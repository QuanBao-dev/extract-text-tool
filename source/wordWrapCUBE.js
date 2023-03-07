const handleWordWrap = require("./handleWordWrap");
const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { CUBE } = require("../setting.json");
const delay = require("./delay");
const handleWordWrapArtemis = require("./handleWordWrapArtemis");
const handleWordWrapQlieVN = require("./handleWordWrapQlie");
const { handleWordWrapCUBE } = require("./handleWordWrapKs");
const handleWordWrapShina = require("./handleWordWrapShina");
const handleWordWrapSrp = require("./handleWordWrapSrp");
const handleWordWrapArtemis2 = require("./handleWordWrapArtemis2");
const containRegExpI = new RegExp(
  CUBE.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
(async () => {
  // console.log(
  //   handleWordWrap(
  //     53,
  //     "「Hamu、nn、*slurp*♪ *kiss*...pah♪ Sensei's penis is[r]so big and wonderful♪ Nnue、*lick、lick*...[r]*lick*...」",
  //     "[r]"
  //   )
  // );
  // await delay(1000000);
  const listFileName = fs.readdirSync(CUBE.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${CUBE.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "shiftjis");
  return await writeFile(filePath, handleWordWrapCUBE(fileContent), "shiftjis");
}
