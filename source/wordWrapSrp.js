const handleWordWrap = require("./handleWordWrap");
const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { srp } = require("../setting.json");
const delay = require("./delay");
const handleWordWrapSrp = require("./handleWordWrapSrp");
(async () => {
  const listFileName = fs.readdirSync(srp.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${srp.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "shiftjis");
  return await writeFile(filePath, handleWordWrapSrp(fileContent), "shiftjis");
}
