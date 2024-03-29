const { readFile, writeFile } = require("./handleFile");
const handleWordWrap = require("./handleWordWrap");
const { bsxx } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");
const handleWordWrapGlue = require("./handleWordWrapGlue");
(async () => {
  const listFileName = fs.readdirSync(bsxx.wordWrap.folderPath);
  console.log(listFileName);
  for (let i = 0; i < listFileName.length; i++) {
    await wordWrapBsxx(bsxx.wordWrap.folderPath + "/" + listFileName[i]);
  }
  await delay(10000000);
})();

async function wordWrapBsxx(filePath) {
  const text = await readFile(filePath, "utf8");
  const dataList = text.split("\r\n");
  let contentTextList = dataList.map((text) => {
    return removeThePrefix(text);
  });
  console.time(filePath);
  const prefixList = dataList.map((text) => {
    return extractThePrefix(text);
  });

  // contentTextList = handleWordWrapGlue(
  contentTextList = contentTextList.map((text) => {
    // text = text.replace(/\\n/g, "").replace(/Kageto/g,"");
    // if (text.match(/^「/g)) text += "」";
    return handleWordWrap(bsxx.wordWrap.maxCharPerLines, text, "\\n", 1000)
      .replace(/[「]/g, "「 ")
      .replace(/[『]/g, "『 ");
  });
  //   65,
  //   "\\n"
  // );

  const ans = prefixList
    .map(
      (prefixText, index) =>
        prefixText + (contentTextList[index] ? contentTextList[index] : "")
    )
    .join("\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, ans, "utf8");
}

function extractThePrefix(text) {
  const matchedText = text.match(/[◇○●◆].+[◇○●◆]/g);
  if (!matchedText) return "";
  return matchedText[0];
}

function removeThePrefix(text) {
  return text.replace(/[◇○●◆].+[◇○●◆]/g, "");
}
