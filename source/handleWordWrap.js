// const { replaceTagName } = require("./translateJapanese");
module.exports = function handleWordWrap(
  maxNumberOfChar,
  text,
  lineBreakString = " ",
  limitBreak = 1000,
  priorityWordWrap
) {
  let count = 0;
  const rawMaxNumberOfChar = maxNumberOfChar;
  const tagName = text.match(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g)
    ? text.match(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g)[0]
    : "";
  text = text.replace(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g, "");
  if (text.trim() === "") return text;
  let prefix = text.replace(/\[plc\]/g, "").match(/^(	+)/g)
    ? text.match(/^(	+)/g)[0]
    : "";
  let filteredText = text
    .replace(
      new RegExp(lineBreakString.replace("[", "\\[").replace("]", "\\]"), "g"),
      " "
    )
    .replace(/é/g, "e")
    .replace(/ó/g, "o")
    .replace(/ +/g, " ")
    .replace(/\["text"\] = \{\[\[/g, "")
    .replace(/\]\]\},/g, "")
    .replace(/、/g, ", ")
    .replace(/&/g, "＆");
  // filteredText = replaceTagName(filteredText, [2], "g");
  // filteredText = replaceTagName(filteredText, [3], "gi");
  const words = filteredText.split(" ");
  let ans = "";
  let sum = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (priorityWordWrap) {
      maxNumberOfChar = priorityWordWrap;
    } else {
      maxNumberOfChar = rawMaxNumberOfChar;
    }
    sum += word.length + 1;
    if (sum <= maxNumberOfChar || count >= limitBreak - 1) {
      ans += word + " ";
    }
    if (sum > maxNumberOfChar && count < limitBreak - 1) {
      ans = ans.slice(0, ans.length - 1);
      sum = (word + " ").length;
      if (lineBreakString === " ") {
        lineBreakString = Array.from(
          Array(maxNumberOfChar - (ans.length - 1)).keys()
        )
          .map(() => " ")
          .join("");
      }
      ans += lineBreakString + word + " ";
      priorityWordWrap = undefined;
      count++;
    }
  }
  let finalResult = tagName + prefix + ans.slice(0, ans.length - 1);
  // .replace(/[“”]/g, '"')
  // .replace(/"/g, "”")
  // .replace(/^”/g, '"')
  // .replace(/”,$/g, '",');
  // .replace(/,( )?/g, "、")
  // .replace(/、/g, ", ");
  // if (finalResult.split(lineBreakString).length < limitBreak) {
  //   finalResult += Array.from(
  //     Array(limitBreak - finalResult.split(lineBreakString).length).keys()
  //   )
  //     .map(() => lineBreakString)
  //     .join("");
  // }
  // return `\t\t["text"] = {[[` + finalResult + `]]},`;
  return finalResult.replace(/\\k/g, "\\k\n");
};
