const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
(async () => {
  const filePathInput = "./waffle/data.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const dataList = JSON.parse(jsonRawText);
  let ans = [];
  for (let i = 0; i < dataList.length; i++) {
    const { rawTextList, fileName } = dataList[i];
    const translatedTextList = await translateOfflineSugoiCt2LongList(
      rawTextList,
      2,
      false,
      true,
      true
    );
    ans.push({
      translatedTextList,
      fileName,
    });
  }
  await writeFile(filePathInput, JSON.stringify(ans, null, 2), "utf8");
  console.log("Done");
  await delay(1000000);
})();
