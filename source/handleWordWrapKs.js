const { ks } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  ks.wordWrap.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);

// module.exports = function handleWordWrapKs(fileContent) {
//   let blockList = fileContent.split("\r\n[Hitret]\r\n").map((block) => {
//     const stringList = block.split("\r\n");
//     return stringList;
//   });
//   let contentsList = blockList.map((block) => {
//     // if (!block[block.length - 1]) return [block[0]];
//     const temp = handleWordWrap(
//       54,
//       block[block.length - 1]
//         .replace(/\[/g, "『")
//         .replace(/\]/g, "』")
//         .replace(/^\*/, "＊"),
//       "[r]"
//     ).split("[r]");
//     if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
//     return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
//   });
//   let ans = [];
//   contentsList.forEach((contents, index) => {
//     contents.forEach((content, key) => {
//       const block = blockList[index];
//       if (key === 0) {
//         ans.push(
//           block.slice(0, block.length - 1).join("\r\n") + "\r\n" + content
//         );
//       } else {
//         ans.push(
//           "\r\n" +
//             block.slice(block.length - 2, block.length - 1).join("\r\n") +
//             "\r\n" +
//             content
//         );
//       }
//     });
//   });
//   return ans.join("\r\n[Hitret]\r\n");
// };

module.exports = function handleWordWrapKs(fileContent) {
  // console.log(fileContent.split(/@Hitret id=[0-9]+/));
  // const footerList = fileContent.match(/@Hitret id=[0-9]+/g);
  let blockList = fileContent
    .split(/@Hitret id=[0-9]+/g)
    .map((block, index) => {
      const stringList = block.split("\r\n");
      return stringList;
    });

  // console.log(blockList);
  let contentsList = blockList.map((block) => {
    // if (!block[block.length - 1]) return [block[0]];
    const temp = handleWordWrap(
      45,
      block[block.length - 2]
        .replace(/\[/g, "『")
        .replace(/\]/g, "』")
        .replace(/^\*/, "＊"),
      "[r]"
    ).split("[r]");
    if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
    return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
  });
  let ans = [];
  let count = 0;
  contentsList.forEach((contents, index) => {
    contents.forEach((content, key) => {
      const block = blockList[index];
      count++;
      if (key === 0) {
        ans.push(
          block.slice(0, block.length - 2).join("\r\n") +
            "\r\n" +
            content +
            `\r\n@Hitret id=${count}`
        );
      } else {
        let temp = block.slice(block.length - 3, block.length - 2).join("\r\n");
        temp = temp.replace(/voice=[A-Z]+[0-9]+/g, "");
        ans.push("\r\n" + temp + "\r\n" + content + `\r\n@Hitret id=${count}`);
      }
    });
  });
  // console.log(
  //   blockList.map((block) => {
  //     // if (!block[block.length - 1]) return [block[0]];
  //     const temp = handleWordWrap(
  //       45,
  //       block[block.length - 2]
  //         .replace(/\[/g, "『")
  //         .replace(/\]/g, "』")
  //         .replace(/^\*/, "＊"),
  //       "[r]"
  //     ).split("[r]");
  //     return temp;
  //   })
  // );
  return ans.join("\r\n");
};
