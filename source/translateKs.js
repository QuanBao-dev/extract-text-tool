const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { ks } = require("../setting.json");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  ks.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = ks.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  ks.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "「わ、私・・・・・・そういうのあまり気にしてなかったんですけど・・・・・・。も、もしかして・・・・・・。日常的にバンツを見せて飛んでいましたか?」",
  //       "怯えてるんだ……？　ふふっ……やっぱり、君って素質あるよ……",
  //       "それで、目覚めたはいいけど。自己主張の激しい子も一緒に元気になってるよ",
  //       "甘くて、優しくて、ずっとしていたい心地よさに頭が覚醒することを妨げている感じがした。",
  //       "濡れたような声が耳元で響いた気がした。",
  //     ],
  //     5,
  //     false,
  //     true,
  //     true
  //   )
  // );

  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       `&0"「こっち。こっちだよー」"#:NameSuffix`,
  //       `&1"「むにゃむにゃ……おっぱいだ　待ってよーあははははは」"`,
  //       `&13"澄野撫子。今日も寝坊しかけた俺と違って、昔からしっかり者の姉ちゃんだ。"&14"同い年でありながら、俺は体の隅々まで悲しいかな、今のような具合にしつけられている。"`,
  //       `&20"「朝ごはんを:NameSuffixと一緒に食べるのは当然じゃない」"42("DEL","02DrawFc.dat")`,
  //       `&53"「へ？　う、うん。(e)俺も姉ちゃんがいつも母さん達に内緒にしてくれる事には感謝してるよ！　ありがとな！」"`,
  //       `&28"「ハハハ…」"&29"俺は思わず引きつった笑みを浮かべる。これは、姉ちゃんが何かを訴える時の合図だ。"_Target=@CharC,`,
  //       `&46"どこから出したのか、５枚ほどの原稿用紙を差し出す姉ちゃん。それを埋める所要時間は経験から言って２時間～３時間。"#:NameSuffix`,
  //       `&34"我ながら分かりやすすぎるリアクションだ。"&35"姉ちゃんは箸をおくと、冷たさの漂う目で俺を見つめた。"_Target=@CharC,`,
  //     ],
  //     2,
  //     true
  //   )
  // );
  // await delay(10000000);
  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       `春の空を<r うすくれない>薄紅</r>に染める。`,
  //     ],
  //     2,
  //     true
  //   )
  // );
  // console.log(
  //   handleWordWrap(
  //     20,
  //     "The quick brown fox jumps over the lazy dog",
  //     "\n",
  //     5,
  //     undefined
  //   )
  // );
  // console.log(
  //   handleWordWrap(
  //     53,
  //     `&300"【車内アナウンス】「Next is... Ichiou Academy、Ichigakuen-mae、and the(e)exit is to the left. This is the Tozai Line of the(e)subway North-South Line.」"`,
  //     "\n",
  //     6
  //   )
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(ks.translation.folderPath);
  let start = 0;
  let numberAsync = ks.translation.numberOfFiles;

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
                `${ks.translation.folderPath}/${fileName}`,
                ks.translation.isSelects,
                ks.translation.isTagName,
                ks.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = ks.translation.numberOfFiles;
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

