const { moveFile } = require("./helpers");

moveFile("../dist/bundles/index.esm.js", "../dist/bundles/index.mjs");
moveFile("../dist/bundles/index.esm.min.js", "../dist/bundles/index.min.mjs");
