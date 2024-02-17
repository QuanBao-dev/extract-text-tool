const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
  translateJapaneseToEng,
} = require("./translateJapanese");
const delay = require("./delay");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const converter = new AFHConvert();

(async () => {
  const listFileName = fs.readdirSync("./cst");
  let start = 0;
  let numberAsync = 1;
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       // "雫のいら立ったタイミングを見計らったように現れたヴ[r]ォイドに、熱い正義の炎を[ruby text=ほとばし]迸らせる。",
  //       // "【浩輔】（仕事も終わったばっかだってのに、みんな元気だよなあ……）",
  //       // "「夜舟流着地術・参式――“<Rはごろもひとえ>羽衣一重</R>”」",
  //       "%C77FF「『おはようございます、兄さん。\r\n　　なんでもＣＦＣの会合があるとか。おめでとうございます』」\r\n"
  //     ],
  //     2,
  //     false,
  //     true,
  //     true,
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
  // const fileContentRaw = await readFile(filePath.replace(/cst_3/g,"cst_2"), "utf8");
  const dataList = JSON.parse(fileContent);
  // const dataListRaw = JSON.parse(fileContentRaw);
  const messageList = dataList.map(({ message }) =>
    message
      // .replace(/( )?<[a-z A-Z0-9]+>( )?/g, "")
      .replace(/<\/r>/g, "")
      .replace(/<r.+>/g, "")
  );
  const nameList = dataList.map(({ name }) => name);
  const namesList = dataList.map(({ names }) => names);
  const translatedNameList = (
    await translateSelectCenterTextList(nameList, 2, false, undefined, "srp")
  ).map((v) => (v ? v.replace(/\./g, "") : v));
  // const translatedNameList = nameList;
  const translatedNamesList = namesList;
  let translatedMessageList;
  // translatedMessageList = (
  //   await translateSelectCenterTextList(messageList, 2, false, undefined, "srp")
  // ).map((v) => (v ? v : v));
  // translatedMessageList = messageList;
  try {
    translatedMessageList = (
      await translateOfflineSugoiCt2LongList(
        messageList,
        // .map((message) => {
        //   if (!message) return message;
        //   const specialList = message.match(
        //     /[≪\[]][0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/／]+[≫\]]/g
        //   );
        //   if (specialList)
        //     for (let i = 0; i < specialList.length; i++) {
        //       const special = specialList[i].split(/[／/]/)[0];
        //       message = message.replace(
        //         specialList[i],
        //         special.replace(/[≪\[]/, "")
        //       );
        //     }
        //   return message;
        // })
        3,
        false,
        true,
        false,
        "cst-special"
      )
    ).map((v) => (v ? v.replace(/\(/g, "（").replace(/\)/g, "）") : v));
    // translatedMessageList = messageList
    // const translatedNamesList = namesList;
  } catch (error) {
    translatedMessageList = (
      await translateOfflineSugoiCt2LongList(
        messageList,
        // .map((message) => {
        //   if (!message) return message;
        //   const specialList = message.match(
        //     /≪[0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/／]+≫/g
        //   );
        //   if (specialList)
        //     for (let i = 0; i < specialList.length; i++) {
        //       const special = specialList[i].split("／")[0];
        //       message = message.replace(
        //         specialList[i],
        //         special.replace("≪", "")
        //       );
        //     }
        //   return message;
        // })
        2,
        false,
        true,
        true,
        "cst"
      )
    ).map((v) => (v ? v.replace(/\(/g, "（").replace(/\)/g, "）") : v));
  }
  // for(let i = 0; i < translatedMessageList.length;i++){
  //   console.log(translatedMessageList[i])
  //   translatedMessageList[i] = await translateJapaneseToEng(
  //     translatedMessageList[i].replace(/、/g,", ").replace(/’/g,"'"),
  //     false,
  //     3,
  //     10
  //   )
  //   console.log(translatedMessageList[i])
  //   console.log("-----------------")
  // }
  const ans = translatedMessageList.reduce((result, translatedMessage, key) => {
    const name = translatedNameList[key];
    const names = translatedNamesList[key];
    const object = {};
    if (name) object.name = name;
    if (names) object.names = names;
    if (translatedMessage !== undefined) object.message = translatedMessage;
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
