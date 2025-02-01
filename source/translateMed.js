const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { med } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  med.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = med.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  med.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "「まずは、お食事ですね。準備をしてまいりますので",
  //       "そう言って二人は、いったん部屋を出ていく。」",
  //       "ボクは、部屋の中などを眺めつつ、待つことにした。",
  //       "しばらくして、彼女たちが、食事の膳などを持って",
  //       "戻ってくる。",
  //       "徳利に、御猪口などもあった。",
  //       "この家では、すべてが和風で統一されているようだ。",
  //       "そして、彼女たちは着替えていて……。",
  //       "親子揃って、ものすごい格好になっていた。",
  //       "肌襦袢、というやつだろうか？",
  //       "透け透けで、乳首まで丸わかりの状態だった。",
  //       "おまけに丈は短くて、陰毛が見えている。",
  //       "この服装に関しては、別にボクは指示していない。",
  //       "じっと観察していると、栞里さんが不安そうな顔で",
  //       "「あの、もしかして、この格好……ご主人様は、",
  //       "　お気に召しませんでしたか？」",
  //     ],
  //     3,
  //     false,
  //     true,
  //     false,
  //     "med"
  //   )
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(med.translation.folderPath);
  let start = 0;
  let numberAsync = med.translation.numberOfFiles;

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
              await translateFileMed(
                `${med.translation.folderPath}/${fileName}`,
                med.translation.isSelects,
                med.translation.isTagName,
                med.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = med.translation.numberOfFiles;
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

async function translateFileMed(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  const json = JSON.parse(fileContent);
  // console.log(json);
  const rawTexts = Object.keys(json);
  let saveIndex = null;
  // const handledTexts = rawTexts.reduce((ans, curr, index) => {
  //   // if (curr.match(/^　/g)) {
  //   //   if (saveIndex === null) saveIndex = index;
  //   //   ans[saveIndex - 1] += curr;
  //   //   ans.push(" ");
  //   //   return ans;
  //   // } else {
  //   //   saveIndex = null;
  //   // }
  //   if (!curr.match(/[a-zA-Z_]/g)) {
  //     ans.push(curr);
  //     return ans;
  //   }
  //   return ans;
  // }, []);
  const translationList = (
    await translateOfflineSugoiCt2LongList(
      rawTexts,
      3,
      false,
      true,
      false,
      "med"
    )
  ).map((v) => (v === "" ? " " : v));

  let count = 0;
  const ans = rawTexts.reduce((ans, curr, index) => {
    ans[curr] = translationList[count];
    count++;
    return ans;
  }, {});
  await writeFile(filePath, JSON.stringify(ans, null, 2), encoding);
}
// [一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟]"
