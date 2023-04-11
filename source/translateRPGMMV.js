const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateSelectCenterTextList,
  translateOfflineSugoiCt2LongList,
  translateJapaneseWithOpenai,
} = require("./translateJapanese");
const { rpgmmv } = require("../setting.json");
const delay = require("./delay");
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  const listFileName = fs.readdirSync(rpgmmv.translation.folderPath);
  let start = 0;
  let numberAsync = rpgmmv.translation.numberOfFiles;
  // console.log(await translateJapaneseWithOpenai())

  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       "うなさか　MP \\V[15]/\\V[16]",
  //       "薬草を使って、HPを５回復した！",
  //       "\\P[1]のHPが 5 回復した！",
  //     ],
  //     2,
  //     false,
  //     rpgmmv,
  //     "srp"
  //   )
  // );
  // await delay(10000000);
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
              await translateFileRPGMMV(
                `${rpgmmv.translation.folderPath}/${fileName}`,
                rpgmmv.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = rpgmmv.translation.numberOfFiles;
      } while (start < listFileName.length);
      break;
    } catch (error) {
      console.log("Error:", error.message);
      await delay(10000);
      numberAsync--;
    }
  } while (numberAsync > 0);
  console.log("Done");
  await delay(10000000);
})();
let objectCount = {};
const dataBracketList = [
  ["「", "」"],
  ["『", "』"],
  ["（", "）"],
  ["【", "】"],
  ["{", "}"],
];
async function translateFileRPGMMV(filePath, encoding) {
  const fileContent = await readFile(filePath, encoding);
  objectCount = {};
  console.time(filePath);
  const dataJson = JSON.parse(fileContent);
  if (rpgmmv.translation.isMenu) {
    if (!dataJson.length) {
      const switches = await translateOfflineSugoiCt2LongList(
        dataJson.switches,
        2,
        false,
        true,
        false,
        "rpgmmv"
      );
      const variables = await translateOfflineSugoiCt2LongList(
        dataJson.variables,
        2,
        false,
        true,
        false,
        "rpgmmv"
      );
      dataJson.switches = switches;
      dataJson.variables = variables;
      return await writeFile(
        filePath,
        JSON.stringify(dataJson, null, 2),
        "utf8"
      );
    }
    const dataNameList = await translateOfflineSugoiCt2LongList(
      dataJson.reduce((acc, v) => {
        if (!v) return acc;
        acc.push(v.name);
        return acc;
      }, []),
      2,
      false,
      true,
      false,
      "rpgmmv"
    );
    const dataProfileList = await translateOfflineSugoiCt2LongList(
      dataJson.reduce((acc, v) => {
        if (!v) return acc;
        acc.push(v.profile);
        return acc;
      }, []),
      2,
      false,
      true,
      false,
      "rpgmmv"
    );
    const dataDescriptionList = await translateOfflineSugoiCt2LongList(
      dataJson.reduce((acc, v) => {
        if (!v) return acc;
        acc.push(v.description);
        return acc;
      }, []),
      2,
      false,
      true,
      false,
      "rpgmmv"
    );
    const dataMessage1List = await translateOfflineSugoiCt2LongList(
      dataJson.reduce((acc, v) => {
        if (!v) return acc;
        acc.push(v.message1);
        return acc;
      }, []),
      2,
      false,
      true,
      false,
      "rpgmmv"
    );
    const dataMessage2List = await translateOfflineSugoiCt2LongList(
      dataJson.reduce((acc, v) => {
        if (!v) return acc;
        acc.push(v.message2);
        return acc;
      }, []),
      2,
      false,
      true,
      false,
      "rpgmmv"
    );

    const ans = dataJson.map((v, index) => {
      if (!v) return null;
      return {
        ...v,
        name: dataNameList[index - 1],
        profile: dataProfileList[index - 1],
        description: dataDescriptionList[index - 1],
        message1: dataMessage1List[index - 1],
        message2: dataMessage2List[index - 1],
      };
    });
    return await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
  }
  if (rpgmmv.translation.isMenu2) {
    let ans = [];
    const regExp = new RegExp(
      "(var )|(Utils\\.isNwjs)|(switch \\()|(exec\\()|(default:)|('win32')|(break;)|(} else {)|(    })|(_)|(□)",
      "g"
    );
    let pages = dataJson.slice(1);
    // ["", 0, 1, 2] ["", 0, 0, 2] ["", 0, 1, 1] ["",0,1,0]
    const specialArray = ["*", "*&"];
    let ans2 = [];
    pages = pages.map((page) => {
      return {
        ...page,
        list: page.list.map((v) => {
          if (!v.parameters) return v;
          ans2.push(v);
          ans.push([...v.parameters]);
          return v;
        }),
      };
    });
    let rawTextsList = [];
    let isDialogue = false;
    let count = 0;
    let saveIndex = 0;
    if (rpgmmv.translation.isSelect) {
      ans2 = ans2.map((data) => {
        if (data.code === 102) {
          rawTextsList.push(data.parameters[0]);
        }
        return data;
      });
      let ans3 = [];
      for (let i = 0; i < rawTextsList.length; i++) {
        const rawTexts = rawTextsList[i];
        const translatedTextsList = await translateSelectCenterTextList(
          rawTexts,
          1,
          false,
          rpgmmv,
          "srp"
        );
        ans3.push(translatedTextsList);
      }
      let count = 0;
      pages = pages.map((page) => {
        return {
          ...page,
          list: page.list.map((v) => {
            if (v.code === 102) {
              v.parameters[0] = ans3[count++];
            }
            return v;
          }),
        };
      });
    } else {
      ans = ans.map((parameters, index) => {
        if (isDialogue) {
          if (parameters.length === 1 && typeof parameters[0] === "string") {
            count++;
            if (parameters[0].includes("$") || parameters[0].match(regExp)) {
              return parameters;
            }
            if (count === 1) {
              saveIndex = index;
              rawTextsList.push(parameters[0]);
              return parameters;
            } else {
              ans[saveIndex][0] += parameters[0];
              if (
                !parameters[0].includes("$") &&
                !parameters[0].match(regExp)
              ) {
                rawTextsList[rawTextsList.length - 1] += parameters[0];
              }
              return [""];
            }
          } else {
            isDialogue = false;
            count = 0;
          }
        }
        if (compareParameters(parameters, specialArray)) {
          isDialogue = true;
          count = 0;
        }
        return parameters;
      });
      const translatedTextList = await translateOfflineSugoiCt2LongList(
        rawTextsList,
        2,
        false,
        true,
        false,
        "rpgmmv"
      );
      // const translatedTextList = await translateSelectCenterTextList(
      //   rawTextsList,
      //   2,
      //   false,
      //   rpgmmv,
      //   "srp"
      // );
      isDialogue = false;
      count = 0;
      let count2 = 0;
      pages = pages.map((page) => {
        return {
          ...page,
          list: page.list.reduce((acc, v) => {
            if (!v.parameters) {
              acc.push(v);
              return acc;
            }
            const parameters = v.parameters;
            if (isDialogue) {
              if (
                parameters.length === 1 &&
                typeof parameters[0] === "string"
              ) {
                count++;
                if (
                  parameters[0].includes("$") ||
                  parameters[0].match(regExp)
                ) {
                  acc.push(v);
                  return acc;
                }
                if (count === 1) {
                  acc.push({
                    ...v,
                    parameters: [translatedTextList[count2++]],
                  });
                  return acc;
                } else {
                  // count2++;
                  return acc;
                }
              } else {
                isDialogue = false;
                count = 0;
              }
            }
            if (compareParameters(parameters, specialArray)) {
              isDialogue = true;
              count = 0;
            }
            acc.push(v);
            return acc;
          }, []),
        };
      });
    }
    return await writeFile(
      filePath,
      JSON.stringify([null, ...pages], null, 2),
      "utf8"
    );
  }
  //////////////////////////////////
  const events = dataJson.events;
  const regExp = new RegExp(
    "(var )|(Utils\\.isNwjs)|(switch \\()|(exec\\()|(default:)|('win32')|(break;)|(} else {)|(    })|(_)|(□)",
    "g"
  );

  // ["", 0, 1, 2] ["", 0, 0, 2] ["", 0, 1, 1] ["",0,1,0] ["", 0, 0, 2]
  const specialArray = ["*", "*&"];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event === null) continue;
    let ans = [];
    let ans2 = [];
    event.pages = event.pages.map((page) => {
      return {
        ...page,
        list: page.list.map((v) => {
          if (!v.parameters) return v;
          ans2.push(v);
          ans.push([...v.parameters]);
          return v;
        }),
      };
    });
    let rawTextsList = [];
    let isDialogue = false;
    let count = 0;
    let saveIndex = 0;
    if (rpgmmv.translation.isSelect) {
      ans2 = ans2.map((data) => {
        if (data.code === 102) {
          rawTextsList.push(data.parameters[0]);
        }
        return data;
      });
      let ans3 = [];
      for (let i = 0; i < rawTextsList.length; i++) {
        const rawTexts = rawTextsList[i];
        const translatedTextsList = await translateOfflineSugoiCt2LongList(
          rawTexts,
          2,
          false,
          true,
          false,
          "rpgmmv"
        );
        ans3.push(translatedTextsList);
      }
      let count = 0;
      event.pages = event.pages.map((page) => {
        return {
          ...page,
          list: page.list.map((v) => {
            if (v.code === 102) {
              v.parameters[0] = ans3[count++];
            }
            return v;
          }),
        };
      });
    } else {
      ans = ans.map((parameters, index) => {
        if (isDialogue) {
          if (parameters.length === 1 && typeof parameters[0] === "string") {
            count++;
            if (parameters[0].includes("$") || parameters[0].match(regExp)) {
              return parameters;
            }
            if (count === 1) {
              saveIndex = index;
              rawTextsList.push(parameters[0]);
              return parameters;
            } else {
              ans[saveIndex][0] += parameters[0];
              if (
                !parameters[0].includes("$") &&
                !parameters[0].match(regExp)
              ) {
                rawTextsList[rawTextsList.length - 1] += parameters[0];
              }
              return [""];
            }
          } else {
            isDialogue = false;
            count = 0;
          }
        }
        if (compareParameters(parameters, specialArray)) {
          isDialogue = true;
          count = 0;
        }
        return parameters;
      });
      const translatedTextList = await translateOfflineSugoiCt2LongList(
        rawTextsList,
        2,
        false,
        true,
        true,
        "rpgmmv"
      );
      // const translatedTextList = await translateSelectCenterTextList(
      //   rawTextsList,
      //   2,
      //   false,
      //   rpgmmv,
      //   "srp"
      // );
      isDialogue = false;
      count = 0;
      let count2 = 0;
      event.pages = event.pages.map((page) => {
        return {
          ...page,
          list: page.list.reduce((acc, v) => {
            if (!v.parameters) {
              acc.push(v);
              return acc;
            }
            const parameters = v.parameters;
            if (isDialogue) {
              if (
                parameters.length === 1 &&
                typeof parameters[0] === "string"
              ) {
                count++;
                if (
                  parameters[0].includes("$") ||
                  parameters[0].match(regExp)
                ) {
                  acc.push(v);
                  return acc;
                }
                if (count === 1) {
                  acc.push({
                    ...v,
                    parameters: [translatedTextList[count2++]],
                  });
                  return acc;
                } else {
                  // count2++;
                  return acc;
                }
              } else {
                isDialogue = false;
                count = 0;
              }
            }
            if (compareParameters(parameters, specialArray)) {
              isDialogue = true;
              count = 0;
            }
            acc.push(v);
            return acc;
          }, []),
        };
      });
    }
  }
  await writeFile(filePath, JSON.stringify(dataJson, null, 2), "utf8");
}

function compareParameters(parameter1, parameter2) {
  const temp1 = parameter1.map((v) => {
    if (v && v.length && typeof v !== "string") {
      return v.length;
    }
    return v;
  });
  const temp2 = parameter2.map((v, index) => {
    if (v && v.length && typeof v !== "string") {
      return v.length;
    }
    if (v === "*" && typeof temp1[index] === "string") {
      return temp1[index];
    }
    if (v === "*&" && typeof temp1[index] === "number") {
      return temp1[index];
    }
    return v;
  });
  for (let i = 0; i < parameter2.length; i++) {
    if (temp1[i] !== temp2[i]) {
      return false;
    }
  }
  return true;
}
