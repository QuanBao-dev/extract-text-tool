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
const list = [
  {
    tag: "01",
    name: "雄馬",
  },
  {
    tag: "02",
    name: "慎也",
  },
  {
    tag: "03",
    name: "かなめ",
  },
  {
    tag: "04",
    name: "由那",
  },
  {
    tag: "05",
    name: "藤花",
  },
  {
    tag: "06",
    name: "橘花",
  },
  {
    tag: "07",
    name: "浩一郎",
  },
  {
    tag: "08",
    name: "芽依",
  },
  {
    tag: "09",
    name: "啓吾",
  },
  {
    tag: "10",
    name: "リンドウ",
  },
  {
    tag: "11",
    name: "マイキー",
  },
  {
    tag: "12",
    name: "Ｏ",
  },
  {
    tag: "13",
    name: "クラスメイト",
  },
  {
    tag: "14",
    name: "男性の声",
  },
  {
    tag: "15",
    name: "男性",
  },
  {
    tag: "16",
    name: "女性",
  },
  {
    tag: "17",
    name: "藤花たちの父",
  },
  {
    tag: "18",
    name: "サトミ",
  },
  {
    tag: "19",
    name: "成れの果て",
  },
  {
    tag: "20",
    name: "？？？",
  },
  {
    tag: "21",
    name: "謎の少女",
  },
  {
    tag: "22",
    name: "ボス",
  },
  {
    tag: "23",
    name: "怪物",
  },
  {
    tag: "24",
    name: "見知らぬ青年",
  },
  {
    tag: "25",
    name: "女性の悲鳴",
  },
  {
    tag: "26",
    name: "男性の悲鳴",
  },
  {
    tag: "27",
    name: "眞紀男",
  },
  {
    tag: "28",
    name: "由那・マイキー",
  },
  {
    tag: "29",
    name: "雄馬・由那・マイキー",
  },
  {
    tag: "30",
    name: "雄馬・由那",
  },
  {
    tag: "31",
    name: "かなめ・由那・マイキー",
  },
  {
    tag: "32",
    name: "２人",
  },
  {
    tag: "33",
    name: "３人",
  },
  {
    tag: "34",
    name: "全員",
  },
  {
    tag: "35",
    name: "マイキー・リンドウ",
  },
];
const textList = [
  "来栖 雄馬",
  "小鳥遊 慎也",
  "秋月 かなめ",
  "水瀬 由那",
  "明坂 藤花",
  "明坂 橘花",
  "小鳥遊 浩一郎",
  "天城 芽依",
  "篠原 啓吾",
  "リンドウ",
  "マイキー",
  "Ｏ",
  "クラスメイト",
  "男性の声",
  "男性",
  "女性",
  "藤花たちの父",
  "サトミ",
  "成れの果て",
  "？？？",
  "謎の少女",
  "ボス",
  "怪物",
  "見知らぬ青年",
  "女性の悲鳴",
  "男性の悲鳴",
  "眞紀男",
  "由那&マイキー",
  "雄馬 & 由那 & マイキー",
  "雄馬 & 由那",
  "かなめ & 由那 & マイキー",
  "２人",
  "３人",
  "全員",
  "マイキー & リンドウ",
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
    listExtractedFileName,
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
      let fontSize = 25;
      // if(listExtractedFileName[index] === "眉毛にピアスの男") fontSize = 20
      // if(translatedText.length )
      return await textToImage.generate(translatedText.replace(/\./g, ""), {
        maxWidth: width,
        customHeight: height,
        debug: true,
        fontFamily:"MS Gothic",
        fontSize: fontSize,
        fontWeight: "600",
        lineHeight: 30,
        // margin,
        verticalAlign: "center",
        bgColor: "transparent",
        textColor: "white",
        textAlign: "center",
        debugFilename: `./raw_images_output/name_${translatedText.replace(
          /\./g,
          ""
        )}.png`,
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
