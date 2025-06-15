const axios = require("axios");
const { readFile } = require("./handleFile");
const delay = require("./delay");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();
const objectMap2 = handleObjectMap({
  "相倉 和葉": "Ainokura Kazuha",
  "雨晴 こがね": "Amahara Kogane",
  "上梨 夜雪": "Kaminashi Yashiro",
  "上梨 鋼": "Kaminashi Kou",
  "赤尾 充祥": "Akao Mitsuru",
  "国広 伊織": "Kunihiro Iori",
  "利賀 遥斗": "Touga Haruto",
  ぽっぽんち: "Popponchi",
});

let count = 1;

let messages = [];

async function updateCount(history) {
  const maxCount = history.match(/Line[0-9]+/g).reduce((acc, v) => {
    let count = parseInt(v.replace(/Line/g, ""));
    if (count > acc) return count;
    return acc;
  }, 0);
  if (!maxCount) return 0;
  return maxCount;
}
async function translateAIModelList(
  rawTexts = [],
  nameList,
  model = "vntl-llama3-8b",
  isCst = false,
  narrator = "Narrator"
) {
  nameList = nameList.map((v) => {
    if (!v) return narrator;
    if (v === "？？？") return "???";
    return v.replace(/(Mr\.)|(Mrs\.)|(\.)/g, "");
  });

  const textList = rawTexts.map((v, index) => {
    if (nameList[index] !== "") {
      if (isCst) return nameList[index] + "　「" + v + "」";
      return nameList[index] + "　" + v;
    }
    return v;
  });

  const [prompt, history] = await Promise.all([
    readFile("./prompt.txt", "utf8"),
    readFile("./history.json", "utf8"),
  ]);
  if (count === 1) {
    messages.push({ role: "system", content: prompt });
  }
  if (history && count === 1) {
    const jsonHistory = JSON.parse(history);
    if (jsonHistory.length !== 0) {
      messages = [...messages, ...jsonHistory];
      count = (await updateCount(history)) + 1;
    }
  }

  let jsonObject = {};
  let jsonObject2 = {};
  // return rawTexts;
  textList.forEach((text) => {
    let temp = handleTextBeforeTranslation(
      text
        .replace(/\\r\\n/g, "")
        .replace(/\r\n/g, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
      // .replace(/　/g, "")
    );
    temp = replaceTagName(temp, [2], "g");
    temp = replaceTagName(temp, [3], "gi");
    // console.log({temp});
    jsonObject[`Line${count}`] = temp;
    jsonObject2[`Line${count}`] = temp.replace(narrator, "").trim();
    count++;
  });
  const text = JSON.stringify(jsonObject, null, 1).replace(/\[r\]/g, "");

  let translatedTextList = [];
  let length = 0;
  while (translatedTextList.length !== textList.length) {
    messages.push({ role: "user", content: text });
    // console.log(messages);
    console.log(jsonObject2);
    let response;
    try {
      response =
        (
          await axios({
            url: "http://localhost:1234/v1/chat/completions",
            method: "post",
            data: JSON.stringify({
              model: model,
              stream: false,
              max_tokens: -1,
              temperature: 0,
              stop: ["\n}"],
              messages,
            }),
            timeout: 1000 * 60 * 1.5,
            headers: { "Content-Type": "application/json" },
          })
        ).data.choices[0].message.content.trim() + "\n}";
    } catch (error) {
      handleCatchError(rawTexts);
    }

    try {
      translatedTextList = jsonRepair2(response, nameList);
      if (translatedTextList.length !== length) {
        translatedTextList = jsonRepair(response, nameList);
      }

      translatedTextList = translatedTextList.map((v, i) => {
        let temp = v.trim();
        if (!isCst) {
          if (
            rawTexts[i].trim().match(/^『/g) &&
            rawTexts[i].trim().match(/』$/g)
          ) {
            temp =
              "『" +
              temp.replace(/^["'“‘«]+/g, "").replace(/["'”’»]+$/g, "") +
              "』";
          }
          if (
            rawTexts[i].trim().match(/^【/g) &&
            rawTexts[i].trim().match(/】$/g)
          ) {
            temp =
              "【" +
              temp.replace(/^["'“‘«]+/g, "").replace(/["'”’»]+$/g, "") +
              "】";
          }
          if (
            rawTexts[i].trim().match(/^「/g) &&
            rawTexts[i].trim().match(/」$/g)
          ) {
            temp =
              "「" +
              temp.replace(/^["'“‘«]+/g, "").replace(/["'”’»]+$/g, "") +
              "」";
          }
          if (
            rawTexts[i].trim().match(/^\(/g) &&
            rawTexts[i].trim().match(/\)$/g)
          ) {
            temp =
              "(" +
              temp.replace(/^["'“‘«]+/g, "").replace(/["'”’»]+$/g, "") +
              ")";
          }
          if (
            rawTexts[i].trim().match(/^（/g) &&
            rawTexts[i].trim().match(/）$/g)
          ) {
            temp =
              "(" +
              temp.replace(/^["'“‘«]+/g, "").replace(/["'”’»]+$/g, "") +
              ")";
          }
        }
        return temp
          .trim()
          .replace(/^「+/g, "「")
          .replace(/」」+$/g, "」")
          .replace(/^\(\(/g, "(")
          .replace(/^"/g, "");
      });
    } catch (error) {
      handleCatchError(rawTexts);
    }

    if (translatedTextList.length !== rawTexts.length) {
      handleCatchError(rawTexts);
    }

    // Add assistant content
    let assistantContent = {};
    let assistantContent2 = {};
    let temp = 0;
    for (let i = count - rawTexts.length; i < count; i++) {
      if (nameList[temp] !== "") {
        assistantContent[`Line${i}`] =
          nameList[temp] +
          ' "' +
          translatedTextList[temp]
            .replace(/^["'“【『「（《\(:«]+/g, "")
            .replace(/["'》】』」»\)]+$/g, "") +
          '"';
      } else {
        assistantContent[`Line${i}`] =
          nameList[temp] +
          translatedTextList[temp]
            .replace(/^["'“【『「（《\(:«]+/g, "")
            .replace(/["'》】』」»\)]+$/g, "");
      }
      temp++;
    }

    temp = 0;
    for (let i = count - rawTexts.length; i < count; i++) {
      if (nameList[temp] !== "" && nameList[temp] !== narrator) {
        assistantContent2[`Line${i}`] =
          nameList[temp] +
          ' "' +
          translatedTextList[temp]
            .replace(/^["'“【『「（《\(:«]+/g, "")
            .replace(/["'》】』」»\)]+$/g, "") +
          '"';
      } else {
        assistantContent2[`Line${i}`] = translatedTextList[temp]
          .replace(/^["'“【『「（《\(:«]+/g, "")
          .replace(/["'》】』」»\)]+$/g, "");
      }
      temp++;
    }

    messages.push({
      role: "assistant",
      content: JSON.stringify(assistantContent, null, 1),
    });

    console.log(assistantContent2);
    const n = 10;
    let historyLength = n * 2;
    if (messages.length > historyLength) {
      let length = messages.length;
      messages = [messages[0], ...messages.slice(length - historyLength)];
    }
  }
  return { translatedTextList, messages };
}

function handleCatchError(rawTexts) {
  count -= rawTexts.length;
  count++;
  messages.pop();
  throw new Error("Fall back");
}

function extractName(text) {
  const regExp = new RegExp(
    `[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：‘’＄αβ％●＜＞♀♂♪〇☆〜゛×○♥☆＆＿♥、☆＆・ζ‘’＄αβ％●＜＞♀♂♪〇☆〜゛×・○♥、☆＆＿’！？\r\n∴（）　\\+―]+`,
    "g"
  );
  const textList = text.match(regExp);
  if (!textList) {
    return "";
  }
  return textList[1] || textList[0] || "";
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

function replaceTagName(text, modes = [2], flag = "g") {
  let temp = text;
  if (!temp) return temp;
  if (modes.includes(2)) {
    Object.keys(objectMap2).forEach((key) => {
      temp = temp.replace(new RegExp(key, flag), objectMap2[key]);
    });
  }
  return temp;
}

function handleTextBeforeTranslation(text) {
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
  for (let i = 0; i < rubyList22.length; i++) {
    text = text.replace(
      rubyList22[i],
      rubyList22[i].split("/")[0].replace(/\(/g, "")
    );
  }
  for (let i = 0; i < rubyList21.length; i++) {
    text = text.replace(
      rubyList21[i],
      rubyList21[i].split(":")[0].replace(/\{/g, "")
    );
  }
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
  // for (let i = 0; i < rubyList.length; i++) {
  //   text = text.replace(
  //     new RegExp(rubyList[i].replace(/\[/g, "\\[").replace(/\]/g, "\\]"), "i"),
  //     rubyList[i].split(",")[2]
  //       ? rubyList[i].split(",")[2].replace("]", "")
  //       : rubyList[i].split(",")[1].replace("]", "")
  //   );
  // }
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
  for (let i = 0; i < rubyList17.length; i++) {
    text = text.replace(
      rubyList17[i],
      rubyList17[i].split("／")[0].replace(/≪/g, "")
    );
  }
  // for (let i = 0; i < rubyList18.length; i++) {
  //   text = text.replace(
  //     rubyList18[i],
  //     rubyList18[i].split("'")[0].replace(/\[/g, "")
  //   );
  // }
  return text;
}
function jsonRepair(text, nameList) {
  return text
    .replace(/(\\n)|(\\)/g, "")
    .split(',\n "')
    .map((v) =>
      v
        .replace(/Line[0-9]+/g, "")
        .replace(/[\[\]]/g, "")
        .trim()
        .replace(/(\\)|(\n)|(^"+)|("+$)|(\{)|(\})/g, "")
        .trim()
        .replace(/(““)/g, "")
        .trim()
        .replace(/(””)/g, "")
        .trim()
        .replace(/(",$)/g, "")
        .trim()
        .replace(/(")$/g, "")
        .trim()
        .replace(/(」)$/g, "")
        .trim()
        .replace(/(,$)/g, "")
        .trim()
        .replace(/(,$)/g, "")
        .trim()
        .replace(/(»$)/g, "")
        .trim()
        .replace(/"/g, "")
    )
    .map((v, index) => {
      let name = replaceTagName(nameList[index], [2], "g");
      name = replaceTagName(nameList[index], [3], "gi");
      let temp = v
        .trim()
        // .replace(/:/g, "")
        .replace(new RegExp(name.replace(/\?/g, "\\?"), "i"), "")
        .trim()
        .replace(/^["'“【『「（《\(:«]+/g, "")
        .replace(/["'》】』」»\)]+$/g, "");
      return temp;
    });
}
function jsonRepair2(text, nameList) {
  return text
    .replace(/(\\n)|(\\)/g, "")
    .split("Line")
    .slice(1)
    .map((v) => {
      let temp = v.split(":");
      temp = [v[0], temp.slice(1).join(":")];
      let length = temp.length;
      let text = temp[length - 1];
      return text
        .replace(/[\[\]]/g, "")
        .trim()
        .replace(/(\\)|(\n)|(^"+)|("+$)|(\{)|(\})/g, "")
        .trim()
        .replace(/(““)/g, "")
        .trim()
        .replace(/(””)/g, "")
        .trim()
        .replace(/(",$)/g, "")
        .trim()
        .replace(/(")$/g, "")
        .trim()
        .replace(/(」)$/g, "")
        .trim()
        .replace(/(,$)/g, "")
        .trim()
        .replace(/(,$)/g, "")
        .trim()
        .replace(/(»$)/g, "")
        .trim()
        .replace(/(")$/g, "");
    })
    .map((v, index) => {
      let name = replaceTagName(nameList[index], [2], "g");
      name = replaceTagName(nameList[index], [3], "gi");
      let temp = v
        .trim()
        .replace(new RegExp(name.replace(/\?/g, "\\?"), "i"), "")
        .trim()
        .replace(/^["'“【『「（《\(:«]+/g, "")
        .replace(/["'》】』」»\)]+$/g, "");
      return temp;
    });
}

module.exports = { translateAIModelList, extractName };
