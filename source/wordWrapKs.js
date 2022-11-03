const handleWordWrap = require("./handleWordWrap");
const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { ks } = require("../setting.json");
const delay = require("./delay");
const handleWordWrapArtemis = require("./handleWordWrapArtemis");
const handleWordWrapQlieVN = require("./handleWordWrapQlie");
const handleWordWrapKs = require("./handleWordWrapKs");
const handleWordWrapShina = require("./handleWordWrapShina");
const handleWordWrapSrp = require("./handleWordWrapSrp");
const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
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
  const listFileName = fs.readdirSync(ks.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${ks.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "shiftjis");
  // await writeFile(filePath, handleWordWrapArtemis(fileContent), "utf8");
  // await writeFile(filePath, handleWordWrapQlieVN(fileContent), "shiftjis");
  // await writeFile(filePath, handleWordWrapShina(fileContent), "shiftjis");
  await writeFile(filePath, handleWordWrapKs(fileContent), "shiftjis");
  // await writeFile(filePath, handleWordWrapSrp(fileContent), "shiftjis");
  // const dataList = fileContent.split(/\r\n/i);
  // let isHighLight = false;
  // const rawTextList = dataList.reduce((ans, rawText) => {
  //   if (rawText === "") return ans;
  //   // if (rawText.match(ks.wordWrap.regExpToFilterSentenceNeededHighlightStart))
  //   //   isHighLight = true;
  //   // if (rawText.match(ks.wordWrap.regExpToFilterSentenceNeededHighlightStop))
  //   //   isHighLight = false;
  //   // if (rawText.match(containRegExpI)) {
  //   //   return ans;
  //   // }
  //   if (!rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName)) {
  //     return ans;
  //   }
  //   ans.push(
  //     rawText
  //       .replace(/(\[ruby text="[ぁ-んァ-ン一-龥]+"\])/gi, "")
  //       .replace(/\[r\]/gi, " ") + (isHighLight ? "|HIGHTLIGHT|" : "")
  //   );
  //   return ans;
  // }, []);
  // // console.log(rawTextList);
  // const translatedTextList = rawTextList.map((text) => {
  //   const prefix = `		   text="`;
  //   // if(text.match(/ timeout=".+\/>/g)) return text
  //   if (!text.match(/ timeout="(.+\/>)?/g)) return text;
  //   const suffix = text.match(/ timeout="(.+\/>)?/g)[0];
  //   const ans =
  //     prefix +
  //     text
  //       .replace(/\|HIGHTLIGHT\|/g, "")
  //       .replace(prefix, "")
  //       .replace(suffix, "")
  //       .replace(/"/g, "'") +
  //     suffix;
  //   return ans;
  // });
  // let count = 0;
  // let isDisable = false;
  // const translatedFileContent = dataList
  //   .reduce((ans, rawText) => {
  //     if (
  //       !rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName) ||
  //       rawText === ""
  //     )
  //       isDisable = false;
  //     if (isDisable) return ans;
  //     if (
  //       !rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName) ||
  //       rawText === ""
  //     ) {
  //       let temp = rawText.replace(/\$r\:/gi, "");
  //       if (rawText.match(/^	/i)) {
  //         temp = "	" + temp;
  //       }
  //       ans.push(temp);
  //       return ans;
  //     }
  //     if (translatedTextList[count]) {
  //       let temp = translatedTextList[count]
  //         .replace(/\$r\:/gi, "")
  //         .replace(/^\*/g, "");
  //       if (rawText.match(/^	/i)) {
  //         temp = "	" + temp;
  //       }
  //       ans.push(
  //         temp
  //         // + "[T_NEXT]\\"
  //       );
  //     } else {
  //       ans.push("");
  //     }
  //     isDisable = true;
  //     count++;
  //     return ans;
  //   }, [])
  //   .join("\r\n");
  // await writeFile(filePath, translatedFileContent, "utf8");
}
