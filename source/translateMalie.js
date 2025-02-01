const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { malie } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");

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
  //       "　{v_zep0014}人ならば誰しも、いいやどんな生物であろうと例外なく勝利という結果を目指す。それが自然で、当たり前の行動原理 だ。そもそも負けてばかりでは生きることさえ難しく、無制限に敗者を許してくれるほど世の中は甘い形に出来てはいない。",
  //     ],
  //     3,
  //     false,
  //     true,
  //     false,
  //     "malie",
  //     "",
  //     false,
  //     false,
  //     false,
  //     false
  //   )
  // );
  // await delay(10000000);

  try {
    const listFileName = fs.readdirSync(malie.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileMalie(
        malie.translation.folderPath + "/" + listFileName[i]
      );
    }
  } catch (error) {
    console.log(error);
  }
  await delay(10000000);
})();

async function translateFileMalie(filePath) {
  const text = await readFile(filePath, "utf8");
  // return await writeFile(filePath, text, "utf8");
  console.log(filePath);
  const dataList = text.split("\r\n");
  let contentText = dataList.map((text) => {
    return removeThePrefix(text);
  });
  console.time(filePath);
  const prefixList = dataList.map((text) => {
    return extractThePrefix(text);
  });
  let temp = "";
  const narrowedContentText = contentText.reduce((ans, curr) => {
    if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
      ans.push(curr);
    }
    temp = curr;
    return ans;
  }, []);

  for (let i = 0; i < narrowedContentText.length; i++) {
    const textList = narrowedContentText[i].split("[z]");
    const translatedTextList = await translateOfflineSugoiCt2LongList(
      textList,
      malie.translation.numberOfSentences,
      false,
      true,
      false,
      "malie",
      "",
      false,
      false,
      false,
      false
    );
    narrowedContentText[i] = translatedTextList.join("[z]");
  }

  const contentTextList = contentText.reduce((ans, curr) => {
    if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
      ans.push(curr);
    }
    temp = curr;
    return ans;
  }, []);
  const translatedContentText = narrowedContentText.reduce(
    (ans, curr, index) => {
      ans.push(contentTextList[index]);
      ans.push(curr);
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
    .join("\r\n");
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
