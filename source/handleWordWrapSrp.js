const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);

module.exports = function handleWordWrapSrp(fileContent) {
  const blockList = fileContent.split("\n");
  let temp = [];
  let ans = blockList.reduce((result, text) => {
    if (text !== "") temp.push(text);
    else {
      result.push(temp);
      temp = [];
    }
    return result;
  }, []);
  const blockTextList = ans.map((blockList) => {
    for (let i = blockList.length - 1; i > 0; i--) {
      if (blockList[i].includes(" ") || blockList[i].match(/[.!\?:]/g)) {
        return handleSplitWordWrappedText(
          handleWordWrap(
            60,
            blockList[i].replace(/\\n/g, " ").replace(/, /g, "、"),
            "\\n"
          ).split("\\n"),
          2,
          "\\n"
        );
      }
    }
    return "";
  });
  ans = ans.reduce((result, data, index) => {
    if (data.length === 4 || data[0] === "00003000"|| data[0] === "00001000") {
      const temp = [];
      const blockText = blockTextList[index];
      for (let j = 0; j < blockText.length; j++) {
        if (j === 0) {
          temp.push(
            [
              ...data.slice(0, data.length - 2),
              blockText[j],
              data[data.length - 1],
            ].join("\n")
          );
        } else {
          temp.push(
            [
              data[0] === "00003000"|| data[0] === "00001000" ? "00000000" : data[0],
              ...data.slice(1, data.length - 2),
              blockText[j],
            ].join("\n")
          );
        }
      }
      result.push(...temp);
    } else if (data.length === 3 || data.length === 2) {
      // if (data[0] === "00001000") {
      //   const temp = [];
      //   const blockText = [...blockTextList[index]];
      //   for (let j = 0; j < blockText.length; j++)
      //     temp.push(
      //       [
      //         ...data.slice(0, data.length - 2),
      //         blockText[j],
      //         data[data.length - 1],
      //       ].join("\n")
      //     );
      //   result.push(...temp);
      // } else {
      const temp = [];
      const blockText = [...blockTextList[index]];
      for (let j = 0; j < blockText.length; j++)
        temp.push([...data.slice(0, data.length - 1), blockText[j]].join("\n"));
      result.push(...temp);
      // }
    } else result.push(data);
    return result;
  }, []);
  ans = ans.slice(0, ans.length).join("\n\n");
  return ans;
};
// 64
function handleSplitWordWrappedText(textList, number, joinString) {
  let i = -1;
  let temp2 = "";
  do {
    i++;
    if (i === 0) {
      temp2 = textList.slice(i * number, (i + 1) * number).join(joinString);
    } else {
      temp2 +=
        textList.slice(i * number, (i + 1) * number).length > 0
          ? joinString +
            joinString +
            textList.slice(i * number, (i + 1) * number).join(joinString)
          : "";
    }
  } while (i * number < textList.length);
  return temp2.split(joinString + joinString);
}
