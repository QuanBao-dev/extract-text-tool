const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { artemisAster } = require("../setting.json");
const delay = require("./delay");
const handleWordWrapArtemis = require("./handleWordWrapArtemis");
(async () => {
  const listFileName = fs.readdirSync(artemisAster.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${artemisAster.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "utf8");
  return await writeFile(filePath, handleWordWrapArtemis(fileContent), "utf8");
}
