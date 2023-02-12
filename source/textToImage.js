const textToImage = require("text-to-image");
const delay = require("./delay");
const fs = require("fs");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const extractTextFromImage = require("./textFromImage");
const { textToImageSetting } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");
const textList = [
  { index: "04", name: "アマミヤ" },
  { index: "05", name: "シガニー" },
  { index: "06", name: "リッサ" },
  { index: "07", name: "マコ" },
  { index: "08", name: "ミナ" },
  { index: "09", name: "ジョン" },
  { index: "10", name: "ラッセル" },
  { index: "11", name: "ダニエル" },
  { index: "12", name: "マッド" },
  { index: "13", name: "タロウ" },
  { index: "14", name: "アーノルド" },
];
(async () => {
  const width = textToImageSetting.width;
  const height = textToImageSetting.height;
  const margin = textToImageSetting.margin;
  // console.log(await extractTextFromImage("./raw_images/028_ts.png"))
  let listFileName = fs.readdirSync(`./${textToImageSetting.fileInputPath}`);
  const listExtractedFileName = listFileName.map((text) =>
    text
      .replace("name_", "")
      .replace(".png", "")
      .replace("：", " ")
      .replace("_f", "")
  );
  // const listExtractedFileName = [
  //   "“いつか虹の根元を見に行こうよ”",
  //   "暗い空の下、高い高い時計台の巣の中で、彼女は夢見るよう囀った。",
  //   "――眼下に広がる霧。遠い遠い地面。その場に横たわれば、自身を包む優しいぬくもり。",
  //   "踏み出さなければ、落ちることはない。けれど、けれどね――踏み出さなければ、この羽は夜露をふりほどけない。",
  //   "羽を広げることを恐れ、震え、戸惑い、けれど、けれどね――彼女は心の中に再びあの言葉を灯す。",
  //   "“虹の根元を見に行こう”",
  //   "――彼女は前を見て、踏み出す。この空への一歩を。得体の知れない世界に向かって、その左足を。",
  //   "“飛び方は知っているだろう？”",
  //   "かつて交わしたその言葉を胸に、彼女は身をかがめ、飛び出した。",
  //   "まるで、暗い昏い空に落ちていくように――",
  //   "ここから本当のナオカの日々が始まるのだろう。",
  //   "“リーザルさん……”",
  //   "呆然と呟くわたしの前には、おかーさんの……ううん、わたしの大事な人はいない。",
  //   "ただ、わたしの手には折れた角が残るだけだった",
  // ];
  // const listExtractedFileName = await Promise.all(
  //   listFileName.slice(0,1).map(
  //     async (filePath) =>
  //       await extractTextFromImage(
  //         `${textToImageSetting.fileInputPath}/${filePath}`
  //       )
  //   )
  // );
  // console.log(listExtractedFileName)
  const translatedTexts = await translateOfflineSugoiCt2LongList(
    textList.map(({ name }) => name),
    1,
    false,
    true,
    false
  );
  // const translatedTexts =
  //   translatedTexts.map(
  //     (v, key) => (key + 1 < 10 ? "0" + (key + 1) : key + 1)+"\t" + v
  //   ).join("\n")
  // .map((v) => "name_" + v.replace(/\./g,"") + ".png");
  // .map((txt) => {
  //   return handleWordWrap(42,txt.replace("Dahlia","Daria"),"\n")
  // });
  console.log(listFileName, translatedTexts);
  await Promise.all(
    translatedTexts.map(async (translatedText, index) => {
      let fontSize = 20;
      // if(listExtractedFileName[index] === "眉毛にピアスの男") fontSize = 20
      // if(translatedText.length )
      return await textToImage.generate(translatedText.replace(/\./g, ""), {
        maxWidth: width,
        customHeight: height,
        debug: true,
        fontFamily: "MS Gothic",
        fontSize: fontSize,
        fontWeight: "600",
        lineHeight: 30,
        // margin,
        verticalAlign: "center",
        bgColor: "black",
        textColor: "white",
        textAlign: "center",
        debugFilename: `./raw_images_output/name_${
          // listExtractedFileName[index]
          textList[index].index
          // translatedText.replace(/\./g, "").replace(/ /g, "　")
        }.png`,
      });
    })
  );
  // await Promise.all(
  //   translatedTexts.map(async (translatedText, key) => {
  //     fs.renameSync(
  //       "./raw_images_output/" + listFileName[key],
  //       "./raw_images_output/" + "name_" + translatedText.replace(/\./g,"") + ".png"
  //     );
  //   })
  // );
  await delay(100000);
})();
