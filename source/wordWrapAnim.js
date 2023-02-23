const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const handleWordWrap = require("./handleWordWrap");

(async () => {
  const filePathInput = "./anim_output/script.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const json = JSON.parse(jsonRawText);
  const rawTextList = Object.keys(json);
  // const rawTextList = json;
  const translationList = rawTextList.map((rawText) => {
    return handleWordWrap(88, json[rawText].replace(/(<unk>(")?)/g, " "), "\r\n");
    // return handleWordWrap(70, rawText.replace(/(<unk>(")?)/g, " "), "\\r\\n");
    // return json[rawText].replace(/(<unk>(")?)|(@b)/g, " ");
  });
  const ans = {};
  translationList.forEach((translatedText, index) => {
    ans[rawTextList[index]] = translatedText;
  });
  await writeFile(filePathInput, JSON.stringify(ans, null, 2), "utf8");
  console.log("Done");
  await delay(10000000);
})();
