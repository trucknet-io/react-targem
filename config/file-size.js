const path = require("path");
const { readFile: readFileCb, writeFile: writeFileCb } = require("fs");
const { promisify } = require("util");
const readFile = promisify(readFileCb);
const writeFile = promisify(writeFileCb);
const exec = promisify(require("child_process").exec);

const kolor = require("kleur");
const prettyBytes = require("pretty-bytes");
const brotliSize = require("brotli-size");
const gzipSize = require("gzip-size");
const { log } = console;
const pkg = require("../package.json");

main();

async function main() {
  const args = process.argv.splice(2);
  const filePaths = [...args.map(path.normalize)];
  const fileMetadata = await Promise.all(
    filePaths.map(async (filePath) => {
      return {
        path: filePath,
        blob: await readFile(filePath, { encoding: "utf8" }),
      };
    }),
  );

  const output = await Promise.all(
    fileMetadata.map((metadata) => getSizeInfo(metadata.blob, metadata.path)),
  );

  const formattedOutput = getFormatedOutput(pkg.name, output);
  log(formattedOutput);
  await saveSizesLock(output);
}

/**
 *
 * @param {string} pkgName
 * @param {string[]} filesOutput
 */
function getFormatedOutput(pkgName, filesOutput) {
  const MAGIC_INDENTATION = 3;
  const WHITE_SPACE = " ".repeat(MAGIC_INDENTATION);

  return (
    kolor.blue(`${pkgName} bundle sizes: 📦`) +
    `\n${WHITE_SPACE}` +
    filesOutput.map((o) => o.infoString).join(`\n\n${WHITE_SPACE}`)
  );
}

/**
 *
 * @param {number} size
 * @param {string} filename
 * @param {'br' | 'gz'} type
 * @param {boolean} raw
 */
function formatSize(size, filename, type, raw, noColor) {
  const color = size < 5000 ? "green" : size > 40000 ? "red" : "yellow";
  const MAGIC_INDENTATION = noColor || ["br", "gz"].includes(type) ? 13 : 10;
  const pretty = raw ? `${size} B` : prettyBytes(size);
  const prettyStr = noColor ? pretty : kolor[color](pretty);
  const basename = path.basename(filename);
  const nameStr = noColor ? basename : kolor.white(basename);

  return `${" ".repeat(
    MAGIC_INDENTATION - pretty.length,
  )}${prettyStr}: ${nameStr}${type ? "." + type : ""}`;
}

/**
 *
 * @param {string} code
 * @param {string} filename
 * @param {boolean} [raw=false]
 */
async function getSizeInfo(code, filename, raw = false) {
  const codeSize = code.length;
  const isRaw = raw || codeSize < 5000;
  const rawSize = formatSize(codeSize, filename, "", isRaw, true);
  const size = formatSize(codeSize, filename, "", isRaw);
  const gzipCodeSize = await gzipSize(code);
  const rawGzip = formatSize(gzipCodeSize, filename, "gz", isRaw, true);
  const gzip = formatSize(gzipCodeSize, filename, "gz", isRaw);
  const brotliCodeSize = await brotliSize(code);
  const rawBrotli = formatSize(brotliCodeSize, filename, "br", isRaw, true);
  const brotli = formatSize(brotliCodeSize, filename, "br", isRaw);

  return {
    rawString: `${rawSize}\n${rawGzip}\n${rawBrotli}`,
    infoString: `${size}\n${gzip}\n${brotli}`,
  };
}

async function saveSizesLock(output) {
  const lockFilename = "./bundle-sizes.lock";
  const readmeFilename = "./README.md";
  const lockPath = path.join(process.cwd(), lockFilename);

  const bundleSizes = output.map((info) => info.rawString).join(`\n\n`);

  const readmePath = path.join(process.cwd(), readmeFilename);
  let readmeContent = (await readFile(readmePath)).toString();
  readmeContent = readmeContent.replace(
    /<!--size-start-->(.|\n|\r|\t)*<!--size-end-->/gim,
    `<!--size-start-->\n\n\`\`\`\n${bundleSizes}\n\`\`\`\n\n<!--size-end-->`,
  );

  await Promise.all([
    writeFile(lockPath, bundleSizes),
    writeFile(readmePath, readmeContent),
  ]);
  await exec(`git add ${lockFilename} ${readmeFilename}`);
}
