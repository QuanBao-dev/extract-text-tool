const { qlie } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  qlie.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

function handleWordWrapQlie(rawText, start = 0, end) {
  let text = rawText
    .replace(/,( )?/g, "、")
    .replace(/^"/g, "「")
    .replace(/"$/g, "」")
    .replace(/,"/g, ",「");
  if (text.match(containRegExpI) || text.trim() === "") return rawText;
  const textList = text.split(",");
  if (!textList) return rawText;
  const translatedTextList = textList.map((v) => {
    return handleWordWrap(qlie.wordWrap.maxCharPerLines, v, "[r]");
  });
  if (!end) end = translatedTextList.length;
  for (let i = start; i < end; i++) {
    text = text.replace(textList[i], translatedTextList[i].replace(/,/g, "、"));
  }
  return text;
}

function handleWordWrapQlieVN(fileContent) {
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
            let j = 0;
            do {
              ans.push(...texts.slice(j, j + 3));
              if (ans.slice(0, 3).length % 3 === 0) {
                if (texts.length > 3) {
                  ans.push(
                    "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n"
                  );
                }
              }
              j += 3;
            } while (j < texts.length);
            return ans;
          }, [])
          .join("\r\n")
      );
      return dataItem;
    }, [])
    .join("\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n");
  return dataList;
}

function handleWordWrapQlieVN1() {}

module.exports = { handleWordWrapQlieVN, handleWordWrapQlieVN1 };
