const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateSelectCenterTextList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrap = require("./handleWordWrap");
const converter = new AFHConvert();
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList([
  //     "『下着を履かせたまま』,txPS0202_02",
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
  //   }),3,false,false,false,"BGI")
  // );
  // await delay(1000000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "[昴]（しかし、流石に人手が足りないなー……）\\f",
  //     ],
  //     3,
  //     false,
  //     false,
  //     false,
  //     "aos"
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
  // const translationList = rawTextList
  const translationList = await translateOfflineSugoiCt2LongList(
    rawTextList
      .map((text) => text.replace(/◆/g, "").replace(/@[nb]/g,"").replace(/@[a-zA-Z0-9]+/g,""))
      // .filter((v) => json[v] === "")
      // .map((v) => json[v])
      // .filter(
      //   (rawText) => !rawText.match(/_/g)
      //   && rawText !== "@@" && rawText !== ""
      //   // (rawText) => json[rawText] !== ""
      // ),
      .map((rawText) => {
        let textList = rawText.match(
          /@\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『「」』？＆:]+\]/g
        );
        if (!textList) return rawText;
        for (let i = 0; i < textList.length; i++) {
          rawText = rawText.replace(
            textList[i],
            textList[i].split(":")[1].replace("@[", "").replace("]", "")
          );
        }
        return rawText;
      })
      ,
    3,
    false,
    true,
    false,
    "srp"
  );
  let ans = {};
  let count = 0;
  // translatedTextList = translatedTextList.map((translatedText) => {
  //   if (translatedText === "@@") return " ";
  //   return translatedText;
  // });
  rawTextList.forEach((rawText, index) => {
    // json[rawText] = converter.toFullWidth(translationList[count]);
    json[rawText] = translationList[count];
    count++;
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
    // if (json[rawText] === "") {
    //   json[rawText] = translationList[count];
    //   count++;
    // }
    // ans[rawText] = json[rawText]
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
  await writeFile(filePathInput, JSON.stringify(json, null, 2), "utf8");
  console.log("Done");
  await delay(1000000);
})();
