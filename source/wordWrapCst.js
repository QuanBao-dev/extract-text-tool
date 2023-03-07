const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
const { nanoid } = require("nanoid");
const handleWordWrap = require("./handleWordWrap");
(async () => {
  const listFileName = fs.readdirSync("./cst_output");
  let start = 0;
  let numberAsync = 1;
  // console.log(await translateOfflineSugoiCt2LongList([
  //   "和倉 賢一",
  //   "氷見山 玲",
  //   "黒姫 結灯",
  //   "蔦町 ちとせ"
  // ]))
  // await delay(100000)
  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              await translateFileCst(`./cst_output/${fileName}`);
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
let downChars = 0;
async function translateFileCst(filePath) {
  const fileContent = await readFile(filePath, "utf8");
  const dataList = JSON.parse(fileContent);
  const ans = [];
  const listOfChoice = ["(^([『「」』]))", "(([『「」』])$)"];
  for (let i = 0; i < dataList.length; i++) {
    let { message, name } = dataList[i];
    let object = {};
    if (message !== undefined) {
      message = handleWordWrap(
        50,
        message
          // .replace(/( )?<[a-z A-Z0-9\-\/]+>( )?/g, "")
          // .replace(/<r/g, "")
          // .replace(/\>/g, "")
          // .replace(/<\/s/g, "")
          .replace(/❛/g, "'").replace(/、/g,", "),
        "\r\n"
      );

      // const specialList = message.match(
      //   /\[[0-9一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆、　『「！」』“”。●・♡＝…：＄αβ%％●＜＞&A-Z←→↓↑\/]+\]/g
      // );
      // if (specialList)
      //   for (let i = 0; i < specialList.length; i++) {
      //     const special = specialList[i].split("/")[0];
      //     message = message.replace(specialList[i], special.replace("[", ""));
      //   }
      // if (message.length < 55 * 3) {
      //   message = handleWordWrap(
      //     55,
      //     message,
      //     "\r\n",
      //     3,
      //     downChars !== 0 ? 55 - downChars : undefined
      //   );
      // } else {
      //   message = handleWordWrap(60, message, "\r\n", 3);
      // }
      // if (!message.match(listOfChoice[1]) && message.match(listOfChoice[0])) {
      //   downChars =
      //     message.split("\r\n")[message.split("\r\n").length - 1].length;
      // } else {
      //   downChars = 0;
      // }
    }
    if (name !== undefined) object.name = name;
    if (message !== undefined) object.message = message;
    ans.push(object);
    console.log(`${i + 1}/${dataList.length}`);
  }
  await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
}
