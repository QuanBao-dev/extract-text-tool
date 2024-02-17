const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { systemC_TXD } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");

(async () => {
  try {
    const listFileName = fs.readdirSync(systemC_TXD.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileSystemC(
        systemC_TXD.translation.folderPath + "/" + listFileName[i]
      );
    }
  } catch (error) {
    console.log(error);
  }
  await delay(10000000);
})();

async function translateFileSystemC(filePath) {
  const text = await readFile(filePath, "utf8");
  console.log(filePath);
  const dataList = text.split("\r\n");
  const tagNameList = dataList.map((text) => text.split(",")[0]);
  const contentList = dataList.map((text) => text.split(",").slice(1).join("、"));
  const translatedTagNameList = await translateOfflineSugoiCt2LongList(
    tagNameList.slice(0, tagNameList.length - 1),
    3,
    false,
    true,
    false,
    "srp",
    "Eroit"
  );
  const translatedContentList = await translateOfflineSugoiCt2LongList(
    contentList.slice(0, contentList.length - 1),
    3,
    false,
    true,
    false,
    "srp",
    "Eroit"
  );
  const ans = translatedTagNameList.reduce((ans, tagName, index) => {
    ans.push(tagName + "," + translatedContentList[index]);
    return ans;
  }, []);
  await writeFile(filePath, ans.join("\r\n") + "\r\n", "utf8");
}
