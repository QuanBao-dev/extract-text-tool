const { SLG } = require("../setting.json");
const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
let prefixIndent = "            ";
let breakText = "\\n";

(async () => {
  const listFileName = fs.readdirSync(SLG.translation.folderPath);
  let start = 0;
  let numberAsync = SLG.translation.numberOfFiles;

  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              // await fixTranslatedFileKs(
              //   `./ks/${fileName}`,
              //   `${ks.translation.folderPath}/${fileName}`,
              //   "shiftjis"
              // );
              await translateFileSLG2(
                `${SLG.translation.folderPath}/${fileName}`,
                SLG.translation.isSelects,
                SLG.translation.isTagName,
                SLG.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = SLG.translation.numberOfFiles;
      } while (start < listFileName.length);
      break;
    } catch (error) {
      console.log("Error:", error.message);
      await delay(10000);
      numberAsync--;
    }
  } while (numberAsync > 0);
  console.log("Done");
  await delay(10000000000);
})();
async function translateFileSLG2(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  const dataList = fileContent.split("#").map((v) => v.split("\r\n"));
  let isSeparate = false;
  let isMessage = false;
  const rawTextList = dataList
    .map((texts, i) =>
      texts
        .filter((v) => {
          if (v.match(/"\\n/g)) return true;
          return v.length > 0 && !v.match(/[a-zA-Z0-9\[\]\*]/g);
        })
        .reduce((ans, curr) => {
          if (dataList[i][0].includes("MESSAGE")) {
            isMessage = true;
          } else {
            isMessage = false;
          }
          if (dataList[i][0].includes("CHOICE")) {
            isSeparate = true;
          } else {
            isSeparate = false;
          }
          if (curr.includes(prefixIndent) && ans.length >= 1) {
            if (
              ans[ans.length - 1].includes(prefixIndent) &&
              isSeparate === false &&
              isMessage
            ) {
              ans[ans.length - 1] += curr.replace(/""\\n/g, "");
              ans[ans.length - 1] = ans[ans.length - 1]
                .replace(new RegExp("," + prefixIndent, "g"), "")
                .replace(/""\\n/g, "");
            } else ans.push(curr.replace(/""\\n/g, ""));
          } else {
            ans.push(curr.replace(/""\\n/g, ""));
          }
          return ans;
        }, [])
    )
    .filter((v) => v.length)
    .reduce((ans, v) => {
      return [...ans, ...v];
    }, []);
  let count = 0;

  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    3,
    false,
    true,
    false,
    "SLG"
  );
  const editedDataList = dataList.map((texts, i) => {
    return texts
      .map((text) => {
        if (text.match(/"\\n/g)) return "@#@";
        if (text.length > 0 && !text.match(/[a-zA-Z0-9\[\]\*]/g)) {
          return "#$%";
        }
        return text;
      })
      .reduce((ans, curr) => {
        if (dataList[i][0].includes("MESSAGE")) {
          isMessage = true;
        } else {
          isMessage = false;
        }
        if (dataList[i][0].includes("CHOICE")) {
          isSeparate = true;
        } else {
          isSeparate = false;
        }
        if (curr === "@#@") {
          ans.push(prefixIndent + '"",');
        } else if (curr === "#$%") {
          if (
            ans.length >= 1 &&
            ans[ans.length - 1].includes("#$%") &&
            isSeparate === false &&
            isMessage
          ) {
            ans[ans.length - 1] += curr;
            ans[ans.length - 1] = ans[ans.length - 1]
              .replace(new RegExp("," + prefixIndent, "g"), "")
              .replace(/(\#\$\%)+/g, "#$%");
          } else {
            ans.push(curr);
          }
        } else ans.push(curr);
        return ans;
      }, [])
      .map((text) => {
        if (text === "#$%") {
          const prefix = translatedTextList[count].match(/^( )+/g);
          return (
            (prefix ? prefix[0] : "") +
            (!dataList[i][0].includes("CHOICE")
              ? handleWordWrap(55, translatedTextList[count++], breakText)
              : translatedTextList[count++].trim())
          );
        }
        return text;
      })
      .join("\r\n");
  });
  const ans = editedDataList.join("#");
  await writeFile(filePath, ans, "shiftjis");
}

async function translateFileSLG(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  const dataList = fileContent.split("#").map((v) => v.split("\r\n"));
  let isSeparate = false;
  prefixIndent = "        ";
  breakText = `,\r\n${prefixIndent}`;
  // console.log(dataList);
  const rawTextList = dataList
    .map((texts, i) => {
      return texts
        .filter((v) => v.length > 0 && !v.match(/[a-zA-Z0-9\[\]\*]/g))
        .reduce((ans, curr) => {
          if (dataList[i][0].includes("CHOICE")) {
            isSeparate = true;
          } else {
            isSeparate = false;
          }
          if (curr.includes(prefixIndent) && ans.length >= 1) {
            if (
              ans[ans.length - 1].includes(prefixIndent) &&
              isSeparate === false
            ) {
              ans[ans.length - 1] += curr;
              ans[ans.length - 1] = ans[ans.length - 1].replace(
                new RegExp("," + prefixIndent, "g"),
                ""
              );
            } else ans.push(curr);
          } else {
            ans.push(curr);
          }
          return ans;
        }, []);
    })
    .filter((v) => v.length)
    .reduce((ans, v) => {
      return [...ans, ...v];
    }, []);
  let count = 0;
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    3,
    false,
    true,
    false,
    "SLG"
  );
  // const translatedTextList =
  //   rawTextList
  // console.log(translatedTextList)
  // console.log(translatedTextList);
  const editedDataList = dataList.map((texts, i) => {
    return texts
      .map((text) => {
        if (text.length > 0 && !text.match(/[a-zA-Z0-9\[\]\*]/g)) {
          return "#$%";
        }
        return text;
      })
      .reduce((ans, curr) => {
        if (dataList[i][0].includes("CHOICE")) {
          isSeparate = true;
        } else {
          isSeparate = false;
        }
        if (curr === "#$%") {
          if (
            ans.length >= 1 &&
            ans[ans.length - 1].includes("#$%") &&
            isSeparate === false
          ) {
            ans[ans.length - 1] += curr;
            ans[ans.length - 1] = ans[ans.length - 1]
              .replace(new RegExp("," + prefixIndent, "g"), "")
              .replace(/(\#\$\%)+/g, "#$%");
          } else {
            ans.push(curr);
          }
        } else ans.push(curr);
        return ans;
      }, [])
      .map((text) => {
        if (text === "#$%") {
          const prefix = translatedTextList[count].match(/^( )+/g);
          return (
            (prefix ? prefix[0] : "") +
            (!dataList[i][0].includes("CHOICE")
              ? handleWordWrap(55, translatedTextList[count++], breakText)
              : translatedTextList[count++].trim())
          );
        }
        return text;
      })
      .join("\r\n");
  });
  const ans = editedDataList.join("#");
  await writeFile(filePath, ans, "shiftjis");
}
//        ""
