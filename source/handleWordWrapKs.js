const { ks, pinpoint, CUBE } = require("../setting.json");
const handleWordWrap = require("./handleWordWrap");

const containRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
// const containRegExpG = new RegExp(
//   ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
//   "g"
// );
// const containRegExpG2 = new RegExp(
//   ks.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
//   "g"
// );
const exceptRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
// const exceptRegExpG = new RegExp(
//   ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
//   "g"
// );
// const exceptRegExpG2 = new RegExp(
//   ks.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
//   "g"
// );

// const containTagNameRegExpI = new RegExp(
//   ks.translation.regExpToFilterSentenceContainTagName,
//   "i"
// );

function handleWordWrapKs(fileContent) {
  let blockList = fileContent.split("\n@Msgend\r\n").map((block) => {
    const stringList = block.split("\r\n");
    return stringList;
  });
  console.log(blockList);
  let contentsList = blockList.map((block) => {
    // if (!block[block.length - 1]) return [block[0]];
    const temp = handleWordWrap(
      53,
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
            block
              .map((text) => text.replace(/voice=".+"/g, ""))
              .slice(block.length - 2, block.length - 1)
              .join("\r\n") +
            "\r\n" +
            content
        );
      }
    });
  });
  return ans.join("\r\n@Msgend\r\n");
}

function handleWordWrapCUBE(fileContent) {
  // console.log(fileContent.split(/@Hitret id=[0-9]+/));
  // const footerList = fileContent.match(/@Hitret id=[0-9]+/g);
  let blockList = fileContent
    .split(/@Hitret id=[0-9]+/g)
    .map((block, index) => {
      const stringList = block.split("\n");
      return stringList;
    });
  let contentsList = blockList.map((block) => {
    if (block.length === 1) return [""];
    // if(!blockList[block.length - 2) return "";
    const temp = handleWordWrap(
      CUBE.wordWrap.maxCharPerLines,
      block[block.length - 2]
        .replace(/\[/g, "『")
        .replace(/\]/g, "』")
        .replace(/^\*/, "＊")
        .replace(/　/g, " "),
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
          block.slice(0, block.length - 2).join("\n") +
            "\n" +
            content +
            `\n@Hitret id=${count}`
        );
      } else {
        let temp = block.slice(block.length - 3, block.length - 2).join("\n");
        temp = temp.replace(/voice=[A-Z]+[0-9]+/g, "");
        ans.push("\n" + temp + "\n" + content + `\n@Hitret id=${count}`);
      }
    });
  });
  // console.log(
  //   blockList.map((block) => {
  //     // if (!block[block.length - 1]) return [block[0]];
  //     const temp = handleWordWrap(
  //       52,
  //       block[block.length - 2]
  //         .replace(/\[/g, "『")
  //         .replace(/\]/g, "』")
  //         .replace(/^\*/, "＊"),
  //       "[r]"
  //     ).split("[r]");
  //     return temp;
  //   })
  // );
  return ans.join("\n");
}

