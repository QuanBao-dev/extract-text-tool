const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { rpgm } = require("../setting.json");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  const listFileName = fs.readdirSync(rpgm.wordWrap.folderPath);
  let start = 0;
  let numberAsync = rpgm.wordWrap.numberOfFiles;

  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              await wordWrapRPGM(
                `${rpgm.wordWrap.folderPath}/${fileName}`,
                rpgm.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = rpgm.wordWrap.numberOfFiles;
      } while (start < listFileName.length);
      break;
    } catch (error) {
      console.log("Error:", error.message);
      await delay(10000);
      numberAsync--;
    }
  } while (numberAsync > 0);
  console.log("Done");
  await delay(10000000);
})();
let objectCount = {};

async function wordWrapRPGM(filePath, encoding) {
  const fileContent = await readFile(filePath, encoding);
  objectCount = {};
  console.time(filePath);
  const dataRawList = fileContent
    .split("> BEGIN STRING\r\n")
    .map((text) => text.split("\r\n"));
  // const textDialogueList = dataRawList.map((data) => {
  //   let indexEndString = data.findIndex((v) => v.includes("> END STRING"));
  //   if (indexEndString < 0) return data.join("\r\n");
  //   return handleWordWrap(44, data[indexEndString - 1] || "", "\r\n");
  // });
  // const wordWrapDataList = dataRawList.map((data, index) => {
  //   let indexEndString = data.findIndex((v) => v.includes("> END STRING"));
  //   if (indexEndString < 0) return data.join("\r\n");
  //   data[indexEndString - 1] = textDialogueList[index];
  //   return data.join("\r\n");
  // });
  const textDialogueList = dataRawList.map((data) => {
    let indexEndString = data.findIndex((v) => v.includes("> END STRING"));
    if (indexEndString < 0) return data.join("\r\n");
    let temp = "";
    let i = indexEndString - 1;
    let finalText = "";
    while (!data[i].includes(">") && !data[i + 1].match(/^[「『（【(“\\]/g)) {
      temp = data[i] + " " + temp;
      finalText = data[i];
      i--;
    }
    return handleWordWrap(62, temp || "", "\r\n");
  });
  const wordWrapDataList = dataRawList.map((data, index) => {
    let indexEndString = data.findIndex((v) => v.includes("> END STRING"));
    if (indexEndString < 0) return data.join("\r\n");
    let end = indexEndString - 1;
    let i = indexEndString - 1;
    while (!data[i].includes(">") && !data[i + 1].match(/^[「『（【(“\\]/g)) {
      i--;
    }
    return (
      data.slice(0, i + 1).join("\r\n") +
      "\r\n" +
      textDialogueList[index] +
      "\r\n" +
      data.slice(end + 1).join("\r\n")
    )
      .replace(/Georuis/g, "Geo Louise")
      .replace(/Georius/g, "Geo Louise")
      .replace(/Georgys/g, "Geo Louise")
      .replace(/Georges/g, "Geo Louise")
      .replace(/Guinet/g, "Guina")
      .replace(/Guine/g, "Guina")
      .replace(/Guinah/g, "Guina")
      .replace(/Stialla/g, "Stiara");
  });
  await writeFile(
    filePath,
    wordWrapDataList.join("> BEGIN STRING\r\n"),
    encoding
  );
}
