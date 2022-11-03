const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
module.exports = function handleWordWrapShina(fileContent) {
  const blockList = fileContent.split("\r\n");
  const ans = blockList
    .reduce((acc, block) => {
      let maxLines = 3;
      // if (block.match(/wmv/g)) {
      //   return acc;
      // }
      if (block.match(containRegExpI)) {
        acc.push(block);
        return acc;
      }
      let temp = handleWordWrap(40, block, "\r\n");
      temp = temp.split("\r\n").map((text) => {
        if (text.match(containRegExpI) || text === "") {
          return text;
        }
        return " " + text;
      });
      let i = -1;
      let temp2 = "";
      do {
        i++;
        if (i === 0) {
          temp2 = temp.slice(i * maxLines, (i + 1) * maxLines).join("\r\n");
        } else {
          temp2 +=
            temp.slice(i * maxLines, (i + 1) * maxLines).length > 0
              ? "\r\n\r\n" +
                temp.slice(i * maxLines, (i + 1) * maxLines).join("\r\n")
              : "";
        }
      } while (i * maxLines < temp.length);
      acc.push(temp2);
      return acc;
    }, [])
    .join("\r\n");
  return ans;
};
