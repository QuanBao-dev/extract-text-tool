const { translate } = require("bing-translate-api");
const translateGoogle = require("translatte");
// const puppeteer = require("@scaleleap/puppeteer");
const axios = require("axios");
let cacheTranslation;
let jsonCache = "cacheTranslation.json";
try {
  cacheTranslation = require("../" + jsonCache);
  // cacheTranslationRaw = { ...cacheTranslation };
} catch (error) {
  cacheTranslation = {};
  // cacheTranslationRaw = {};
}
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const converter = new AFHConvert();
const signedCharacter = [
  ..."ăâđêôơưàảãạáằẳẵặắầẩẫậấèẻẽẹéềểễệếìỉĩịíòỏõọóồổỗộốờởỡợớùủũụúừửữựứỳỷỹỵýĂÂĐÊÔƠƯÀẢÃẠÁẰẲẴẶẮẦẨẪẬẤÈẺẼẸÉỀỂỄỆẾÌỈĨỊÍïÒỎÕỌÓỒỔỖỘỐỜỞỠỢỚÙỦŨỤÚỪỬỮỰỨỲỶỸỴÝ",
];
const unsignedCharacter = [
  ..."aadeoouaaaaaaaaaaaaaaaeeeeeeeeeeiiiiiooooooooooooooouuuuuuuuuuyyyyyAADEOOUAAAAAAAAAAAAAAAEEEEEEEEEEIIIIIiOOOOOOOOOOOOOOOUUUUUUUUUUYYYYY",
];

function replaceSignedCharacter(text) {
  let temp = text;
  signedCharacter.forEach((signedChar, index) => {
    temp = temp.replace(new RegExp(signedChar, "g"), unsignedCharacter[index]);
  });
  return temp;
}

const {
  replacedCharsAfterTranslation,
  replacedCharsBeforeTranslation,
  replacedExactCharsAfterTranslation,
} = require("../setting.json");
const delay = require("./delay");
const handleWordWrap = require("./handleWordWrap");
let objectMap = replacedCharsBeforeTranslation;
// g
const objectMap2 = replacedExactCharsAfterTranslation;
// i
const objectMap3 = replacedCharsAfterTranslation;
objectMap = handleObjectMap(objectMap);

// console.log(objectMap);

let yuris3String = "";
Object.keys(objectMap).forEach((v, index) => {
  if (index === Object.keys(objectMap).length - 1) {
    yuris3String += `(^${v}　)`;
  } else yuris3String += `(^${v}　)|`;
});

async function test() {
  return await Promise.all(
    Object.keys(objectMap).map(
      async (name) => (await translateOfflineSugoiLongList(name)) + "|" + name
    )
  );
}
const { Configuration, OpenAIApi } = require("openai");
const { weirdToNormalChars } = require("weird-to-normal-chars");
const {
  simpleReadFile,
  writeFile,
  simpleWriteFile,
  readFile,
  saveBackup,
} = require("./handleFile");
const { translateAIModelList } = require("./translateAIModel");
function handleNormalLetterText(text) {
  const normalTextList = text.match(/[a-zA-Z0-9]+/g) || [""];
  const fullWidthTextList = text.match(
    /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　【『「（《》】』」）]+/g
  ) || [""];
  let fullWidthTextLength = 0;
  let normalTextLength = 0;
  fullWidthTextList.forEach((text) => {
    fullWidthTextLength = Math.max(fullWidthTextLength, text.length);
  });
  normalTextList.forEach((text) => {
    normalTextLength = Math.max(normalTextLength, text.length);
  });
  if (fullWidthTextLength - normalTextLength >= 4) {
    for (let i = 0; i < normalTextList.length; i++) {
      text = text.replace(
        normalTextList[i],
        converter.toFullWidth(normalTextList[i])
      );
    }
  }
  return text;
}

async function translateJapaneseToEng(
  text,
  isBing,
  count = 0,
  countForGoogle = 0
) {
  if (!text) return null;
  let handledText = text.replace(/\\n/g, "");
  handledText = excludeTranslateText(handledText);
  if (isBing && count <= 3) {
    try {
      let data = await translate(handledText, null, "es");
      if (!data) return text;
      data.translation = replaceTagName(data.translation);
      return data.translation;
    } catch (error) {
      // console.log("/*Error Bing, retry*/");
      return await translateJapaneseToEng(handledText, true, ++count);
    }
  }
  if (true)
    try {
      // if (isBing) console.log("****Google translate*****");
      const data = await translateGoogle(handledText, { to: "es" });
      data.text = replaceTagName(data.text);
      return data.text;
    } catch (error) {
      console.log(error);
      return await translateJapaneseToEng(
        handledText,
        false,
        0,
        ++countForGoogle
      );
    }
  return text;
}

function capitalize(name) {
  if (name === null || name === "") return null;
  return (
    name[0].toLocaleUpperCase() + name.slice(1, name.length).toLocaleLowerCase()
  );
}

