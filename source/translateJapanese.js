require("dotenv").config();
const { translate } = require("bing-translate-api");
const translateGoogle = require("translatte");
// const puppeteer = require("@scaleleap/puppeteer");
const axios = require("axios");
let cacheTranslation;
try {
  cacheTranslation = require("../cacheTranslation.json");
} catch (error) {
  cacheTranslation = {};
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
async function test() {
  return await Promise.all(
    Object.keys(objectMap).map(
      async (name) => (await translateOfflineSugoiLongList(name)) + "|" + name
    )
  );
}
const { Configuration, OpenAIApi } = require("openai");
const { weirdToNormalChars } = require("weird-to-normal-chars");
const { simpleReadFile, writeFile, simpleWriteFile } = require("./handleFile");
async function translateJapaneseWithOpenai() {
  console.log(process.env.OPENAI_API_KEY);
  const configuration = new Configuration({
    organization: "org-dgZcSqa4cKBUjSEzln0j5Dn5",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Hello world",
  });
  return completion.data.choices[0].text;
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
  csvIndex
) {
  // return textList
  // return textList.map((v) => weirdToNormalChars(replaceSignedCharacter(v)))
  let ans = [];
  let i = 0;
  const rawTextList2 = [...textList];
  const rawIsGlue = isGlue;
  textList = textList.map((text) => {
    if (text === null) return null;
    let rawMatchedText = text.match(
      /(\[ruby text="[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+"\][a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+\[\/ruby\])/g
    );
    let matchedText = "";
    if (rawMatchedText) {
      for (let j = 0; j < rawMatchedText.length; j++) {
        matchedText = rawMatchedText[j]
          .replace('[ruby text="', "")
          .replace(
            /[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,＋]+\[\/ruby\]/g,
            ""
          )
          .replace("]", "")
          .replace(/"$/g, "");
        text = text.replace(rawMatchedText[j], matchedText);
      }
    }
    return text
      .replace(/\[nr\]/g, "")
      .replace(/\[r\]/g, "")
      .replace(/\[haret\]/g, "");
  });
  let editedTextList = [...textList];
  let suffixList = [];
  let prefixList = [];
  // let editedTextList = [];
  function findPrefix(text) {
    if (["Seen"].includes(type)) {
      return text.match(/[0-9]+ (【.+】)?/g) || [""];
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
    if (["kirisnr"].includes(type)) {
      return text.match(/【.+】(.+\))?/g) || ["　"];
    }
    if (["cst-special"].includes(type)) {
      return text.match(/^([%\\0-9　a-zA-Z]+)/g) || [""];
    }
    if (["willadv"].includes(type)) {
      // return text.match(/▷.+◁/g) || [""];
      // return text.match(/【.+】/g) || [""];
      return text.match(/^@[a-zA-Z0-9@]+/g) || [""];
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
      return text.match(/^(\[.+\])/g) || [""];
    }
    if (["kiriruby"].includes(type)) {
      return (
        text.match(
          /^(\[[a-zA-Z =\[\]_0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝"…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω【】]+\]+(\\)?)/g
        ) || [""]
      );
    }
    if (["kiri"].includes(type)) {
      return (
        text.match(
          /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω\(\)【】]+((\/)?[ a-z0-9=]+)?\]/g
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
          /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[「（]/g
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
    }
    if (["kiri2"].includes(type)) {
      return text.match(/(\[[a-zA-Z% ]+\])$/g) || [""];
    }
    if (["unity"].includes(type)) {
      return text.match(/(<[A-Za-z_/0-9%\.]+>)$/g) || [""];
    }
    if (["kiriruby"].includes(type)) {
      return text.match(/(\[[a-zA-Z =\[\]_0-9]+\]+(\\)?)$/g) || [""];
    }
    if (["ast"].includes(type)) {
      return text.match(/(<[A-Za-z_/0-9%\.]+>)$/g) || [""];
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
    if (["cst-special"].includes(type)) {
      return text.replace(/[%\\0-9a-zA-Z]+/g, "") || "";
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
    if (["willadv"].includes(type)) {
      // return text.replace(/▷.+◁/g, "") || "";
      // return text.replace(/【.+】/g, "") || "";
      return text
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
        /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω\(\)【】]+((\/)?[ a-z0-9=]+)?\]/g,
        ""
      );
    }
    if (["unity"].includes(type)) {
      return text
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
        /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[「（]/g
      ) || [""])[0].match(/[「（]/g) || [""];
      return (
        bracket[0] +
        text.replace(
          /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[「（]/g,
          ""
        )
      );
    }
    if (["yuris"].includes(type)) {
      return text.replace(/<.+>/g, "");
    }
    if (["BGI"].includes(type)) {
      // return text.replace(/#/g, "");
      return text.replace(/<[a-z0-9,]+>/g, "");
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
        return text.split(",").slice(2).join(",");
      }
      return text;

      if (!text.includes(",")) {
        return text;
      }
      return text.split(",").slice(2).join(",");
    }
    if (["kiriruby"].includes(type)) {
      return text.replace(/(\[[a-zA-Z0-9 =\[\]_]+\])/g, "");
    }
    // return text.replace(/<.+>/g, "").replace(/【.+】/g, "");
    return text;
  }
  // console.log(textList)
  // if (textList.includes(undefined)) return textList;
  if (["srp", "anim", "bsxx", "waffle", "rpgm", "scn", "cst"].includes(type)) {
    editedTextList = editedTextList;
  } else if (["kiriruby"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["rpgmmv", "aos", "willadv", "kiri2", "Seen"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map(
      (v) => getRidOfPrefixSuffix(v).split("／")[0]
    );
  } else if (["Seen"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["yuris2"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) => findSuffix(v)[0]);
    editedTextList = editedTextList.map((v) => getRidOfPrefixSuffix(v));
  } else if (["ain"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "雄大")
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
      return findSuffix(v)[0].replace(":NameSuffix", "雄大");
    });
    editedTextList = editedTextList.map(
      (v) => getRidOfPrefixSuffix(v).replace(/:NameSuffix/g, "雄大")
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
          if (text.length > 100) {
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
        return !v.match(/[a-zA-Z_0-9\.]/g) && v !== "主人公（名）";
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
    textList = [...editedTextList].map((v) => (v ? v.replace(/<.+>/g, "") : v));
  }
  if (["rpgmmv"].includes(type)) {
    textList = [...editedTextList].map((v) => {
      if (!v) return v;
      return v.replace(/Ci-en/, "Ｃｉ－ｅｎ");
    });
  }
  // if (textList.length === 0) return [];
  if (["rpgmmv-name"].includes(type)) {
    ans = await translateSelectCenterTextList(
      textList,
      2,
      false,
      undefined,
      "srp"
    );
  } else
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
          do {
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
              translatedTextList = (
                await translateOfflineSugoiCt2(
                  textList
                    .slice(i * limit, (i + 1) * limit)
                    .map((text) => {
                      if (!text) return text;
                      if (
                        text.match(/^[『【「]/g) &&
                        text.match(/[』」】]$/g)
                      ) {
                        return text
                          .replace(/^[『「【]/g, "")
                          .replace(/[』」】]$/g, "");
                      }
                      return text;
                    })
                    .join("！"),
                  wordWrapMode,
                  isExhibit,
                  isLovelyCation
                )
              )
                .replace(/!\)/g, ")!")
                .split(/[!！]+/g)
                .filter((v) => v.trim() !== "")
                .map((v) =>
                  v.replace(/”」/g, "」").replace(/(@)$/g, "").trim()
                );
              if (
                translatedTextList.length !==
                textList.slice(i * limit, (i + 1) * limit).length
              ) {
                isGlue = false;
                continue;
              }
              console.log(true, translatedTextList);
              translatedTextList = translatedTextList.map((v, index) => {
                const rawText = textList.slice(i * limit, (i + 1) * limit)[
                  index
                ];
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
              // const translatedText = await translateOfflineSugoiCt2(textList[i]);
              translatedTextList = await Promise.all(
                textList
                  .slice(i * limit, (i + 1) * limit)
                  .map(async (text, index) => {
                    if (!isSplit) {
                      return await translateOfflineSugoiCt2(
                        text,
                        wordWrapMode,
                        isExhibit,
                        isLovelyCation,
                        prefixList[i * limit + index],
                        i * limit + index
                      );
                    }
                    const splitText = text.split(/[。？！：]/g);
                    const specialCharsList = text.match(/[。？！：]/g);
                    let temp = "";
                    for (let j = 0; j < splitText.length; j++) {
                      const translatedText = await translateOfflineSugoiCt2(
                        splitText[j],
                        wordWrapMode,
                        isExhibit,
                        isLovelyCation
                      );
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
              console.log(false, translatedTextList);
            }
          } while (
            translatedTextList.length !==
            textList.slice(i * limit, (i + 1) * limit).length
          );
          ans = [...ans, ...translatedTextList];
          if (rawIsGlue === true) isGlue = true;
          i++;
          if (isConsoleLog) console.log(`${ans.length}/${textList.length}`);
        } while (ans.length < textList.length);
        break;
      } catch (error) {
        console.log(error);
        // limit = parseInt(limit / 2) === 0 ? 1 : parseInt(limit / 2);
        console.log({ limit });
        // limit = 2;
        await delay(10000);
      }
    }
  if (["kiri-mink", "yuris2", "kirisnr"].includes(type)) {
    prefixList = await translateSelectCenterTextList(
      prefixList,
      1,
      false,
      undefined,
      "srp"
    );
  }
  if (type === "aos") {
    // prefixList = await translateSelectCenterTextList(
    //   prefixList,
    //   1,
    //   false,
    //   undefined,
    //   "srp"
    // );
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
  await simpleWriteFile(
    "./cacheTranslation.json",
    JSON.stringify(cacheTranslation, null, 2),
    "utf8"
  );
  if (
    [
      "srp",
      "anim",
      "bsxx",
      "waffle",
      "rpgm",
      "scn",
      "cst",
      "rpgmmv-name",
    ].includes(type)
  ) {
    return ans;
  }
  let finalResult = [];
  if (
    [
      "ain",
      "yuris",
      "EAGLS",
      "musica",
      "whale",
      "Seen",
      "BGI",
      "kiriruby",
      "Eroit",
      "rpgmvxace",
      "kiri-mink",
      "kiri-mekujira",
      "rpgmmv",
      "qlie",
      "yuris2",
      "kiri",
      "unity",
      "aos",
      "tanuki",
      "willadv",
      "willadv2",
      "kirisnr",
      "cst-special",
      "kiri2",
      "SLG",
      "ast",
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
      case "Seen":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let temp = prefix + ans[count];
          count++;
          return temp;
        });
        break;
      case "musica":
        finalResult = rawTextList2.map((text, index) => {
          let prefix = prefixList[index];
          let temp = prefix + " " + ans[count];
          count++;
          return temp;
        });
        break;
      case "ast":
        finalResult = rawTextList2.map((text, index) => {
          // let prefix = prefixList[index];
          let suffix = suffixList[index];
          let temp = ans[count] + suffix;
          count++;
          return temp;
        });
        break;
      case "willadv2":
        finalResult = rawTextList2.map((text, index) => {
          let suffix = suffixList[index];
          let temp = ans[count] + suffix;
          count++;
          return temp;
        });
        break;
      case "kiri2":
        finalResult = rawTextList2.map((text, index) => {
          let suffix = suffixList[index];
          let prefix = prefixList[index];
          let temp = prefix + ans[count] + suffix;
          count++;
          return temp;
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
            handleWordWrap(70, ans[count], "\\r\\n") +
            suffix;
          count++;
          if (temp === "=") return "";
          return temp;
        });
        break;
      case "willadv":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
          let temp = prefix + handleWordWrap(55, ans[count], "@n");
          count++;
          // if (temp === "=") return "";
          return temp;
        });
        break;
      case "kirisnr":
        finalResult = rawTextList.map((text, index) => {
          let prefix = prefixList[index];
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
      case "qlie":
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
          let temp = (temp3 ? temp3 : "") + ans[count].replace(/,( )?/g, "、");
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
                .replace(/-/g, "")
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
          let res = temp2 + converter.toFullWidth(ans[count]) + temp3;
          count++;
          return res;
        });
        break;
      case "kiriruby":
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
              if (text.length > 100) {
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
            if (text.match(/[a-zA-Z0-9\._]/g) || text === "主人公（名）") {
              let temp = temp2 + text;
              return temp;
            }
            // if (text === "@-@") return "@@";
            // let temp = ans[count];
            // let temp = temp2 + ans[count] + temp3;
            let temp = temp2 + ans[count];
            // .replace(/, /g, "、")
            // .replace(/’/g, "'")
            // .replace(/"/g, "”")
            // .replace(/'/g, "’")
            // .replace(/(\.\.\.( )?)+/g, "…")
            // .replace(/\.( )?/g, "。")
            // .replace(/\?( )?/g, "？");
            count++;
            return temp
              .trim()
              .replace(/The main character \(name\)/gi, "主人公（名）")
              .replace(/@/g, "＠");
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
          return temp
            .trim()
            .replace(/The main character \(name\)/gi, "主人公（名）")
            .replace(/@/g, "＠");
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
  index
) {
  // return text
  // console.log(text);
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
  console.log(text);
  if (isExhibit && text.length === 1) return text;
  if (text === "ハーレム") return text;
  // if (text.length <= 3) return text;
  // if (text.replace(/#N/g, "").match(/[a-zA-Z0-9_]/g)) return text;
  // if (text.length <= 5 && !text.match(/[。」]$/g)) return text;
  // if (text.match(/[_\.]/g)) return text;
  if (text === null) return text;
  // if (text.match(/[@#]/g)) return text;
  if (["ＰＨＬ", "剣姫", "ソードプリンセス"].includes(text)) return text;
  if (text === undefined) return text;
  if (text === "\n") return text;
  if (text === "　") return text;
  if (text === " ") return text;
  if (text === '""') return text;
  if (text === "") return text;
  if (text === "’") return text;
  if (text === "──") return text;
  if (text === "声") return "Voice";
  if (text === "名前") return "名前";
  if (text === "ＳｅｅｎＥｎｄ") return "ＳｅｅｎＥｎｄ";
  // if (text.length === 1) return text;
  if (text === "＝") return text;
  if (text === ">") return text;
  if (text === undefined) return undefined;
  // if (text.includes("・・・・")) return text;
  if (text === "主人公（名）") return text;
  if (text === "名無し") return text;
  if (text === "、") return text;
  if (text === "「") return text;
  if (text === "『") return text;
  if (text === "（") return text;
  if (text === "心の声") return "心の声";
  if (text === " ") return " ";
  if (text === "？？？？") return "？？？？";
  if (text === "？？？") return "？？？";
  if (text === "？？") return "？？";
  if (text === "？") return "？";
  if (text === "分岐") return "分岐";
  if (text === "かな") return "Kana";
  if (text === "夏鈴") return "Karin";
  if (text === "。") return "。";
  // if (text === "") return "";
  if (text === "    ") return "    ";
  if (text === "ＯＰムービー初回") return "ＯＰムービー初回";
  if (text === "ＯＰムービー２回目以降") return "ＯＰムービー２回目以降";
  if (text === "……") return "……";
  if (text === "。、」』）！？”～ー♪") return "。、」』）！？”～ー♪";
  // return handleWordWrap(
  //   33,
  //   // converter.toHalfWidth(text).replace(/、/g, ", "),
  //   text,
  //   "\r\n"
  // );
  let specialTexts = [];
  if (isLovelyCation) {
    specialTexts = text.match(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》]+\]/g
    );
    if (specialTexts && specialTexts.length > 0) {
      text = text.replace(
        /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》]+\]/g,
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
        `				{"exfont", size="f2"},\n				"` +
        handleWordWrap(10000, text, "\\n") +
        `",\n				{"exfont"},`;
      return wordWrappedText;
    case "Eroit":
      // return text;
      wordWrappedText = handleWordWrap(
        // text.includes("「")?70:72
        // !(prefix1.replace(/[0-9 ]+/g,"")) ? 49 :47,
        1000,
        // converter.toHalfWidth(text).replace(/、/g, ", "),
        text,
        // .replace(/　/g," "),
        "\\n"
      );
      // .replace(/ /g,"　");
      // console.log({wordWrappedText})
      // // if (wordWrappedText.split("\r\n").length > 3) {
      // //   return text;
      // // }
      return wordWrappedText;
      // console.log(wordWrappedText);
      // const array = wordWrappedText.split("\r\n");
      // let i = 0;
      // let temp = "";
      // while (i < array.length) {
      //   if (i > 0) {
      //     temp += "\r\n\r\n";
      //   }
      //   temp += array.slice(i, i + 5).join("\r\n");
      //   i += 5;
      // }
      if (wordWrappedText.split("\r\n").length > 3) {
        return "<FONT SIZE=75>" + handleWordWrap(65, text, "\r\n");
      }
      return "<FONT SIZE=100>" + wordWrappedText;
      return converter.toFullWidth(temp.replace(/, /g, "、"));
      return temp;
    case "rpgmmv":
      wordWrappedText = handleWordWrap(60, text, "\n");
      // if (wordWrappedText.split("\\n").length > 3) {
      //   return text;
      // }
      return wordWrappedText;
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
  const rubyList = (
    text.match(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/g
    ) || []
  ).map((v) => {
    return v.split(",")[2]
      ? v.split(",")[2].replace("]", "")
      : v.split(",")[1].replace("]", "");
  });
  const rubyList2 = (
    text.match(
      /\${ruby text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+}[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+\${\/ruby}/g
    ) || []
  ).map((v) => {
    return v.split("}")[0].replace(/\${ruby text=/g, "");
  });
  const rubyList3 = (
    text.match(
      /(,)?{ruby, text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+},[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+,{\/ruby},/g
    ) || []
  ).map((v) => {
    return v.split("}")[0].replace(/(,)?{ruby, text=/g, "");
  });
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

  for (let i = 0; i < rubyList.length; i++) {
    text = text.replace(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/i,
      rubyList[i]
    );
  }
  for (let i = 0; i < rubyList2.length; i++) {
    text = text.replace(
      /\${ruby text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+}[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+\${\/ruby}/i,
      rubyList2[i]
    );
  }
  for (let i = 0; i < rubyList3.length; i++) {
    text = text.replace(
      /(,)?{ruby, text=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+},[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+,{\/ruby},/i,
      rubyList3[i]
    );
  }
  for (let i = 0; i < rubyList4.length; i++) {
    text = text.replace(
      /\\{[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 \|]+}/i,
      (rubyList4[i].split("|")[1] || rubyList4[i].split("|")[0])
        .replace("\\{", "")
        .replace("}", " ")
    );
  }
  for (let i = 0; i < rubyList5.length; i++) {
    text = text.replace(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω]+:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠Ω]+\]/i,
      (rubyList5[i].split(":")[1] || rubyList4[i].split(":")[0])
        .replace("[", "")
        .replace("]", " ")
    );
  }
  for (let i = 0; i < rubyList6.length; i++) {
    text = text.replace(
      /<ruby%3D.+>.+<\/ruby>/i,
      rubyList6[i]
        .split(">")[1]
        .replace(/<ruby%3D/g, "")
        .replace(/<\/ruby/g, "")
    );
  }
  for (let i = 0; i < rubyList7.length; i++) {
    text = text.replace(
      /\[[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+ base="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+" ruby="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『（』）《》]+"\]/i,
      rubyList7[i].split('"')[3]
    );
  }
  for (let i = 0; i < rubyList8.length; i++) {
    text = text.replace(
      /\[rb t=["一|-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、 ]+\]/i,
      rubyList8[i].split("|")[1].replace(/\]/, "")
    );
  }
  // console.log(text)
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

  if (cacheTranslation[text]) {
    return cacheTranslation[text];
  }
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
    .replace(/ｗ/g, "")
    .replace(/　/g, "")
    .replace(/\[シンボル tx=白ハート\]/g, "♥")
    // .replace(/[◆✩♥♡●♪]/g, "")
    .replace(/ゅ/g, "")
    .replace(/\r/g, "")
    .replace(/\[np\]/g, "")
    .replace(/\n/g, "")
    .replace(/\\[nN]/g, "")
    .replace(/\\n　/g, "")
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
      /\[ruby:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、【『「（《》】』」）‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○♥　、☆＆＿’！？\n]+\]/g
    )
    .replace(/\[\/ruby\]/g, "")
    // .replace(/＃θ/g, "")
    // .replace(/[　 ]/g, "")
    // .replace(
    //   /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
    //   ""
    // )
    .replace(/"/g, "")
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
    .replace(/\[n\]/g, "")
    .replace(/\[ω\]/g, "")
    .replace(
      />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
      ""
    )
    .replace(/<R/g, "")
    .replace(/<r>/g, "")
    .replace(/\[mruby r=/g, "")
    .replace(/\[gly t="/g, "")
    .replace(/"/g, "")
    .replace(/" text=".+"\]/g, "");
  // .replace(/…/g, "...")
  // .replace(/？/g, "? ")
  // .replace(/？/g, "? ")
  // .replace(/：/g, ": ")
  // .replace(/！/g, "! ")
  // .replace(/、/g, ", ")
  // .replace(/＆/g, "&");
  if (filterText === "") {
    return text;
  }
  filterText = excludeTranslateText(filterText);
  filterText = filterText.trim().replace(/[\r\n]+/g, "");
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

  let translatedText = (
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
  if (["Null.", "Null"].includes(translatedText)) return null;
  if (text === "心の声") return "心の声";
  let prefix = text.match(/^(	+)/g) ? text.match(/^(	+)/g)[0] : "";
  let temp = translatedText
    .replace(/(<)?unk>(")?/g, " ")
    .replace(/\u2014/g, "-")
    .replace(/[「【】」]/g, "")
    .replace("It's not like I don't know what's going on.", " ")
    .replace("It's time for me to get started.", "")
    .replace(/I'm not sure if it's true or not./g, "");
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
  temp = temp.replace(/"/g, "").replace(/, /g, "、").replace(/~/, "");
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
    .replace(/❛/g, "’")
    // .replace(/"/g, "”")
    .replace(/^\*/i, "＊")
    .replace("「」", "「……」")
    .replace(/\[/g, "“")
    .replace(/\]/g, "”")
    .replace(/XXX/g, "")
    .replace(/XX/g, "")
    .replace(/【】/g, "")
    .replace(/ü/g, "u")
    .replace(/#/g, "＃");
  // .replace(/\.\.\./g, "…");
  // let finalResult = prefix + temp.slice(0, 14) + temp.slice(15);
  // let finalResult = prefix + await translateJapaneseToEng(
  //   temp.replace(/’/g, "'").replace(/、/g, ", "),
  //   false,
  //   3,
  //   10
  // );
  let finalResult = prefix + temp;
  // let finalResult = prefix + handleWordWrap(67, temp, "\\n");
  if (text.match(/^(\\[nN])+/g)) {
    const prefixBreakLine = text.match(/^(\\[nN])+/g)[0];
    finalResult = prefixBreakLine + finalResult;
  }
  // .replace(/, /g, "、");
  // .replace(/\./g, "")
  finalResult = weirdToNormalChars(replaceSignedCharacter(finalResult));
  cacheTranslation[text] = finalResult;
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
  return finalResult;
  // .replace(/ /g, converter.toFullWidth(" "))
  // .replace(/&/g, converter.toFullWidth("&"))
  // .replace(/-/g, converter.toFullWidth("-"))
}

objectMap = handleObjectMap(objectMap);
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
    .replace(/―/g, "-")
    .replace(/\[シンボル tx=白ハート\]/g, "♥")
    .replace(/￥ｎ/g, "")
    .replace(/\[n\]/g, "")
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
    .replace(/\[n\]/g, "")
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
    .replace(/:NameSuffix/g, converter.toFullWidth("雄大"))

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

  const specialList = rawText.match(/≪.+≫/g);
  if (specialList)
    for (let i = 0; i < specialList.length; i++) {
      text = text.replace(
        /≪.+≫/i,
        specialList[i].split("／")[0].replace("≪", "").replace("≫", "")
      );
    }

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
    "[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×○♥　☆＆＿]+",
    "g"
  );
  const textList = text.match(regExp);
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
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    textList,
    limit,
    false,
    false,
    isGlue,
    type
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
    //       : i===0?textList[i]:translatedTextList[i].replace(/\./g, "")
    //     ).replace(/, /g, "、");
    //   continue;
    // }
    finalResult +=
      splittedTextList[i]
        .trim()
        .replace(/( +)$/g, "")
        .replace(
          /\[font size=25 color="0xffffff"\]/g,
          '[font size=20 color="0xffffff"]'
        ) +
      (i < start || i >= end || textList[i] === "主人公（名）"
        ? textList[i]
        : `"${translatedTextList[i]
            .replace(/\./g, "")
            .replace(/ /g, " ")
            .replace(/ Senpai/g, "")
            .replace(/ Sensei/g, "")
            .replace(/, /g, "、")
            .trim()}"`);
  }
  // backupText2 = backupText;
  const result =
    prefix +
    finalResult
      // .replace(/<FONT SIZE=.+>/g,"")
      // .replace(/'/g, "’")
      // .replace(/"/g,"”")
      // .replace(/\\\\a/g, "\\\\a ")
      // .replace(/ /g,"　")
      .replace("[p][p][p][p]", "")
      .replace(/:NameSuffix/g, "晴彦");
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
              // isQlie ? (text.includes("＠") ? 1 : undefined) : undefined,
              undefined,
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
                  0,
                  // undefined,
                  isQlie ? (text.includes("＠") ? 1 : undefined) : undefined,
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
  translateJapaneseWithOpenai,
};
// Please translate these sentences line by line from Japanese to English. Each line is a part of a conversation so try not to mess up the pronouns. Your answer MUST follow this format
// [The original sentence] >> [The translated sentence]

// Please translate these sentences line by line from Japanese to English. Each line is a part of a conversation so try not to mess up the pronouns. Your answer is the English translated text

// Translate the following game sentence from ${LANG_FROM} to ${LANG_TO} with preserving the number of lines and the original format, No additional explanation or commentary is needed, just return the translation result with correct line count and format. Do not return the original text:\n${SOURCE_TEXT}
