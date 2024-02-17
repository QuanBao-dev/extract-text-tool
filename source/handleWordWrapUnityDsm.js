const { pinpoint } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const exceptRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);

function handleWordWrapUnityDsm(fileContent) {
  const dataList = fileContent.split(/\n\[cpg/g);
  const textList = dataList.reduce((ans, text) => {
    if (text === undefined) {
      ans.push("");
      return ans;
    }
    const texts = text
      .split("\n")
      .slice(1)
      .filter(
        (txt) =>
          !(
            (txt.trim().match(containRegExpI) &&
              !txt.trim().match(exceptRegExpI)) ||
            txt.trim() === ""
          )
      );
    ans.push(texts[0] || "@#$@#$");
    return ans;
  }, []);
  const wordWrapTextList = textList.map((text) => {
    if(text == "@#$@#$") return "";
    const wordWrapText = handleWordWrap(32, text, "[r]");
    let i = 0;
    const list = wordWrapText.split("[r]");
    let temp = "";
    while (i < list.length) {
      temp +=
        list.slice(i, i + 2).join(" ") +
        (i + 2 < list.length ? "\n[cpg]\n\n" : "");
      i += 2;
    }
    return temp;
  });
  let finalResult = fileContent;
  textList.forEach((text, index) => {
    finalResult = finalResult.replace(text, wordWrapTextList[index]);
  })
  return finalResult;
}

module.exports = { handleWordWrapUnityDsm };
