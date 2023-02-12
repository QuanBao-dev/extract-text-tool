const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  ks.translation.regExpToFilterSentenceContainTagName,
  "i"
);

module.exports = function handleWordWrapKs(fileContent) {
  let blockList = fileContent.split("\r\n[Hitret]\r\n").map((block) => {
    const stringList = block.split("\r\n");
    return stringList;
  });
  let contentsList = blockList.map((block) => {
    // if (!block[block.length - 1]) return [block[0]];
    const temp = handleWordWrap(
      50,
      block[block.length - 1]
        .replace(/\[/g, "『")
        .replace(/\]/g, "』")
        .replace(/^\*/, "＊"),
      "[r]"
    ).split("[r]");
    if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
    return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
  });
  
  let ans = [];
  contentsList.forEach((contents, index) => {
    contents.forEach((content, key) => {
      const block = blockList[index];
      if (key === 0) {
        ans.push(
          block.slice(0, block.length - 1).join("\r\n") + "\r\n" + content
        );
      } else {
        ans.push(
          "\r\n" +
            block.slice(block.length - 2, block.length - 1).join("\r\n") +
            "\r\n" +
            content
        );
      }
    });
  });
  return ans.join("\r\n[Hitret]\r\n");
};

// module.exports = function handleWordWrapKs(fileContent) {
//   // console.log(fileContent.split(/@Hitret id=[0-9]+/));
//   // const footerList = fileContent.match(/@Hitret id=[0-9]+/g);
//   let blockList = fileContent
//     .split(/@Hitret id=[0-9]+/g)
//     .map((block, index) => {
//       const stringList = block.split("\n");
//       return stringList;
//     });
//   let contentsList = blockList.map((block) => {
//     if (block.length===1) return [""];
//     // if(!blockList[block.length - 2) return "";
//     const temp = handleWordWrap(
//       45,
//       block[block.length - 2]
//         .replace(/\[/g, "『")
//         .replace(/\]/g, "』")
//         .replace(/^\*/, "＊")
//         .replace(/　/g, " "),
//       "[r]"
//     ).split("[r]");
//     if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
//     return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
//   });
//   let ans = [];
//   let count = 0;
//   contentsList.forEach((contents, index) => {
//     contents.forEach((content, key) => {
//       const block = blockList[index];
//       count++;
//       if (key === 0) {
//         ans.push(
//           block.slice(0, block.length - 2).join("\n") +
//             "\n" +
//             content +
//             `\n@Hitret id=${count}`
//         );
//       } else {
//         let temp = block.slice(block.length - 3, block.length - 2).join("\n");
//         temp = temp.replace(/voice=[A-Z]+[0-9]+/g, "");
//         ans.push("\n" + temp + "\n" + content + `\n@Hitret id=${count}`);
//       }
//     });
//   });
//   // console.log(
//   //   blockList.map((block) => {
//   //     // if (!block[block.length - 1]) return [block[0]];
//   //     const temp = handleWordWrap(
//   //       45,
//   //       block[block.length - 2]
//   //         .replace(/\[/g, "『")
//   //         .replace(/\]/g, "』")
//   //         .replace(/^\*/, "＊"),
//   //       "[r]"
//   //     ).split("[r]");
//   //     return temp;
//   //   })
//   // );
//   return ans.join("\n");
// };
// module.exports = function handleWordWrapKs(fileContent) {
//   // console.log(fileContent.split(/@Hitret id=[0-9]+/));
//   // const footerList = fileContent.match(/@Hitret id=[0-9]+/g);
//   let blockList = fileContent.split(/\n\*s/g).map((block, index) => {
//     const stringList = block.split("\n");
//     stringList[0] = "*s" + stringList[0];
//     return stringList.map((v) => v.trim());
//   });
//   let contentList = blockList.map((stringList) => {
//     const temp = (
//       stringList.filter((rawText) => {
//         return !(
//           (rawText.trim().match(containRegExpI) &&
//             !rawText.trim().match(exceptRegExpI)) ||
//           rawText.trim() === ""
//         );
//       })[0] || ""
//     ).split("[r]");
//     let ans = [];
//     let index = 0;
//     do {
//       const suffix = temp.join("[r]").match(/\[T_NEXT(.+)?\]\\/g);
//       const text = temp.slice(index, index + 3).join("[r]");
//       if (text.match(/\[T_NEXT(.+)?\]\\/g)) {
//         ans.push(text);
//       } else {
//         ans.push(text + suffix);
//       }
//       index += 3;
//     } while (index < temp.length);
//     return ans;
//   });
//   console.log(contentList)
//   let frameList = blockList.map((stringList) => {
//     return stringList.map((rawText) => {
//       if (
//         !(
//           (rawText.trim().match(containRegExpI) &&
//             !rawText.trim().match(exceptRegExpI)) ||
//           rawText.trim() === ""
//         )
//       ) {
//         return "#@$4";
//       }
//       return rawText;
//     });
//   });
//   const ans = frameList
//     .map((arrayItem, index) => {
//       let temp = [];
//       contentList[index].forEach((content, index) => {
//         if (index === 0) {
//           temp.push(arrayItem.join("\n").replace("#@$4", content));
//         } else {
//           temp.push(
//             arrayItem
//               .filter((v) => {
//                 return !v.match(/\[VO vo=/g);
//               })
//               .join("\n")
//               .replace("#@$4", content)
//           );
//         }
//       });
//       return temp.join("\n");
//     })
//     .join("\n");
//   // let contentsList = blockList.map((block) => {
//   //   if (block.length===1) return [""];
//   //   // if(!blockList[block.length - 2) return "";
//   //   const temp = handleWordWrap(
//   //     45,
//   //     block[block.length - 2]
//   //       .replace(/\[/g, "『")
//   //       .replace(/\]/g, "』")
//   //       .replace(/^\*/, "＊")
//   //       .replace(/　/g, " "),
//   //     "[r]"
//   //   ).split("[r]");
//   //   if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
//   //   return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
//   // });
//   // let ans = [];
//   // let count = 0;
//   // contentsList.forEach((contents, index) => {
//   //   contents.forEach((content, key) => {
//   //     const block = blockList[index];
//   //     count++;
//   //     if (key === 0) {
//   //       ans.push(
//   //         block.slice(0, block.length - 2).join("\n") +
//   //           "\n" +
//   //           content +
//   //           `\n@Hitret id=${count}`
//   //       );
//   //     } else {
//   //       let temp = block.slice(block.length - 3, block.length - 2).join("\n");
//   //       temp = temp.replace(/voice=[A-Z]+[0-9]+/g, "");
//   //       ans.push("\n" + temp + "\n" + content + `\n@Hitret id=${count}`);
//   //     }
//   //   });
//   // });
//   // console.log(
//   //   blockList.map((block) => {
//   //     // if (!block[block.length - 1]) return [block[0]];
//   //     const temp = handleWordWrap(
//   //       45,
//   //       block[block.length - 2]
//   //         .replace(/\[/g, "『")
//   //         .replace(/\]/g, "』")
//   //         .replace(/^\*/, "＊"),
//   //       "[r]"
//   //     ).split("[r]");
//   //     return temp;
//   //   })
//   // );
//   return ans;
// };
// module.exports = function handleWordWrapKs(fileContent) {
//   // EAGLS
//   const textList = fileContent.split("\r\n");
//   let count = 0;
//   const filterTextList = textList
//     .filter((text) => text.match(/^&/g))
//     .map((text) => {
//       const list = text.replace(/\(E\)/g,"(e)").split("(e)");
//       const temp = [];
//       let i = 0;
//       do {
//         temp.push(
//           "&" +
//             count +
//             (i > 0 ? '"' : "") +
//             list
//               .slice(i, i + 3)
//               .map((text) => text.replace(/&[0-9]+/g, ""))
//               .join("(e)")
//         );
//         i += 3;
//         count += 1;
//       } while (i < list.length);
//       return temp.join('"\r\n');
//     });
//   let count2 = 0;

//   const finalResult = textList
//     .map((text) => {
//       if (text.match(/^&/g)) {
//         let temp = filterTextList[count2];
//         count2++;
//         return temp;
//       }
//       return text;
//     })
//     .join("\r\n");
//   return finalResult;
// };
