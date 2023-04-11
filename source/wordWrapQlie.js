const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { qlie } = require("../setting.json");
const delay = require("./delay");
const { handleWordWrapQlieVN } = require("./handleWordWrapQlie");
(async () => {
  const listFileName = fs.readdirSync(qlie.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${qlie.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "shiftjis");
  return await writeFile(filePath, handleWordWrapQlieVN(fileContent), "shiftjis");
}