// async function translateDeepl(text) {
//   const browser = await puppeteer.launch({
//     extra: {
//       stealth: true,
//     },
//     headless: true,
//     args: ["--start-maximized", "no-sandbox"],
//     defaultViewport: null,
//     timeout: 10000,
//   });
//   let filterText = text.replace(/\\n/g, "").replace(/\\/g, "");
//   await Promise.all(
//     Object.keys(objectMap).map((japaneseName) => {
//       filterText = filterText.replace(
//         new RegExp(japaneseName, "i"),
//         objectMap[japaneseName]
//       );
//       return { [japaneseName]: objectMap[japaneseName] };
//     })
//   );
//   try {
//     const url = `https://www.deepl.com/en/translator#ja/en/${filterText}`;
//     const page = await browser.newPage();
//     await page.setUserAgent(
//       "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
//     );
//     await page.goto(url);
//     await page.waitForSelector(
//       'div.lmt__inner_textarea_container[title="Click a word to see alternative translations"]'
//     );
//     let textTranslated = await page.evaluate(() => {
//       const element = document.getElementById("target-dummydiv");
//       return element.innerHTML;
//     });
//     await browser.close();
//     Object.keys(objectMap2).forEach((key) => {
//       textTranslated = textTranslated.replace(
//         new RegExp(key, "i"),
//         objectMap2[key]
//       );
//     });
//     return textTranslated.replace(/\r\n/g, "");
//   } catch (error) {
//     console.log(error.message);
//     await browser.close();
//     return await translateJapaneseToEng(filterText);
//   }
// }
async function translateOfflineSugoiLongList(
  textList,
  limit = 20,
  isSplit,
  isShowLog = true
) {
  let ans = [];
  let limit2 = limit;
  while (true) {
    try {
      do {
        const translatedList = await translateOfflineSugoi(
          textList.slice(ans.length, ans.length + limit2),
          isSplit
        );
        ans = [...ans, ...translatedList];
        if (isShowLog) console.log(`${ans.length}/${textList.length}`);
      } while (ans.length < textList.length);
      break;
    } catch (error) {
      console.log(error.message);
      limit2 = parseInt(limit2 / 2);
      await delay(5000);
      console.log({ limit2 });
    }
  }
  return ans;
}
async function translateOfflineSugoiCt2LongList(
  textList,
  limit = 1,
  isSplit = false,
  isConsoleLog = true,
  isGlue,
  type,
  wordWrapMode,
  isExhibit,
  isLovelyCation,
  csvIndex,
  mode = "Sugoi",
  nameList = []
) {
  // console.log(textList)
  // return textList;
  // return textList.map((v) => weirdToNormalChars(replaceSignedCharacter(v)))
  // if (!cacheTranslation) {
  //   cacheTranslation = await readFile("./cacheTranslation.json", "utf8");
  //   console.log(JSON.parse(cacheTranslation));
  // }
  let ans = [];
  let i = 0;
  let isSimpleWriteFile = false;
  const rawTextList2 = [...textList];
  const rawIsGlue = isGlue;
  // textList = textList.map((text) => {
  //   if (text === null) return null;
  //   let rawMatchedText = text.match(
  //     /(\[ruby text="[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+"\][a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+\[\/ruby\])/g
  //   );
  //   let matchedText = "";
  //   if (rawMatchedText) {
  //     for (let j = 0; j < rawMatchedText.length; j++) {
  //       matchedText = rawMatchedText[j]
  //         .replace('[ruby text="', "")
  //         .replace(
  //           /[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+\[\/ruby\]/g,
  //           ""
  //         )
  //         .replace("]", "")
  //         .replace(/"$/g, "");
  //       text = text.replace(rawMatchedText[j], matchedText);
  //     }
  //   }
  //   return text
  //     .replace(/\[nr\]/g, "")
  //     .replace(/\[r\]/g, "")
  //     .replace(/\[haret\]/g, "");
  // });
  let editedTextList = [...textList];
  let suffixList = [];
  let prefixList = [];
  let rawPrefixList = [];
  // let editedTextList = [];
  function findPrefix(text) {
    if (["ast3"].includes(type)) {
      return text.match(/(^")|(^(					"))/g) || [""];
    }
    if (["ast4"].includes(type)) {
      return text.match(/\["text"\] = \{\[\[/g) || [""];
    }
    if (["renpy"].includes(type)) {
      return text.match(/^[a-zA-Z0-9 _]+"/g) || [""];
    }
    if (["lcse"].includes(type)) {
      if (text.includes("*01")) {
        return (
          text.match(
            /^([0-9 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－“”∴“”“”【『「（《》】』」）]+)?\*01(　)?/g
          ) || [""]
        );
      }
      return text.match(/^[0-9]+ /g) || [""];
    }
    if (["catsystem"].includes(type)) {
      return text.match(/^[『「（]/g) || [""];
    }
    if (["unitybin"].includes(type)) {
      return text.match(/^.+,/g) || [""];
    }
    if (["Seen"].includes(type)) {
      return text.match(/[0-9]+ (【.+】)?/g) || [""];
    }
    if (["Seen2"].includes(type)) {
      return (
        text.match(
          /<.+> ((\\)?\{[0-9 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－“”∴“”“”【『「（《》】』」）]+\})?/g
        ) || [""]
      );
    }
    if (["bsxx"].includes(type)) {
      return (
        text.match(/^((◇[a-zA-Z0-9]+◇)?(<color [a-z0-9]+>(\\b)?)?)/g) || [""]
      );
    }
    if (["yuris3"].includes(type)) {
      return text.match(new RegExp(yuris3String, "g")) || [""];
    }
    if (["AST2"].includes(type)) {
      return (
        text.match(
          /(<SOUND( CHANNEL="[0-9]+"( TIME="[0-9]+")?)?>)?(<SOUND SRC=".+">)?<WINDOW( NAME="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？a-zA-Z\.\\" =]+)?>/g
        ) || [""]
      );
    }
    if (["mosaic"].includes(type)) {
      return text.match(/^(【.+】<[a-zA-Z]+>)/g) || [""];
    }
    if (["kiri-sator"].includes(type)) {
      return (
        text.match(
          /^\[M\]\[【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+】( name=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+)?( [a-z ]+)?\]/g
        ) || [""]
      );
    }
    if (["sec5"].includes(type)) {
      return (
        text.match(
          /^(★[0-9a-zA-Z]+★([-> 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+)?★)/g
        ) || [""]
      );
    }
    if (["malie"].includes(type)) {
      return (
        text.match(/^([\{\[　]+[><　地a-zA-Z0-9_\[\]\(\)]+[\}\]　]+)+/g) || [""]
      );
    }
    if (["musica"].includes(type)) {
      const length = text.split(" ").length;
      return (
        [
          text
            .split(" ")
            .slice(0, length - 1)
            .join(" "),
        ] || [""]
      );
    }
    if (["kirisnr", "kirisnr2"].includes(type)) {
      return text.match(/【.+】(.+\))?/g) || ["　"];
    }
    if (["cst-special"].includes(type)) {
      return text.match(/^([%\\0-9　a-zA-Z]+)/g) || [""];
    }
    if (["willadv"].includes(type)) {
      return text.match(/▷.+◁/g) || [""];
      return text.match(/^@[a-zA-Z0-9@]+/g) || [""];
    }
    if (["willadv3"].includes(type)) {
      return text.match(/^[＞【『「（《》】』」）]/g) || [""];
    }
    if (["Scenepck"].includes(type)) {
      return text.match(/(#[a-zA-Z0-9]+)?【.+】/g) || [""];
    }
    if (["nexas"].includes(type)) {
      const rubyList13 =
        text.match(
          /@r[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？_]+@[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？_]+@/g
        ) || [];

      for (let i = 0; i < rubyList13.length; i++) {
        text = text.replace(
          new RegExp(rubyList13[i], "i"),
          rubyList13[i].split("@")[1].replace(/r/g, "")
        );
      }

      return (
        text
          .replace(/@u00/g, "八重垣")
          .replace(/@u01/g, "准")
          .replace(/@u02/g, "准")
          .match(/^@[a-zA-Z0-9@_]+/g) || [""]
      );
    }
    if (["liar"].includes(type)) {
      return text.match(/^#/g) || [""];
    }
    if (["tanuki"].includes(type)) {
      return [splitCSV(text).slice(0, csvIndex).join(",")];
    }
    if (["unity"].includes(type)) {
      return text.match(/^(<[A-Za-z_/0-9%\.]+>)/g) || [""];
    }
    if (["SLG"].includes(type)) {
      return text.match(/ +"/g) || [""];
    }
    if (["aos"].includes(type)) {
      return text.match(/^((\[.+\])|(^　))/g) || [""];
    }
    if (["kiri-alltime"].includes(type)) {
      return text.match(/@locate0.+@locate1/g) || [""];
    }
    if (["so5"].includes(type)) {
      return [text.split("/")[0]] || [""];
    }
    if (["kiriruby2"].includes(type)) {
      return (
        text.match(
          /^\[m [A-Za-z="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪〇☆〜゛×○♥☆&0-9.＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪〇☆〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+―]+\]/g
        ) || [""]
      );
    }
    if (["kiriruby"].includes(type)) {
      // return (
      //   text.match(
      //     /^(\[m([a-zA-Z =_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆？&\.＠Ω【】]+)?\]+(\\)?)/g
      //   ) || [""]
      // );
      return (
        text.match(
          /^(\[[a-zA-Z]\](\[name name="【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆？&\.＠Ω【】]+】"\])?)/g
        ) || [""]
      );
      return (
        text.match(
          /^(\[[a-zA-Z =\[\]_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆？&\.＠Ω【】]+\]+(\\)?)/g
        ) || [""]
      );
    }
    if (["kiri"].includes(type)) {
      return (
        text.match(
          /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-ＺA-Z０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω\(\)【】]+((\/)?[ a-z0-9=]+)?\]/g
        ) || [""]
      );
    }
    if (["kiri2"].includes(type)) {
      return (
        text.match(
          /(\[[a-zA-Z 0-9\[\]=]+\])?\[[a-z][=一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、]+\]/g
        ) || [""]
      );
    }
    // return "";
    if (["whale"].includes(type)) {
      return text.replace(/\[n\]/g, "").match(/【.+】/g) || [""];
    }
    if (["kiri-mink"].includes(type)) {
      if (!text) return [""];
      return text.replace(/\[ω\]/g, "").match(/【.+】+/g) || [""];
    }
    if (["kiri-mekujira"].includes(type)) {
      return (
        text.match(
          /【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／/]+】[「（]/g
        ) || [""]
      );
    }
    if (["EAGLS"].includes(type)) {
      return text.match(/&[0-9]+"/g) || [""];
    }
    if (["yuris"].includes(type)) {
      return text.match(/<.+>/g) || text.match(/【.+】/g) || [""];
    }
    if (["yuris2"].includes(type)) {
      // return text.match(/【.+】/g) || [""];
      // return text.match(/.+[『「（]/g) || [""];
      return (
        text.match(
          /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[『「（【]/g
        ) || [""]
      );
    }
    if (["BGI"].includes(type)) {
      // return text.match(/^#/g) || [""];
      return text.match(/^(<[0-9,]+>)/g) || [""];
    }
    if (["Eroit"].includes(type)) {
      return text.match(/[●★][0-9]+[●★]/g) || [""];
    }
    if (["rpgmvxace"].includes(type)) {
      return text.match(/^([\[\]a-z0-9\\{]+)/g) || [""];
    }
    if (["rpgmmv"].includes(type)) {
      if (!text) return [text];
      return (
        text
          // .match(/【.+】/g) || [""]
          .match(
            /^(((【.+】)|([\\<>a-zA-Z0-9\[\]|/ ]))+([\[\]一-龠ぁ-ゔァ-ヴー0-9ａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、]+>)?)(([\\<>a-zA-Z0-9\[\]|/]+))?/g
          ) || [""]
      );
    }
    if (["qlie"].includes(type)) {
      const textSplit = text.split(",");
      const matchText = (textSplit[0].match(/[a-zA-Z0-9_]+/g) || [""])[0];
      if (textSplit[0].length === matchText.length) {
        return [text.split(",").slice(0, 2).join(",") + ","];
      }
      return [""];
      if (!text.includes(",")) {
      }
      return [text.split(",").slice(0, 2).join(",") + ","];
    }
    return [""];
    return text.match(/m\[[0-9]+\] = "/g) || [""];
  }
  function findSuffix(text) {
    if (["mosaic"].includes(type)) {
      return text.match(/(<[a-zA-Z]+>)+$/g) || [""];
    }
    if (["renpy"].includes(type)) {
      return text.match(/("(:)?)$/g) || [""];
    }
    if (["lcse"].includes(type)) {
      return text.match(/[\*0-9]+$/g) || [""];
    }
    if (["BGI"].includes(type)) {
      // return text.match(/^#/g) || [""];
      return text.match(/(<)$/g) || [""];
    }
    if (["bsxx"].includes(type)) {
      return text.match(/(<\/color>)$/g) || [""];
    }
    if (["catsystem"].includes(type)) {
      return text.match(/((\\@)?\/\/.+)$/g) || [""];
    }
    if (["malie"].includes(type)) {
      return text.match(/([><地a-zA-Z0-9_\{\}\[\]\(\)　]+)$/g) || [""];
    }
    if (["sec5"].includes(type)) {
      return ["\n"];
    }
    if (["qlie"].includes(type)) {
      return text.match(/(\[n\])$/g) || [""];
    }
    if (["tblscr"].includes(type)) {
      return text.match(/((　－.+－”)|(\\n))$/g) || [""];
    }
    if (["tanuki"].includes(type)) {
      let temp = splitCSV(text)
        .slice(csvIndex + 1)
        .join(",");
      return [temp ? "," + temp : temp];
    }
    if (["SLG"].includes(type)) {
      return text.match(/("(,)?)$/g) || [""];
    }
    // return "";
    if (["aos"].includes(type)) {
      return text.match(/\\f/g) || [""];
    }
    if (["willadv2"].includes(type)) {
      return text.match(/([a-zA-Z% ]+)$/g) || [""];
      return text.match(/(\\n)$/g) || [""];
    }
    if (["willadv3"].includes(type)) {
      return text.trim().match(/([＜【『「（《》】』」）])$/g) || [""];
    }
    if (["kiri2", "kiri-sator"].includes(type)) {
      return text.match(/(\[[a-zA-Z% ]+\])$/g) || [""];
    }
    if (["unity"].includes(type)) {
      return text.match(/(<[A-Za-z_/0-9%\.]+>)$/g) || [""];
    }
    if (["kiriruby", "kiri-alltime", "kirisnr2", "kiriruby2"].includes(type)) {
      return text.trim().match(/(\[[a-zA-Z =\[\]_0-9]+\]+(\\)?)$/g) || [""];
    }
    if (["ast"].includes(type)) {
      return text.match(/(<[A-Za-z_/0-9%\.]+>)$/g) || [""];
    }
    if (["ast3"].includes(type)) {
      return text.trim().match(/(",)$/g) || [""];
    }
    if (["ast4"].includes(type)) {
      return text.trim().match(/\]\]\},$/g) || [""];
    }
    if (["EAGLS"].includes(type)) {
      // console.log(text.split(/"/g))
      return ['"' + text.split(/"/g).slice(2).join('"')];
      return (
        text.match(/("([a-zA-Z_0-9=\(\)",!@#$%^&*-\[\]\{\}]+)?)$/g, "") || [""]
      );
    }
    if (["rpgmvxace"].includes(type)) {
      return text.match(/([\\]+!([\[\]a-z0-9\\]+)?)$/g) || [""];
    }
    if (["rpgmmv"].includes(type)) {
      if (!text) return [text];
      return text.match(/(([\\<>a-zA-Z0-9\[\]|/])+)$/g, "") || [""];
    }
    return [""];
    return ['"'];
  }
  function getRidOfPrefixSuffix(text) {
    if (["ast3"].includes(type)) {
      return text.trim().replace(/^"/g, "").replace(/(",)$/g, "") || "";
    }
    if (["ast4"].includes(type)) {
      return (
        text
          .trim()
          .replace(/\["text"\] = \{\[\[/g, "")
          .replace(/\]\]\},$/g, "") || ""
      );
    }
    if (["Seen2"].includes(type)) {
      return (
        text
          .replace(
            /<.+> ((\\)?\{[0-9 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－“”∴“”“”【『「（《》】』」）]+\})?/g,
            ""
          )
          .replace(/\\ruby{.+}=/g, "") || ""
      );
    }
    if (["so5"].includes(type)) {
      return text.split("/")[1] || "";
    }
    if (["renpy"].includes(type)) {
      return text.replace(/"(:)?$/g, "").replace(/^[a-zA-Z0-9 _]+"/g, "") || "";
    }
    if (["lcse"].includes(type)) {
      let temp = text;
      if (temp.includes("*01")) {
        temp = temp.replace(
          /^([0-9 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－“”∴“”“”【『「（《》】』」）]+)?\*01/g,
          ""
        );
      } else {
        temp = temp.replace(/^[0-9]+ /g, "");
      }
      return temp.replace(/[\*0-9]+$/g, "") || "";
    }
    if (["catsystem"].includes(type)) {
      return text.replace(/((\\@)?\/\/.+)$/g, "") || "";
    }
    if (["unitybin"].includes(type)) {
      return text.replace(/^.+,/g, "") || "";
    }
    if (["yuris3"].includes(type)) {
      return text.replace(new RegExp(yuris3String, "g"), "") || "";
    }
    if (["bsxx"].includes(type)) {
      return (
        text
          .replace(/^((◇[a-zA-Z0-9]+◇)?(<color [a-z0-9]+>(\\b)?)?)/g, "")
          .replace(/(<\/color>)$/g, "")
          .replace(/\\n/g, "") || ""
      );
    }
    if (["kiri-sator"].includes(type)) {
      return (
        text
          .replace(
            /^\[M\]\[【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+】( name=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+)?( [a-z ]+)?\]/g,
            ""
          )
          .replace(/(\[[a-zA-Z% ]+\])$/g, "") || ""
      );
    }
    if (["tblscr"].includes(type)) {
      return text.replace(/(　－.+－”)/g, "").replace(/\\n/g, "") || "";
    }

    if (["mosaic"].includes(type)) {
      return (
        text
          .trim()
          .replace(/^(【.+】<[a-zA-Z]+>)/g, "")
          .replace(/(<[a-zA-Z]+>)+$/g, "")
          .replace(/<CR>/g, "") || ""
      );
    }
    if (["malie"].includes(type)) {
      return (
        text
          .replace(/^([\{\[　]+[><地　a-zA-Z0-9_\[\]\(\)]+[\}\]　]+)+/g, "")
          .replace(/([　><地a-zA-Z0-9_\{\}\[\]\(\)]+)$/g, "")
          .replace(/(\[c\])/g, "") || ""
      );
    }
    if (["liar"].includes(type)) {
      return text.replace(/^#/g, "").replace(/\\t/g, "") || "";
    }
    if (["AST2"].includes(type)) {
      return (
        text
          .replace(
            /(<SOUND( CHANNEL="[0-9]+"( TIME="[0-9]+")?)?>)?(<SOUND SRC=".+">)?<WINDOW( NAME="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？a-zA-Z\.\\" =]+)?>/g,
            ""
          )
          .replace(/<FONT COLOR=[0-9A-Za-z]+>/g, "") || ""
      );
    }
    if (["cst"].includes(type)) {
      return (
        text
          .replace(
            />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
            ""
          )
          .replace(/<R/g, "") || ""
      );
    }
    if (["cst-special"].includes(type)) {
      return text.replace(/[%\\0-9a-zA-Z]+/g, "") || "";
    }
    if (["sec5"].includes(type)) {
      return (
        text
          .trim()
          .replace(
            /^(★[0-9a-zA-Z]+★([-> 一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+)?★)/g,
            ""
          ) || ""
      );
    }
    if (["musica"].includes(type)) {
      const length = text.split(" ").length;
      return text.split(" ")[length - 1] || "";
    }
    if (["Seen"].includes(type)) {
      return text.replace(/[0-9]+ (【.+】)?/g, "") || "";
    }
    if (["ast"].includes(type)) {
      return text.replace(/<[A-Za-z_/0-9%\.]+>/g, "") || "";
    }
    if (["SLG"].includes(type)) {
      return text.replace(/("(,)?)$/g, "").replace(/ +"/g, "") || "";
    }
    if (["kirisnr"].includes(type)) {
      return text.replace(/【.+】(.+\))?/g, "") || "";
    }
    if (["kiri2"].includes(type)) {
      return (
        text
          .replace(/(\[[a-zA-Z% ]+\])$/g, "")
          .replace(
            /(\[[a-zA-Z 0-9\[\]=]+\])?\[[a-z][=一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、]+\]/g,
            ""
          ) || ""
      );
    }
    if (["Scenepck"].includes(type)) {
      return (
        text.replace(/(#[a-zA-Z0-9]+)?【.+】/g, "").replace(/NLI/g, "") || ""
      );
    }
    if (["willadv3"].includes(type)) {
      return (
        text
          .replace(/^[＞【『「（《》】』」）]/g, "")
          .replace(/[＜【『「（《》】』」）]$/g, "") || ""
      );
    }
    if (["willadv"].includes(type)) {
      return text.replace(/▷.+◁/g, "") || "";
      return text
        .replace(/\\n/g, "")
        .replace(/@[a-z0-9A-Z_@]+/g, "")
        .replace(/@/g, "");
    }
    if (["nexas"].includes(type)) {
      // return text.replace(/▷.+◁/g, "") || "";
      // return text.replace(/【.+】/g, "") || "";
      const rubyList13 =
        text.match(
          /@r[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？_]+@[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？_]+@/g
        ) || [];

      for (let i = 0; i < rubyList13.length; i++) {
        text = text.replace(
          new RegExp(rubyList13[i], "i"),
          rubyList13[i].split("@")[1].replace(/r/g, "")
        );
      }
      return text
        .replace(/@u00/g, "八重垣")
        .replace(/@u01/g, "准")
        .replace(/@u02/g, "准")
        .replace(/\\n/g, "")
        .replace(/@[a-z0-9A-Z_@]+/g, "")
        .replace(/@/g, "");
    }
    if (["willadv2"].includes(type)) {
      return text.replace(/([a-zA-Z% ]+)$/g, "") || "";
    }
    if (["tanuki"].includes(type)) {
      return splitCSV(text)[csvIndex] || "";
    }
    if (["aos"].includes(type)) {
      return text.replace(/^(\[.+\])/g, "").replace(/\\f/g, "");
    }
    if (["kiri-mink"].includes(type)) {
      if (!text) return "";
      return text.replace(/【.+】+/g, "");
    }
    if (["kiri"].includes(type)) {
      return text.replace(
        /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-ＺA-Z０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω\(\)【】]+((\/)?[ a-z0-9=]+)?\]/g,
        ""
      );
    }
    if (["unity"].includes(type)) {
      return text
        .replace(/\\r\\n/g, "")
        .replace(/(<[A-Za-z_/0-9%\.]+>)$/g, "")
        .replace(/^(<[A-Za-z_/0-9%\.]+>)/g, "");
    }
    if (["whale"].includes(type)) {
      return text.replace(/\[n\]/g, "").replace(/【.+】/g, "");
    }
    if (["ain"].includes(type)) {
      if (text.includes("\\N")) return text + "。";
      return text.replace(/m\[[0-9]+\] = "/g, "").replace(/"$/g, "");
    }
    if (["EAGLS"].includes(type)) {
      return text
        .split(/"/g)[1]
        .replace(/\(e\)/g, "")
        .replace(/\(r\)/g, "")
        .replace(/\(E\)/g, "")
        .replace(
          /\([yfcs]=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●♀♂♪─〇☆―〜゛×・○♥　、,=0-9a-z]+\)/g,
          ""
        );
    }
    if (["yuris2"].includes(type)) {
      // return (
      //   findPrefix(text)[0].slice(findPrefix(text)[0].length - 1) +
      //   text.replace(/.+[『「（]/g, "")
      // );
      // return text.replace(/【.+】/g, "");
      return (
        (text.match(/[『「（]/g) || [""])[0] +
        text.replace(
          /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[『「（【]/g,
          ""
        )
      );
    }

    if (["kiri-mekujira"].includes(type)) {
      const bracket = (text.match(
        /【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／/]+】[「（]/g
      ) || [""])[0].match(/[「（]/g) || [""];
      return (
        bracket[0] +
        text.replace(
          /【[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／/]+】[「（]/g,
          ""
        )
      );
    }
    if (["yuris"].includes(type)) {
      return text.replace(/<.+>/g, "");
    }
    if (["BGI"].includes(type)) {
      // return text.replace(/#/g, "");
      return text.replace(/<[a-z0-9,]+>/g, "").replace(/(<)$/g, "");
    }
    if (["Eroit"].includes(type)) {
      return text.replace(/[●★][0-9]+[●★]/g, "");
    }
    if (["rpgmvxace"].includes(type)) {
      return text
        .replace(/(([\\]+!([\[\]a-z0-9\\]+)?)$)$/g, "")
        .replace(/^([\[\]a-z0-9\\]+)/g, "");
    }
    if (["rpgmmv"].includes(type)) {
      if (!text) return text;
      return text
        .replace(/【.+】/g, "")
        .replace(/\\{\\{/g, "")
        .replace(/\\}\\}/g, "")
        .replace(
          /^(((【.+】)|([\\<>a-zA-Z0-9\[\]|/ ]))+([\[\]一-龠ぁ-ゔァ-ヴー0-9ａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、]+>)?)(([\\<>a-zA-Z0-9\[\]|/]+))?/g,
          ""
        )
        .replace(/(([\\<>a-zA-Z0-9\[\]|/])+)$/g, "")
        .replace(/\\[a-z\[\]\\0-9]+/g, "");
    }
    if (["qlie"].includes(type)) {
      const textSplit = text.split(",");
      const matchText = (textSplit[0].match(/[a-zA-Z0-9_]+/g) || [""])[0];
      if (textSplit[0].length === matchText.length) {
        return text.split(",").slice(2).join(",").replace(/\[n\]/g, "");
      }
      return text.replace(/\[n\]/g, "");

      if (!text.includes(",")) {
        return text;
      }
      return text.split(",").slice(2).join(",");
    }
    if (["kiriruby", "kiri-alltime", "kirisnr2", "kiriruby2"].includes(type)) {
      const rubyList21 =
        text.match(
          /\[eruby str="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n∴（）\\+\\-]+" text="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n∴（）\\+\\-]+"\]/g
        ) || [];
      for (let i = 0; i < rubyList21.length; i++) {
        text = text.replace(
          new RegExp(
            rubyList21[i]
              .replace(/\[/g, "\\[")
              .replace(/\]/g, "\\]")
              .replace(/\(/g, "\\(")
              .replace(/\)/g, "\\)"),
            "i"
          ),
          rubyList21[i]
            .split(" text=")[0]
            .replace(/eruby str=/g, "")
            .replace(/\[/g, "")
            .replace(/"/g, "")
        );
      }
      return (
        text
          .trim()
          .replace(/\[r\]/g, " ")
          .replace(
            /^\[m [a-z="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪〇☆〜゛×○♥☆&0-9.＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪〇☆〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+―]+\]/g,
            ""
          )
          .replace(/【.+】(.+\))?/g, "")
          .replace(/@locate0.+@locate1/g, "")
          .replace(/@locate[0-9]/g, "")
          .replace(/\[heart\]/g, "♥")
          .replace(/\[ruby text=/g, "")
          .replace(/\[firstname\]/g, "青山")
          .replace(/\[lastname\]/g, "洋太")
          .replace(/\[>\]/g, "")
          .replace(/\[ruby text=["']/g, "")
          .replace(/\[font size=["']/g, "")
          .replace(/\[fsize l\]/g, "")
          .replace(/\[resetfont\]/g, "")
          // .replace(
          //   /^(\[[a-zA-Z =\[\]_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆？&\.＠Ω【】]+\]+(\\)?)/g,
          //   ""
          // )
          // .replace(
          //   /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－“”∴“”]+\]/g,
          //   ""
          // )
          .replace(
            /^(\[m([a-zA-Z =_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆？&\.＠Ω【】]+)?\]+(\\)?)/g,
            ""
          )
          .replace(/(\[[a-zA-Z =\[\]_0-9]+\]+(\\)?)$/g, "")
          .replace(/(\[[a-zA-Z0-9 =\[\]_"\.']+\])/g, "")
          .replace(/\[tips /g, "")
          // .replace(
          //   / ruby=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+\\-]+\]/g,
          //   ""
          // )
          .replace(/"\]/g, "")
          .replace(/\]/g, "")
          .replace(/\[/g, "")
      );
    }
    // return text.replace(/<.+>/g, "").replace(/【.+】/g, "");
    return text;
  }
  // console.log(textList)
  // if (textList.includes(undefined)) return textList;
  if (["srp", "anim", "waffle", "rpgm", "scn", "cst"].includes(type)) {
    editedTextList = editedTextList;
  } else if (
    [
      "kiriruby",
      "bsxx",
      "kiri-alltime",
      "ast3",
      "ast4",
      "kirisnr2",
      "lcse",
      "willadv3",
    ].includes(type)
  ) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["rpgmmv", "aos", "willadv", "kiri2"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map(
      (v) => getRidOfPrefixSuffix(v).split("／")[0]
    );
  } else if (["Seen", "AST2", "yuris3", "liar"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["yuris2"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["ain", "med"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "雄也")
    );
    editedTextList = [];
    let j = 0;
    do {
      if (
        getRidOfPrefixSuffix(textList[j]).match(/^[「『（\(〈]/g) &&
        !getRidOfPrefixSuffix(textList[j]).match(/[」）\)〉』]/g) &&
        !getRidOfPrefixSuffix(textList[j]).match(/((ーーー)|(：))$/g)
      ) {
        let count = 0;
        let temp = "";
        do {
          temp += getRidOfPrefixSuffix(textList[j]);
          count++;
          j++;
        } while (!getRidOfPrefixSuffix(textList[j]).match(/[」）\)〉』]/g));
        editedTextList.push(temp + getRidOfPrefixSuffix(textList[j]));
        editedTextList.push(...Array.from(Array(count)).map(() => "@@"));
        j++;
        continue;
      } else if (
        !getRidOfPrefixSuffix(textList[j]).match(
          /[。！？」』）\)…〉ー：・]$/g
        ) &&
        !textList[j + 1].match(/^[『「（\(〈]/g)
      ) {
        let count = 0;
        let temp = "";
        do {
          temp += getRidOfPrefixSuffix(textList[j]);
          count++;
          j++;
        } while (
          !getRidOfPrefixSuffix(textList[j]).match(
            /[。！？」\)』）…〉ー：・]$/g
          ) &&
          textList[j + 1] &&
          !textList[j + 1].match(/^[『「（\(〈]/g)
        );
        editedTextList.push(temp + getRidOfPrefixSuffix(textList[j]));
        editedTextList.push(...Array.from(Array(count)).map(() => "@@"));
        j++;
        continue;
      }
      editedTextList.push(getRidOfPrefixSuffix(textList[j]));
      j++;
    } while (editedTextList.length < textList.length);
  } else if (["rpgmmv-name"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["EAGLS"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => {
      // console.log({v},findSuffix(v))
      return findSuffix(v)[0].replace(":NameSuffix", "雄也");
    });
    editedTextList = editedTextList.map(
      (v) => getRidOfPrefixSuffix(v).replace(/:NameSuffix/g, "雄也")
      // .replace(/DJ/g, "ＤＪ")
      // .replace(/I LOVE SORA/g, "Ｉ　ＬＯＶＥ　ＳＯＲＡ")
      // .replace(/PINE/g, "ＰＩＮＥ")
      // .replace(/10/g, "１０")
    );
  } else {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  }
  const rawTextList = [...editedTextList];
  textList = [...editedTextList];
  if (["BGI"].includes(type)) {
    textList = editedTextList
      .map((v) => {
        const regExp = new RegExp(
          "[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》]+",
          "g"
        );
        const textList = v.match(regExp);
        if (!textList)
          return v
            .replace(/<br>/g, "")
            .replace(/<d[0-9]+>/g, "")
            .replace(/<d>/g, "")
            .replace(/<\/d>/g, "")
            .replace(/<\/r>/g, "")
            .replace(/<r.+>/g, "")
            .replace(
              />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
              ""
            )
            .replace(/<R/g, "")
            .replace(/<[a-zA-Z0-9]+>/g, "");
        const isCheck = textList.reduce((ans, text) => {
          if (text.length > 10) {
            return true;
          }
          return ans;
        }, false);
        if (isCheck === true)
          return converter.toFullWidth(
            v
              .replace(/<\/r>/g, "")
              .replace(/<d[0-9]+>/g, "")
              .replace(/<d>/g, "")
              .replace(/<\/d>/g, "")
              .replace(/<br>/g, "")
              .replace(/<r.+>/g, "")
              .replace(
                />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
                ""
              )
              .replace(/<R/g, "")
              .replace(/<[a-zA-Z0-9]+>/g, "")
          );

        return v
          .replace(/<\/r>/g, "")
          .replace(/<d[0-9]+>/g, "")
          .replace(/<d>/g, "")
          .replace(/<\/d>/g, "")
          .replace(/<r.+>/g, "")
          .replace(
            />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
            ""
          )
          .replace(/<R/g, "")
          .replace(/<br>/g, "")
          .replace(/<[a-zA-Z0-9]+>/g, "");
      })
      .filter((v) => {
        return !v.match(/[a-zA-Z_0-9\.]/g);
      });
  }
  if (["rpgmvxace"].includes(type)) {
    textList = editedTextList.filter((v) => {
      return (
        !v.match(/^"/g) &&
        !v.match(/"$/g) &&
        !v.match(/^'/g) &&
        !v.match(/'$/g) &&
        !v.match(/^(\/)/g) &&
        !v.match(/(\/)$/g) &&
        !v.match(/%w/g)
      );
    });
  }
  // console.log(prefixList)
  if (type === "unity") {
    textList = [...editedTextList].map((v) =>
      v
        .replace(/<emoji%3D2665>/g, "♥")
        .replace(/<color%3Dred>/g, "")
        .replace(/<\/color>/g, "")
        .replace(/<em%3D●>/g, "")
        .replace(/<\/em>/g, "")
        .replace(/\\r/g, "")
    );
  }
  if (type === "kiriruby") {
    textList = editedTextList.map((v) => {
      const rubyList = v.match(
        /[\[<]ruby text=["'][一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_　A-Za-z ]+["'][\]>]/g
      );
      if (rubyList && rubyList.length) {
        let temp = v;
        rubyList.forEach((rubyText) => {
          temp = temp.replace(
            rubyText,
            rubyText
              // .replace(/\[ruby text="/g, "")
              // .replace(/"\]/g, "")
              .replace(/[\[<]ruby text=["']/g, "")
              .replace(/["'][\]>]/g, "")
          );
        });
        return temp
          .replace(/<\/ruby>/g, "")
          .replace(
            /^(\[[a-zA-Z =\[\]_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω【】]+\]+(\\)?)/g,
            ""
          )
          .replace(
            /\[[a-z]+ [a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ ]+\]/g,
            ""
          )
          .replace(
            /(\[[a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ \[\]]+\]+(\\)?)$/g,
            ""
          );
        // .replace(/[\[\]]/g, "");
      }
      return (
        v
          .replace(/<[a-zA-Z '=0-9\+\\\/]+>/g, "")
          // .replace(
          //   /^(\[[a-zA-Z =\[\]_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω\(\)【】]+\]+(\\)?)/g,
          //   ""
          // )
          .replace(/\[一人称\]/g, "僕")
          .replace(
            /\[[a-z]+ [a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ ]+\]/g,
            ""
          )
          .replace(
            /(\[[a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ \[\]]+\]+(\\)?)$/g,
            ""
          )
      );
      // .replace(/[\[\]]/g, "");
    });
  }
  if (["ain"].includes(type)) {
    textList = [...editedTextList].filter((v) => v !== "@@");
  }
  if (["srp"].includes(type)) {
    textList = [...editedTextList].map((v) =>
      v
        ? v.replace(
            /<[/a-zA-Z0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥　☆＆＿]+>/g,
            ""
          )
        : v
    );
  }
  if (["rpgmmv"].includes(type)) {
    textList = [...editedTextList].map((v) => {
      if (!v) return v;
      return v.replace(/Ci-en/, "Ｃｉ－ｅｎ");
    });
  }
  let messages = [];
  // if (textList.length === 0) return [];
  if (["rpgmmv-name"].includes(type)) {
    ans = await translateSelectCenterTextList(
      textList,
      2,
      false,
      undefined,
      "srp"
    );
  } else {
    let pos = 0;
    const initLimit = limit;
    while (true) {
      try {
        do {
          if (limit === 0) return [];
          let translatedTextList = [];
          if (isGlue)
            if (
              textList.slice(i * limit, (i + 1) * limit)
              // .join(" ").length > 20
            )
              isGlue = true;
            else isGlue = false;
          if (isGlue) {
            if (
              textList
                .slice(i * limit, (i + 1) * limit)
                .map((v) => (v ? v.length : 0))
                .reduce((ans, v) => {
                  return ans + v;
                }, 0) < 20
            ) {
              isGlue = false;
            }
          }
          if (isGlue === true) {
            const { data, isSimpleWrite } = await translateOfflineSugoiCt2(
              textList
                .slice(i * limit, (i + 1) * limit)
                .map((text) => {
                  if (!text) return text;
                  if (text.match(/^[『【「]/g) && text.match(/[』」】]$/g)) {
                    return text
                      .replace(/^[『「【]/g, "")
                      .replace(/[』」】]$/g, "");
                  }
                  return text;
                })
                .join("！"),
              wordWrapMode,
              isExhibit,
              isLovelyCation,
              undefined,
              undefined,
              isSimpleWriteFile
            );
            isSimpleWriteFile = isSimpleWrite;
            translatedTextList = data
              .replace(/!\)/g, ")!")
              .split(/[!！]+/g)
              .filter((v) => v.trim() !== "")
              .map((v) => v.replace(/”」/g, "」").replace(/(@)$/g, "").trim());
            if (
              translatedTextList.length !==
              textList.slice(i * limit, (i + 1) * limit).length
            ) {
              isGlue = false;
              continue;
            }
            console.log(true, translatedTextList);
            translatedTextList = translatedTextList.map((v, index) => {
              const rawText = textList.slice(i * limit, (i + 1) * limit)[index];
              if (rawText.match(/^『/g) && rawText.match(/』$/g)) {
                return "『" + v + "』";
              }
              if (rawText.match(/^【/g) && rawText.match(/】$/g)) {
                return "【" + v + "】";
              }
              if (rawText.match(/^「/g) && rawText.match(/」$/g)) {
                return "「" + v + "」";
              }
              return v;
            });
          } else {
            // !Important
            if (wordWrapMode == "Eroit") mode = "Sugoi";
            try {
              if (mode === "Sugoi") throw new Error("Sugoi");
              const data = await translateAIModelList(
                textList.slice(pos, pos + limit),
                nameList.slice(pos, pos + limit),
                "llama-3-vntl-yollisa-8b-i1",
                false,
                "Narrator"
              );
              translatedTextList = data.translatedTextList;
              messages = data.messages;
            } catch (error) {
              if (!["Sugoi", "Fall back"].includes(error.message))
                console.log(error);
              if (error.message === "Fall back") {
                limit = 1;
              }
              translatedTextList = await Promise.all(
                textList.slice(pos, pos + limit).map(async (text, index) => {
                  if (!isSplit) {
                    const { data, isSimpleWrite } =
                      await translateOfflineSugoiCt2(
                        text,
                        wordWrapMode,
                        isExhibit,
                        isLovelyCation,
                        prefixList[i * limit + index],
                        i * limit + index,
                        isSimpleWriteFile
                      );
                    isSimpleWriteFile = isSimpleWrite;
                    return data;
                  }
                  const splitText = text.split(/[。？！：]/g);
                  const specialCharsList = text.match(/[。？！：]/g);
                  let temp = "";
                  for (let j = 0; j < splitText.length; j++) {
                    const { data, isSimpleWrite } =
                      await translateOfflineSugoiCt2(
                        splitText[j],
                        wordWrapMode,
                        isExhibit,
                        isLovelyCation,
                        undefined,
                        undefined,
                        isSimpleWriteFile
                      );
                    isSimpleWriteFile = isSimpleWrite;
                    const translatedText = data;
                    temp +=
                      translatedText.replace(/[\.\?\!\:。？！：]/i, "") +
                      (specialCharsList && specialCharsList[j]
                        ? specialCharsList[j]
                        : "");
                  }
                  return (
                    temp
                      // .replace(/[\.。]/i, ". ")
                      .replace(/[\?？]+/i, "? ")
                      .replace(/[\!！]+/i, "! ")
                      .replace(/[\:：]+/i, ": ")
                      .replace(/[」]+/i, "」")
                  );
                })
              );
              console.log("Translation:", translatedTextList);
            }
          }

          ans = [...ans, ...translatedTextList];
          if (rawIsGlue === true) isGlue = true;
          i++;
          pos += limit;
          limit = initLimit;
          // if (ans.length === 1000) mode = "Sugoi";
          if (isConsoleLog) console.log(`${ans.length}/${textList.length}`);
          if (ans.length === textList.length) break;
        } while (ans.length < textList.length);

        if (mode !== "Sugoi") {
          await simpleWriteFile(
            "./history.json",
            JSON.stringify(messages.slice(1), null, 1),
            "utf8"
          );
        }

        break;
      } catch (error) {
        console.log(error);
        // limit = parseInt(limit / 2) === 0 ? 1 : parseInt(limit / 2);
        console.log({ limit });
        // limit = 2;
        await delay(10000);
      }
    }
  }
  // Important
  if (
    [
      "kiri-mink",
      "willadv",
      "tblscr",
      "sec5",
      "mosaic",
      "Scenepck",
      "yuris3",
      "unitybin",
      "qlie",
      "kiri-alltime",
      "kiri-mekujira",
      "kiri",
      "lcse",
      "yuris2",
      "kirisnr",
      "Seen",
      "Seen2",
      "so5",
      "kiriruby",
    ].includes(type)
  ) {
    rawPrefixList = [...prefixList];
    // prefixList = prefixList.map((text) => {
    //   if (text.trim() === "") return text;
    //   const temp = text.replace(/「/g, "").split("/");
    //   if (temp.length === 1) {
    //     const t =
    //       text.replace(/】「/g, "") +
    //       "/" +
    //       text.replace(/】「/g, "").replace(/【/g, "") +
    //       "】「";
    //     return t;
    //   }
    //   return text;
    // });
    prefixList = await translateSelectCenterTextList(
      prefixList,
      1,
      false,
      undefined,
      "srp"
    );
    // suffixList = await translateSelectCenterTextList(
    //   suffixList,
    //   1,
    //   false,
    //   undefined,
    //   "srp"
    // );
  }
  if (type === "aos") {
    prefixList = await translateSelectCenterTextList(
      prefixList,
      1,
      false,
      undefined,
      "srp"
    );
    prefixList = prefixList.map((v) =>
      converter.toFullWidth(v).replace(/］/g, "]").replace(/［/g, "[")
    );
  }
  let count = 0;
  // ans = handleWordWrapGlue(
  //   ans.map((text) =>
  //     text
  //       .replace(/\(e\)/g, " ")
  //       .replace(/'/g, "’")
  //       .replace(/\)/g, "）")
  //       .replace(/\(/g, "（")
  //   ),
  //   100000,
  //   "(e)"
  // );

  // const finalResult = ans.map((text) =>
  //   text.replace(/'/g, "’").replace(/"/g, "”")
  // );
  // if (isGlue) {
  //   ans = handleWordWrapGlue(ans, 10000, "\n", false);
  // }
  // console.log({ isEqual });
  // if (isEqual) {
  //   const result = !isEqualObjects(cacheTranslationRaw, cacheTranslation);
  //   if (result) {
  //     await simpleWriteFile(
  //       "./cacheTranslation.json",
  //       JSON.stringify(cacheTranslation, null, 2),
  //       "utf8"
  //     );
  //     isEqual = false;
  //   }
  // } else {
  //   await simpleWriteFile(
  //     "./cacheTranslation.json",
  //     JSON.stringify(cacheTranslation, null, 2),
  //     "utf8"
  //   );
  //   cacheTranslationRaw = { ...cacheTranslation };
  //   isEqual = true;
  // }
  console.log({ isSimpleWriteFile });
  if (isSimpleWriteFile === undefined) {
    console.log({ textList });
  }
  if (isSimpleWriteFile) {
    await simpleWriteFile(
      "./" + jsonCache,
      JSON.stringify(cacheTranslation, null, 2),
      "utf8"
    );
  }

  if (
    ["srp", "anim", "waffle", "rpgm", "scn", "cst", "rpgmmv-name"].includes(
      type
    )
  ) {
    return ans;
  }
  let finalResult = [];

  if (
    [
      "yuris3",
      "ain",
      "med",
      "bsxx",
      "yuris",
      "EAGLS",
      "musica",
      "whale",
      "Seen",
      "BGI",
      "kiriruby",
      "kiri-alltime",
      "Eroit",
      "rpgmvxace",
      "kiri-mink",
      "Scenepck",
      "kiri-mekujira",
      "rpgmmv",
      "qlie",
      "yuris2",
      "kiri",
      "unity",
      "kiriruby2",
      "aos",
      "tanuki",
      "willadv",
      "willadv2",
      "kirisnr",
      "kirisnr2",
      "cst-special",
      "kiri2",
      "nexas",
      "SLG",
      "malie",
      "sec5",
      "ast",
      "AST2",
      "tblscr",
      "mosaic",
      "BGI",
      "catsystem",
      "unitybin",
      "liar",
      "kiri-sator",
      "ast3",
      "lcse",
      "renpy",
      "so5",
      "ast4",
      "willadv3",
      "Seen2",
    ].includes(type)
  ) {
    switch (type) {
      case "tanuki":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let suffix = suffixList[index];
          let temp = prefix + ',"' + ans[count] + '"' + suffix;
          count++;
          if (text.split(",").length < 4 || !editedTextList[index]) return text;
          return temp;
        });
        break;
      case "yuris3":
      case "Seen":
      case "Seen2":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let temp =
            prefix + (prefix && type === "yuris3" ? "　" : "") + ans[count];
          count++;
          return temp;
        });
        break;
      case "AST2":
      case "musica":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let temp = prefix + " " + ans[count];
          count++;
          return temp;
        });
        break;
      case "unitybin":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let temp = prefix + "," + ans[count];
          count++;
          return temp;
        });
        break;
      case "tblscr":
      case "ast":
        finalResult = rawTextList2.map((text, index) => {
          // let prefix = prefixList[index];
          let suffix = suffixList[index];
          let temp = ans[count] + suffix.replace(/”/g, '"');
          count++;
          return temp;
        });
        break;
      case "catsystem":
      case "willadv2":
        finalResult = rawTextList2.map((text, index) => {
          let suffix = suffixList[index];
          let prefix = prefixList[index];
          let temp = (prefix ? "" : "ー") + ans[count] + suffix;
          count++;
          return temp;
        });
        break;
      case "mosaic":
      case "sec5":
      case "malie":
      case "kiri2":
      case "bsxx":
      case "kiri-sator":
      case "ast3":
        finalResult = rawTextList2.map((text, index) => {
          let suffix = suffixList[index];
          let prefix = prefixList[index];
          // if (prefix) prefix += "\r\n";
          let temp =
            prefix +
            handleWordWrap(10000, ans[count], "\\n").replace(/"/g, "") +
            suffix;
          if (temp.split("\\n").length >= 4 && type == "ast3") {
            temp =
              prefix +
              handleWordWrap(80, ans[count].replace(/"/g, ""), "\\n") +
              suffix;
            temp = `{"exfont",size="f2"},\r\n` + temp + `\r\n{"exfont"},`;
          }
          count++;
          return temp;
          // .replace(/\\n/g, " ");
        });
        break;
      case "unity":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          let suffix = suffixList[index];
          let temp =
            rawTextList2[index] +
            "=" +
            prefix +
            handleWordWrap(58, ans[count], "\\r\\n") +
            suffix;
          count++;
          if (temp === "=") return "";
          return temp;
        });
        break;
      case "Scenepck":
      case "willadv":
      case "so5":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          // let temp = prefix + handleWordWrap(55, ans[count], "@n");
          // console.log(prefix, ans[count])
          // let temp =
          //   (type === "so5" && prefix.trim() ? " " + prefix : prefix) +
          //   (type === "so5" && prefix.trim() ? "/" : "") +
          //   ans[count].trim();
          let temp =
            (prefix.trim() ? " " + prefix : prefix) + "/" + ans[count].trim();
          count++;
          // if (temp === "=") return "";
          if (type === "so5")
            if (temp.match(/\/$/g))
              return " " + prefix.replace(/\//g, " ").slice(0, 57);
          return temp;
        });
        break;
      case "nexas":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          // let temp = prefix + handleWordWrap(55, ans[count], "@n");
          let temp = prefix + ans[count];
          count++;
          // if (temp === "=") return "";
          return temp;
        });
        break;
      case "kirisnr":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          if (prefix.includes("】")) {
            if (text.match(/^「/g)) {
              ans[count] =
                "「" + ans[count].replace(/\(/g, "（").replace(/\)/g, "）");
            }
          }
          if (text.match(/」$/g)) {
            ans[count] =
              ans[count].replace(/\(/g, "（").replace(/\)/g, "）") + "」";
          }
          let temp =
            prefix + ans[count].replace(/\(/g, "（").replace(/\)/g, "）");
          count++;
          // if (temp === "=") return "";
          return temp;
        });
        break;
      case "cst-special":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          let temp =
            prefix +
            (prefix.includes("pc")
              ? converter.toFullWidth(ans[count])
              : ans[count]);
          count++;
          // if (temp === "=") return "";
          return temp;
        });
        break;
      case "kiri-mekujira":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index].replace(/[「（]/g, "");
          // let temp = prefix + (prefix ? " " : "") + ans[count];
          let temp = prefix + ans[count];
          count++;
          // if (temp === "=") return "";
          return temp;
        });
        break;
      case "yuris":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = prefixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp = (temp3 ? temp3 : "") + ans[count];
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
      case "liar":
      case "kiri":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = prefixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            (text.match(/[a-zA-Z0-9]/) ? "" : temp3 ? temp3 : "　") +
            ans[count];
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp;
        });
        break;
      case "ast4":
      case "willadv3":
      case "renpy":
        finalResult = rawTextList.map((text, index) => {
          let temp3 = prefixList[index];
          let temp4 = suffixList[index];
          // let temp = "    " + temp3 + ans[count] + temp4;
          let temp =
            temp3 +
            (ans[count] || "")
              .replace(/^[＞【『「（《》】』」）]/g, "")
              .replace(/[＜【『「（《》】』」）]$/g, "") +
            temp4;
          count++;
          return temp;
        });
        break;

      case "qlie":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = prefixList[index];
          let temp4 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            (temp3 ? temp3 : "") +
            ans[count].replace(/,( )?/g, "、") +
            (temp4 ? temp4 : "");
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp;
        });
        break;
      case "rpgmmv":
        finalResult = rawTextList.map((text, index) => {
          if (ans[count] === undefined) {
            return ans[count++];
          }
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = prefixList[index];
          let temp4 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp = (temp3 ? temp3 : "") + ans[count] + (temp4 ? temp4 : "");
          if (ans[count] === "") {
            temp = rawTextList2[index];
          }
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim().replace(/】/g, "】\n");
        });
        break;
      case "rpgmvxace":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          if (
            text.match(/^"/g) ||
            text.match(/"$/g) ||
            text.match(/^'/g) ||
            text.match(/'$/g) ||
            text.match(/^(\/)/g) ||
            text.match(/(\/)$/g) ||
            text.match(/%w/g)
          ) {
            return text;
          }
          let temp2 = prefixList[index] + " ";
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp = temp2 + ans[count] + temp3;
          if (text.trim().match(new RegExp("(^(－))|((－)$)", "g"))) {
            temp =
              "－" +
              temp
                .replace(new RegExp("(^(－))|((－)$)", "g"), "")
                // .replace(/-/g, "－")
                .replace(/\./g, "") +
              "－";
          }
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
      case "Eroit":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = prefixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp = (temp3 ? temp3 : "") + ans[count];
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp;
        });
        break;
      case "aos":
        finalResult = rawTextList.map((text, index) => {
          let temp2 = prefixList[index];
          let temp3 = suffixList[index];
          let res =
            temp2 + ans[count].replace(/＇/g, "’").replace(/＂/g, "") + temp3;
          // let res = temp2 + converter.toFullWidth(ans[count]) + temp3;
          count++;
          return res;
        });
        break;
      case "lcse":
        finalResult = rawTextList.map((text, index) => {
          let temp2 = prefixList[index];
          let temp3 = suffixList[index];
          let res =
            temp2 +
            ans[count].replace(/\(/g, "（").replace(/\)/g, "）") +
            temp3;
          count++;
          return res;
        });
        break;
      case "kiri-alltime":
        finalResult = rawTextList.map((text, index) => {
          let temp2 = prefixList[index];
          let temp3 = suffixList[index];
          let temp =
            (temp2.includes("locate0")
              ? temp2
                  .replace(/@locate0 /g, "@locate0\r\n")
                  .replace(/ @locate1/g, "\r\n@locate1")
              : "@locate1") +
            "\r\n" +
            ans[count] +
            temp3;
          count++;
          return temp.trim();
        });
        break;
      case "kirisnr2":
      case "kiriruby":
      case "kiriruby2":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp2 = prefixList[index];
          let temp3 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            (temp2 && !isLovelyCation ? temp2 : "") +
            (type === "kirisnr2" && temp2.includes("】") ? "[r]" : "") +
            ans[count] +
            (temp3 ? temp3 : "");
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
      case "med":
        finalResult = rawTextList.map((text, index) => {
          let temp = ans[count]
            .replace(/, /g, "、")
            .replace(/’/g, "'")
            // .replace(/'/g, "’")
            .replace(/(\.\.\.( )?)+/g, "…")
            .replace(/\.( )?/g, "。")
            .replace(/\?( )?/g, "？");
          count++;
          return temp.trim();
        });
        break;
      case "ain":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          let temp2 = prefixList[index];
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = suffixList[index];
          if (text === "@@") return temp2 + "@@" + temp3;
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            temp2 +
            ans[count]
              .replace(/, /g, "、")
              .replace(/’/g, "'")
              // .replace(/'/g, "’")
              .replace(/(\.\.\.( )?)+/g, "…")
              .replace(/\.( )?/g, "。")
              .replace(/\?( )?/g, "？") +
            temp3;
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
      case "EAGLS":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          let temp2 = prefixList[index];
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = suffixList[index];
          // console.log({temp2, temp3})
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            temp2 +
            ans[count]
              .replace(/\)/g, "）")
              .replace(/\(/g, "（")
              .replace(/（e）/g, "(e)")
              .replace(/（h）/g, "(h)") +
            temp3;
          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
      case "BGI":
        finalResult = rawTextList
          .map((v) => {
            const regExp = new RegExp(
              "[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》]+",
              "g"
            );
            const textList = v.match(regExp);
            if (!textList)
              return v
                .replace(/<br>/g, "")
                .replace(/<d[0-9]+>/g, "")
                .replace(/<d>/g, "")
                .replace(/<\/d>/g, "")
                .replace(/<\/r>/g, "")
                .replace(/<r.+>/g, "")
                .replace(
                  />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
                  ""
                )
                .replace(/<R/g, "")
                .replace(/<[a-zA-Z0-9]+>/g, "");
            const isCheck = textList.reduce((ans, text) => {
              if (text.length > 10) {
                return true;
              }
              return ans;
            }, false);
            if (isCheck === true)
              return converter.toFullWidth(
                v
                  .replace(/<\/r>/g, "")
                  .replace(/<d[0-9]+>/g, "")
                  .replace(/<d>/g, "")
                  .replace(/<\/d>/g, "")
                  .replace(/<br>/g, "")
                  .replace(/<r.+>/g, "")
                  .replace(
                    />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
                    ""
                  )
                  .replace(/<R/g, "")
                  .replace(/<[a-zA-Z0-9]+>/g, "")
              );
            return v
              .replace(/<\/r>/g, "")
              .replace(/<d[0-9]+>/g, "")
              .replace(/<d>/g, "")
              .replace(/<\/d>/g, "")
              .replace(/<r.+>/g, "")
              .replace(
                />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
                ""
              )
              .replace(/<R/g, "")
              .replace(/<br>/g, "")
              .replace(/<[a-zA-Z0-9]+>/g, "");
          })
          .map((text, index) => {
            // if (ans[count]) return text;
            let temp2 = prefixList[index];
            let temp3 = suffixList[index];
            if (text.match(/[a-zA-Z0-9\._]/g)) {
              let temp = temp2 + text;
              return temp;
            }
            // if (text === "@-@") return "@@";
            // let temp = ans[count];
            // let temp = temp2 + ans[count] + temp3;
            let temp = temp2 + ans[count] + temp3;
            // .replace(/, /g, "、")
            // .replace(/’/g, "'")
            // .replace(/"/g, "”")
            // .replace(/'/g, "’")
            // .replace(/(\.\.\.( )?)+/g, "…")
            // .replace(/\.( )?/g, "。")
            // .replace(/\?( )?/g, "？");
            count++;
            return temp.trim().replace(/@/g, "＠");
          });
        break;
      case "yuris2":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          let temp2 = prefixList[index].replace(/[『「（]/, "");
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            (temp2 ? temp2 : "") +
            // .replace(/[『「（]/g, "")
            ans[count];
          // .replace(/, /g, "、")
          // .replace(/’/g, "'")
          // .replace(/"/g, "”")
          // .replace(/'/g, "’")
          // .replace(/(\.\.\.( )?)+/g, "…")
          // .replace(/\.( )?/g, "。")
          // .replace(/\?( )?/g, "？");
          count++;
          return temp.trim().replace(/@/g, "＠");
        });
        break;
      case "SLG":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          let temp2 = prefixList[index];
          let temp3 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            temp2 +
            ans[count]
              // .replace(/, /g, "、")
              // .replace(/’/g, "'")
              .replace(/"/g, "”") +
            // .replace(/'/g, "’")
            // .replace(/(\.\.\.( )?)+/g, "…")
            // .replace(/\.( )?/g, "。")
            // .replace(/\?( )?/g, "？");
            temp3;
          count++;
          return temp;
        });
        break;
      default:
        finalResult = rawTextList.map((text, index) => {
          let temp2 = prefixList[index];
          // let temp =
          //   (temp2 ? temp2 : type === "whale" ? "【】" : "") + ans[count];
          let temp = temp2 + ans[count];
          // .replace(/, /g, "、")
          // .replace(/’/g, "'")
          // .replace(/'/g, "’")
          // .replace(/(\.\.\.( )?)+/g, "…")
          // .replace(/\.( )?/g, "。")
          // .replace(/\?( )?/g, "？")
          // .replace(/vegetable/g, "veggie")
          // .slice(0, 117);

          // handleWordWrap(
          //   46,
          //   ans[count].replace(/、/g,", "),
          //   "\\r\\n",
          //   undefined,
          //   temp2 ? 45 - (temp2.length) : undefined
          // );
          count++;
          return temp.trim();
        });
        break;
    }
  }
  return finalResult;
}
// let a = []
async function translateOfflineSugoiCt2(
  text,
  wordWrapMode,
  isExhibit,
  isLovelyCation,
  prefix1,
  index,
  isSimpleWrite
) {
  // return { data: text, isSimpleWrite };
  // return handleWordWrap(61, text, "\r\n");
  // return text.replace(/Chika/g,"Chinatsu");
  // const data = Object.keys(dataTranslation).reduce((ans, curr) => {
  //   ans[curr.replace(/\\f/g, "").trim()] = converter.toFullWidth(dataTranslation[curr].replace(/\\f/g, "")).replace(/［/g,"[").replace(/］/g,"]");
  //   return ans;
  // }, {});
  // return data[text];
  // if(!text.includes("</s>")){
  //   return text
  // }
  // return text;
  // return text.replace(/"/g, '\\"');
  // if (
  //   text ===
  //   "「‥‥アリス姫、思い直してはいただけませんか？　このような方法、とても賛成できません」"
  // )
  // if(text === "「ややややめて！　ワイシャツの下から手を忍ばせないで！　必要としてる！　俺、愛姉さんのこと必要としてる！」"){
  //   console.log("「ややややめて！　ワイシャツの下から手を忍ばせないで！　必要としてる！　俺、愛姉さんのこと必要としてる！」")
  // }
  if (isExhibit && text.length === 1) {
    // if (text === "雅") return { data: "Miyabi", isSimpleWrite };
    // if (text === "春") return { data: "Haru", isSimpleWrite };
    return { data: text, isSimpleWrite };
  }

  if (text === null) return { data: text, isSimpleWrite };
  if (text === "なし") return { data: text, isSimpleWrite };
  if (text.includes("＃")) return { data: text, isSimpleWrite };
  if (text.includes("：")) return { data: text, isSimpleWrite };
  if (text.includes("选项")) return { data: text, isSimpleWrite };
  if (text === "オン") return { data: text, isSimpleWrite };
  if (text === "　") return { data: text, isSimpleWrite };
  if (text === " ") return { data: text, isSimpleWrite };
  // if (text.includes("──────")) return { data: text, isSimpleWrite };
  if (text === "\n\n") return { data: text, isSimpleWrite };
  if (text === "\\r\\n") return { data: text, isSimpleWrite };
  if (text === "\n") return { data: text, isSimpleWrite };
  if (text === "】") return { data: text, isSimpleWrite };
  if (text === "【") return { data: text, isSimpleWrite };
  if (text === "】\\n") return { data: text, isSimpleWrite };
  let originalText = text;
  // text = text
  //   // .replace(/([0-9a-z\/]+>)/g, "")
  //   // .replace(/\\\\n:/g, "");
  //   //   .replace(/\\n/g, "")
  //   .replace(/\\r\\n/g, "")
  //   .replace(/\r\n/g, "")
  //   .replace(/\n/g, "")
  //   .replace(/<d[0-9]+>/g, "")
  //   .replace(/<s[0-9]+>/g, "")
  //   .replace(/DD-mod/g, "ＤＤ－ｍｏｄ")
  //   .replace(/DD-System/g, "ＤＤ－Ｓｙｓｔｅｍ")
  //   .replace(/<\/d>/g, "")
  //   .replace(/<\/s>/g, "")
  //   .replace(/1vs1/g, "１ｖｓ１")
  //   .replace(/1on1/g, "１ｏｎ１")
  //   .replace(/2on2/g, "２ｏｎ２")
  //   .replace(/3on3/g, "３ｏｎ３")
  //   .replace(/2vs2/g, "２ｖｓ２")
  //   .replace(/3vs3/g, "３ｖｓ３")
  //   .replace(/vs/g, "ｖｓ")
  //   // .replace(/#String\(主人公苗字\)/g, "神楽木")
  //   // .replace(/#String\(主人公名前\)/g, "旭")
  //   .replace(/\r/g, "")
  //   .replace(/\[ruby text='/g, "")
  //   .replace(
  //     /'\]\[ch text='[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪〇☆〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪〇☆〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+―]+'\]/g,
  //     ""
  //   )
  //   .trim();
  //   .replace(/\n/g, "")
  //   .replace(/\[emb exp="tf\.target_name"\]/g, "Ｙａｍａｄａ")
  //   //   // .replace(/\r\n/g, "")
  //   //   .replace(/\\c/g, "")
  //   .replace(/\*01/g, "")
  //   .replace(/{image=gui\/heart.png}{alt}heart{\/alt}/g, "♥")
  //   .replace(/“/g, "『")
  //   .replace(/#String\(主人公苗字\)/g, "西園寺")
  //   .replace(/”/g, "』")
  //   .replace(/<r>/g, "")
  //   .replace(/\[ruby text=["']/g, "")
  //   .trim();
  // .replace(/["']\]/g, "");
  // if (text.replace(/\\n/g, "").match(/[a-zA-Z0-9_#\.\/{}：\\]/g))
  //   return { data: text, isSimpleWrite };
  // if (text === "ハーレム") return { data: text, isSimpleWrite };
  // if (text === "悲しい") return { data: text, isSimpleWrite };
  // if (text === "部活中") return { data: text, isSimpleWrite };
  // if (text === "不安") return { data: text, isSimpleWrite };
  // if (text.includes("\x06")) return { data: text, isSimpleWrite };
  // if (text.includes("（夕方～夜）")) return { data: text, isSimpleWrite };
  // if (text.includes("エッチシーン")) return { data: text, isSimpleWrite };
  // if (text.includes("（日中）")) return { data: text, isSimpleWrite };
  // if (text.includes("のテーマ")) return { data: text, isSimpleWrite };
  // if (text.includes("ギャグシーン")) return { data: text, isSimpleWrite };
  // if (text === "プロローグ開始") return { data: text, isSimpleWrite };
  // if (text === "プロローグ終了") return { data: text, isSimpleWrite };
  // if (text === "選択結果") return { data: text, isSimpleWrite };
  // if (text === "選択肢登録") return { data: text, isSimpleWrite };
  // if (text.match(/[Ａ-Ｚ０-９\-\+]/g)) return { data: text, isSimpleWrite };
  // if (text === "ト書き") return { data: text, isSimpleWrite };
  if (text === "』") return { data: text, isSimpleWrite };
  if (text === "》") return { data: text, isSimpleWrite };
  if (text === "――っ") return { data: "――", isSimpleWrite };
  // if (text === "文章表示") return { data: text, isSimpleWrite };
  // if (text.includes("選択結果")) return { data: text, isSimpleWrite };
  // if (text === "ト書き") return { data: text, isSimpleWrite };
  // if (text === "侍女") return { data: text, isSimpleWrite };
  if (text === "@@") return { data: " ", isSimpleWrite };
  text = text.replace(/3Ping Lovers!/g, converter.toFullWidth("3Ping Lovers!"));
  // if (text.replace(/\\n/g, "").match(/[a-zA-Z0-9_#\.]/g))
  //   return { data: text, isSimpleWrite };
  // if (text.length <= 5 && !text.match(/[。」]$/g)) return {data: text, isSimpleWrite};
  // if (text.match(/[_\.]/g)) return {data: text, isSimpleWrite};
  // if (text.includes("シナリオ") || text.includes("明菜視点"))
  //   return { data: text, isSimpleWrite };
  // if (text.includes("エラー") | text.includes("ｔｂ"))
  //   return { data: text, isSimpleWrite };
  // if (text.match(/[@#]/g)) return {data: text, isSimpleWrite};
  if (
    [
      "ＰＨＬ",
      "剣姫",
      "ソードプリンセス",
      "／",
      "日",
      "月",
      "詠",
      "火",
      "水",
      "木",
      "金",
      "土",
      "回",
    ].includes(text)
  )
    return { data: text, isSimpleWrite };
  if (text === undefined) return { data: text, isSimpleWrite };
  // if (text.includes("／") && !text.includes("≪"))
  //   return { data: text, isSimpleWrite };
  // if (text.includes("：")) return { data: text, isSimpleWrite };
  if (text === "　") return { data: text, isSimpleWrite };
  if (text === "?") return { data: text, isSimpleWrite };
  if (text.includes("１２３４")) return { data: text, isSimpleWrite };
  if (text === "・\\n・\\n・\\n") return { data: text, isSimpleWrite };
  if (text === " ") return { data: text, isSimpleWrite };
  if (text === "(") return { data: text, isSimpleWrite };
  if (text === ")") return { data: text, isSimpleWrite };
  if (text === "[") return { data: text, isSimpleWrite };
  if (text === "]") return { data: text, isSimpleWrite };
  if (text === '""') return { data: text, isSimpleWrite };
  if (text === "") return { data: text, isSimpleWrite };
  if (text === "’") return { data: text, isSimpleWrite };
  if (text === "──") return { data: text, isSimpleWrite };
  if (text === "声") return { data: "Voice", isSimpleWrite };
  if (text === "文章表示") return { data: text, isSimpleWrite };
  if (text === "アイキャッチ") return { data: text, isSimpleWrite };
  if (text === "主人公") return { data: "You", isSimpleWrite };
  if (text === "名前") return { data: "名前", isSimpleWrite };
  if (text === "ＳｅｅｎＥｎｄ")
    return { data: "ＳｅｅｎＥｎｄ", isSimpleWrite };
  // if (text.length === 1) return {data: text, isSimpleWrite};
  if (text === "＝") return { data: text, isSimpleWrite };
  if (text === ">") return { data: text, isSimpleWrite };
  if (text === undefined) return { data: undefined, isSimpleWrite };
  // if (text.includes("・・・・")) return {data: text, isSimpleWrite};
  if (text === "名無し") return { data: text, isSimpleWrite };
  if (text === "、") return { data: text, isSimpleWrite };
  if (text === "「") return { data: text, isSimpleWrite };
  if (text === "『") return { data: text, isSimpleWrite };
  if (text === "（") return { data: text, isSimpleWrite };
  if (text === "心の声") return { data: "心の声", isSimpleWrite };
  if (text === " ") return { data: " ", isSimpleWrite };
  if (text === "？？？？") return { data: "？？？？", isSimpleWrite };
  if (text === "？？？") return { data: "？？？", isSimpleWrite };
  if (text === "？？") return { data: "？？", isSimpleWrite };
  if (text === "？") return { data: "？", isSimpleWrite };
  if (text === "分岐") return { data: "分岐", isSimpleWrite };
  if (text === "かな") return { data: "Kana", isSimpleWrite };
  if (text === "夏鈴") return { data: "Karin", isSimpleWrite };
  if (text === "。") return { data: "。", isSimpleWrite };
  // if (text === "") return {data: "", isSimpleWrite};
  if (text === "    ") return { data: "    ", isSimpleWrite };
  if (text === "ＯＰムービー初回")
    return { data: "ＯＰムービー初回", isSimpleWrite };
  if (text === "ＯＰムービー２回目以降")
    return { data: "ＯＰムービー２回目以降", isSimpleWrite };
  if (text === "……") return { data: "……", isSimpleWrite };
  if (text === "。、」』）！？”～ー♪")
    return { data: "。、」』）！？”～ー♪", isSimpleWrite };

  // text = excludeTranslateText(text);
  // if (text.length <= 1) return { data: text, isSimpleWrite };
  // return {
  //   data: handleWordWrap(
  //     33,
  //     // converter.toHalfWidth(text).replace(/、/g, ", "),
  //     text,
  //     "\r\n"
  //   ),
  //   isSimpleWrite,
  // };
  let specialTexts = [];
  if (isLovelyCation) {
    specialTexts = text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』'‥ⅠⅡⅢⅣⅤ『』《》]+\]/g
    );
    if (specialTexts && specialTexts.length > 0) {
      text = text.replace(
        /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』'‥ⅠⅡⅢⅣⅤ『』《》]+\]/g,
        "Dana"
      );
    }
  }

  let wordWrappedText;
  switch (wordWrapMode) {
    case "artemisAster":
      if (text.includes("\\n")) {
        return text;
      }
      wordWrappedText =
        `{"exfont", size="f2"},\n"` +
        handleWordWrap(60, text, "\\n") +
        `",\n{"exfont"},`;
      return { data: wordWrappedText, isSimpleWrite };
    case "Eroit":
      // return text.replace(/、/g, ", ");
      // console.log({text});
      // wordWrappedText = handleWordWrap(61, text, "\\n");
      // if (wordWrappedText.split("\\n").length >= 3 ) {
      //   wordWrappedText = handleWordWrap(82, text, "\\n");
      // }
      wordWrappedText =
        // `[font size = "21"]\r\n` +
        converter
          .toFullWidth(
            handleWordWrap(
              // text.includes("「")?70:72
              // !(prefix1.replace(/[0-9 ]+/g,"")) ? 49 :47,
              29,
              // converter.toHalfWidth(text),
              text
                .replace(/\[r\]/g, " ")
                .replace(/(““)/g, "")
                .replace(/、/g, ", ")
                .replace(/^(「“)/g, "")
                .replace(/(”」)$/g, "」")
                .replace(/\;/g, ",")
                .replace(/(””)/g, "")
                .trim(),
              // .replace(/\r\n/g, " "),
              // .replace(/　/g," "),
              "\r\n"
            )
          )
          // .replace(/ /g, "　")
          // .replace(/　/g, " ")
          .replace(/w/g, converter.toFullWidth("w"))
          .replace(/W/g, converter.toFullWidth("W"))
          .replace(/m/g, converter.toFullWidth("m"))
          .replace(/m/g, converter.toFullWidth("m"))
          .replace(/M/g, converter.toFullWidth("M"));
      // console.log({wordWrappedText})
      // // if (wordWrappedText.split("\r\n").length > 3) {
      // //   return text;
      // // }
      // return { data: wordWrappedText, isSimpleWrite };
      // return {
      //   data: text,
      //   // .replace(/a m/g, converter.toFullWidth("a m")),
      //   isSimpleWrite,
      // };
      // console.log(wordWrappedText);
      const array = wordWrappedText.split("\r\n");
      let i = 0;
      let temp = "";
      while (i < array.length) {
        if (i > 0) {
          // temp += "\r\n\r\n@talk\r\n";
          // temp += `[pw]\r\n\r\n[m name=""]`;
          // temp += `\r\n[tp]\r\n\r\n`;
          temp += `\r\n\r\n`;
        }
        // temp +=
        //   array.slice(i, i + 3).join(" ") +
        //   (i + 3 < array.length ? "\r\n@hitret" : "");
        temp += array.slice(i, i + 3).join("\r\n");
        i += 3;
      }
      // if (wordWrappedText.split("\r\n").length > 3) {
      //   return "<FONT SIZE=75>" + handleWordWrap(65, text, "\r\n");
      // }
      // return "<FONT SIZE=100>" + wordWrappedText;
      // return converter.toFullWidth(temp.replace(/, /g, "、"));
      return { data: temp, isSimpleWrite };
    case "rpgmmv":
      wordWrappedText = handleWordWrap(60, text, "\n");
      // if (wordWrappedText.split("\\n").length > 3) {
      //   return text;
      // }
      return { data: wordWrappedText, isSimpleWrite };
    default:
      break;
  }
  // return text;
  // console.log(text);
  // if (
  //   [
  //     "ﾇﾏ",
  //     "ｸ",
  //     "Ｐゴシック",
  //     "ＭＳ",
  //     "ﾈ",
  //     "%",
  //     "ｮ",
  //     "ﾐ",
  //     "ｴ",
  //     "ﾀ",
  //     "ﾝ",
  //   ].includes(text)
  // )
  // return text;
  // console.log({ text });

  // return text;
  // return text+"Hello world";
  // return "「caretaker really has changed a little… I can tell from the way the word  cock   comes out with a straight face at the dinner table..」"
  const rubyList =
    text.match(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/g
    ) || [];
  const rubyList2 =
    text.match(
      /\${ruby text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+}[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+\${\/ruby}/g
    ) || [];
  const rubyList3 =
    text.match(
      /(,)?{ruby, text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+},[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+,{\/ruby},/g
    ) || [];
  const rubyList4 =
    text.match(
      /\\{[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 \|]+}/g
    ) || [];
  const rubyList5 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω]+:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω]+\]/g
    ) || [];
  const rubyList6 = text.match(/<ruby%3D.+>.+<\/ruby>/g) || [];
  const rubyList7 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+ base="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+" ruby="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+"\]/g
    ) || [];
  const rubyList8 =
    text.match(
      /\[rb t=["一|-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+\]/g
    ) || [];
  const rubyList9 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・\\n]+ rb = "[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・\\nA-C/]+"\]/g
    ) || [];
  const rubyList10 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ ]+\]\([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ ]+\)/g
    ) || [];
  const rubyList11 =
    text.match(
      /<WinRubi [一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？,]+>/g
    ) || [];
  const rubyList12 =
    text.match(
      /<RUBY TEXT="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+" RUBY="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+">/g
    ) || [];
  const rubyList13 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ /]+\]/g
    ) || [];
  const rubyList14 =
    text.match(
      /\[[■一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ /]+\]\([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ ■]+\)/g
    ) || [];
  const rubyList15 =
    text.match(
      /<ruby text="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+">[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？]+<\/ruby>/g
    ) || [];
  const rubyList16 =
    text.match(
      /\[ruby_c t="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+" r="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－]+"\]/g
    ) || [];
  const rubyList17 =
    text.match(
      /≪[0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/／]+≫/g
    ) || [];
  const rubyList18 =
    text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥☆＆＿“”♥　、☆＆・ζ“”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？ /']+\]/g
    ) || [];
  const rubyList19 =
    text.match(
      /\|[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+\]/g
    ) || [];
  const rubyList20 =
    text.match(
      /\[mruby r="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+" text="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+"\]/g
    ) || [];
  const rubyList21 =
    text.match(
      /\{[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：:‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+\}/g
    ) || [];
  const rubyList22 =
    text.match(
      /\([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：:‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）\/]+\)/g
    ) || [];
  const rubyList23 =
    text.match(
      /{[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 \|:]+}/g
    ) || [];

  for (let i = 0; i < rubyList23.length; i++) {
    text = text.replace(
      rubyList23[i],
      rubyList23[i].split(":")[0].replace(/{/g, "").replace(/}/g, "")
    );
  }
  // for (let i = 0; i < rubyList22.length; i++) {
  //   text = text.replace(
  //     rubyList22[i],
  //     rubyList22[i].split("/")[0].replace(/\(/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList21.length; i++) {
  //   text = text.replace(
  //     rubyList21[i],
  //     rubyList21[i].split(":")[0].replace(/\{/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList14.length; i++) {
  //   text = text.replace(
  //     new RegExp(
  //       rubyList14[i]
  //         .replace(/\[/g, "\\[")
  //         .replace(/\]/g, "\\]")
  //         .replace(/\(/g, "\\(")
  //         .replace(/\)/g, "\\)"),
  //       "i"
  //     ),
  //     rubyList14[i].split("](")[0].replace(/\)/g, "").replace(/\[/g, "")
  //   );
  // }

  // for (let i = 0; i < rubyList20.length; i++) {
  //   text = text.replace(
  //     rubyList20[i],
  //     rubyList20[i].split("text=")[1].replace(/"/g, "").replace(/\]/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList5.length; i++) {
  //   text = text.replace(
  //     rubyList5[i],
  //     rubyList5[i].split(":")[0].replace("[", "").replace("]", " ")
  //   );
  // }
  // for (let i = 0; i < rubyList19.length; i++) {
  //   text = text.replace(
  //     rubyList19[i],
  //     rubyList19[i].split("[")[0].replace(/\|/g, "")
  //   );
  // }
  for (let i = 0; i < rubyList.length; i++) {
    text = text.replace(
      new RegExp(rubyList[i].replace(/\[/g, "\\[").replace(/\]/g, "\\]"), "i"),
      rubyList[i].split(",")[2]
        ? rubyList[i].split(",")[2].replace("]", "")
        : rubyList[i].split(",")[1].replace("]", "")
    );
  }
  // for (let i = 0; i < rubyList2.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList2[i], "i"),
  //     rubyList2[i].split("}")[0].replace(/\${ruby text=/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList3.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList3[i], "i"),
  //     rubyList3[i].split("}")[0].replace(/(,)?{ruby, text=/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList4.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList4[i], "i"),
  //     (rubyList4[i].split("|")[1] || rubyList4[i].split("|")[0])
  //       .replace("\\{", "")
  //       .replace("}", " ")
  //   );
  // }
  // for (let i = 0; i < rubyList6.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList6[i], "i"),
  //     rubyList6[i]
  //       .split(">")[1]
  //       .replace(/<ruby%3D/g, "")
  //       .replace(/<\/ruby/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList7.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList7[i], "i"),
  //     rubyList7[i].split('"')[3]
  //   );
  // }
  // for (let i = 0; i < rubyList8.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList8[i], "i"),
  //     rubyList8[i].split("|")[1].replace(/\]/, "")
  //   );
  // }
  // for (let i = 0; i < rubyList9.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList9[i], "i"),
  //     rubyList9[i].split("/")[1].replace(/"/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList10.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList10[i], "i"),
  //     rubyList10[i].split("](")[0].replace(/\[/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList11.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList11[i], "i"),
  //     rubyList11[i].split(",")[0].replace(/<WinRubi /g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList12.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList12[i], "i"),
  //     rubyList12[i]
  //       .split(" ")[1]
  //       .replace(/TEXT="/g, "")
  //       .replace(/"/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList13.length; i++) {
  //   text = text.replace(
  //     new RegExp(
  //       rubyList13[i].replace(/\[/g, "\\[").replace(/\]/g, "\\]"),
  //       "i"
  //     ),
  //     rubyList13[i].split("/")[0].replace(/\[/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList15.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList15[i], "i"),
  //     rubyList15[i].split('">')[1].replace(/<\/ruby>/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList16.length; i++) {
  //   text = text.replace(
  //     rubyList16[i],
  //     rubyList16[i].split('" ')[0].replace(/\[ruby_c t="/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList17.length; i++) {
  //   text = text.replace(
  //     rubyList17[i],
  //     rubyList17[i].split("／")[0].replace(/≪/g, "")
  //   );
  // }
  // for (let i = 0; i < rubyList18.length; i++) {
  //   text = text.replace(
  //     rubyList18[i],
  //     rubyList18[i].split("'")[0].replace(/\[/g, "")
  //   );
  // }
  // console.log({ text });
  // Ⅱ
  // const specialText = text.match(
  //   /\\.+\]/g
  // );
  // const specialText = text.match(
  //   /\<[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９0-9々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　　。●・♡＝…：＄αβ%％●＜＞「」『』（）♀♂♪（）─〇☆―〜゛×・○\/]+\>/g
  // );
  // if (specialText) {
  //   for (let i = 0; i < specialText.length; i++) {
  //     text = text.replace(
  //       specialText[i],
  //       // specialText[i].split("/")[1].replace(/\>/g, "")
  //       ""
  //     );
  //   }
  // }
  // if (text === "？？？？？") return "base";

  // a.push(text);
  // console.log(a);
  const listOfChoice = [
    `[…。♪:：〟！～『「」』？]`,
    "…",
    "(([『「【】」』])$)|(^([『「【】」』]))",
    "(^([『「【】」』]))",
    "(([『「【】」』])$)",
  ];
  const filterSpecialPrefixRegExp = new RegExp("%(n)?[0-9]+([;. ,])?", "g");
  if (text === null) return "Null";

  let filterText = text
    .replace(/コイバナ/g, "恋愛トーク")
    .replace(/タスケテ/g, "助けて")
    .replace(/チ×ポを/g, "ちんぽ")
    .replace(/太転依/g, "精神")
    .replace(/女/g, "女性")
    .replace(/タスケ────テ/g, "助けて")
    .replace(/ダル絡み/g, "煩わしい言動")
    .replace(/\[ruby text=["']/g, "")
    .replace(/["']\]/g, "")
    .replace(/\[ch text='/g, "")
    .replace(/<font size='[0-9]+'>/g, "")
    .replace(/<font size=[\-+0-9]+>/g, "")
    .replace(/<key>/g, "")
    .replace(/<\/key>/g, "")
    .replace(/<\/font>/g, "")
    .replace(/ｗ/g, "")
    .replace(/　/g, "")
    .replace(/\[シンボル tx=白ハート\]/g, "♥")
    // .replace(/[◆✩♥♡●♪]/g, "")
    .replace(/ゅ/g, "")
    // .replace(/\r/g, "")
    .replace(/\[np\]/g, "")
    // .replace(/\n/g, "")
    .replace(/<color [a-z0-9]+>/g, "")
    .replace(/<\/color>/g, "")
    // .replace(/\\[nN]/g, "")
    // .replace(/\\n　/g, "")
    .replace(/\[hint_[a-z_]+\]/g, "")
    .replace(/[♀♂]/g, "")
    .replace(/\[[0-9]+\]/g, "")
    .replace(/☆☆☆/g, "タッヤ")
    .replace(/,{"rt2"},/g, "")
    .replace(/\[シンボル tx=黒ハート\]/g, "♥")
    .replace(/<\/s>/g, "")
    .replace(/#N/g, "")
    .replace(/\\r/g, "")
    .replace(
      /\[ruby:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？\n]+\]/g,
      ""
    )
    .replace(/\[\/ruby\]/g, "")
    // .replace(/＃θ/g, "")
    // .replace(/[　 ]/g, "")
    // .replace(
    //   /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
    //   ""
    // )
    // .replace(/"/g, "")
    // .replace(/"$/g, "")
    // .replace(/。$/g, "")
    .replace(/\\r\\n/g, "")
    .replace(/[\[<]\/ruby[\]>]/g, "")
    .replace(/&heart;/g, "♥")
    .replace(/[《》]/g, "")
    .replace(/＃./g, "")
    // .replace(/＃β/g,"")
    // .replace(/＃η/g,"")
    // .replace(
    //   /\[ruby text=[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,]+\]/g,
    //   ""
    // )
    .replace(/\[emb exp='f\.PlayerGivenName'\]/g, "タッヤ")
    .replace(/\$L/g, "")
    .replace(/\$M/g, "")
    // .replace(/\[n\]/g, "")
    .replace(/\[[a-zA-Z]\]/g, "")
    .replace(/\[ω\]/g, "")
    .replace(
      />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
      ""
    )
    .replace(/<R/g, "")
    .replace(/<r>/g, "")
    // .replace(/\[mruby r=/g, "")
    .replace(/\[gly t="/g, "")
    // .replace(/"/g, "")
    .replace(/" text=".+"\]/g, "")
    .replace(/\\c/g, "")
    .replace(
      /<R[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪─〇☆―〜゛×・○♥、☆＆＿’！？\r\n　－（）]+>/g,
      ""
    )
    .replace(/<\/R>/g, "");
  // .replace(/…/g, "...")
  // .replace(/？/g, "? ")
  // .replace(/？/g, "? ")
  // .replace(/：/g, ": ")
  // .replace(/！/g, "! ");
  // .replace(/!+/g, "！");
  // .replace(/、/g, ", ")
  // .replace(/＆/g, "&");
  // if (filterText === "") {
  //   return text;
  // }
  filterText = handleNormalLetterText(filterText);
  // filterText = filterText.trim().replace(/[\r\n]+/g, "");
  // .replace(filterSpecialPrefixRegExp, "");
  // .split(/？。/g);
  if (filterText.match(/^[『「【]/g) && filterText.match(/[】』」]$/g)) {
    filterText = filterText.replace(/^[『「【]/g, "").replace(/[】』」]$/g, "");
  }
  // const specialList = filterText.match(/≪.+≫/g);
  // if (specialList)
  //   for (let i = 0; i < specialList.length; i++) {
  //     filterText = filterText.replace(
  //       /≪.+≫/i,
  //       specialList[i].split("／")[1].replace("≪", "").replace("≫", "")
  //     );
  //   }
  // console.log(cacheTranslation[filterText], { filterText });
  // Important
  if (filterText.includes("』@n『")) return { data: text, isSimpleWrite };

  if (
    excludeTranslateText(filterText.replace(/\\n/g, "")).match(
      /[a-zA-Z_#\.／]/g
    )
  )
    return { data: text, isSimpleWrite };
  // if (filterText.length === 1) return { data: text, isSimpleWrite };
  if (filterText === "") return { data: "", isSimpleWrite };

  console.log(filterText);

  filterText = excludeTranslateText(filterText);
  filterText = handleNormalLetterText(filterText);
  if (cacheTranslation[filterText]) {
    cacheTranslation[filterText] = cacheTranslation[filterText].replace(
      /⁇/g,
      ""
    );
    cacheTranslation[filterText] = replaceTagName(
      cacheTranslation[filterText],
      [2],
      "g"
    );
    cacheTranslation[filterText] = replaceTagName(
      cacheTranslation[filterText],
      [3],
      "gi"
    );
    cacheTranslation[filterText] = cacheTranslation[filterText].replace(
      /、/g,
      ", "
    );
    let doubleSpaceList =
      cacheTranslation[filterText].match(/((  )+)|((   )+)/g);

    if (doubleSpaceList && doubleSpaceList.length % 2 === 0) {
      doubleSpaceList.forEach((v, index) => {
        if (index % 2 === 0)
          cacheTranslation[filterText] = cacheTranslation[filterText].replace(
            v,
            "『"
          );
        else
          cacheTranslation[filterText] = cacheTranslation[filterText].replace(
            v,
            "』"
          );
      });
    }
    return {
      data: cacheTranslation[filterText]
        .replace(/。”。/g, "。” ")
        .replace(/❛/g, "’")
        .replace(/"/g, "")
        // .replace(/'/g, "’")
        // .replace(/’/g, "'")
        .replace(/\*/g, "＊")
        // .replace(/ /g, "　")
        // .replace(/_/g, "")
        // .replace(/m/g, "m ")
        // .replace(/M/g, "M ")
        // .replace(/w/g, "w ")
        // .replace(/W/g, "W ")
        // .replace(/H/g, "H ")
        // .replace(/\. /g, "。")
        // .replace(/’/g, "'")
        .replace(/, /g, "、")
        // .replace(/’/g, "'")
        .replace("「」", "「……」")
        .replace(/\[/g, "“")
        // .replace(/\.\.\./g, "…")
        .replace(/\]/g, "”")
        .replace(/XXX/g, "")
        .replace(/XX/g, "")
        .replace(/【】/g, "")
        // .replace(/-/g, "")
        // .replace(/-/g, "－")
        .replace(/ü/g, "u")
        .replace(/#/g, "＃")
        // .replace(/[“【『《]/g, "‘")
        // .replace(/[”》】』]/g, "’")
        .replace(/!+/g, "！")
        // .replace(/’/g, "'")
        // .replace(/、/g, ", ")
        .replace(/:NameSuffix/g, "晴彦")
        .replace(
          'Manji Manji Manji climax<style="Ruby6">フィニッシュ</style>　卍卍卍卍卍 Manji 卍　Climax Finish　卍卍卍卍卍',
          "卍　Climax Finish　卍"
        )
        .replace("【Kyoku】必　殺　技【極】", "【極】Special move【極】")
        .replace("（soft）", "（Soft）")
        .replace(/？/g, "?")
        .replace(/！/g, "!")
        .replace(/」」/g, "」")
        .replace(/『『/g, "『")
        .replace(/>/g, "＞")
        .replace(/</g, "＜")
        .replace(/\//g, "・"),
      // .replace(/time/g, "tｉme")
      // .replace(/Time/g, "Tｉme")
      // .replace(/Jump/g, "Jｕmp")
      // .replace(/jump/g, "jｕmp"),
      // .trim()
      // .replace(/^(San)/g, "-san"),
      // .replace(/\?/g, "？")
      // .replace(/？/g, "?"),
      // .replace(/n/g, "ｎ")
      // .replace(/N/g, "Ｎ")
      isSimpleWrite,
    };

    // return {
    //   data:
    //     // "[font size=27]" +
    //     // "@font size=30\r\n" +
    //     // (cacheTranslation[filterText].match(/[【『「（《]/g) ? "" : "　") +
    //     handleWordWrap(
    //       74,
    //       cacheTranslation[filterText]
    //         .replace(/。”。/g, "。” ")
    //         .replace(/❛/g, "’")
    //         .replace(/</g, "『")
    //         .replace(/>/g, "』")

    //         .replace(/’/g, "'")
    //         // .replace(/'/g, "’")
    //         // .replace(/\*/g, "＊")
    //         .replace(/＊/g, "*")
    //         // .replace(/\. /g, "。")
    //         .replace(/’/g, "'")
    //         .replace(/, /g, "、")
    //         .replace(/、/g, ", ")
    //         .replace("「」", "「……」")
    //         .replace(/\[/g, "“")
    //         .replace(/\]/g, "”")
    //         .replace(/XXX/g, "")
    //         .replace(/XX/g, "")
    //         // .replace(/[“”【『（《》】』）]/g, '"')
    //         .replace(/─/g, "-")
    //         .replace(/【】/g, "")
    //         .replace(/ü/g, "u")
    //         .replace(/#/g, "＃")
    //         .replace(/!+/g, "！")
    //         .replace(/！/g, "!")
    //         // .replace(/-/g, "")
    //         // .replace(/\?+/g, "？")
    //         // .replace(/“/g, '"')
    //         // .replace(/”/g, '"')
    //         .replace(/？/g, "?"),
    //       // .replace(/[“【『《]/g, "‘")
    //       // .replace(/[”》】』]/g, "’")
    //       // .replace(/, /g, "、")
    //       // .replace(/'/g, "’")
    //       // .replace(/！+/g, "!")
    //       // .replace(/？+/g, "?")
    //       // .replace(/？/g, "?").replace(/！/g, "!")
    //       "[r]"
    //     ),
    //   // .replace(/\.\.\. \?/g, "...?")
    //   // .split(/\\n/)
    //   // .slice(0, 10)
    //   // .join("\\n")
    //   // .split("\r\n")
    //   // .slice(0, 3)
    //   // .join("\r\n")
    //   // .replace(/[「]/g, "「 ")
    //   // .replace(/[『]/g, "『 ")
    //   // .replace(/“/g, "“ ")
    //   // .replace(/――/g, "―― ")
    //   // .replace(/(nnnn)+/g, "nnnn"),
    //   // .replace(
    //   //   /–––/g,
    //   //   "---"
    //   // ),
    //   // .replace(
    //   //   /!+/g,
    //   //   "！"
    //   // )
    //   isSimpleWrite,
    // };
    let wordWrappedText = handleWordWrap(
      25,
      cacheTranslation[filterText]
        .replace(/。”。/g, "。” ")
        .replace(/❛/g, "’")
        .replace(/</g, "『")
        .replace(/>/g, "』")

        .replace(/'/g, "’")
        // .replace(/\*/g, "＊")
        .replace(/＊/g, "*")
        // .replace(/\. /g, "。")
        .replace(/’/g, "'")
        .replace(/, /g, "、")
        // .replace(/、/g, ", ")
        .replace("「」", "「……」")
        .replace(/\[/g, "“")
        .replace(/\]/g, "”")
        .replace(/"/g, "")
        .replace(/XXX/g, "")
        .replace(/XX/g, "")
        // .replace(/[“”【『「（《》】』」）]/g, '"')
        // .replace(/─/g, "-")
        .replace(/\-/g, "─")
        .replace(/【】/g, "")
        .replace(/ü/g, "u")
        .replace(/#/g, "＃")
        .replace(/!+/g, "！")
        // .replace(/！/g, "!")
        .replace(/-/g, "")
        .replace(/\(/g, "（")
        .replace(/\)/g, "）")
        .replace(/\?+/g, "？")
        .replace(/？+/g, "?")
        .replace(/！/g, "!"),
      // .replace(/ /g, "　")
      // .replace(/“/g, '"')
      // .replace(/”/g, '"')
      // .replace(/？/g, "?")
      // .replace(/[“【『《]/g, "‘")
      // .replace(/[”》】』]/g, "’")
      "[r]"
    );

    // if (wordWrappedText.split("\r\n").length >= 4) {
    //   wordWrappedText = wordWrappedText.replace(/\r\n/g, " ");
    // }
    // return { data: wordWrappedText, isSimpleWrite };

    // if (prefix1 === "[n]") return { data: wordWrappedText, isSimpleWrite };
    // const array = wordWrappedText.split("*01");
    const array = wordWrappedText.split("[r]");
    let i = 0;
    let temp = "";
    while (i < array.length) {
      if (i > 0) {
        // temp += `[np]\r\n\r\n`;
        temp += `\r\n\r\n`;
        // temp += `\r\n@Msgend\r\n\r\n@Msg\r\n`;
        // temp += `\r\n[pre]\r\n`;
        // temp += `[T_NEXT]`;
        // temp += `//`;
        // temp += `\r\n[Hitret]\r\n\r\n`;
        // temp += `\r\n@Hitret\r\n\r\n`;
        // temp += "*02*03*01";
        // temp += "\r\n[tp]\r\n\r\n";
      }
      // temp += array.slice(i, i + 3).join("*01");
      temp += array.slice(i, i + 3).join("\r\n");
      // .replace(/ /g, "　")
      // .replace(/"/g, "");
      i += 3;
    }
    // return {
    //   data: converter.toFullWidth(temp),
    //   isSimpleWrite,
    // };
    // 【『「（《》】』」）
    return {
      data: converter.toFullWidth(temp),
      // .trim()
      // .replace(/^「/g, "[「]")
      // .replace(/」$/g, "[」]")
      // .replace(/^（/g, "[（]")
      // .replace(/）$/g, "[）]")
      // .replace(/^『/g, "[『]")
      // .replace(/』$/g, "[』]")
      isSimpleWrite,
    };
    // return cacheTranslation[filterText];
  }
  const translatedText = (
    await axios({
      url: "http://localhost:14366",
      method: "post",
      data: JSON.stringify({
        content: filterText,
        message: "translate sentences",
      }),
      headers: { "Content-Type": "application/json" },
      timeout: 150000,
    })
  ).data;

  isSimpleWrite = true;
  if (["Null.", "Null"].includes(translatedText)) return null;
  if (text === "心の声") return "心の声";
  let prefix = text.match(/^(	+)/g) ? text.match(/^(	+)/g)[0] : "";
  let temp = translatedText
    .replace(/(<)?unk>(")?/g, " ")
    .replace(/\u2014/g, "-")
    .replace(/[「【】」]/g, "")
    .replace("It's not like I don't know what's going on.", " ")
    .replace("It's time for me to get started.", "")
    .replace(/I'm not sure if it's true or not\./g, "");
  // .replace(/\%/g, " percent");
  if (["N$", " ", "\\B", "????", "\\b"].includes(temp)) temp = text;
  // if (text.match(/\r\n/g)) temp = translatedText + "\r\n";
  // else if (text.match(/\n/g)) temp = translatedText + "\n";
  // if (text.match(new RegExp(filterSpecialPrefixRegExp, "g"))) {
  //   const text = text
  //     .match(new RegExp(filterSpecialPrefixRegExp, "g"))[0]
  //     .replace(/[;. ,]+/g, "");
  //   temp = text + "; " + temp;
  // }
  if (text.match(/。$/g)) {
    temp = temp + text.match(/。$/g)[0];
    temp = temp.replace(".。", ".");
    temp = temp.replace(/。/g, ".");
  }
  temp = replaceTagName(temp, [2], "g");
  temp = replaceTagName(temp, [3], "gi");
  // temp = temp.replace(/"/g, "").replace(/, /g, "、").replace(/~/, "");
  if (
    text.trim().match(new RegExp(listOfChoice[3], "g")) &&
    text.trim().match(new RegExp(listOfChoice[4], "g"))
  )
    if (text.trim().match(new RegExp(listOfChoice[2], "g"))) {
      temp =
        (text.trim().match(new RegExp(listOfChoice[3], "g"))
          ? text.trim().match(new RegExp(listOfChoice[3], "g"))[0]
          : "") +
        temp +
        (text.trim().match(new RegExp(listOfChoice[4], "g"))
          ? text.trim().match(new RegExp(listOfChoice[4], "g"))[0]
          : "");
    }
  temp = temp
    .trim()
    .replace(/'/g, "’")
    // .replace(/"/g, "”")
    .replace(/❛/g, "’")
    .replace(/\*/i, "＊")
    .replace("「」", "「……」")
    .replace(/\[/g, "“")
    .replace(/\]/g, "”")
    .replace(/XXX/g, "")
    .replace(/XX/g, "")
    .replace(/【】/g, "")
    .replace(/ü/g, "u")
    .replace(/#/g, "＃")
    .replace(/!+/g, "！")
    // .replace(/^(San)/g, "-san")
    .replace(/\?/g, "？")
    .replace(/⁇/g, "");
  // .replace(/\.\.\./g, "…");
  // let finalResult = prefix + temp.slice(0, 14) + temp.slice(15);
  // let finalResult = prefix + await translateJapaneseToEng(
  //   temp.replace(/’/g, "'").replace(/、/g, ", "),
  //   false,
  //   3,
  //   10
  // );
  if (temp === "") return { data: text, isSimpleWrite };
  let finalResult = prefix + temp;
  // let finalResult = prefix + handleWordWrap(67, temp, "\\n");
  // if (text.match(/^(\\[nN])+/g)) {
  //   const prefixBreakLine = text.match(/^(\\[nN])+/g)[0];
  //   finalResult = prefixBreakLine + finalResult;
  // }
  // .replace(/, /g, "、");
  // .replace(/\./g, "")
  finalResult = weirdToNormalChars(replaceSignedCharacter(finalResult));
  cacheTranslation[filterText] = finalResult;
  // .replace(/ /g, converter.toFullWidth(" "))
  // .replace(/&/g, converter.toFullWidth("&"))
  // .replace(/-/g, converter.toFullWidth("-"))
  if (isLovelyCation) {
    if (specialTexts && specialTexts.length > 0) {
      specialTexts.forEach((specialText) => {
        finalResult = finalResult.replace(/Dana/i, specialText);
      });
    }
  }
  // return  converter.toFullWidth(finalResult);
  return {
    data: finalResult.replace(/–––/g, "---"),
    isSimpleWrite,
  };
  // .replace(/ /g, converter.toFullWidth(" "))
  // .replace(/&/g, converter.toFullWidth("&"))
  // .replace(/-/g, converter.toFullWidth("-"))
}

function excludeTranslateText(text) {
  let temp = text;
  Object.keys(objectMap).map((japaneseName) => {
    temp = temp.replace(
      new RegExp(japaneseName, "g"),
      // converter.toFullWidth(objectMap[japaneseName])
      converter.toFullWidth(objectMap[japaneseName])
    );
  });
  return temp;
}

function handleObjectMap(objectMap) {
  let ans = Object.keys(objectMap).reduce((ans, key) => {
    ans[key.replace(/ /g, "")] = objectMap[key];
    ans[key.replace(/ /g, "・")] = objectMap[key];
    ans[key.replace(/ /g, "＝")] = objectMap[key];
    ans[key.replace(/ /g, "　")] = objectMap[key];
    return ans;
  }, {});
  ans = Object.keys(objectMap).reduce((ans, key) => {
    const valueList = objectMap[key].split(" ");
    const keyList = key.split(" ");
    keyList.forEach((key, i) => {
      ans[key] = valueList[i];
    });
    return ans;
  }, ans);
  return ans;
}

let backupText = "";
// let backupText2 = "";
let check = false;
async function translateSelectCenterText(
  rawText,
  limit,
  start = 0,
  end,
  isGlue,
  ks,
  type
) {
  // console.log(rawText.replace(/<[0-9,]+>/g, ""), rawText.replace(/<[0-9,]+>/g, "").match(
  //   new RegExp(ks.translation.regExpToFilterSentenceContainTagName, "g")
  // ));
  if (!rawText) return rawText;
  // if (rawText.includes("／")) return rawText;
  // .replace(/\[SF\]/g, "ユウト")
  // .replace(/\[HF\]/g, "ユウト")
  // .replace(/\[SL\]/g, "シグルス")
  // .replace(/・/g, "")     "%A %B": "Nakamaru Soushirou"

  if (ks)
    if (
      !rawText
        .trim()
        // .replace(/\[[0-9]+\]/g, "")
        // .replace(/\$\$\$/g, "")
        // .replace(/<[0-9,]+>/g, "")
        // .replace(
        //   />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
        //   ""
        // )
        // .replace(/<R/g, "")
        .match(
          new RegExp(ks.translation.regExpToFilterSentenceContainTagName, "g")
        )
    )
      return rawText;
  // rawText = rawText.replace(/\\n/g, "");
  if (
    type === "kiri-mink" &&
    rawText.includes("【") &&
    rawText.includes("】")
  ) {
    const prefix = rawText.match(/【.+】/g)[0];
    if (!prefix.includes("/")) {
      rawText = rawText.replace(
        /【.+】/g,
        `【${prefix.replace(/[【】]/g, "")}/${prefix.replace(/[【】]/g, "")}】`
      );
    }
  }
  const prefix = rawText.match(/^((　)+)/g)
    ? rawText.match(/^((　)+)/g)[0]
    : "";
  const suffix = (rawText.match(/(　（[０-９]+）(.+)?)/g) || [""])[0];
  // console.log(suffix);
  let text = rawText
    // .trim()
    .replace(/―/g, "-")
    .replace(/\[シンボル tx=白ハート\]/g, "♥")
    .replace(/￥ｎ/g, "")
    // .replace(/\[n\]/g, "")
    // .replace(/\[[0-9]+\]/g, "")
    .replace(/<\/r>/g, "")
    .replace(/<r.+>/g, "")
    .replace(/<r・・・・・>/g, "♪")
    .replace(/<\/r>/g, "♥")
    // .replace(/　/g,"")
    // .replace(/MP/g, converter.toFullWidth("MP"))
    // .replace(/HP/g, converter.toFullWidth("HP"))
    // .replace(/TP/g, converter.toFullWidth("TP"));
    // .replace(/○/g, "")
    // .replace(/￥ｎ￥ｎ/g, "@#@1")
    // .replace(/\\n:/g, "")
    // // .replace(/、/g, ", ")
    // .replace(/\n:/g, "")
    // .replace(/\(e\)/g, "")
    // .replace(/\(f=[0-9]+\)/g, "")
    // .replace(/\(r\)/g, "")
    // .replace(/\n/g, "")
    // .replace(/\\n/g, "")
    // .replace(/\[n\]/g, "")
    // .replace(
    //   /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
    //   ""
    // )
    // .replace(
    //   /\(y=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　　。●・♡＝…：＄αβ%％●＜＞「」『』（）♀♂♪（）─〇☆―〜゛×・]+\)/g,
    //   ""
    // )
    // // .replace(/(<\/r>)|(<r )|(<r)|(　)|(\\r\\n)/g, "")
    // // .replace(/・/g, ".")
    // .replace(
    //   /\[ruby text="[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,]+"\]/g,
    //   ""
    // )
    .replace(/:NameSuffix/g, converter.toFullWidth("雄也"))

    .replace(/(　（[０-９]+）(.+)?)/g, "");
  // text = text.replace(">", "#").replace(/>/g, "").replace("#", ">");
  // text = text.replace("<", "#").replace(/</g, "").replace("#", "<");

  // if (
  //   (text.trim().match(containRegExpG) &&
  //     (ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept === "" ||
  //       !text.trim().match(exceptRegExpG))) ||
  //   text.trim() === ""
  // )
  //   return rawText;

  ////////////////
  // if (rawText.match(/(&)$/)) check = true;
  // if(rawText.includes("MW.TP")){
  //   return "MW.TP 50"
  // }
  // if (check === true) {
  //   check = false;
  //   return "　" + rawText.replace("」", "").replace(/^(\*)/, "＊") + "」";
  // }
  // return "【】" + rawText.replace(/^(\*)/, "＊");
  ///////////////
  const specialNumber = rawText.match(/[0-9]+/g) || [];
  const rubyList = (
    rawText.match(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/g
    ) || []
  ).map((v) => {
    return v.split(",")[2]
      ? v.split(",")[2].replace("]", "")
      : v.split(",")[1].replace("]", "");
  });
  if (type === "rpgmmv")
    for (let i = 0; i < specialNumber.length; i++) {
      text = text.replace(/[0-9]+/g, converter.toFullWidth(specialNumber[i]));
    }
  const specialNumber2 = rawText.match(/\[[0-9]+\]/g) || [];
  for (let i = 0; i < specialNumber.length; i++) {
    text = text.replace(/\[[０-９]+\]/g, specialNumber2[i]);
  }
  for (let i = 0; i < rubyList.length; i++) {
    text = text.replace(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/i,
      rubyList[i]
    );
  }
  // const specialList = rawText.match(/\{.+\}/g);
  // if (specialList)
  //   for (let i = 0; i < specialList.length; i++) {
  //     text = text.replace(
  //       /\{.+\}/i,
  //       specialList[i].split("/")[0].replace("{", "")
  //     );
  //   }

  // const specialList = rawText.match(/≪.+≫/g);
  // if (specialList)
  //   for (let i = 0; i < specialList.length; i++) {
  //     text = text.replace(
  //       /≪.+≫/i,
  //       specialList[i].split("／")[0].replace("≪", "").replace("≫", "")
  //     );
  //   }

  // const specialList = rawText.match(
  //   /\\r;[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　。●・;♡＝…：＄αβ％●]+:/g
  // );
  // if (specialList)
  //   for (let i = 0; i < specialList.length; i++) {
  //     text = text.replace(
  //       /\\r;[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　。●・;♡＝…：＄αβ％●]+:/i,
  //       specialList[i].split(";")[1]
  //     );
  //     // .replace(":", "");
  //   }

  // Important “”【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？
  const regExp = new RegExp(
    `[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪〇☆〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪〇☆〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+―]+`,
    "g"
  );
  const textList = text.match(regExp);
  // console.log(textList);
  // console.log(textList);
  // console.log(text, textList)
  // const textList = [text.replace(/<en[A-Z][0-9]+>/g, "")];
  // const textList = rawText.split(",");
  if (!textList) {
    // if (!rawText.includes("[p]")) return rawText + "[p]";
    return rawText;
  }
  // if (textList[0].length <= 4) return rawText;
  // const translatedTextList = await translateOfflineSugoiLongList(
  //   textList,
  //   300,
  //   false,
  //   false
  // );
  // console.log(textList);
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    textList,
    limit,
    false,
    false,
    isGlue,
    type,
    "anim",
    false,
    false,
    undefined,
    "Sugoi"
  );
  // const translatedTextList = textList.map((v) => {
  //   const temp = handleWordWrap(
  //     190,
  //     (backupText2 !== "" ? backupText2 + " " : "") + v,
  //     "[r]"
  //   );
  //   backupText = temp.split("[r]")[1] ? temp.split("[r]")[1] : "";
  //   return temp.split("[l][r]")[0];
  // });
  // console.log(translatedTextList);
  // const translatedTextList = textList;
  if (!end) end = translatedTextList.length;
  // console.log(translatedTextList);
  // console.log(textList, translatedTextList);
  const splittedTextList = text.split(regExp);
  let finalResult = "";
  for (let i = 0; i < splittedTextList.length; i++) {
    if (!translatedTextList[i]) {
      finalResult += splittedTextList[i];
      continue;
    }
    // finalResult +=
    //   splittedTextList[i] +
    //   (i < start || i >= end || textList[i] === "主人公（名）"
    //     ? textList[i]
    //     : !text.includes("＠")
    //     ? converter.toFullWidth(
    //         translatedTextList[i].replace(/, /g, "、").replace(/\./g, "")
    //       ) +
    //       "＠" +
    //       textList[i]
    //     : converter.toFullWidth(
    //         translatedTextList[i].replace(/, /g, "、").replace(/\./g, "")
    //       ));
    // if (translatedTextList.length === 2) {
    //   finalResult +=
    //     splittedTextList[i] +
    //     (i < start || i >= end || textList[i] === "主人公（名）"
    //       ? textList[i]
    //       : i === 0
    //       ? textList[i]
    //       : translatedTextList[i].replace(/\./g, "")
    //     ).replace(/, /g, "、");
    //   continue;
    // }
    // if (text.includes("（")) {
    //   finalResult +=
    //     splittedTextList[i]
    //       // .replace(/( +)$/g, "")
    //       .replace(
    //         /\[font size=25 color="0xffffff"\]/g,
    //         '[font size=20 color="0xffffff"]'
    //       ) +
    //     (i <= 0 || i >= 2
    //       ? textList[i]
    //       : `${translatedTextList[i]
    //           .trim()
    //           .replace(/[【『「（《》】』」）\.]/g, "")}`);
    //   continue;
    // }
    // finalResult +=
    //   splittedTextList[i]
    //     // .replace(/( +)$/g, "")
    //     .replace(
    //       /\[font size=25 color="0xffffff"\]/g,
    //       '[font size=20 color="0xffffff"]'
    //     ) +
    //   (i < start || i >= end || textList[i] === "主人公（名）"
    //     ? textList[i]
    //     : `${textList[i]}（${translatedTextList[i]
    //         .trim()
    //         .replace(/[【『「（《》】』」）\.]/g, "")
    //         .replace(/\(/g, "（")
    //         .replace(/\)/g, "）")}）`);
    // if (text.includes("/")) {
    //   finalResult +=
    //     splittedTextList[i]
    //       // .replace(/( +)$/g, "")
    //       .replace(
    //         /\[font size=25 color="0xffffff"\]/g,
    //         '[font size=20 color="0xffffff"]'
    //       ) +
    //     (i < 1 || i >= end || textList[i] === "主人公（名）"
    //       ? textList[i]
    //       : translatedTextList[i]
    //           .trim()
    //           .replace(/[【『「（《》】』」）\.]/g, "")
    //           .replace(/\(/g, "（")
    //           .replace(/\)/g, "）"));
    //   continue;
    // }
    // if (text.includes("／")) {
    //   finalResult +=
    //     splittedTextList[i]
    //       // .replace(/( +)$/g, "")
    //       .replace(
    //         /\[font size=25 color="0xffffff"\]/g,
    //         '[font size=20 color="0xffffff"]'
    //       ) +
    //     (i < 0 || i >= 1 || textList[i] === "主人公（名）"
    //       ? ""
    //       : translatedTextList[i]
    //           .trim()
    //           .replace(/[【『「（《》】』」）\.]/g, "")
    //           .replace(/\(/g, "（")
    //           .replace(/\)/g, "）"));
    //   continue;
    // }
    // if (text.includes("storage")||text.includes("？？？")) {
    //   return text;
    // }
    // if (!text.includes("voice=")) {
    //   finalResult +=
    //     splittedTextList[i]
    //       // .replace(/( +)$/g, "")
    //       .replace(
    //         /\[font size=25 color="0xffffff"\]/g,
    //         '[font size=20 color="0xffffff"]'
    //       ) +
    //     (i < start || i >= end || textList[i] === "主人公（名）"
    //       ? textList[i]
    //       : `${
    //           // converter.toFullWidth(
    //           translatedTextList[i]
    //             .trim()
    //             .replace(/[【『「（《》】』」）\.]/g, "")
    //             .replace(/\(/g, "（")
    //             .replace(/\)/g, "）")
    //             .replace(/, /g, "、")
    //           // )
    //           // .replace(/ /g, "　")
    //         }`);
    //   continue;
    // }
    // finalResult +=
    //   splittedTextList[i]
    //     // .replace(/( +)$/g, "")
    //     .replace(
    //       /\[font size=25 color="0xffffff"\]/g,
    //       '[font size=20 color="0xffffff"]'
    //     ) +
    //   (i < start || i >= end || textList[i] === "主人公（名）"
    //     ? textList[i]
    //     : `${textList[i]}" storage="${
    //         // converter.toFullWidth(
    //         translatedTextList[i]
    //           .trim()
    //           .replace(/[【『「（《》】』」）\.]/g, "")
    //           .replace(/\(/g, "（")
    //           .replace(/\)/g, "）")
    //           .replace(/, /g, "、")
    //         // )
    //         // .replace(/ /g, "　")
    //       }`);
    // if (textList.length === 2) {
    finalResult +=
      splittedTextList[i]
        // .replace(/( +)$/g, "")
        .replace(
          /\[font size=25 color="0xffffff"\]/g,
          '[font size=20 color="0xffffff"]'
        ) +
      (i < start || i >= end || textList[i] === "主人公（名）"
        ? textList[i]
        : `${
            // converter.toFullWidth(
            translatedTextList[i]
              .trim()
              .replace(/[【『「（《》】』」）\.]/g, "")
              .replace(/\(/g, "（")
              .replace(/\)/g, "）")
              .replace(/, /g, "、")
            // )
          }`);
    // } else
    // finalResult +=
    //   splittedTextList[i]
    //     // .replace(/( +)$/g, "")
    //     .replace(
    //       /\[font size=25 color="0xffffff"\]/g,
    //       '[font size=20 color="0xffffff"]'
    //     ) +
    //   (i < start || i >= end || textList[i] === "主人公（名）"
    //     ? textList[i]
    //     : `${textList[i]}","${
    //         // converter.toFullWidth(
    //         translatedTextList[i]
    //           .trim()
    //           .replace(/[【『「（《》】』」）\.]/g, "")
    //           .replace(/\(/g, "（")
    //           .replace(/\)/g, "）")
    //           .replace(/, /g, "、")
    //         // )
    //       }`);
  }
  // backupText2 = backupText;
  const result =
    prefix +
    finalResult
      // .replace(/／/g, "")
      // .replace(/<FONT SIZE=.+>/g,"")
      // .replace(/'/g, "’")
      // .replace(/"/g,"”")
      // .replace(/\\\\a/g, "\\\\a ")
      // .replace(/ /g, "　")
      .replace("[p][p][p][p]", "")
      .replace(/:NameSuffix/g, "雄也")
      .replace(
        'Manji Manji Manji climax<style="Ruby6">フィニッシュ</style>　卍卍卍卍卍',
        `卍卍卍卍卍　Climax　Finish<style="Ruby6">フィニッシュ</style>　卍卍卍卍卍`
      )
      .replace("【Kyoku】必　殺　技【極】", "【極】Special move【極】")
      .replace("（soft）", "（Soft）")
      .trim();
  // if (!result.includes("[p]")) return result + "[p]";
  return result + suffix;
}

async function translateSelectCenterTextList(
  dataList,
  limit = 20,
  isGlue,
  ks,
  type,
  isQlie
) {
  // return dataList.map((v) => v ? weirdToNormalChars(replaceSignedCharacter(v)):v)
  let ans = [];
  let limit2 = limit;
  while (true) {
    try {
      do {
        let translatedSelectCenterText = [];
        if (isGlue) {
          translatedSelectCenterText = (
            await translateSelectCenterText(
              dataList.slice(ans.length, ans.length + limit2).join("$$$"),
              limit,
              0,
              isQlie ? (text.includes("＠") ? 1 : undefined) : undefined,
              // 1,
              isGlue,
              ks,
              type
            )
          ).split("$$$");
        }
        if (!isGlue) {
          translatedSelectCenterText = await Promise.all(
            dataList
              .slice(ans.length, ans.length + limit2)
              .map(async (text) => {
                if (!text) return text;
                const temp = await translateSelectCenterText(
                  text,
                  limit,
                  isQlie ? (text.includes("＠") ? 1 : 0) : 0,
                  isQlie ? (text.includes("＠") ? 2 : undefined) : undefined,
                  // undefined,
                  false,
                  ks,
                  type
                );
                return temp;
              })
          );
        }
        ans = [...ans, ...translatedSelectCenterText];
        console.log(`${ans.length}/${dataList.length}`);
      } while (ans.length < dataList.length);
      break;
    } catch (error) {
      console.log(error);
      limit2 = parseInt(limit2 / 2) === 0 ? 1 : parseInt(limit2 / 2);
      console.log({ limit2 });
      await delay(10000);
    }
  }
  return ans;
  // .map((v) => {
  //   if(v.includes("\"Shizuka\"") && !v.includes("storage=")){
  //     return v.replace(/"Shizuka"/g,"\"静　香\" storage=\"Shizuka\"")
  //   }
  //   if(v.includes("\"Shizuka\"")){
  //     return v.replace(/"Shizuka"/g,"\"静　香\"")
  //   }
  //   return v;
  // });
}
async function translateTextListSugoiWebsite(dataList, limit = 20) {
  let ans = [];
  let limit2 = limit;
  while (true) {
    try {
      do {
        const translatedSelectCenterText = await Promise.all(
          dataList.slice(ans.length, ans.length + limit2).map(async (text) => {
            return await translateTextSugoiWebsite(text);
          })
        );
        ans = [...ans, ...translatedSelectCenterText];
        console.log(`${ans.length}/${dataList.length}`);
      } while (ans.length < dataList.length);
      break;
    } catch (error) {
      console.log(error);
      limit2 = parseInt(limit2 / 2) === 0 ? 1 : parseInt(limit2 / 2);
      console.log({ limit2 });
      await delay(10000);
    }
  }
  return ans;
}
function replaceTagName(text, modes = [2], flag = "g") {
  let temp = text;
  if (modes.includes(2)) {
    Object.keys(objectMap2).forEach((key) => {
      temp = temp.replace(new RegExp(key, flag), objectMap2[key]);
    });
  }
  if (modes.includes(3)) {
    Object.keys(objectMap3).forEach((key) => {
      temp = temp.replace(new RegExp(key, flag), objectMap3[key]);
    });
  }
  return temp;
}

async function translateTextSugoiWebsite(text) {
  const filterText = excludeTranslateText(text);
  if (filterText.length <= 2) {
    let textTranslated = await translateOfflineSugoiLongList([text]);
    let temp = textTranslated[0];
    temp = replaceTagName(temp, [2], "g");
    temp = replaceTagName(temp, [3], "gi");
    return temp;
  }

  const browser = await puppeteer.launch({
    extra: {
      stealth: true,
    },
    headless: true,
    args: ["--start-maximized", "no-sandbox"],
    defaultViewport: null,
    timeout: 10000,
  });
  try {
    const url = `https://sugoitranslator.com/`;
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await page.goto(url);
    await page.waitForSelector(".source__input");
    await page.type(".source__input", filterText);
    await page.click(".controls .button");
    await page.waitForFunction(
      "document.querySelectorAll('.source__input')[1].innerText.length > 0"
    );
    const textTranslated = await page.evaluate(() => {
      return document.querySelectorAll(".source__input")[1].innerText;
    });
    let temp = replaceTagName(textTranslated, [2], "g");
    temp = replaceTagName(textTranslated, [3], "gi");
    await browser.close();

    return temp; /*.replace(/\r\n/g, "");*/
  } catch (error) {
    console.log(error.message);
    await browser.close();
    let textTranslated = await translateOfflineSugoiLongList([text]);
    let temp = textTranslated[0];
    temp = replaceTagName(temp, [2], "g");
    temp = replaceTagName(temp, [3], "gi");
    return temp;
    // return await translateJapaneseToEng(filterText);
  }
}

function splitCSV(text) {
  let check = false;
  return text.split(",").reduce((ans, curr) => {
    let count = curr.split("").reduce((ans, curr) => {
      if (curr === '"') ans++;
      return ans;
    }, 0);
    if (curr.includes('"') && count % 2 !== 0 && check === false) {
      ans.push(curr);
      check = true;
      return ans;
    }
    if ((!curr.includes('"') || count % 2 === 0) && check === false) {
      ans.push(curr);
      return ans;
    }
    if (curr) {
      ans[ans.length - 1] += "," + curr;
    } else {
      ans.push(curr);
    }
    check = false;
    return ans;
  }, []);
}

module.exports = {
  // translateJapaneseToEng,
  capitalize,
  // translateDeepl,
  translateSelectCenterTextList,
  translateOfflineSugoiLongList,
  test,
  replaceTagName,
  translateTextSugoiWebsite,
  translateTextListSugoiWebsite,
  translateOfflineSugoiCt2,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
  translateJapaneseToEng,
  excludeTranslateText,
  handleNormalLetterText,
};
// Please translate these sentences line by line from Japanese to English. Each line is a part of a conversation so try not to mess up the pronouns. Your answer MUST follow this format
// [The original sentence] >> [The translated sentence]

// Please translate these sentences line by line from Japanese to English. Each line is a part of a conversation so try not to mess up the pronouns. Your answer is the English translated text

// Translate the following game sentence from ${LANG_FROM} to ${LANG_TO} with preserving the number of lines and the original format, No additional explanation or commentary is needed, just return the translation result with correct line count and format. Do not return the original text:\n${SOURCE_TEXT}
