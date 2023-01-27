const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateSelectCenterTextList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const handleWordWrap = require("./handleWordWrap");
const converter = new AFHConvert();
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList([
  //     "「この辺りだったら、@[夕鶴亭:ゆうかくてい]のお風呂が一番かしら？」",
  //     "「はじめまして、お母さんの友達の風岡@kです、よろしくね」",
  //     "「これも何かの縁ということで……改めまして、@[若月:わかつき]　@[莉緒:りお]です」",
  //     "しかし、旅先で相手を@[誑:たぶら]かすようなタイプにも見えないし、こういうやりとりを楽しむ人なんだろう。",
  //     "「いえ、こちらこそ、たのしい時間を過ごせましたよ。ええと……そういえば、自己紹介がまだでしたね。風岡　@kっていいます」"
  //   ].map((rawText) => {
  //     let textList = rawText.match(
  //       /@\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆:]+\]/g
  //     );
  //     if (!textList) return rawText;
  //     for (let i = 0; i < textList.length; i++) {
  //       rawText = rawText.replace(
  //         textList[i],
  //         textList[i].split(":")[1].replace("@[", "").replace("]", "")
  //       );
  //     }
  //     return rawText;
  //   }))
  // );
  // await delay(1000000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "「あの技術を『あの男』以外が手に入れたということは……",
  //       "　ワシらの企みも失敗したということじゃな……」",
  //       "レギナピスはまだその事実に気付いてはいなかったが、",
  //       "やがて下魔達が彼女の体に触れると――――",
  //       "「い、いやじゃあああああああぁぁぁぁぁーーーーーーーーーー",
  //       "　ーーーーーーーーーーーーーーーーーーッッ！！！！！」",
  //       "「魔族」と呼称するようになる。",
  //       "研究機関は新発見されたエネルギーを",
  //       "アークと名付ける。",
  //       "〈アークシオン〉",
  //       "女性",
  //       "「あ、もっしー。うん、もう帰るところー。",
  //       "　今日の合コン、マジなかったわぁ。",
  //       "　いらねー、おっさんとフリーターとかマジいらねー」",
  //       "「でも、怖がらせちゃったのは、",
  //       "　間違いなく私たちだから……本物のヒーローみたいに、",
  //       "　安心させてあげたかったのに……」",

  //     ],
  //     3,
  //     false,
  //     false,
  //     true
  //   )
  // );
  // await delay(1000000);
  const filePathInput = "./anim/script.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const json = JSON.parse(jsonRawText);
  const rawTextList = Object.keys(json);

  // let i = 0;
  // let translatedTextList = [...rawTextList].map((v) => json[v]);
  // do {
  //   const value = translatedTextList[i];
  //   const nextValue = translatedTextList[i + 1];
  //   const wordWrappedText = handleWordWrap(58, value, "\\n");
  //   const splittedTextList = wordWrappedText.split("\\n");
  //   if (nextValue === "@@" && splittedTextList.length > 1) {
  //     translatedTextList[i] = splittedTextList[0];
  //     translatedTextList[i + 1] =
  //       splittedTextList.slice(1).join(" ") === ""
  //         ? " "
  //         : splittedTextList.slice(1).join(" ");
  //   }
  //   i++;
  // } while (i < translatedTextList.length - 1);

  const translationList = await translateOfflineSugoiCt2LongList(
    rawTextList,
      // .map((v) => json[v])
      // .filter(
      //   (rawText) => !rawText.match(/_/g)
      //   && rawText !== "@@" && rawText !== ""
      //   // (rawText) => json[rawText] !== ""
      // ),
    // .map((rawText) => {
    //   let textList = rawText.match(
    //     /@\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆:]+\]/g
    //   );
    //   if (!textList) return rawText;
    //   for (let i = 0; i < textList.length; i++) {
    //     rawText = rawText.replace(
    //       textList[i],
    //       textList[i].split(":")[1].replace("@[", "").replace("]", "")
    //     );
    //   }
    //   return rawText;
    // })
    3,
    false,
    true,
    true
  );
  let ans = {};
  let count = 0;
  // translatedTextList = translatedTextList.map((translatedText) => {
  //   if (translatedText === "@@") return " ";
  //   return translatedText;
  // });
  rawTextList.forEach((rawText, index) => {
    // ans[rawText] = translatedTextList[index];
    // if (rawText.match(/_/g)) {
    //   ans[rawText] = "";
    // } else
    // {
    //   ans[rawText] = translationList[count];
    //   count++;
    // }
    // if (json[rawText] === "@@") {
    //   ans[rawText] = "@@";
    // } else {
      ans[rawText] = translationList[count];
      count++;
    // }
  });
  // ans = rawTextList.reduce((ans, key) => {
  //   if (key.includes(",") || key.match(/[a-z]/g)) {
  //     ans[key] = "";
  //     return ans;
  //   }
  //   ans[key] = converter.toHalfWidth(json[key]);
  //   return ans;
  // }, {});
  await writeFile(filePathInput, JSON.stringify(ans, null, 2), "utf8");
  console.log("Done");
  await delay(1000000);
})();
