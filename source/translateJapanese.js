// const { translate } = require("bing-translate-api");
// const translateGoogle = require("translatte");
// const puppeteer = require("@scaleleap/puppeteer");
const axios = require("axios");
const { ks } = require("../setting.json");
// const handleWordWrap = require("./handleWordWrap");

const {
  replacedCharsAfterTranslation,
  replacedCharsBeforeTranslation,
  replacedExactCharsAfterTranslation,
} = require("../setting.json");
const delay = require("./delay");
const objectMap = replacedCharsBeforeTranslation;
// g
const objectMap2 = replacedExactCharsAfterTranslation;
// i
const objectMap3 = replacedCharsAfterTranslation;
const containRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const exceptRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);

async function test() {
  return await Promise.all(
    Object.keys(objectMap).map(
      async (name) => (await translateOfflineSugoiLongList(name)) + "|" + name
    )
  );
}

// async function translateJapaneseToEng(
//   text,
//   isBing,
//   count = 0,
//   countForGoogle = 0
// ) {
//   if (!text) return null;
//   let handledText = text.replace(/\\n/g, "");
//   handledText = excludeTranslateText(handledText);
//   if (isBing && count <= 3) {
//     try {
//       let data = await translate(handledText, null, "en");
//       if (!data) return text;
//       data.translation = replaceTagName(data.translation);
//       return data.translation;
//     } catch (error) {
//       // console.log("/*Error Bing, retry*/");
//       return await translateJapaneseToEng(handledText, true, ++count);
//     }
//   }
//   if (countForGoogle <= 5)
//     try {
//       // if (isBing) console.log("****Google translate*****");
//       const data = await translateGoogle(handledText, { to: "en" });
//       data.text = replaceTagName(data.text);
//       return data.text;
//     } catch (error) {
//       console.log(error);
//       return await translateJapaneseToEng(
//         handledText,
//         false,
//         0,
//         ++countForGoogle
//       );
//     }
//   return text;
// }

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
  limit = 0,
  isSplit = false,
  isConsoleLog = true
) {
  let ans = [];
  let i = 0;
  textList = textList.map((text) => {
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
  if (textList.length === 0) return [];
  while (true) {
    try {
      do {
        if (limit === 0) return [];
        // const translatedText = await translateOfflineSugoiCt2(textList[i]);
        const translatedTextList = await Promise.all(
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
        ans = [...ans, ...translatedTextList];
        i++;
        if (isConsoleLog) console.log(`${ans.length}/${textList.length}`);
      } while (ans.length < textList.length);
      break;
    } catch (error) {
      console.log(error);
      limit = parseInt(limit / 2) === 0 ? 1 : parseInt(limit / 2);
      console.log({ limit });
      await delay(10000);
    }
  }
  return ans;
}
// let a = []
async function translateOfflineSugoiCt2(text) {
  if (text === "？？？？？") return "base";
  if (text === "？？？？") return "？？？？";
  if (text === "？？？") return "？？？";
  if (text === "？？") return "？？";
  if (text === "？") return "？";
  if (text === "") return "";
  if (cacheTranslation[text]) {
    return cacheTranslation[text];
  }
  // a.push(text);
  // console.log(a);
  const listOfChoice = [
    `[…。♪:：〟！～『「」』？]`,
    "…",
    "(([『「」』])$)|(^([『「」』]))",
    "(^([『「」』]))",
    "(([『「」』])$)",
  ];
  const filterSpecialPrefixRegExp = new RegExp("%(n)?[0-9]+([;. ,])?", "g");
  if (text === null) return "Null";
  let filterText = text
    .replace(
      /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
      ""
    )
    .replace(/([」])$/g, "")
    .replace(/^"/g, "")
    .replace(/"$/g, "")
    .replace(/^([「])/g, "")
    .replace(/。$/g, "")
    .replace(/\\n/g, "");
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
  filterText = filterText.trim();
  // .replace(/[\r\n]+/g, "")
  // .replace(filterSpecialPrefixRegExp, "");
  // .split(/？。/g);
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
    .replace(/[「」]/g, "")
    .replace("It's not like I don't know what's going on.", " ")
    .replace("It's time for me to get started.", "")
    .replace(/I'm not sure if it's true or not./g, "");
  // .replace(/\%/g, " percent");
  if (["N$", " ", "\\B", "????", "\\b"].includes(temp)) temp = text;
  // if (text.match(/\r\n/g)) temp = translatedText + "\r\n";
  // else if (text.match(/\n/g)) temp = translatedText + "\n";
  if (text.match(new RegExp(filterSpecialPrefixRegExp, "g"))) {
    const text = text
      .match(new RegExp(filterSpecialPrefixRegExp, "g"))[0]
      .replace(/[;. ,]+/g, "");
    temp = text + "; " + temp;
  }
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
      .replace(/^\*/i, "＊")
      .replace("「」", "「……」")
      .replace(/’/g, "'")
      .replace(/」"/g, '」"')
      .replace(/^"/g, "")
      .replace(/"$/g, "")
      .replace(/( )?⁇( )?/g, "");
  cacheTranslation[text] = finalResult;
  return finalResult;
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
      cacheTranslation[textList[index]] =
        prefix +
        temp
          .trim()
          .replace("「」", "「……」")
          .replace(/’/g, "'")
          .replace(/」"/g, '」"')
          .replace(/^"/g, "")
          .replace(/"$/g, "");
      return (
        prefix +
        temp
          .trim()
          .replace(/^\*/i, "＊")
          .replace("「」", "「……」")
          .replace(/’/g, "'")
          .replace(/」"/g, '」"')
          .replace(/^"/g, "")
          .replace(/"$/g, "")
      );
    })
  );
  return translatedTextList;
}

function excludeTranslateText(text) {
  let temp = text;
  Object.keys(objectMap).map((japaneseName) => {
    temp = temp.replace(new RegExp(japaneseName, "g"), objectMap[japaneseName]);
  });
  return temp;
}

let backupText = "";
// let backupText2 = "";
let check = false;
async function translateSelectCenterText(rawText, start = 0, end) {
  if (
    !rawText
      .trim()
      .match(
        new RegExp(ks.translation.regExpToFilterSentenceContainTagName, "g")
      )
  )
    return rawText;
  rawText = excludeTranslateText(rawText);
  const prefix = rawText.match(/^((　)+)/g)
    ? rawText.match(/^((　)+)/g)[0]
    : "";
  let text = rawText
    .replace(/\\n:/g, "")
    .replace(/\n:/g, "")
    .replace(/\n/g, "")
    .replace(/\\n/g, "")
    // .replace(/\[n\]/g, "")
    .replace(
      /_t![0-9,]+[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～『！』？＆、。●'“”・♡＝…―]+\//g,
      ""
    )
    // .replace(/(<\/r>)|(<r )|(<r)|(　)|(\\r\\n)/g, "")
    // .replace(/・/g, ".")
    .replace(
      /\[ruby text="[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"・♡＝…―,]+"\]/g,
      ""
    );
  // .replace(/(（[０-９]+）)/g, "");

  // text = text.replace(">", "#").replace(/>/g, "").replace("#", ">");
  // text = text.replace("<", "#").replace(/</g, "").replace("#", "<");

  // const suffix = rawText.match(/(（[０-９]+）)/g)[0];

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
  const rubyList = (
    rawText.match(
      /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '"●・♡＝…―,]+\]/g
    ) || []
  ).map((v) => {
    return v.split(",")[2]
      ? v.split(",")[2].replace("]", "")
      : v.split(",")[1].replace("]", "");
  });
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

  const specialList = rawText.match(
    /\\r;[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　。●・;♡＝…：＄αβ％●]+:/g
  );
  if (specialList)
    for (let i = 0; i < specialList.length; i++) {
      text = text.replace(
        /\\r;[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　。●・;♡＝…：＄αβ％●]+:/i,
        specialList[i].split(";")[1]
      );
      // .replace(":", "");
    }

  const textList = text.match(
    /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●]+/g
  );
  // const textList = [text.replace(/<en[A-Z][0-9]+>/g, "")];
  // const textList = rawText.split(",");
  // console.log(text,textList);
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
    1,
    false,
    false
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
  for (let i = start; i < end; i++) {
    if (textList[i].trim() === "") continue;
    translatedTextList[i] = replaceTagName(translatedTextList[i], [2], "g");
    text = text
      // .replace(
      //   /\[rb[a-zA-Z一-龠ぁ-ゔァ-ヴ　ーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-ん ァ-ヾｦ-ﾟ〟！～『「！」』？＆、。　 '●・♡＝…―,]+\]/g,
      //   ""
      // )
      .replace(
        textList[i],
        // '"' +
        // (rawText.split(">")[1] && rawText.split(">")[1][0] === "　"
        //   ? "　"
        //   : "") +
        translatedTextList[i].replace(/, /g, "、").replace(/,/g, "、")
        // + '"'
        // .replace(/</g, " ")
      );
  }
  // backupText2 = backupText;
  return prefix + text.replace(/\\n/g, " ").replace("Huh? What's up?", "へ");
  // +suffix
}

async function translateSelectCenterTextList(dataList, limit = 20) {
  let ans = [];
  let limit2 = limit;
  while (true) {
    try {
      do {
        const translatedSelectCenterText = await Promise.all(
          dataList.slice(ans.length, ans.length + limit2).map(async (text) => {
            if (text === "    ") return "    ";
            if (text === "ＯＰムービー初回") return "ＯＰムービー初回";
            if (text === "ＯＰムービー２回目以降")
              return "ＯＰムービー２回目以降";
            if (text === "……") return "……";
            if (text === "。、」』）！？”～ー♪") return "。、」』）！？”～ー♪";
            return await translateSelectCenterText(
              text,
              ks.translation.isQlie ? (text.includes("＠") ? 1 : 0) : 0
            );
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
};
