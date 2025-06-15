const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { sec5 } = require("../setting.json");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();

const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  sec5.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  sec5.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = sec5.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  sec5.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  // console.log(
  //   await translateSelectCenterTextList(
  //     ["えみる -> 声"],
  //     1,
  //     false,
  //     undefined,
  //     "srp"
  //   )
  // );

  // await delay(10000);
  const listFileName = fs.readdirSync(sec5.translation.folderPath);
  let start = 0;
  let numberAsync = sec5.translation.numberOfFiles;

  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              // await fixTranslatedFileKs(
              //   `./ks/${fileName}`,
              //   `${ks.translation.folderPath}/${fileName}`,
              //   "shiftjis"
              // );
              await translateFileSec5(
                `${sec5.translation.folderPath}/${fileName}`,
                sec5.translation.isSelects,
                sec5.translation.isTagName,
                sec5.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = sec5.translation.numberOfFiles;
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

async function translateFileSec5(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  // const translatedRawFileContent = await readFile(filePath.replace("BGI","BGI_output"),encoding)
  objectCount = {};
  let count2 = 0;
  // const dumpFileContent = await readFile(
  //   filePath.replace(/csv/g, "txt"),
  //   encoding
  // );
  let dataList = fileContent.split(/\r\n/g);
  // console.log(dataList)
  // .map((v) => v.replace(/\[ruby:/g, "").replace(/\[\/ruby\]/g, "").replace(/\]/g,""));
  // let rawTranslatedDataList = translatedRawFileContent.split(/\r\n/g);
  // let dumpList = dumpFileContent.split(/\r\n/g);
  // console.log(dataList);
  // let temp2 = [];
  // dataList.forEach((text) => {
  //   const textList = text.split("\n");
  //   textList.forEach((text) => temp2.push(text));
  // });
  // dataList = [...temp2];
  // console.log(dataList)
  // return await writeFile(
  //   filePath,
  //   dataList.filter(v => v !== "").join("\r\n"),
  //   "utf16"
  // );
  let temp = "";
  console.time(filePath);
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(dataList, 3, false, sec5, "srp")
    ).join("\r\n");
    return await writeFile(
      filePath,
      translatedFileContent,
      encoding,
      false,
      false
    );
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  // console.log(dataList)
  let isScript = false;
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (!sec5.translation.isNoFilter) {
        // console.log(rawText)
        if (rawText.includes("endscript")) {
          isScript = false;
        }
        if (!rawText.match(/★/g)) {
          if (rawText.includes("iscript")) {
            isScript = true;
          }
          isNewDialog = true;
          return ans;
        }
      }
      if (ans.length > 0 && isNewDialog === false) {
        dataList[index - 1] = dataList[index - 1].replace(/［Ｔｅｍｐ］/, "");
        ans[ans.length - 1] = ans[ans.length - 1].replace(/［Ｔｅｍｐ］/, "");
      }
      ans.push(rawText + "［Ｔｅｍｐ］");
      dataList[index] = dataList[index] + "［Ｔｅｍｐ］";
      isNewDialog = false;
      return ans;
    }, [])
    .reduce((ans, rawText) => {
      // if (rawText.match(/^(\[ruby text=")/g))
      //   rawText = rawText.replace("[ruby text=", "").replace('"]', "");
      if (sec5.translation.isNoFilter) {
        ans.push(rawText.replace(/［Ｔｅｍｐ］/g, ""));
        return ans;
      }
      count3++;
      temp += (rawText.trim() === "---" ? "" : rawText.trim()) + " ";
      if (rawText.match(/［Ｔｅｍｐ］/)) {
        // suffixList.push(
        //   temp.match(/(\[[a-zA-Z =\[\]_]+\]+)$/g)[0].replace(/\[Ｔｅｍｐ\]/g, "")
        // );
        ans.push(
          temp
            .replace(/\[font size=[0-9]+\]/g, "")
            .replace(/［Ｔｅｍｐ］/g, "")
            .replace(/\[r\](\\)?/g, "")
            .replace(/／/g, "")
            .replace(/\[r\]/g, "")
            .trim()
        );
        temp = "";
        listCount.push(count3);
        count3 = 0;
      }
      return ans;
    }, []);
  // let temp2 = "";
  // const translatedTextList = rawTextList.map((text) => {
  //   if (text.match(/^#/g)) {
  //     temp2 = text
  //       .split(",")[0]
  //       .replace(/#/g, "")
  //       .replace(":NameSuffix", "Masato");
  //     if (temp2 !== "") temp2 = "【" + temp2 + "】";
  //     return text;
  //   }
  //   if (text.match(/^&/g)) {
  //     const splittedTextList = text.split('"');
  //     splittedTextList[1] = temp2 + splittedTextList[1];
  //     temp2 = "";
  //     return splittedTextList.join('"');
  //   }
  //   temp2 = "";
  //   return text;
  // });
  // const translatedTextList = rawTextList.map((text) => {
  //   const splittedTexts = text.split('"');
  //   splittedTexts[1] = handleWordWrap(50, splittedTexts[1], "(e)").replace(
  //     /^((】 )?）)/g,
  //     ""
  //   );
  //   if (splittedTexts[1].match(/】（/g)) {
  //     splittedTexts[1] += "）";
  //   }
  //   return splittedTexts.join('"');
  // });
  // console.log(rawTextList)
  // const translatedTextList = [...rawTextList].map((v)=>v.slice(0,v.length - 1).replace("]","]\r\n")+"]");
  // console.log(rawTextList)
  // const translatedTextList = rawTextList.map((text) => {
  //   if(text.length > 125){
  //     return `<font size ='-6'>${text}</font>`
  //   }
  //   return text;
  // });
  // let isAdd = false;
  // console.log(rawTextList)
  // const translatedTextList = rawTextList.map((v) => {
  //   if(!v.match(/^[【『「（《]/g)){
  //     return "　"+v
  //   }
  //   return v.replace(/^\(/g,"（");
  // })
  // const translatedTextList = [...rawTextList];
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    3,
    false,
    true,
    false,
    "sec5",
    "",
    false,
    false
  );
  // const translatedTextList = rawTextList.map((v) => `@font size="25"\r\n`+v)
  // .map((v) => converter.toFullWidth(v).replace(/］/g,"]").replace(/［/g,"["));
  // .map((text) => {
  //   if(!text.includes("[pre]")) return  text + "[pre]";
  //   return text
  // });

  // console.log({translatedTextList})
  // const translatedTextList = await translateSelectCenterTextList(
  //   rawTextList,
  //   3,
  //   true,
  //   pinpoint,
  //   "srp"
  // );
  // const translatedTextList = rawTextList.reduce((ans, curr) => {
  //   if (curr.trim() === "") return ans;
  //   if (!curr.trim().match(/^(<)/g)) {
  //     ans[ans.length - 1] = ans[ans.length - 1].trim() + " " + curr;
  //     return ans;
  //   }
  //   ans.push(curr);
  //   return ans;
  // }, []);
  // return await writeFile(filePath, translatedTextList.join("\r\n")+"\r\n", encoding);
  // const translatedTextList = rawTextList.map((v) => {
  //   if (v === ".") {
  //     return "";
  //   }
  //   return v;
  // });
  // let translatedTextList = handleWordWrapGlue(rawTextList,100000,"\\n")

  // const translatedTextList = rawTextList
  // .map((text)=> text.replace(/, /g,"、"))
  // .map((text) => {
  //   const splittedTexts = text.split('"');
  //   if (splittedTexts[2] === "") {
  //     return splittedTexts.slice(0, 2).join('"') + '"';
  //   }
  //   return (
  //     splittedTexts.slice(0, 2).join('"') +
  //     '"' +
  //     "\r\n" +
  //     splittedTexts.slice(2).join('"')
  //   );
  // });
  // .map(
  //   (text) => text.replace(/&/g, "\r\n&")
  //   // "&" + text.split("&").slice(1).join("\r\n&").split("#").join("\r\n#")
  // );
  // console.log(rawTextList)
  // let translatedTextList = await translateSelectCenterTextList(
  //   rawTextList,
  //   2,
  //   false
  // );

  // translatedTextList = translatedTextList.map((text) => text + "[np]");
  // console.log(
  //   checkIsContinue(
  //     dumpList.filter((text) => text !== ""),
  //     "射精を促す刺激を、たっぷりと堪能するように、"
  //   )
  // );
  // let prefixList = [...rawTextList].reduce((ans, text, index) => {
  //   // if (text.split(",")[3]) {
  //   //   ans.push(text.split(",").slice(0, 3).join(",") + ",");
  //   //   return ans;
  //   // }
  //   ans.push(text.split(",").slice(0, 4).join(",") + ",");
  //   return ans;
  //   ans.push("");
  //   return ans;
  // }, []);

  // let translatedTextList = [...rawTextList].map((text) => {
  //   const temp = text.split(",").slice(4).join("、");
  //   return temp;
  // });
  // let translatedTextList = await translateOfflineSugoiCt2LongList(
  //   // [...rawTextList].map((text) => {
  //   //   return text.split(",")[0].includes("pylm")
  //   //     ? text.split(",")[3].replace(/"/g, "")
  //   //     : text.split(",")[0].replace(/"/g, "");
  //   // }),
  //   rawTextList,
  //   3,
  //   false,
  //   true,
  //   true,
  //   "BGI"
  // );
  // let translatedTextList = rawTranslatedDataList.map((rawTranslatedText, index) => {
  //   if(rawTranslatedText.includes("<R")) return rawTextList[index];
  //   return rawTranslatedText
  // })

  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  isScript = false;
  let translatedFileContent = dataList.reduce((ans, rawText, index) => {
    if (!sec5.translation.isNoFilter) {
      if (rawText.includes("endscript")) {
        isScript = false;
      }
      if (
        // !rawText.match(/^((\[姫)|(\[日向)|(\[星音))|(\[font )/g)
        // rawText.match(/^(\[ruby )/g)
        // !rawText.match(/^(\[p\]\[p\])/g)
        // !rawText.match(/mruby/g)
        !rawText.match(/★/g)

        // (rawText.trim().match(containRegExpI) &&
        //   !rawText.trim().match(exceptRegExpI)) ||
        // rawText.trim() === "" ||
        // isScript
        // !rawText.match(containRegExpG2) || rawText.match(/^;/g)
        // rawText.match(containTagNameRegExpI)
      ) {
        if (rawText.includes("iscript")) {
          isScript = true;
        }
        isDisable = false;
      }
      if (isDisable) return ans;
      if (
        // !rawText.match(/\[en\]/g)
        // !rawText.match(/(^\[和琴先輩\])|(^\[日向ちゃん\])/g)
        // !rawText.match(/^(\[ruby )/g)
        // !rawText.match(/^(\[星音)/g)
        // !rawText.match(/\[p\]\[p\]/g)
        // !rawText.match(/mruby/g)
        // !rawText.match(/^『[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、―]/g)
        !rawText.match(/★/g)
        // (rawText.trim().match(containRegExpI) &&
        //   !rawText.trim().match(exceptRegExpI)) ||
        // rawText.trim() === "" ||
        // isScript
        // !rawText.match(/(^\[─+\])/g)
        // !rawText.match(containTagNameRegExpI)
        // index === 0
        // !rawText.match(containRegExpG2)|| rawText.match(/^;/g)
        // rawText.match(containTagNameRegExpI)
      ) {
        if (rawText.includes("iscript")) {
          isScript = true;
        }
        ans.push(rawText);
        return ans;
      }
    }
    if (translatedTextList[count] !== undefined) {
      let temp = translatedTextList[count];
      // let prefix = prefixList[count];
      // if (rawText.match(/(^	)/g)) {
      //   temp = rawText.match(/(	)+/g)[0] + temp;
      // }
      // temp = temp.replace(/!/g,"！");
      // const rawNameTag = rawText.match(/@nm t="([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ【『「（《》】』」）]+)?"/g)[0].replace(/@nm t="/g,"").replace(/"/g,"");
      // let isRtContained = rawText.includes("rt");
      // const prefix = (temp.match(/[0-9]+ (【.+】)?/g) || [""])[0];
      ans.push(
        // handleWordWrap(
        //   Math.floor(temp.length / listCount[count]) < 41
        //     ? Math.floor(temp.length / listCount[count])
        //     : 46,
        //   temp,
        //   "\r\n",
        //   listCount[count]
        // )
        // temp
        // count2 === 0 && temp.includes("【")
        //   ? prefix +
        //       converter.toFullWidth(temp.replace(/[0-9]+ (【.+】)?/g, ""))
        //   : temp

        // temp.replace(/@/g, "＠")
        temp
        // handleWordWrap(65, temp, "\\n").replace(/(\\n)$/g, "")
        // handleWordWrap(65, temp, "\r\n", listCount[count])
        // prefix + (temp === "@@" ? "" : temp).replace(/,( )?/g, "、")
        // ("　"+temp).replace(/　「/g,"「")
        // rawText.replace(/@nm t="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ]+"/g,`@nm t="${temp}"${!isRtContained ? ` rt="${rawNameTag}"`:""}`)
        // temp
        // .replace(/,( )?/g, "、")
        // .replace(/、/g, ", ")
        // .replace(/[◆✩♥♡●♪]/g, "")
        // .replace(/❛/g, "’")
        // .replace(/é/g, "e")
        // .replace(/ō/g, "o")
        // .replace(/[àâ]/g, "a")
      );
      // if (prefix.includes("【")) count2++;
      if (sec5.translation.isArtemis) ans.push('					{"rt2"},');
    } else {
      ans.push("");
    }
    isDisable = true;
    count++;
    return ans;
  }, []);
  // .filter((text) => text !== "" && text !== ",")
  translatedFileContent = translatedFileContent
    // .slice(0, translatedFileContent.length - 2)
    .join("\r\n")
    .replace(/★Chosen★/g, "★选项★")
    .replace(/★Mistake★/g, "★标题★");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding, false, false);
}
function checkIsContinue(dumpList, previousText) {
  let isContinue = false;
  let isBr = false;
  const previousDumpText = dumpList.find((text) => text.includes(previousText));
  if (previousDumpText) {
    if (!checkFoundPG(dumpList, previousText)) {
      isContinue = true;
    }
  }
  return { isContinue, isBr };
}
function checkFoundPG(dumpList, text) {
  let isCheck = false;
  if (!objectCount[text]) objectCount[text] = 0;
  objectCount[text] += 1;
  let dumpTextIndex = -1;
  let count = 0;
  for (let i = 0; i < dumpList.length; i++) {
    const dumpText = dumpList[i];
    if (dumpText.replace(/<[a-zA-Z0-9]+>/g, "") === text) {
      count++;
      if (count === objectCount[text]) {
        dumpTextIndex = i;
        break;
      }
    }
  }
  // console.log(dumpTextIndex)
  if (dumpTextIndex < 0) return isCheck;
  if (text) {
    if (dumpList[dumpTextIndex].includes("<PG>")) {
      isCheck = true;
    }
    if (!isCheck) {
      do {
        dumpTextIndex++;
        if (dumpList[dumpTextIndex] === "<PG>") {
          isCheck = true;
        }
      } while (!isCheck && dumpList[dumpTextIndex].match(/^[{]/g));
    }
  }
  // console.log(isCheck)
  return isCheck;
}
async function fixTranslatedFileKs(filePathTranslated, filePathRaw, encoding) {
  const fileContent = await readFfile(filePathTranslated, encoding);
  let dataList = fileContent.split(/\n/i);
  let check = true;
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].trim().match(/\[rb/g)) {
      console.log(dataList[i]);
      check = false;
      break;
    }
  }
  // console.log(dataList.length,check);
  if (check) {
    fs.unlinkSync(filePathRaw);
  }
}
// [...$0.querySelectorAll(".mainbox")].reduce((ans, curr) => {
//   const characters = [...curr.querySelectorAll(".chardetails")];
//   characters.forEach((character) => {
//     if (character.querySelector("tr b"))
//       ans[character.querySelector("tr b").textContent] =
//         character.querySelector("tr a").textContent;
//   });
//   return ans;
// }, {});
// ○○○○
