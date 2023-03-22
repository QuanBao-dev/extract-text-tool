const handleWordWrap = require("./handleWordWrap");

module.exports = function handleWordWrapGlue(
  contentList,
  maxNumberChars,
  lineBreakString,
  isAin
) {
  let translatedContentList = [];
  let temp2 = "";
  for (let i = 0; i < contentList.length; i++) {
    const v = contentList[i].trim();
    let text = "";
    let prefix = "";
    if (isAin) {
      text = v
        .replace(/m\[[0-9]+\] = "/g, "")
        .replace(/"$/g, "")
        .trim();
      prefix = v.match(/m\[[0-9]+\] = "/g);
    } else {
      prefix = [""];
      text = v;
    }
    const allSpecialCharacters = text.match(/[\.\?\!\)―♪”。…？]/g);
    const splittedSentences = text.split(/[\.\?\!\)―♪”。…？]/g);

    if (text.trim() === "@@") {
      translatedContentList.push(prefix[0] + "@@");
      continue;
    }
    if (text.trim() === "") {
      translatedContentList.push(prefix[0] + "");
      continue;
    }
    // translatedTextList.push(
    //   prefix[0] + (await translateSelectCenterTextList([text], 1, false))
    // );
    const prefixedText = text.match(/^["\(『「]/g)
      ? text.match(/^["\(『「]/g)[0]
      : "";
    let finalText =
      prefixedText + temp2 + text.trim().replace(/["\(『「]/g, "");
    temp2 = "";
    translatedContentList.push(
      prefix[0] +
        handleWordWrap(maxNumberChars, finalText, lineBreakString) +
        (isAin ? '"' : "")
    );
    if (
      ![".", "?", "!", ")", "―", "♪", "。", "”", "…", "？"].includes(
        text.replace(/[\"」』]/g, "")[text.replace(/[\"」』]/g, "").length - 1]
      )
    ) {
      const finalSentences = splittedSentences[
        splittedSentences.length - 1
      ].replace(/[\"」』]/g, "");
      if (splittedSentences.length === 1) continue;
      let textTemp = "";
      for (let i = 0; i < splittedSentences.length - 1; i++) {
        textTemp +=
          splittedSentences[i] +
          (allSpecialCharacters[i] ? allSpecialCharacters[i] : "");
      }
      translatedContentList[translatedContentList.length - 1] =
        prefix[0] +
        handleBracket(
          handleWordWrap(maxNumberChars, textTemp, lineBreakString)
        ) +
        (isAin ? '"' : "");
      temp2 = finalSentences.trim() + " ";
    } else {
      temp2 = "";
    }
  }
  return translatedContentList;
};

function handleBracket(text) {
  const listOfChoice = [
    `[…。♪:：〟！～『「」』？]`,
    "…",
    "(([『「」』])$)|(^([『「」』]))",
    "(^([『「」』]))",
    "(([『「」』])$)",
  ];
  let temp = text;
  if (
    text.trim().match(new RegExp(listOfChoice[3], "g")) &&
    !text.trim().match(new RegExp(listOfChoice[4], "g"))
  ) {
    if (text.trim().match(new RegExp(listOfChoice[3], "g"))[0] === "「")
      temp += "」";
    if (text.trim().match(new RegExp(listOfChoice[3], "g"))[0] === "『")
      temp += "』";
  }
  // if (
  //   text.trim().match(new RegExp(listOfChoice[4], "g")) &&
  //   !text.trim().match(new RegExp(listOfChoice[3], "g"))
  // ) {
  //   if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "」")
  //     temp = "「" + temp;
  //   if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "』")
  //     temp = "『" + temp;
  // }
  return temp;
}
