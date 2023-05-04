const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const handleWordWrap = require("./handleWordWrap");

(async () => {
  const filePathInput = "./anim_output/script.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const json = JSON.parse(jsonRawText);
  const rawTextList = Object.keys(json);
  // const rawTextList = json;
  const translationList = rawTextList.map((rawText,index) => {
    const wordWrappedText = handleWordWrap(45,json[rawText],"\\N");
    if(wordWrappedText.split("\\N").length > 3) return json[rawText].replace(/( )|(@@)/g,"\t"); 
    if(rawText.includes("\\N")) return ""
    return handleWordWrap(45,json[rawText],"\\N").replace(/( )|(@@)/g,"\t");
    // return handleWordWrap(75, json[rawText].replace(/(<unk>(")?)/g, " "), "\r\n");
    // return handleWordWrap(88, json[rawText].replace(/@n/g,"").replace(/(<unk>(")?)/g, " "), "@b");
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
