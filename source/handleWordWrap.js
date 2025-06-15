// const { replaceTagName } = require("./translateJapanese");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();

module.exports = function handleWordWrap(
  maxNumberOfChar,
  text,
  lineBreakString = " ",
  limitBreak = 1000,
  priorityWordWrap
) {
  // if (!text) return text.replace(/\\n/g, " ");
  try {
    let count = 0;
    const rawMaxNumberOfChar = maxNumberOfChar;
    // console.log(text)
    const rawLineBreakString = lineBreakString;
    // const tagName = text.match(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g)
    //   ? text.match(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g)[0]
    //   : "";
    // text = text
    //   .replace(/^((<)?【[a-zA-Z0-9\?\.!@#%\^&\*]+】(>)?)/g, "")
    //   .replace(/\(e\)/g, " ");
    if (text.trim() === "") return text;
    let prefix = text.replace(/\[plc\]/g, "").match(/^(	+)/g)
      ? text.match(/^(	+)/g)[0]
      : "";
    let filteredText = text
      .trim()
      // .replace(
      //   new RegExp(
      //     lineBreakString
      //       .replace("(", "\\(")
      //       .replace(")", "\\\\)")
      //       // .replace("\\", "\\\\")
      //       .replace("[", "\\[")
      //       .replace("]", "\\]"),
      //     "g"
      //   ),
      //   " "
      // )
      // .replace(/é/g, "e")
      // .replace(/ó/g, "o")
      // .replace(/ +/g, " ")
      // .replace(/\["text"\] = \{\[\[/g, "")
      // .replace(/\]\]\},/g, "")
      // .replace(/^\.\.\./g, "…");
      // .replace(/…/g, "... ")
      // .replace(/？/g, "? ")
      // .replace(/,( )?/g, "、")
      .replace(/、/g, ", ")
      .replace(/\.\.\.( )?/g, "... ");
    // .replace(/\\n/g, "")
    // .replace(/&/g, "＆")
    // .replace(/"/, "")
    // .replace(/。/g, ". ")
    // .replace(/’/g, "'")
    // .replace(/'/g, "’");
    // .replace(/[『』「」“”]/g, '"')
    // .replace(/[‘’]/g, "'");
    // .replace(/”」/g, "」")
    // .replace(/\(h\)/g, "");
    // filteredText = replaceTagName(filteredText, [2], "g");
    // filteredText = replaceTagName(filteredText, [3], "gi");
    const words = filteredText.split(" ");
    let ans = "";
    let sum = 0;
    let temp = 0;
    let count2 = 0;
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
        // lineBreakString += " ";
        if (rawLineBreakString === " ") lineBreakString = " ";
        if (lineBreakString === " ") {
          lineBreakString = Array.from(
            Array(maxNumberOfChar - (ans.length - 1 - temp)).keys()
          )
            .map(() => " ")
            .join("");
        }
        temp = (ans + lineBreakString).length;
        ans += lineBreakString + word + " ";
        priorityWordWrap = undefined;
        count++;
      }
    }
    let finalResult = ans;
    // tagName +
    // prefix + ans.slice(0, ans.length - 1)
    // .replace(/[“”]/g, '"')
    // .replace(/"/g, "”")
    // .replace(/^”/g, '"')
    // .replace(/”,$/g, '",');
    // .replace(/,( )?/g, "、")
    // .replace(/、/g, ", ");
    // if(!finalResult.match(/^[【『「（《》】』」）]/g)){
    //   finalResult = "　"+finalResult+"　"
    // }
    if (
      finalResult.split(lineBreakString).length < limitBreak &&
      limitBreak !== 1000
    ) {
      finalResult +=
        Array.from(
          Array(limitBreak - finalResult.split(lineBreakString).length).keys()
        )
          .map(() => lineBreakString)
          .join("") + "  ";
    }

    // return `\t\t["text"] = {[[` + finalResult + `]]},`;
    if (finalResult.split(" ").length === 1) return "　" + finalResult;
    return (
      finalResult
        // .replace(/( )+$/g, "");
        // .replace(/\\k/g, "\\k\n");
        // .replace(/,( )?/g, "、")
    );
    // .replace(/"、/g, "\",");
  } catch (error) {
    return text;
  }
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
    !text.trim().match(new RegExp(listOfChoice[3], "g")) &&
    text.trim().match(new RegExp(listOfChoice[4], "g"))
  ) {
    if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "」")
      temp = "「" + temp;
    if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "』")
      temp = "『" + temp;
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
