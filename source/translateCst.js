const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const {
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const delay = require("./delay");
(async () => {
  const listFileName = fs.readdirSync("./cst");
  let start = 0;
  let numberAsync = 1;
  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       "整った顔は、目を閉じているとどこか和風人形めいた美しさがある。",
  //       "ぁ…。",
  //       "〈真樹夫〉ぁ…。"
  //     ],
  //     4
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
    message.replace(/( )?<[a-z A-Z0-9]+>( )?/g, "")
  );
  const nameList = dataList.map(({ name }) => name);
  const translatedMessageList = await translateOfflineSugoiCt2LongList(
    messageList,
    2,
    false,
    true,
    true,
    "cst"
  );
  const translatedNameList = await translateOfflineSugoiCt2LongList(
    nameList,
    1,
    false,
    false,
    false,
    "cst"
  );
  const ans = translatedMessageList.reduce((result, translatedMessage, key) => {
    const name = translatedNameList[key];
    const object = {};
    if (name) object.name = name;
    if (translatedMessage) object.message = translatedMessage;
    result.push(object);
    return result;
  }, []);
  // for (let i = 0; i < dataList.length; i++) {
  //   let { message, name } = dataList[i];
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
  //     message = (
  //       await translateOfflineSugoiCt2LongList([message], 6, false, false, true)
  //     )[0];
  //   }
  //   if (name !== undefined)
  //     name = (
  //       await translateOfflineSugoiCt2LongList([name], 1, false, false)
  //     )[0].replace(/@/g, "＠");
  //   if (name !== undefined) object.name = name;
  //   if (message !== undefined) object.message = message;
  //   ans.push(object);
  //   console.log(`${i + 1}/${dataList.length}`);
  // }
  await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
}
