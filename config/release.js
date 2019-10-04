const { exec, yesNo } = require("./helpers");

release()
  .then(() => {
    console.log("Released successfully!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.stdout || e.message || e);
    process.exit(1);
  });

async function release() {
  // Commit bundle sizes if build generated new ones
  await exec(`git add ./bundle-sizes.lock ./README.md`);
  await exec(
    `git commit --no-verify -m "docs: 📝 Updated bundle sizes info"`,
  ).catch(() => {});

  // Configure git to be not-interactive
  process.env.GIT_MERGE_AUTOEDIT = "no";
  await exec(`git config gitflow.hotfix.finish.message "Hotfix %tag%"`);
  await exec(`git config gitflow.release.finish.message "Release %tag%"`);

  // Getting the version number
  const args = process.argv.slice(2);
  if (!args.length) {
    throw new Error("You need to specify version (patch/minor/major)");
  }

  const [versionArg] = args;
  if (!versionArg) {
    throw new Error("Invalid version is passed");
  }

  let version = await exec(`npm --no-git-tag-version version ${versionArg}`);
  // Converts v10.234.43\n to 10.234.43
  version = version.slice(1).slice(0, -1);

  if (!version) {
    throw new Error("Failed to take version");
  }
  process.env.VERSION = version;

  await exec(`git checkout -- package.json`);
  await exec(`git checkout -- package-lock.json`);

  const agreed = await yesNo(`Version will be ${version}, continue? (y/n)`);
  if (!agreed) {
    throw new Error("Release aborted");
  } else {
    console.log("Lets go!");
  }

  // Doing release
  await exec(`git flow release start ${version}`);

  // Updating version in package.json, package-lock.json and Dockerrun.aws.json
  await exec(`npm --no-git-tag-version version ${version}`);
  await exec(`git commit -am "release: 🏹 v${version}"`);
  await exec(`git flow release finish ${version}`);

  // Pushing to repo
  await exec(`git push --all --follow-tags`);
}