async function translateFileKs(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  let dataList = fileContent.split(/\n/g);
  // console.log(dataList);
  // let temp2 = [];
  // dataList.forEach(text => {
  //   const textList = text.split("\n");
  //   textList.forEach((text) => temp2.push(text));
  // });
  // dataList = [...temp2];
  let temp = "";
  console.time(filePath);
  if (isTagName) {
    const { rawTextList, alternativeTextList } = dataList.reduce(
      (ans, rawText) => {
        if (rawText === "") return ans;
        if (
          rawText.match(containTagNameRegExpI) &&
          rawText.match(
            /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
          )
        ) {
          // console.log(ans);
          ans.alternativeTextList.push(
            rawText.match(
              /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
            )[0]
          );
        }

        if (
          rawText.match(containTagNameRegExpI) &&
          !rawText.match(
            /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
          )
        ) {
          ans.rawTextList.push(
            rawText.match(
              /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
            )[0]
          );
        }

        return ans;
      },
      { alternativeTextList: [], rawTextList: [] }
    );
    const translatedTextList = await translateOfflineSugoiLongList(
      rawTextList,
      300
    );
    const translatedAlternativeTextList = await translateOfflineSugoiLongList(
      alternativeTextList,
      300
    );
    let count = 0;
    let count2 = 0;
    const translatedContentFile = dataList
      .map((rawText) => {
        if (!rawText.match(containTagNameRegExpI)) return rawText;
        if (
          rawText.match(
            /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
          ) &&
          !rawText.match(
            /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
          )
        ) {
          rawText = rawText.replace(
            /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g,
            translatedTextList[count2].replace("Voice of the Heart", "心の声")
          );
          count2++;
        }
        if (
          rawText.match(
            /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g
          )
        ) {
          rawText = rawText.replace(
            /\/[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆]+/g,
            translatedAlternativeTextList[count]
              .replace("/ ", "/")
              .replace("The Voice of the Heart", "心の声")
          );
          count++;
        }
        let text = rawText
          .match(
            /[一-龠ぁ-ゔァ-ヴーA-Zａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ -ﾟ〟！～『「」』？＆]+/g
          )[0]
          .replace(/name=/g, 'name="');
        if (rawText.match(/(^	)/g)) text = rawText.match(/(	)+/g)[0] + text;

        if (text.match(/ voice=/g)) {
          text = text.replace(/ voice=/g, '" voice=');
        }
        if (rawText.match(/name=/i)) {
          // text = "@Talk " + text;
          if (!text.match(/ voice=/g)) {
            text += '"';
          }
        }
        return text;
      })
      .join("\r\n");
    return await writeFile(
      filePath,
      translatedContentFile.replace(/\?\?\?/g, "? ? ?"),
      encoding
    );
  }
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(dataList, 1, false)
    ).join("\r\n");
    return await writeFile(filePath, translatedFileContent, encoding);
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === ""
        // !rawText.match(containRegExpG2)
        // rawText.match(containTagNameRegExpI)
      ) {
        isNewDialog = true;
        return ans;
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
      ans.push(rawText.replace(/\[Cock\]/g, ""));
      return ans;
      count3++;
      temp += " " + (rawText.trim() === "---" ? "" : rawText.trim());
      if (rawText.match(/\[Cock\]/)) {
        ans.push(
          temp
            .replace(/\[Cock\]/g, "")
            .replace(/\[np\]/g, "")
            .replace(/\[r\]/g, "")
            .replace(/\n/g, " ")
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
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    5,
    false,
    true,
    true
  );
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
  //   3,
  //   true
  // );

  // console.log(translatedTextList)
  // translatedTextList = translatedTextList.map((text) => text + "[np]");

  // let translatedTextList = [...rawTextList];
  // let i = 0;
  // do {
  //   const currentText = translatedTextList[i]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const nextText = translatedTextList[i + 1]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const prefix = translatedTextList[i].match(/m\[[0-9]+\] = "/g)[0];
  //   const nextPrefix = translatedTextList[i + 1].match(/m\[[0-9]+\] = "/g)[0];
  //   const wordWrappedText = handleWordWrap(76, currentText, "\\n");
  //   const splittedTextList = wordWrappedText.split("\\n");
  //   if (nextText === "" && splittedTextList.length > 1) {
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
  // const translatedTextList = rawTextList;
  // console.log(translatedTextList);
  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  const translatedFileContent = dataList
    .reduce((ans, rawText) => {
      // if (
      //   (rawText.trim().match(containRegExpI) &&
      //     !rawText.trim().match(exceptRegExpI)) ||
      //   rawText.trim() === ""
      //   // !rawText.match(containRegExpG2)
      //   // rawText.match(containTagNameRegExpI)
      // )
      //   isDisable = false;
      // if (isDisable) return ans;
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === ""
        // !rawText.match(containRegExpG2)
        // rawText.match(containTagNameRegExpI)
      ) {
        ans.push(rawText);
        return ans;
      }
      if (translatedTextList[count]) {
        let temp = addedPrefixAfterTranslation + translatedTextList[count];
        // if (rawText.match(/(^	)/g)) {
        //   temp = rawText.match(/(	)+/g)[0] + temp;
        // }
        temp = temp + addedStringAfterTranslation;
        // console.log(temp, listCount[count]);
        ans.push(
          // handleWordWrap(
          //   Math.floor(temp.length / listCount[count]) < 41
          //     ? Math.floor(temp.length / listCount[count])
          //     : 46,
          //   temp,
          //   "\r\n",
          //   listCount[count]
          // )
          // handleWordWrap(57, temp, "\\n")
          // handleWordWrap(56, temp, "\r\n", listCount[count], undefined)
          temp
          // .replace(/、/g, ", ")
          // .replace(/[◆✩♥♡●♪]/g, "")
          // .replace(/❛/g, "’")
          // .replace(/é/g, "e")
          // .replace(/ō/g, "o")
          // .replace(/[àâ]/g, "a")
        );
        if (ks.translation.isArtemis) ans.push('					{"rt2"},');
      } else {
        ans.push("");
      }
      isDisable = true;
      count++;
      return ans;
    }, [])
    .join("\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding);
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
//   const characters = [...curr.querySelectorAll(".chardetails")]
//   characters.forEach(character => {
//       ans[character.querySelector("tr b").textContent]=character.querySelector("tr a").textContent
//   })
//      return ans;
// },{})
// ○○○○
