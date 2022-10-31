const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

function handleWordWrapQlie(rawText, start = 0, end) {
  let text = rawText
    .replace(/, /g, "、")
    .replace(/^"/g, "「")
    .replace(/"$/g, "」")
    .replace(/,"/g, ",「");
  if (text.match(containRegExpI) || text.trim() === "") return rawText;
  const textList = text.split(",");
  if (!textList) return rawText;
  const translatedTextList = textList.map((v) => {
    return handleWordWrap(44, v, "[r]");
  });
  if (!end) end = translatedTextList.length;
  for (let i = start; i < end; i++) {
    text = text.replace(textList[i], translatedTextList[i].replace(/,/g, "、"));
  }
  return text;
}

module.exports = function handleWordWrapQlieVN(fileContent) {
  let dataList = fileContent.split(/\r\n/g);
  let count = 0;
  let isCounter = false;
  dataList = dataList.reduce((ans, text) => {
    if (text.trim() === "" && isCounter === true) {
      count++;
      isCounter = false;
    }
    if (text.trim() !== "") {
      if (!ans[count]) ans[count] = [];
      ans[count].push(text);
      isCounter = true;
    }
    return ans;
  }, []);
  dataList = dataList
    .reduce((dataItem, listText) => {
      let temp = [];
      dataItem.push(
        listText
          .reduce((ans, text) => {
            // if (!text.includes("log:continue")) ans.push(text);
            // return ans;

            const wordWrappedText = handleWordWrapQlie(
              text,
              text.includes("＠") ? 1 : 0
            );
            const texts = wordWrappedText.split("[r]");
            texts.forEach((text, index) => {
              if (index / 2 < 1) {
                ans.push(text);
              } else {
                temp = [text];
              }
            });
            return ans;
          }, [])
          .join("\r\n")
      );
      if (temp.length !== 0) dataItem.push(temp);
      return dataItem;
    }, [])
    .join("\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n");
  return dataList;
};
