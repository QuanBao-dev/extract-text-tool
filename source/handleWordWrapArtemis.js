const { artemisAster } = require("../setting.json");
const containRegExpI = new RegExp(
  artemisAster.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

module.exports = function handleWordWrapArtemis(fileContent) {
  let dataList = fileContent.split(/block_[0-9]+ = {/g);
  dataList = dataList.map((text, index) => {
    if (index === 0) return text;
    return `block_${parsingNumber(index - 1)} = {` + text;
  });
  // console.log(dataList)
  const dataTextList = dataList.reduce((ans, blockString) => {
    let splittedBlock = blockString.split("\r\n");
    splittedBlock = splittedBlock.reduce((ans, v) => {
      ans.push(...v.split("\n"));
      return ans;
    }, []);
    splittedBlock = splittedBlock.filter((string) => {
      return string.trim().match(containRegExpI) === null;
    });
    let array = splittedBlock[0].trim().split("\\n");
    const temp = [];
    let i = 0;
    while (i < array.length) {
      temp.push(
        ((i > 0 ? '"' : "") + array.slice(i, i + 3).join("\\n") + '",').replace(
          /\\n",/g,
          '",\\n'
        )
      );
      i += 3;
    }
    ans.push(temp);
    // ans.push(
    //   handleWordWrap(
    //     ks.wordWrap.maxCharPerLines,
    //     splittedBlock[0].trim(),
    //     '",[r]"'
    //   ).split("[r]")

    //   // splittedBlock[0].trim().split("\\n")
    // );
    return ans;
  }, []);
  let count = 0;
  let isExcepted = false;
  const result = dataTextList.map((listText, index) => {
    let blockSplit = dataList[index].split("\r\n");
    blockSplit = blockSplit.reduce((ans, v) => {
      ans.push(...v.split("\n"));
      return ans;
    }, []);
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
  return result.join("\r\n").replace(/',",/g, '",').replace(/					",/g, "");
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
