const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

module.exports = function handleWordWrapArtemis(fileContent) {
  let dataList = fileContent.split(/\[[0-9]+\] = 	{/g);
  dataList = dataList.map((text, index) => {
    if (index === 0) return text;
    return `[${index}] = 	{` + text;
  });
  let dataListExceptText = [];
  const dataTextList = dataList.reduce((ans, blockString) => {
    let splittedBlock = blockString.split("\r\n");
    const splittedBlockExceptText = splittedBlock.map((string) => {
      if (string.match(containRegExpI)) return "@@";
      return string;
    });
    dataListExceptText.push(
      splittedBlockExceptText
        .slice(0, splittedBlockExceptText.length)
        .filter((v) => v !== "")
    );
    splittedBlock = splittedBlock.filter((string) => {
      return string.match(containRegExpI);
    });
    if (!splittedBlock[0]) {
      ans.push("");
      return ans;
    }
    let wordWrapList = handleWordWrap(
      ks.wordWrap.maxCharPerLines,
      splittedBlock[0].trim(),
      "\\n"
    )
      .split("\\n")
      .map((v) =>
        v.replace(/\t\t\["text"\] = \{\[\[/g, "").replace(/\]\]\},/g, "")
      );
    let i = 0;
    let finalResult = [];
    while (i < wordWrapList.length) {
      finalResult.push(wordWrapList.slice(i, i + 3).join("\\n"));
      i += 3;
    }
    ans.push(finalResult);
    return ans;
  }, []);
  return applyTextToBlock(dataTextList, dataListExceptText);
};

function applyTextToBlock(dataListText, dataListExceptText) {
  let count = 0;
  return dataListExceptText
    .reduce((result, blockList, key) => {
      if (dataListText[key] === "") {
        result.push(blockList.join("\r\n"));
        return result;
      }
      let blockListString = blockList.join("\r\n");
      let temp = "";
      for (let i = 0; i < dataListText[key].length; i++) {
        if (dataListText[key][i] === "") continue;
        count++;
        if (i === 1) {temp += "\r\n";console.log(blockListString)}
        temp += blockListString
          .replace(/@@/g, `\t\t["text"] = {[[` + dataListText[key][i] + `]]},`)
          .replace(/\[[0-9]+\] = 	{/g, `[${count}] = 	{`);
      }
      result.push(temp);
      return result;
    }, [])
    .join("\r\n");
}
