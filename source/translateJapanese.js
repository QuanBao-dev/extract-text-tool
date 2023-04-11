require("dotenv").config();
// const { translate } = require("bing-translate-api");
// const translateGoogle = require("translatte");
// const puppeteer = require("@scaleleap/puppeteer");
const axios = require("axios");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const converter = new AFHConvert();

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
let cacheTranslation = {};
async function translateOfflineSugoiCt2LongList(
  textList,
  limit = 1,
  isSplit = false,
  isConsoleLog = true,
  isGlue,
  type
) {
  let ans = [];
  let i = 0;
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
  //   return text.replace(/\[nr\]/g, "").replace(/\[r\]/g, "");
  // });
  let editedTextList = [...textList];
  let suffixList = [];
  let prefixList = [];
  // let editedTextList = [];
  function findPrefix(text) {
    // return "";
    if (["whale"].includes(type)) {
      return text.replace(/\[n\]/g, "").match(/【.+】/g) || [""];
    }
    if (["kiri-mink"].includes(type)) {
      return text.replace(/\[ω\]/g, "").match(/【.+】/g) || [""];
    }
    if (["EAGLS"].includes(type)) {
      return text.match(/&[0-9]+"/g) || [""];
    }
    if (["yuris"].includes(type)) {
      return text.match(/<.+>/g) || text.match(/【.+】/g) || [""];
    }
    if (["yuris2"].includes(type)) {
      return text.match(/【.+】/g) || [""];
      // return text.match(/.+[『「（]/g) || [""];
      return (
        text.match(
          /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[『「（]/g
        ) || [""]
      );
    }
    if (["BGI"].includes(type)) {
      return text.match(/<[0-9,]+>/g) || [""];
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
        text.match(/【.+】/g) || [""]
        // .match(
        //   /^([\\<>a-zA-Z0-9\[\]|/]+([\[\]一-龠ぁ-ゔァ-ヴー0-9ａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、]+>)?)(([\\<>a-zA-Z0-9\[\]|/]+))?/g
        // ) || [""]
      );
    }
    if (["qlie"].includes(type)) {
      if (!text.includes(",")) {
        return [""];
      }
      return [text.split(",").slice(0, 2).join(",") + ","];
    }
    return text.match(/m\[[0-9]+\] = "/g) || [""];
  }
  function findSuffix(text) {
    // return "";
    if (["kiriruby"].includes(type)) {
      return text.match(/(\[[a-zA-Z =\[\]_]+\]+)$/g) || [""];
    }
    if (["EAGLS"].includes(type)) {
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
    return ['"'];
  }
  function getRidOfPrefixSuffix(text) {
    if (["whale"].includes(type)) {
      return text.replace(/\[n\]/g, "").replace(/【.+】/g, "");
    }
    if (["ain"].includes(type)) {
      return text.replace(/m\[[0-9]+\] = "/g, "").replace(/"$/g, "");
    }
    if (["EAGLS"].includes(type)) {
      return text
        .replace(/&[0-9]+"/g, "")
        .replace(/("([a-zA-Z_0-9=\(\)",!@#$%^&*-\[\]]+)?)$/g, "")
        .replace(/\(e\)/g, "")
        .replace(/\(E\)/g, "")
        .replace(
          /\(Y=[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●♀♂♪─〇☆―〜゛×・○♥　、]+\)/g,
          ""
        );
    }
    if (["yuris2"].includes(type)) {
      // return (
      //   findPrefix(text)[0].slice(findPrefix(text)[0].length - 1) +
      //   text.replace(/.+[『「（]/g, "")
      // );
      return text.replace(/【.+】/g, "");
      return text.replace(
        /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆？／【】]+[『「（]/g,
        ""
      );
    }
    if (["BGI"].includes(type)) {
      return text.replace(/<[0-9,]+>/g, "");
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
      return (
        text
          .replace(/【.+】/g, "")
          // .replace(
          //   /^([\\<>a-zA-Z0-9\[\]]+([\[\]一-龠ぁ-ゔァ-ヴー0-9ａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、]+>)?)((([\\<>a-zA-Z0-9\[\]])+))?/g,
          //   ""
          // )
          .replace(/(([\\<>a-zA-Z0-9\[\]|/])+)$/g, "")
          .replace(/\\[a-z\[\]\\0-9]+/g, "")
      );
    }
    if (["qlie"].includes(type)) {
      if (!text.includes(",")) {
        return text;
      }
      return text.split(",").slice(2).join(",");
    }
    // return text.replace(/<.+>/g, "").replace(/【.+】/g, "");
    return text;
  }
  // console.log(textList)
  // if (textList.includes(undefined)) return textList;
  if (["srp", "anim", "bsxx", "waffle", "rpgm", "scn", "cst"].includes(type)) {
    editedTextList = editedTextList;
  } else if (["kiriruby"].includes(type)) {
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "Yuji")
    );
  } else if (["yuris2"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "Yuji")
    );
    let isConnect = false;
    let count = 1;
    editedTextList = editedTextList
      .map((v) => getRidOfPrefixSuffix(v))
      .reduce((ans, v) => {
        if (isConnect) {
          if (v.match(/[」）\)〉』]$/g)) {
            isConnect = false;
          }
          ans[ans.length - count++] += v;
          ans.push("");
          return ans;
        }
        if (
          v.match(/^[「『（\(〈]/g) &&
          !v.match(/[」）\)〉』]$/g) &&
          !isConnect &&
          v.length > 1
        ) {
          isConnect = true;
          count = 1;
        }
        ans.push(v);
        return ans;
      }, []);
  } else if (["ain"].includes(type)) {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "Yuji")
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
  } else {
    prefixList = textList.map((v) => findPrefix(v)[0]);
    suffixList = textList.map((v) =>
      findSuffix(v)[0].replace(":NameSuffix", "Yuji")
    );
    editedTextList = editedTextList.map(
      (v) => getRidOfPrefixSuffix(v)
      // .replace(/DJ/g, "ＤＪ")
      // .replace(/I LOVE SORA/g, "Ｉ　ＬＯＶＥ　ＳＯＲＡ")
      // .replace(/PINE/g, "ＰＩＮＥ")
      // .replace(/10/g, "１０")
    );
  }
  const rawTextList = [...editedTextList];
  textList = [...editedTextList];
  if (["BGI"].includes(type)) {
    textList = editedTextList
      .map((v) =>
        v
          .replace(/<\/r>/g, "")
          .replace(/<r.+>/g, "")
          .replace(
            />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
            ""
          )
          .replace(/<R/g, "")
      )
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
  if (type === "kiriruby") {
    textList = editedTextList.map((v) => {
      const rubyList = v.match(
        /\[ruby text="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_　A-Za-z ]+"\]/g
      );
      if (rubyList && rubyList.length) {
        let temp = v;
        rubyList.forEach((rubyText) => {
          temp = temp.replace(
            rubyText,
            rubyText.replace(/\[ruby text="/g, "").replace(/"\]/g, "")
          );
        });
        return temp.replace(
          /\[[a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ ]+\]+/g,
          ""
        );
      }
      return v.replace(
        /\[[a-zA-Z ="一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟0-9_ ]+\]+/g,
        ""
      );
    });
  }

  if (["ain"].includes(type)) {
    textList = [...editedTextList].filter((v) => v !== "@@");
  }
  if (["srp"].includes(type)) {
    textList = [...editedTextList].map((v) => (v ? v.replace(/<.+>/g, "") : v));
  }
  if (["rpgmmv"].includes(type)) {
    textList = [...editedTextList].map((v) => v.replace(/Ci-en/, "Ｃｉ－ｅｎ"));
  }
  if (textList.length === 0) return [];
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
          if (isGlue === true) {
            translatedTextList = (
              await translateOfflineSugoiCt2(
                textList
                  .slice(i * limit, (i + 1) * limit)
                  .map((text) => {
                    if (text.match(/^[『「]/g) && text.match(/[』」]$/g)) {
                      return text
                        .replace(/^[『「]/g, "")
                        .replace(/[』」]$/g, "");
                    }
                    return text;
                  })
                  .join("＄＠＠")
              )
            )
              .split(/[$@＄＠]+/g)
              .filter((v) => v.trim() !== "")
              .map((v) => v.replace(/”」/g, "」").replace(/(@)$/g, ""));
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
              if (rawText.match(/^「/g) && rawText.match(/」$/g)) {
                return "「" + v + "」";
              }
              return v;
            });
          } else {
            // const translatedText = await translateOfflineSugoiCt2(textList[i]);
            translatedTextList = await Promise.all(
              textList.slice(i * limit, (i + 1) * limit).map(async (text) => {
                if (!isSplit) {
                  return await translateOfflineSugoiCt2(text);
                }
                const splitText = text.split(/[。？！：]/g);
                const specialCharsList = text.match(/[。？！：]/g);
                let temp = "";
                for (let j = 0; j < splitText.length; j++) {
                  const translatedText = await translateOfflineSugoiCt2(
                    splitText[j]
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
  if (["srp", "anim", "bsxx", "waffle", "rpgm", "scn", "cst"].includes(type)) {
    return ans;
  }
  let finalResult = [];
  if (
    [
      "ain",
      "yuris",
      "EAGLS",
      "whale",
      "BGI",
      "kiriruby",
      "Eroit",
      "rpgmvxace",
      "kiri-mink",
      "rpgmmv",
      "qlie",
      "yuris2",
    ].includes(type)
  ) {
    switch (type) {
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
            (temp3 ? temp3 + "\n" : "") + ans[count] + (temp4 ? temp4 : "");
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
          return temp.trim();
        });
        break;
      case "kiriruby":
        finalResult = rawTextList.map((text, index) => {
          // if (ans[count]) return text;
          // if (text.match(/[a-z_]/g) || text === "主人公（名）") {
          //   let temp = temp2 + text;
          //   return temp;
          // }
          let temp3 = suffixList[index];
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp = ans[count] + (temp3 ? temp3 : "");
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
              .replace(/'/g, "’")
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
          // if (text === "@-@") return "@@";
          // let temp = ans[count];
          // let temp = temp2 + ans[count] + temp3;
          let temp =
            temp2 +
            ans[count].replace(/\)/g, "）").replace(/\(/g, "（") +
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
          .map((v) =>
            v
              .replace(/<\/r>/g, "")
              .replace(/<r.+>/g, "")
              .replace(
                />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
                ""
              )
              .replace(/<R/g, "")
          )
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
          let temp2 = prefixList[index];
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
      default:
        finalResult = rawTextList.map((text, index) => {
          let temp2 = prefixList[index];
          let temp =
            (temp2 ? temp2 : type === "whale" ? "【】" : "") + ans[count];
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
async function translateOfflineSugoiCt2(text) {
  // try {
  //   if (handleWordWrap(47, text, "\n").split("\n").length > 3) {
  //     return handleWordWrap(51000, text, "\n");
  //   }
  //   return handleWordWrap(46, text, " ");
  // } catch (error) {
  //   return text;
  // }
  // return text;
  if (text === null) return null;
  if (text === undefined) return undefined;
  // if (text.includes("・・・・")) return text;
  if (text === "主人公（名）") return text;
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
    // .replace(/[◆✩♥♡●♪]/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/[♀♂]/g, "")
    .replace(/\[[0-9]+\]/g, "")
    .replace(/☆☆☆/g, "タッヤ")
    // .replace(/＃θ/g, "")
    // .replace(/[　 ]/g, "")
    // .replace(
    //   /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
    //   ""
    // )
    // .replace(/^"/g, "")
    // .replace(/"$/g, "")
    // .replace(/。$/g, "")
    .replace(/\\r\\n/g, "")
    .replace(/\[\/ruby\]/g, "")
    // .replace(
    //   /\[ruby text=[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,]+\]/g,
    //   ""
    // )
    .replace(/\[emb exp='f.PlayerGivenName'\]/g, "タッヤ")
    .replace(/\$L/g, "")
    .replace(/\$M/g, "")
    .replace(/\[n\]/g, "")
    .replace(/\[ω\]/g, "")
    .replace(
      />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
      ""
    )
    .replace(/<R/g, "");
  // .replace(/…/g, "...")
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
  const finalResult =
    prefix +
    temp
      .trim()
      .replace(/'/g, "’")
      .replace(/❛/g, "’")
      .replace(/"/g, "”")
      .replace(/^\*/i, "＊")
      .replace("「」", "「……」")
      .replace(/\[/g, "“")
      .replace(/\]/g, "”")
      .replace(/XXX/g, "")
      .replace(/XX/g, "")
      .replace(/【】/g, "")
      .replace(/ü/g, "u")
      .replace(/#/g, "＃");
  // .replace(/, /g, "、");
  // .replace(/\./g, "")
  cacheTranslation[text] = finalResult;
  // .replace(/ /g, converter.toFullWidth(" "))
  // .replace(/&/g, converter.toFullWidth("&"))
  // .replace(/-/g, converter.toFullWidth("-"))
  return finalResult;
  // .replace(/, /g, "、")
  // .replace(/ /g, converter.toFullWidth(" "))
  // .replace(/&/g, converter.toFullWidth("&"))
  // .replace(/-/g, converter.toFullWidth("-"))
}

async function translateOfflineSugoi(textList, isSplit) {
  const listOfChoice = [
    `[…。♪:：\r\n〟！～『「」』？]`,
    "…",
    "(([『「」』])$)|(^([『「」』]))",
    "(^([『「」』]))",
    "(([『「」』])$)",
  ];
  const cloneTextList = [...textList];
  const filterSpecialPrefixRegExp = new RegExp("%(n)?[0-9]+([;. ,])?", "g");
  let filterTextList = await Promise.all(
    textList.map(async (text, index) => {
      if (text === null) return "Null";
      let filterText = text
        .replace(
          /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
          ""
        )
        .replace(/([」])$/g, "")
        .replace(/^"/g, "")
        .replace(/"$/g, "")
        .replace(/^([「])/g, "");
      // .replace(/\\n/g, "")
      // .replace(/…/g, "...")
      // .replace(/？/g, "? ")
      // .replace(/：/g, ": ")
      // .replace(/！/g, "! ")
      // .replace(/、/g, ", ")
      // .replace(/＆/g, "&");
      const filterSpecialCharsRegExp = new RegExp(listOfChoice[0], "g");
      if (isSplit && filterText.match(filterSpecialCharsRegExp)) {
        const filterSymbols = filterText
          .match(filterSpecialCharsRegExp)
          .map((v) =>
            v
              .trim()
              .replace("、", ", ")
              .replace(/[『「]/g, ' "')
              .replace(/[」』]/g, '" ')
          );
        filterText = await translateOfflineSugoiLongList(
          filterText.split(filterSpecialCharsRegExp),
          20
        );
        let ans = "";
        for (let i = 0; i < filterText.length; i++) {
          if (filterText[i] === " ") filterText[i] = "";
          ans +=
            filterText[i]
              .replace(filterSpecialCharsRegExp, "")
              .replace(/\./g, "")
              .replace(/I'm sorry, but I can't help it/g, "")
              .replace(/It's not like I don't know what's going on./g, " ")
              .replace(/I'm not sure if it's true or not./g, "") +
            (filterSymbols[i] ? filterSymbols[i] : "");
        }
        cloneTextList[index] = ans
          .replace(filterSpecialPrefixRegExp, "")
          .trim();
        filterText = "N$";
      }
      filterText = excludeTranslateText(filterText);
      filterText = filterText
        .trim()
        .replace(/[\r\n]+/g, "")
        .replace(filterSpecialPrefixRegExp, "");
      // .split(/？。/g);
      return filterText;
    })
  );
  filterTextList = filterTextList.map((text) => {
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
    return text;
  });
  let isCheck = true;
  let data = [];
  data = textList.map((text) => {
    if (!cacheTranslation[text]) isCheck = false;
    return cacheTranslation[text];
  });
  if (!isCheck) {
    data = (
      await axios({
        url: "http://localhost:14366",
        method: "post",
        data: JSON.stringify({
          content: filterTextList,
          message: "translate sentences",
        }),
        headers: { "Content-Type": "application/json" },
        timeout: 150000,
      })
    ).data;
  }
  let translatedTextList = data;
  // let translatedTextList = filterTextList;
  // Replace tag name
  translatedTextList = await Promise.all(
    translatedTextList.map((translatedText, index) => {
      if (["Null.", "Null"].includes(translatedText)) return null;
      if (textList[index] === "心の声") return "心の声";
      let prefix = textList[index].match(/^(	+)/g)
        ? textList[index].match(/^(	+)/g)[0]
        : "";
      let temp = translatedText
        .replace(/(<)?unk>(")?/g, " ")
        .replace(/\u2014/g, "-")
        .replace(/[「」]/g, "")
        .replace("It's not like I don't know what's going on.", " ")
        .replace("It's time for me to get started.", "")
        .replace(/I'm not sure if it's true or not./g, "")
        .replace(/\%/g, " percent");
      if (["N$", " ", "\\B", "????", "\\b"].includes(temp))
        temp = cloneTextList[index];
      if (textList[index].match(/\r\n/g)) temp = translatedText + "\r\n";
      else if (textList[index].match(/\n/g)) temp = translatedText + "\n";
      if (textList[index].match(new RegExp(filterSpecialPrefixRegExp, "g"))) {
        const text = textList[index]
          .match(new RegExp(filterSpecialPrefixRegExp, "g"))[0]
          .replace(/[;. ,]+/g, "");
        temp = text + "; " + temp;
      }
      temp = replaceTagName(temp, [2], "g");
      temp = replaceTagName(temp, [3], "gi");
      if (textList[index].trim().match(new RegExp(listOfChoice[2], "g"))) {
        temp =
          (textList[index].trim().match(new RegExp(listOfChoice[3], "g"))
            ? textList[index].trim().match(new RegExp(listOfChoice[3], "g"))[0]
            : "") +
          temp +
          (textList[index].trim().match(new RegExp(listOfChoice[4], "g"))
            ? textList[index].trim().match(new RegExp(listOfChoice[4], "g"))[0]
            : "");
      }
      let finalResult =
        prefix +
        temp
          .trim()
          .replace("「」", "「……」")
          .replace(/’/g, "'")
          .replace(/」"/g, '」"')
          .replace(/^"/g, "")
          .replace(/"$/g, "");
      cacheTranslation[textList[index]] = finalResult;

      return finalResult;
    })
  );
  return translatedTextList;
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
  // if (
  //   !rawText
  //     .trim()
  //     // .replace(/\[[0-9]+\]/g, "")
  //     // .replace(/\$\$\$/g, "")
  //     // .replace(/<[0-9,]+>/g, "")
  //     // .replace(
  //     //   />[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○]+<\/R>/g,
  //     //   ""
  //     // )
  //     // .replace(/<R/g, "")
  //     .match(
  //       new RegExp(ks.translation.regExpToFilterSentenceContainTagName, "g")
  //     )
  // )
  //   return rawText;
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
  // const suffix = rawText.match(/(　（[０-９]+）(.+)?)/g)[0];
  // console.log(suffix);
  let text = rawText
    .replace(/\[n\]/g, "")
    // .replace(/\[[0-9]+\]/g, "")
    .replace(/<\/r>/g, "")
    .replace(/<r.+>/g, "")
    .replace(/<r・・・・・>/g, "♪")
    .replace(/<\/r>/g, "♥")
    .replace(/MP/g, converter.toFullWidth("MP"))
    .replace(/HP/g, converter.toFullWidth("HP"))
    .replace(/TP/g, converter.toFullWidth("TP"));
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
  // .replace(/:NameSuffix/g, converter.toFullWidth("Yuji"))

  // .replace(/(　（[０-９]+）(.+)?)/g, "");
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

  // Important 【『「（】』」）
  const regExp = new RegExp(
    "[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆’ ＆]+",
    "g"
  );
  const textList = text.match(regExp);
  // console.log(text, textList)
  // const textList = [text.replace(/<en[A-Z][0-9]+>/g, "")];
  // const textList = rawText.split(",");
  // console.log(textList);
  if (!textList) return rawText;
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
    finalResult +=
      splittedTextList[i] +
      ((i < start || i >= end || textList[i] === "主人公（名）"
        ? textList[i]
        : translatedTextList[i].replace(/\./g, "")) ||
        // .replace(/'/g, "’").replace(/"/g, "”")
        "");
  }
  // backupText2 = backupText;
  return (
    prefix + finalResult
    // .replace(/, /g, "、")
    // .replace(/'/g, "’").replace(/"/g,"”")
    // .replace(/\\\\a/g, "\\\\a ")
    // .replace(/\./g, "")
    // .replace(/:NameSuffix/g, "Yuji")
    // suffix
  );
  // + suffix;
}

async function translateSelectCenterTextList(
  dataList,
  limit = 20,
  isGlue,
  ks,
  type,
  isQlie
) {
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
              isGlue,
              ks,
              type
            )
          ).split("$$$");
        }
        if (!isGlue)
          translatedSelectCenterText = await Promise.all(
            dataList
              .slice(ans.length, ans.length + limit2)
              .map(async (text) => {
                const temp = await translateSelectCenterText(
                  text,
                  limit,
                  0,
                  isQlie ? (text.includes("＠") ? 1 : undefined) : undefined,
                  isGlue,
                  ks,
                  type
                );
                return temp;
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
