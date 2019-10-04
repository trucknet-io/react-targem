const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { promisify } = require("util");
const execAsync = promisify(require("child_process").exec);

module.exports = {
  camelCaseToDash,
  dashToCamelCase,
  toUpperCase,
  pascalCase,
  normalizePackageName,
  getOutputFileName,
  exec,
  yesNo,
  moveFile,
};

/**
 *
 * @param {string} myStr
 */
function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 *
 * @param {string} myStr
 */
function dashToCamelCase(myStr) {
  return myStr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 *
 * @param {string} myStr
 */
function toUpperCase(myStr) {
  return `${myStr.charAt(0).toUpperCase()}${myStr.substr(1)}`;
}

/**
 *
 * @param {string} myStr
 */
function pascalCase(myStr) {
  return toUpperCase(dashToCamelCase(myStr));
}

/**
 *
 * @param {string} rawPackageName
 */
function normalizePackageName(rawPackageName) {
  const scopeEnd = rawPackageName.indexOf("/") + 1;

  return rawPackageName.substring(scopeEnd);
}

/**
 *
 * @param {string} fileName
 * @param {boolean?} isProd
 */
function getOutputFileName(fileName, isProd = false) {
  return isProd ? fileName.replace(/\.js$/, ".min.js") : fileName;
}

function exec(...args) {
  return execAsync(...args).then((res) => res.stdout);
}

function yesNo(question) {
  return new Promise((resolve) => {
    const rlInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rlInterface.question(question, (answer) => {
      const positiveAnswers = ["yes", "y"];
      rlInterface.close();
      resolve(positiveAnswers.includes(answer.trim().toLowerCase()));
    });
  });
}

function moveFile(oldPath, newPath) {
  fs.renameSync(path.join(__dirname, oldPath), path.join(__dirname, newPath));
}
