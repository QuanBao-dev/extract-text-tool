const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { willadv } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");

(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "緑野の瑞風…Shaonが使う回復系の天眷。対象１体を回復する。怪我をしてない対象に、この天眷をかけると生命力が溢れ各能力が上昇する。",
  //       "「かおるこ先輩とは上手くいってるんでしょうね？　もし悲しませたりしていたら承知しないわよ」",
  //       "「心配しなくても大丈夫だって。そもそも桜木はかおることしょっちゅう会って話してるんじゃないのか？」",
  //       "「かおることか呼ばないで。イラッとくるから」",
  //       "少なくともこの俺……\n\A\Bはそう思っている。"
  //     ],
  //     2,
  //     undefined,
  //     true,
  //     true,
  //     "srp"
  //   )
  // );
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "▷康也◁「ふふ、頼んだぜー」"
  //     ],
  //     3,
  //     false,
  //     true,
  //     false,
  //     "willadv"
  //   )
  // );
  // await delay(10000000);

  try {
    const listFileName = fs.readdirSync(willadv.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileBsxx(
        willadv.translation.folderPath + "/" + listFileName[i]
      );
    }
  } catch (error) {
    console.log(error);
  }
  await delay(10000000);
})();

async function translateFileBsxx(filePath) {
  const text = await readFile(filePath, "utf8");
  // return await writeFile(filePath, text, "utf8");
  console.log(filePath);
  const dataList = text.split("\n");
  let contentText = dataList.map((text) => {
    return removeThePrefix(text);
  });
  console.time(filePath);
  const prefixList = dataList.map((text) => {
    return extractThePrefix(text);
  });
  // return retranslatedSpecificLines();
  let temp = "";
  // const narrowedContentText = await translateOfflineSugoiCt2LongList(
  //   contentText.reduce((ans, curr) => {
  //     if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
  //       ans.push(curr.replace(/\\n/g, "").replace(//g, "♥"));
  //     }
  //     temp = curr;
  //     return ans;
  //   }, []),
  //   bsxx.translation.numberOfSentences,
  //   undefined,
  //   true,
  //   true
  // );
  // " ": "見神 航平",
  const narrowedContentText = await translateOfflineSugoiCt2LongList(
    contentText.reduce((ans, curr) => {
      if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
        ans.push(
          curr.replace(/\\n/g, "")
          // .replace(//g, "♥")
        );
      }
      temp = curr;
      return ans;
    }, []).map((v) => v.split("／")[0]),
    willadv.translation.numberOfSentences,
    false,
    true,
    false,
    "willadv2",
    ""
  );
  const translatedContentText = narrowedContentText.reduce(
    (ans, curr, index) => {
      ans.push(
        contentText.reduce((ans, curr) => {
          if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
            ans.push(curr);
          }
          temp = curr;
          return ans;
        }, [])[index]
      );
      ans.push(
        curr
          .replace(/『“/g, "『")
          .replace(/”』/g, "』")
          .replace(/『+/g, "『")
          .replace(/』+/g, "』")
          .replace(/\u275b/g, "")
          .replace(/\xe9/g, "e")
          .replace(/\u2013/g, "-")
          .replace(/\xef/g, "i")
          .replace(/\xe0/g, "a")
      );
      ans.push("");
      return ans;
    },
    []
  );
  const ans = prefixList
    .map(
      (prefixText, index) =>
        prefixText +
        (translatedContentText[index]
          ? translatedContentText[index]
          : ""
        ).replace(/XXX/g, "")
    )
    .join("\n");
  console.timeEnd(filePath);
  await writeFile(filePath, ans, "utf8");
}

function extractThePrefix(text) {
  // const matchedText = text.match(/[●○].+[○●]/g);
  const matchedText = text.match(/[○●◆◇][a-zA-Z0-9\|]+[○●◆◇](\\b)?( )?/g);
  if (!matchedText) return "";
  return matchedText[0];
}

function removeThePrefix(text) {
  return text.replace(/[◆◇○●][a-zA-Z0-9\|]+[○●◆◇](\\b)?( )?/g, "");
}
// ○○○○