function handleWordWrapPoison(fileContent) {
  let blockList = fileContent.split("\n[Hitret]\r\n").map((block) => {
    const stringList = block.split("\r\n");
    // .reduce((ans,v) => {
    //   const temp = v.split("\n");
    //   ans.push(...temp)
    //   return ans;
    // },[]);
    return stringList;
  });
  // console.log(fileContent.split("\n[Hitret]\r\n"))
  let contentsList = blockList.map((block) => {
    // if (!block[block.length - 1]) return [block[0]];
    const temp = handleWordWrap(
      49,
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
}
function handleWordWrapHibikiWork(fileContent) {
  const textDataList = fileContent.split("\r\n*p").map((data) => {
    return data.split("\r\n").reduce((ans, v, index) => {
      if (
        !v.match(
          pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain
        ) &&
        v.trim() !== ""
      ) {
        let prefix = data.split("\r\n").slice(1, index).join("\r\n");
        prefix = prefix ? prefix + "\r\n" : "";
        const wordWrappedText = handleWordWrap(30, v, "[r]");
        const wordWrappedTextSplit = wordWrappedText.split("[r]");
        let i = 0;
        let temp = [];
        while (i < wordWrappedTextSplit.length) {
          isNpAdded = false;
          if (
            !wordWrappedTextSplit
              .slice(i, i + 3)
              .join("[r]")
              .includes("[np]")
          )
            isNpAdded = true;
          let text =
            prefix +
            wordWrappedTextSplit.slice(i, i + 3).join("[r]") +
            (isNpAdded ? "[np]" : "");
          if(i > 0){
            text = text.replace(/s=[0-9a-zA-Z]+/g,"")
          }
          temp.push(text);
          i += 3;
        }
        ans = temp.join("\r\n\r\n");
      }
      return ans;
    }, "");
  });
  let temp = "";
  const dataList = fileContent.split("\r\n*p").map((v, index) =>
    v
      .split("\r\n")
      .map((v, i) => {
        if (i === 0 && index !== 0) return "*p" + v;
        if (
          (!v.match(
            pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain
          ) &&
            v.trim() !== "") ||
          v.match(/@nm/g)
        ) {
          return "%$$";
        }
        return v;
      })
      .reduce((ans, curr) => {
        if (temp === curr) return ans;
        ans.push(curr);
        temp = curr;
        return ans;
      }, [])
  );
  const ans = dataList
    .map((data, index) => {
      return data
        .map((text) => {
          if (text === "%$$") {
            return textDataList[index];
          }
          return text;
        })
        .join("\r\n");
    })
    .join("\r\n");
  // console.log(textDataList)
  return ans;
}

function handleWordWrapLilith(fileContent) {
  // console.log(fileContent.split(/@Hitret id=[0-9]+/));
  // const footerList = fileContent.match(/@Hitret id=[0-9]+/g);
  let blockList = fileContent.split(/\n\*s/g).map((block, index) => {
    const stringList = block.split("\n");
    stringList[0] = "*s" + stringList[0];
    return stringList.map((v) => v.trim());
  });
  let contentList = blockList.map((stringList) => {
    const temp = (
      stringList.filter((rawText) => {
        return !(
          (rawText.trim().match(containRegExpI) &&
            !rawText.trim().match(exceptRegExpI)) ||
          rawText.trim() === ""
        );
      })[0] || ""
    ).split("[r]");
    let ans = [];
    let index = 0;
    do {
      const suffix = temp.join("[r]").match(/\[T_NEXT(.+)?\](\\)?/g);
      const text = temp.slice(index, index + 3).join("[r]");
      if (text.match(/\[T_NEXT(.+)?\](\\)?/g)) {
        ans.push(text);
      } else {
        ans.push(text + suffix);
      }
      index += 3;
    } while (index < temp.length);
    return ans;
  });
  console.log(contentList);
  let frameList = blockList.map((stringList) => {
    return stringList.map((rawText) => {
      if (
        !(
          (rawText.trim().match(containRegExpI) &&
            !rawText.trim().match(exceptRegExpI)) ||
          rawText.trim() === ""
        )
      ) {
        return "#@$4";
      }
      return rawText;
    });
  });
  const ans = frameList
    .map((arrayItem, index) => {
      let temp = [];
      contentList[index].forEach((content, index) => {
        if (index === 0) {
          temp.push(arrayItem.join("\n").replace("#@$4", content));
        } else {
          temp.push(
            arrayItem
              .filter((v) => {
                return (
                  !v.match(/\[VO vo=/g) &&
                  !v.match(/tf\.lastVoice/g) &&
                  !v.match(/\*Speak/g)
                );
              })
              .join("\n")
              .replace("#@$4", content)
          );
        }
      });
      return temp.join("\n");
    })
    .join("\n");
  // let contentsList = blockList.map((block) => {
  //   if (block.length===1) return [""];
  //   // if(!blockList[block.length - 2) return "";
  //   const temp = handleWordWrap(
  //     45,
  //     block[block.length - 2]
  //       .replace(/\[/g, "『")
  //       .replace(/\]/g, "』")
  //       .replace(/^\*/, "＊")
  //       .replace(/　/g, " "),
  //     "[r]"
  //   ).split("[r]");
  //   if (temp.slice(3).join("[r]") === "") return [temp.slice(0, 3).join("[r]")];
  //   return [temp.slice(0, 3).join("[r]"), temp.slice(3).join("[r]")];
  // });
  // let ans = [];
  // let count = 0;
  // contentsList.forEach((contents, index) => {
  //   contents.forEach((content, key) => {
  //     const block = blockList[index];
  //     count++;
  //     if (key === 0) {
  //       ans.push(
  //         block.slice(0, block.length - 2).join("\n") +
  //           "\n" +
  //           content +
  //           `\n@Hitret id=${count}`
  //       );
  //     } else {
  //       let temp = block.slice(block.length - 3, block.length - 2).join("\n");
  //       temp = temp.replace(/voice=[A-Z]+[0-9]+/g, "");
  //       ans.push("\n" + temp + "\n" + content + `\n@Hitret id=${count}`);
  //     }
  //   });
  // });
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
  return ans;
}
function handleWordWrapEAGLS(fileContent) {
  // EAGLS
  const textList = fileContent.split("\r\n");
  let count = 0;
  const filterTextList = textList
    .filter((text) => text.match(/^&/g))
    .map((text) => {
      const list = text
        .replace(/\(E\)/g, "(e)")
        .replace(/\:/g, "")
        .replace(/Name Suffix/g, "Gou")
        .replace(/NameSuffix/g, "Gou")
        .replace(/＃/g, '"#')
        .split("(e)");
      const temp = [];
      let i = 0;
      do {
        temp.push(
          "&" +
            count +
            (i > 0 ? '"' : "") +
            list
              .slice(i, i + 3)
              .map((text) => text.replace(/&[0-9]+/g, ""))
              .join("(e)")
        );
        i += 3;
        count += 1;
      } while (i < list.length);
      return temp.join('"\r\n');
    });
  let count2 = 0;

  const finalResult = textList
    .map((text) => {
      if (text.match(/^&/g) && !text.match(/^&_/g) && !text.match(/^&,/g)) {
        let temp = filterTextList[count2];
        count2++;
        return temp;
      }
      return text;
    })
    .join("\r\n");
  return finalResult;
}
module.exports = {
  handleWordWrapEAGLS,
  handleWordWrapCUBE,
  handleWordWrapPoison,
  handleWordWrapKs,
  handleWordWrapLilith,
  handleWordWrapHibikiWork,
};
