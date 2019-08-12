const filesExts = require("../../config/filesExts");
const fs = require("fs");
const path = require("path");

file = "";

for (const fileExt of filesExts) {
  file += `
  declare module "*.${fileExt}" {
    const path: string;
    export = path;
  }
`;
}

fs.writeFileSync(path.join(__dirname, "index.d.ts"), file);
