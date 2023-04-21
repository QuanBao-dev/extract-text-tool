const handleWordWrap = require("./handleWordWrap");
const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const { ks, pinpoint } = require("../setting.json");
const delay = require("./delay");
const handleWordWrapArtemis = require("./handleWordWrapArtemis");
const handleWordWrapQlieVN = require("./handleWordWrapQlie");
const {handleWordWrapLilith} = require("./handleWordWrapKs");
const handleWordWrapShina = require("./handleWordWrapShina");
const handleWordWrapSrp = require("./handleWordWrapSrp");
const handleWordWrapArtemis2 = require("./handleWordWrapArtemis2");
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
  const listFileName = fs.readdirSync(pinpoint.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapKs(`${pinpoint.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("Done");
  await delay(10000000);
})();

async function wordWrapKs(filePath) {
  const fileContent = await readFile(filePath, "shiftjis");

  // await writeFile(filePath, fileContent, "shiftjis");
  // const fileContent2 = await readFile(
  //   filePath
  //     .split("/")
  //     .map((v, key) => {
  //       if (key === 1) {
  //         return v + "_output";
  //       }
  //       return v;
  //     })
  //     .join("/"),
  //   "gbk"
  // );
  // return await writeFile(filePath, fileContent2, "utf8");
  // return await writeFile(filePath, handleWordWrapArtemis(fileContent), "utf8");
  return await writeFile(filePath, handleWordWrapLilith(fileContent), "shiftjis");
  // return await writeFile(filePath, handleWordWrapArtemis2(fileContent), "utf8");
  // return await writeFile(filePath, handleWordWrapQlieVN(fileContent), "utf16");
  // return await writeFile(filePath, handleWordWrapShina(fileContent), "shiftjis");
  // return await writeFile(filePath, handleWordWrapKs(fileContent), "shiftjis");
  // return await writeFile(
  //   filePath,
  //   handleWordWrapKs.handleWordWrapPoison(fileContent),
  //   "shiftjis"
  // );
  // return await writeFile(filePath, handleWordWrapSrp(fileContent), "shiftjis");
  const dataList = fileContent.split(/\r\n/i);
  let isHighLight = false;
  const rawTextList = dataList.reduce((ans, rawText) => {
    if (rawText === "") return ans;
    // if (rawText.match(ks.wordWrap.regExpToFilterSentenceNeededHighlightStart))
    //   isHighLight = true;
    // if (rawText.match(ks.wordWrap.regExpToFilterSentenceNeededHighlightStop))
    //   isHighLight = false;
    // if (rawText.match(containRegExpI)) {
    //   return ans;
    // }
    if (!rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName)) {
      return ans;
    }
    ans.push(
      rawText
        .replace(/(\[ruby text="[ぁ-んァ-ン一-龥]+"\])/gi, "")
        .replace(/\[r\]/gi, " ") + (isHighLight ? "|HIGHTLIGHT|" : "")
    );
    return ans;
  }, []);
  // console.log(rawTextList);
  const wordWrappedTextList = rawTextList.map((text) => {
    // const prefix = `		   text="`;
    // if(text.match(/ timeout=".+\/>/g)) return text
    // if (!text.match(/ timeout="(.+\/>)?/g)) return text;
    // const suffix = text.match(/ timeout="(.+\/>)?/g)[0];
    // const ans =
    //   prefix +
    //   text
    //     .replace(/\|HIGHTLIGHT\|/g, "")
    //     .replace(prefix, "")
    //     .replace(suffix, "")
    //     .replace(/"/g, "'")
    //     + suffix;
    const list = text.split(",");
    list[list.length - 1] = handleWordWrap(29, list[list.length - 1], "\\n");
    const ans = list.join(",");
    return ans;
  });
  let count = 0;
  let isDisable = false;
  const translatedFileContent = dataList
    .reduce((ans, rawText) => {
      // if (
      //   !rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName) ||
      //   rawText === ""
      // )
      //   isDisable = false;
      // if (isDisable) return ans;
      // if (
      //   !rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName) ||
      //   rawText === ""
      // ) {
      //   let temp = rawText.replace(/\$r\:/gi, "");
      //   if (rawText.match(/^	/i)) {
      //     temp = "	" + temp;
      //   }
      //   ans.push(temp);
      //   return ans;
      // }
      if (!rawText.match(ks.wordWrap.regExpToFilterSentenceContainTagName)) {
        ans.push(rawText);
        return ans;
      }
      if (wordWrappedTextList[count]) {
        let temp = wordWrappedTextList[count]
          .replace(/\$r\:/gi, "")
          .replace(/^\*/g, "");
        if (rawText.match(/^	/i)) {
          temp = "	" + temp;
        }
        ans.push(
          temp
          // + "[T_NEXT]\\"
        );
      } else {
        ans.push("");
      }
      isDisable = true;
      count++;
      return ans;
    }, [])
    .join("\r\n");
  await writeFile(filePath, translatedFileContent, "shiftjis");
}
