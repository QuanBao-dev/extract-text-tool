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
  console.log(
    await translateOfflineSugoiCt2LongList(
      [
        "「あっ、あ、んっ……そう……それ……それを、もっと……",
        "　そのまま、ずっと……！」",
        "桃子さんは、多分夫の和弥さんに開発されただろう性感帯と、",
        "そこで気持ちよくなるやり方を、僕に教えてくれる。",
        "だってこれは、喫茶店の業務の一部なんだからね。",
        "そうだよね、桃子さん？",
        "「ひくひくしてきた……ほら、おま○こが、濡れて……",
        "　もうちょっとだよ桃子さん」",
        "「んっ！　んっ、あっ、あっ…………んんっ！」",
        "桃子さんの声が、どんどん艶を増してゆく。",
        "ああ…………すごい。",
        "昔から知ってる人が、別人のようになって……。",
        "「そこ、それっ！　あっ、いいっ、それっ！　あっ、んっ、",
        "　いいわっ、そこっ！」",
        "あられもない快感の声を張り上げると共に、",
        "膣口がきゅっと締まった。",
        "内側がさらに濡れてきて、指がふやけそう。",
        "動かすと、じゅぷじゅぷ、くちゅくちゅ、いやらしい音がする。",
        "「はあん、んっ、あっ、あっ、上手、いいわ……それ、んっ、",
        "　そこ、は、あ、ああ……あんっ、んっ、あっ！」",
      ],
      3,
      false,
      true,
      false,
      "med"
    )
  );
  await delay(10000000);

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
  const handledTexts = rawTexts.reduce((ans, curr, index) => {
    // if (curr.match(/^　/g)) {
    //   if (saveIndex === null) saveIndex = index;
    //   ans[saveIndex - 1] += curr;
    //   ans.push(" ");
    //   return ans;
    // } else {
    //   saveIndex = null;
    // }
    if (!curr.match(/[a-zA-Z_]/g)) {
      ans.push(curr);
      return ans;
    }
    return ans;
  }, []);
  const translationList = await translateOfflineSugoiCt2LongList(
    handledTexts,
    3,
    false,
    true,
    false,
    "med"
  );
  let count = 0;
  const ans = rawTexts.reduce((ans, curr, index) => {
    if (curr.match(/[a-zA-Z_]/g)) {
      ans[curr] = "";
      return ans;
    }
    ans[curr] = translationList[count];
    count++;
    return ans;
  }, {});
  await writeFile(filePath, JSON.stringify(ans, null, 2), encoding);
}
