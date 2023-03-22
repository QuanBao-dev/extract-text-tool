const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
(async () => {
  const listFileName = fs.readdirSync("./cst");
  let start = 0;
  let numberAsync = 1;
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "……仕事も終わったことだし、≪役所／ギルド≫に報告に行くブー"
  //     ],
  //     4,
  //     false,
  //     true,
  //     false,
  //     "cst"
  //   )
  // );
  // await delay(1000000);
  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              await translateFileCst(`./cst/${fileName}`);
            })
        );
        start += numberAsync;
        numberAsync = 1;
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

async function translateFileCst(filePath) {
  const fileContent = await readFile(filePath, "utf8");
  const dataList = JSON.parse(fileContent);
  const messageList = dataList.map(({ message }) =>
    message
      .replace(/( )?<[a-z A-Z0-9]+>( )?/g, "")
      .replace(/<\/r>/g, "")
      .replace(/<r.+>/g, "")
  );
  const nameList = dataList.map(({ name }) => name);
  const namesList = dataList.map(({ names }) => names);
  const translatedMessageList = await translateOfflineSugoiCt2LongList(
    messageList.map((message) => {
      const specialList = message.match(
        /\[[0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/]+\]/g
      );
      if (specialList)
        for (let i = 0; i < specialList.length; i++) {
          const special = specialList[i].split("/")[0];
          message = message.replace(specialList[i], special.replace("[", ""));
        }
      return message;
    }),
    3,
    false,
    true,
    false,
    "cst"
  );
  const translatedNameList = (
    await translateOfflineSugoiCt2LongList(
      nameList,
      1,
      false,
      false,
      false,
      "cst"
    )
  ).map((v) => (v ? v.replace(/\(/g, "（").replace(/\)/g, "）") : v));
  // const translatedNameList = nameList;
  const translatedNamesList = await translateOfflineSugoiCt2LongList(
    namesList,
    1,
    false,
    false,
    false,
    "cst"
  );
  // const translatedNamesList = namesList;
  const ans = translatedMessageList.reduce((result, translatedMessage, key) => {
    const name = translatedNameList[key];
    const names = translatedNamesList[key];
    const object = {};
    if (name) object.name = name;
    if (names) object.names = names;
    if (translatedMessage) object.message = translatedMessage;
    result.push(object);
    return result;
  }, []);
  // for (let i = 0; i < dataList.length; i++) {
  //   let { message, name } = dataList[i];
  //   let translatedName = translatedNameList[i];
  //   let translatedMessage = translatedMessageList[i];
  //   let object = {};
  //   if (message !== undefined) {
  //     const specialList = message.match(
  //       /\[[0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/]+\]/g
  //     );
  //     if (specialList)
  //       for (let i = 0; i < specialList.length; i++) {
  //         const special = specialList[i].split("/")[0];
  //         message = message.replace(specialList[i], special.replace("[", ""));
  //       }
  //     message = translatedMessage;
  //   }
  //   if (name !== undefined) name = translatedName.replace(/@/g, "＠");
  //   if (name !== undefined) object.name = name;
  //   if (message !== undefined) object.message = message;
  //   ans.push(object);
  //   console.log(`${i + 1}/${dataList.length}`);
  // }
  await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
}
