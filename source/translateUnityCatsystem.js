const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { catsystem } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");

(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       // "緑野の瑞風…Shaonが使う回復系の天眷。対象１体を回復する。怪我をしてない対象に、この天眷をかけると生命力が溢れ各能力が上昇する。",
  //       // "「かおるこ先輩とは上手くいってるんでしょうね？　もし悲しませたりしていたら承知しないわよ」",
  //       // "「心配しなくても大丈夫だって。そもそも桜木はかおることしょっちゅう会って話してるんじゃないのか？」",
  //       // "「かおることか呼ばないで。イラッとくるから」",
  //       // "少なくともこの俺……\nABはそう思っている。",
  //       "肉体の耐久性や俊敏性、筋力などは俺達[人間/ヒューム]より格段に上の種族である。",
  //     ],
  //     2,
  //     undefined,
  //     true,
  //     false,
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
    const listFileName = fs.readdirSync(catsystem.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileBsxx(
        catsystem.translation.folderPath + "/" + listFileName[i]
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
  const dataList = text.split("\r\n");
  let contentText = dataList.map((text) => {
    return removeThePrefix(text);
  });
  console.time(filePath);
  const prefixList = dataList
    .map((text) => {
      return extractThePrefix(text);
    })
    .filter((v) => v.includes("☆"));
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
  // const rawTextList = contentText
  //   .reduce((ans, curr) => {
  //     if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
  //       ans.push(
  //         curr
  //         // .replace(//g, "♥")
  //       );
  //     }
  //     temp = curr;
  //     return ans;
  //   }, [])
  //   .map((v) => v.split("／")[0]);
  const list = contentText.reduce((ans, curr) => {
    if (
      temp.trim().replace(/[☆★]/g, "") !== curr.trim().replace(/[☆★]/g, "") &&
      curr !== ""
    ) {
      ans.push(
        curr
        // .replace(/\\n/g, " ")
        // .replace(//g, "♥")
      );
    }
    temp = curr;
    return ans;
  }, []);
  const narrowedContentText = await translateOfflineSugoiCt2LongList(
    list,
    catsystem.translation.numberOfSentences,
    false,
    true,
    false,
    "catsystem",
    ""
  );
  const translatedContentText = narrowedContentText.reduce(
    (ans, curr, index) => {
      ans.push(prefixList[index] + list[index]);
      let text = curr.replace(/ /g, "　");
      if (prefixList[index].includes("name")) {
        text = text.replace(/^ー/g, "");
      }
      ans.push(
        // handleWordWrap(
        //   53,
        //   curr
        //     .replace(/『“/g, "『")
        //     .replace(/”』/g, "』")
        //     .replace(/『+/g, "『")
        //     .replace(/』+/g, "』")
        //     .replace(/\u275b/g, "")
        //     .replace(/\xe9/g, "e")
        //     .replace(/\u2013/g, "-")
        //     .replace(/\xef/g, "i")
        //     .replace(/\xe0/g, "a"),
        //   "\\n"
        // ) + ((rawTextList[index] || "").match(/(\\n)$/g) ? "\\n" : "")
        prefixList[index].replace(/☆/g, "★") +
          text.replace(/’/g, "'").replace(/、/g, ",　")
      );
      ans.push("");
      ans.push("");
      return ans;
    },
    []
  );
  // const ans = prefixList
  //   .map(
  //     (prefixText, index) =>
  //       prefixText +
  //       (translatedContentText[index]
  //         ? translatedContentText[index]
  //         : ""
  //       ).replace(/XXX/g, "")
  //   )
  //   .join("\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedContentText.join("\r\n"), "utf8", true);
}

function extractThePrefix(text) {
  // const matchedText = text.match(/[●○].+[○●]/g);
  const matchedText = text.match(/[☆★○●◆◇][a-zA-Z0-9_\|]+[☆★○●◆◇](\\b)?( )?/g);
  if (!matchedText) return "";
  return matchedText[0];
}

function removeThePrefix(text) {
  return text.replace(/[☆★◆◇○●][a-zA-Z0-9_\|]+[☆★○●◆◇](\\b)?( )?/g, "");
}
// ○○○○
