module.exports = function handleWordWrapGlue(
  contentList,
  maxNumberChars,
  lineBreakString
) {
  let translatedContentList = [];
  let temp2 = "";
  for (let i = 0; i < contentList.length; i++) {
    const v = contentList[i];
    // const text = v.replace(/m\[[0-9]+\] = "/g, "").replace(/"/g, "");
    // const prefix = v.match(/m\[[0-9]+\] = "/g);
    const prefix = [""];
    let text = v;
    const allSpecialCharacters = text.match(/[\.\?\!\)―♪\-]/g);
    const splittedSentences = text.split(/[\.\?\!\)―♪\-]/g);

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
    translatedContentList.push(
      prefix[0] + handleWordWrap(maxNumberChars, finalText, lineBreakString)
    );
    if (
      ![".", "?", "!", ")", "―", "♪", "*", "-"].includes(
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
        handleBracket(handleWordWrap(maxNumberChars, textTemp, lineBreakString));
      temp2 = finalSentences.trim() + " ";
    } else {
      temp2 = "";
    }
  }
  return translatedContentList;
};
