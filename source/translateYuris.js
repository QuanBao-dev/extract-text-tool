const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { yuris } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");

(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "キャラ名定義の記述方法が新しい仕様に変わりました。記述の修正をお願いします。",
  //       "キャラ名定義の記述方法が新しい仕様に変わりました。記述の修正をお願いします。",
  //       "剛志「通報するかね？　私は一向に構わないが。ほら、手を伸ばせばすぐそこに電話があるぞ？」",
  //       "バックログ画面のサンプルです。",
  //       "背景透過度を変更することができます。",
  //       "？？？／由季菜「れろぉ……れるぅっ、れろぉっ……」",
  //       "／"
  //     ],
  //     2,
  //     false,
  //     true,
  //     false,
  //     "yuris2"
  //   )
  // );
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "【四魔鬼族Ａ】「すまぬ、義弟よ……！　我ら四魔鬼族生まれし",
  //       "日、時は違えども兄弟の契りを結びしからは…",
  //       "…ぐふっ」",
  //     ],
  //     1,
  //     false,
  //     true,
  //     false,
  //     "yuris2"
  //   )
  // );
  // await delay(10000000);

  try {
    const listFileName = fs.readdirSync(yuris.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileYuris(
        yuris.translation.folderPath + "/" + listFileName[i]
      );
    }
  } catch (error) {
    console.log(error);
  }
  await delay(10000000);
})();

async function translateFileYuris(filePath) {
  const text = await readFile(filePath, "utf8");
  const data = JSON.parse(text);
  let ans = {};
  for (let i = 0; i < Object.keys(data).length; i++) {
    const key = Object.keys(data)[i];
    const rawTextList = data[key].filter((v) => {
      return (
        !v.match(/\//g) && !v.match(/_/g && !v.match(/\\/g)) && !v.match(/■/g)
      );
      // return v.match(/[【『「（]/g) && !v.match(/\//g);
      // return !v.match(/[a-zA-Z0-9]/g);
      return v.match(/[【]/g);
    });
    const translatedTextList = await translateOfflineSugoiCt2LongList(
      rawTextList,
      2,
      false,
      true,
      false,
      "yuris2"
    );
    // console.log(rawTextList)
    // const translatedTextList = await translateSelectCenterTextList(
    //   rawTextList,
    //   2,
    //   false,
    //   yuris,
    //   "srp"
    // );
    let count = 0;
    ans[key] = data[key].map((v) => {
      if (
        !v.match(/\//g) &&
        !v.match(/_/g && !v.match(/\\/g)) &&
        !v.match(/■/g)
      ) {
        return translatedTextList[count++];
      }
      // if (v.match(/[【『「（]/g) && !v.match(/\//g)) {
      //   return translatedTextList[count++]
      //     .replace(/\(/g, "（")
      //     .replace(/\)/g, "）");
      // }
      // if (!v.match(/[a-zA-Z0-9]/g)) {
      //   return translatedTextList[count++];
      // }
      // if (v.match(/[【]/g)) {
      //   return translatedTextList[count++]
      //     .replace(/\(/g, "（")
      //     .replace(/\)/g, "）");
      // }
      return v;
    });
    await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
  }
}
