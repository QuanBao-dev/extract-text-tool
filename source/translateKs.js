const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const { ks } = require("../setting.json");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
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
  //   await translateOfflineSugoiCt2LongList([
  //     "怯えてるんだ……？　ふふっ……やっぱり、君って素質あるよ……",
  //     "それで、目覚めたはいいけど。自己主張の激しい子も一緒に元気になってるよ",
  //     "甘くて、優しくて、ずっとしていたい心地よさに頭が覚醒することを妨げている感じがした。",
  //     "濡れたような声が耳元で響いた気がした。",
  //     `「はーい。お冷やお持ちしましたー。[ruby text="ワン"]１[/ruby]、[ruby text="ツー"]２[/ruby]ーっとご注文はいかがいたしますスか？」`
  //   ]),
  //   1
  // );

  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       "25500 ,,,,,,,,,,,,,,,,,,,すべてを捨てて殺風景になった部屋で、スマホから婚活サイトに登録して、三度、四度とイベントに参加して……"
  //     ],
  //     1
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
  const dataList = fileContent.split(/\r\n/g);
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
      await translateSelectCenterTextList(dataList, 1)
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
        rawText === "" ||
        rawText.match(containRegExpG2)
      ) {
        isNewDialog = true;
        return ans;
      }
      if (ans.length > 0 && isNewDialog === false) {
        dataList[index - 1] = dataList[index - 1].replace(containRegExpG, "");
        ans[ans.length - 1] = ans[ans.length - 1].replace(exceptRegExpG, "");
      }
      ans.push(rawText + addedString);
      dataList[index] = dataList[index] + addedString;
      isNewDialog = false;
      return ans;
    }, [])
    .reduce((ans, rawText) => {
      count3++;
      if (temp === "") {
        temp += rawText.trim();
      } else {
        temp += rawText.trim();
      }
      if (rawText.match(exceptRegExpG)) {
        ans.push(temp.replace(exceptRegExpG, "").replace(/／/g, ""));
        temp = "";
        listCount.push(count3);
        count3 = 0;
      }
      return ans;
    }, []);
  // console.log(rawTextList);
  // const translatedTextList = await translateOfflineSugoiLongList(
  //   rawTextList,
  //   ks.translation.numberOfSentences
  // );
  // console.log(rawTextList);
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    1,
    false
  );
  // const translatedTextList = await translateSelectCenterTextList(
  //   rawTextList,
  //   1
  // );
  // const translatedTextList = rawTextList.map((text) => text + "[plc]");
  // const translatedTextList = rawTextList.map((text) => handleWordWrap(76,text,"[r]"));
  let count = 0;
  let isDisable = false;
  const translatedFileContent = dataList
    .reduce((ans, rawText) => {
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText === "" ||
        rawText.match(containRegExpG2)
      )
        isDisable = false;
      if (isDisable) return ans;
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText === "" ||
        rawText.match(containRegExpG2)
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
          //     : 41,
          //   temp,
          //   "\n",
          //   listCount[count]
          // )
          temp
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
