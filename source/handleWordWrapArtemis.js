const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

module.exports = function handleWordWrapArtemis(fileContent) {
  let dataList = fileContent.split(/block_[0-9]+ = {/g);
  dataList = dataList.map((text, index) => {
    if (index === 0) return text;
    return `block_${parsingNumber(index - 1)} = {` + text;
  });
  const dataTextList = dataList.reduce((ans, blockString) => {
    let splittedBlock = blockString.split("\r\n");
    splittedBlock = splittedBlock.filter((string) => {
      return string.trim().match(containRegExpI) === null;
    });
    ans.push(
      handleWordWrap(
        ks.wordWrap.maxCharPerLines,
        splittedBlock[0].trim(),
        '",[r]"'
      ).split("[r]")
    );
    return ans;
  }, []);
  let count = 0;
  let isExcepted = false;
  const result = dataTextList.map((listText, index) => {
    let blockSplit = dataList[index].split("\r\n");
    return listText
      .map((translatedDialog, index) => {
        const temp = blockSplit.map((text) => {
          // console.log(text);
          if (text.trim().match(/^(block_)/g)) {
            return (
              "\t" +
              text.replace(
                text.match(/block_[0-9]+/g),
                `block_${parsingNumber(count)}`
              )
            );
          }
          if (text.trim().match(/^(linkback)/g)) {
            if (count - 1 >= 0)
              return text.replace(
                text.match(/block_[0-9]+/g),
                `block_${parsingNumber(count - 1)}`
              );
            return text;
          }
          if (text.trim().match(/^(linknext)/g)) {
            let temp2 = text.replace(
              text.match(/block_[0-9]+/g),
              `block_${parsingNumber(count + 1)}`
            );
            count++;
            return temp2;
          }
          if (text.trim().match(/"vo"/g) && index > 0) {
            return "";
          }
          if ((text.trim().match(/delay = /g) || isExcepted) && index > 0) {
            if (text.trim().match(/delay = /g)) isExcepted = true;
            if (text === "		},") isExcepted = false;
            return "";
          }
          if (
            text === "\t" ||
            text.trim().match(/(^(astver))|([{}])|(line = )/g)
          ) {
            return text;
          }
          return (
            "\t\t\t\t\t" +
            translatedDialog
              .replace(/"/g, "'")
              .replace(/^(\')/g, '"')
              .replace(/(',)$/g, '",')
          );
        });
        return temp.filter((v) => v.trim() !== "").join("\r\n");
      })
      .join("\r\n");
  });
  return result.join("\r\n");
};

function parsingNumber(num) {
  const numString = num.toString();
  const lengthAdded = 5 - numString.length;
  return (
    Array.from(Array(lengthAdded).keys())
      .map(() => "0")
      .join("") + numString
  );
}
