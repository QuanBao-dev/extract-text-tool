const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { tanuki } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  tanuki.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  tanuki.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = tanuki.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  tanuki.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  const listFileName = fs.readdirSync(tanuki.translation.folderPath);
  let start = 0;
  let numberAsync = tanuki.translation.numberOfFiles;

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
              await translateFileKs(
                `${tanuki.translation.folderPath}/${fileName}`,
                tanuki.translation.isSelects,
                tanuki.translation.isTagName,
                tanuki.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = tanuki.translation.numberOfFiles;
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

async function translateFileKs(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  // const translatedRawFileContent = await readFile(filePath.replace("BGI","BGI_output"),encoding)
  objectCount = {};
  // const dumpFileContent = await readFile(
  //   filePath.replace(/csv/g, "txt"),
  //   encoding
  // );
  let dataList = fileContent.split(/\r\n/g);
  // let rawTranslatedDataList = translatedRawFileContent.split(/\r\n/g);
  // let dumpList = dumpFileContent.split(/\r\n/g);
  // console.log(dataList);
  let temp2 = [];
  dataList.forEach((text) => {
    const textList = text.split("\n");
    textList.forEach((text) => temp2.push(text));
  });
  dataList = [...temp2];
  // console.log(dataList)
  let temp = "";
  console.time(filePath);
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(dataList, 3, false, tanuki, "srp")
    ).join("\r\n");
    return await writeFile(filePath, translatedFileContent, encoding);
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  let isScript = false;
  // console.log(dataList)
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (!tanuki.translation.isNoFilter) {
        if (rawText.includes("endscript")) {
          isScript = false;
        }
        if (
          (rawText.trim().match(containRegExpI) &&
            !rawText.trim().match(exceptRegExpI)) ||
          rawText === "" ||
          isScript
          // index === 0
          // !rawText.match(containRegExpG2)
          // rawText.match(containTagNameRegExpI)
          // !rawText.match(containTagNameRegExpI)
          // false
        ) {
          if (rawText.includes("iscript")) {
            isScript = true;
          }
          isNewDialog = true;
          return ans;
        }
      }
      if (ans.length > 0 && isNewDialog === false) {
        dataList[index - 1] = dataList[index - 1].replace(/\[Cock\]/, "");
        ans[ans.length - 1] = ans[ans.length - 1].replace(/\[Cock\]/, "");
      }
      ans.push(rawText + "[Cock]");
      dataList[index] = dataList[index] + "[Cock]";
      isNewDialog = false;
      return ans;
    }, [])
    .reduce((ans, rawText) => {
      if (tanuki.translation.isNoFilter) {
        ans.push(rawText.replace(/\[Cock\]/g, "").replace(/\[r\]/g, ""));
        return ans;
      }
      count3++;
      temp += " " + (rawText.trim() === "---" ? "" : rawText.trim());
      if (rawText.match(/\[Cock\]/)) {
        // suffixList.push(
        //   temp.match(/(\[[a-zA-Z =\[\]_]+\]+)$/g)[0].replace(/\[Cock\]/g, "")
        // );
        ans.push(
          temp
            .replace(/\[Cock\]/g, "")
            .replace(/\[r\]/g, "")
            .replace(/／/g, "")
            .replace(/,{"rt2"},/g, "")
            .replace(/"/g, "")
            // .replace(/,/g, "")
            // .replace(/{ruby text=/g, "")
            // .replace(/{\/ruby}/g, "")
            // .replace(/}/g, "")
            .replace(/・/g, "")
            .replace(/{exfont/g, "")
            // .replace(/[a-zA-Z0-9=]+/g,"")
            // .replace(/」( +)?「/g,"@@@")
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
  // console.log(rawTextList);
  // const translatedTextList = rawTextList
  // console.log(translatedTextList.map((v) => {
  //   return v.split(",")[v.split(",").length - 1]
  // }))
  // console.log(rawTextList.join("\r\n"))
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    3,
    false,
    true,
    false,
    "tanuki",
    false,
    false,
    false,
    1
  );
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

  // let translatedTextList = [...rawTextList].reduce((ans, text, index) => {
  //   const { isContinue } = checkIsContinue(
  //     dumpList.filter((text) => text !== ""),
  //     rawTextList[index - 1]
  //       ? rawTextList[index - 1].split(",")[0].includes("pylm")
  //         ? rawTextList[index - 1].split(",")[3].replace(/"/g, "")
  //         : rawTextList[index - 1].split(",")[0].replace(/"/g, "")
  //       : undefined
  //   );
  //   if (isContinue) {
  //     // if (text.match(/("(,)?)/g)) {
  //     //   console.log(text);
  //     //   ans[ans.length - 1] += text;
  //     //   ans[ans.length - 1] = ans[ans.length - 1].replace(/"/g, "");
  //     //   return ans;
  //     // }
  //     let j = 1;
  //     if (ans[ans.length - j] === "@@") {
  //       do {
  //         if (ans[ans.length - j] !== "@@")
  //           ans[ans.length - j] += text.split(",")[0].includes("pylm")
  //             ? text.split(",")[3].replace(/"/g, "")
  //             : text.split(",")[0].replace(/"/g, "");
  //         j += 1;
  //       } while (ans[ans.length - j] === "@@");
  //     }

  //     ans[ans.length - j] += text.split(",")[0].includes("pylm")
  //       ? text.split(",")[3].replace(/"/g, "")
  //       : text.split(",")[0].replace(/"/g, "");
  //     ans[ans.length - j] = ans[ans.length - j].replace(/\"/g, "");
  //     ans.push("@@");
  //     return ans;
  //   }
  //   ans.push(text.split(",")[3]);
  //   return ans;
  // }, []);

  // translatedTextList = await translateOfflineSugoiCt2LongList(
  //   translatedTextList,
  //   1000000,
  //   false,
  //   true,
  //   false
  // );
  // .reduce(())
  // console.log(translatedTextList)
  // let translatedTextList = [...rawTextList].map((v) => {
  //   return handleWordWrap(47, v, "\r\n");
  // });
  // let i = 0;
  // let translatedTextList = [...rawTextList];
  // do {
  //   const currentText = translatedTextList[i]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const nextText = translatedTextList[i + 1]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const prefix = translatedTextList[i].match(/m\[[0-9]+\] = "/g)[0];
  //   const nextPrefix = translatedTextList[i + 1].match(/m\[[0-9]+\] = "/g)[0];
  //   const wordWrappedText = handleWordWrap(44, currentText, "\\n");
  //   const splittedTextList = wordWrappedText.split("\\n");
  //   if (nextText === "@@" && splittedTextList.length > 1) {
  //     translatedTextList[i] =
  //       prefix +
  //       splittedTextList[0].replace(/[『「]/g, "“").replace(/[」』]/g, "”") +
  //       '"';
  //     translatedTextList[i + 1] =
  //       nextPrefix +
  //       " " +
  //       splittedTextList
  //         .slice(1)
  //         .join(" ")
  //         .replace(/[『「]/g, "“")
  //         .replace(/[」』]/g, "”") +
  //       '"';
  //   }
  //   translatedTextList[i] = translatedTextList[i]
  //     .replace(/[『「]/g, "“")
  //     .replace(/[」』]/g, "”");
  //   i++;
  // } while (i < translatedTextList.length - 1);

  // translatedTextList = rawTextList.map((text) => {
  //   const prefix = text.match(/m\[[0-9]+\] = "/g);
  //   return (
  //     prefix +
  //     handleWordWrap(
  //       80,
  //       text.replace(/m\[[0-9]+\] = "/g, "").replace(/"$/g, ""),
  //       "\\r\\n"
  //     ) +
  //     '"'
  //   );
  // });
  // const translatedTextList = rawTextList.reduce((ans, curr) => {
  //   if (curr.match(/^</g)) {
  //     ans.push(curr);
  //   } else {
  //     ans[ans.length - 1] += (curr.length > 0 ? " " : "") + curr;
  //   }
  //   return ans;
  // }, []);
  // console.log(translatedTextList);
  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  isScript = false;
  let translatedFileContent = dataList.reduce((ans, rawText, index) => {
    if (!tanuki.translation.isNoFilter) {
      if (rawText.includes("endscript")) {
        isScript = false;
      }
      /////////////
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText === "" ||
        isScript
        // !rawText.match(containRegExpG2)
        // rawText.match(containTagNameRegExpI)
      ) {
        if (rawText.includes("iscript")) {
          isScript = true;
        }
        isDisable = false;
      }
      if (isDisable) return ans;
      ////////////////////
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText === "" ||
        isScript
        // !rawText.match(containTagNameRegExpI)
        // index === 0
        // !rawText.match(containRegExpG2)
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
      temp = temp;
      // let prefix = prefixList[count];
      // if (rawText.match(/(^	)/g)) {
      //   temp = rawText.match(/(	)+/g)[0] + temp;
      // }
      if (temp === "{Rt2},") {
        ans.push();
      } else
        ans.push(
          // handleWordWrap(
          //   67,
          //   temp,
          //   "\r\n",
          //   listCount[count]
          // )
          // handleWordWrap(67, temp, "\\n").replace(/(\\n)$/g,"")
          temp
          // handleWordWrap(67, temp, "\r\n", listCount[count], undefined)
          // prefix + (temp === "@@" ? "" : temp).replace(/,( )?/g, "、")
          // ("					\"" + temp + "\",")
          // temp
          // .replace(/@+/g,"」\\n「")
          // .replace(/,( )?/g, "、")
          // .replace(/、/g, ", ")
          // .replace(/[◆✩♥♡●♪]/g, "")
          // .replace(/❛/g, "’")
          // .replace(/é/g, "e")
          // .replace(/ō/g, "o")
          // .replace(/[àâ]/g, "a")
        );
      if (tanuki.translation.isArtemis) ans.push('					{"rt2"},');
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
    .join("\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding);
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
  // [...document.querySelectorAll(".chardetails")].reduce((ans,v)=>{
  //   const stripe = v.querySelector(".stripe");
  //   let temp = {};
  //   ans[stripe.querySelector("small").textContent] = stripe.querySelector("td a").textContent;
  //   return ans;
  // },{})
