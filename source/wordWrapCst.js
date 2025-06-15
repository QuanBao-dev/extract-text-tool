const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
const { nanoid } = require("nanoid");
const handleWordWrap = require("./handleWordWrap");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();

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
    let { message, name, names } = dataList[i];
    let object = {};
    if (name !== undefined) {
      // name = name.replace(/“/g, "【").replace(/”/g, "】");
      // name = "        " + name.replace(/"/g, "");
      name = name.replace(/"/g, "");
      // .split("/")[0]
      // .replace(/\./g, "")
      // // .replace(/“/g, "")
      // // .replace(/”/g, "")
      // // .replace(/m/g, "m ")
      // .replace(/M/g, "m")
      // .replace(/F/g, "f")
      // // .replace(/G/g, "G ")
      // // .replace(/w/g, "w ")
      // .replace(/W/g, "w")
      // .replace(/O/g, "o");
    }
    if (message !== undefined) {
      const rawMessage = message;
      // try {
      //   // message = "  "+message
      //   // message = handleWordWrap(50, message,"\r\n")
      //   // message = message
      //   //   .split("")
      //   //   .map((v) => {
      //   //     if (["m", "M","w","W"].includes(v)) return v + "  ";
      //   //     if (["’"].includes(v)) return "'";
      //   //     if (["、", "（","’","i","t"," ","l","f","j","\r","\n"].includes(v)) return v;
      //   //     return v + " ";
      //   //   })
      //   //   .join("");
      message = handleWordWrap(
        78,
        message.replace(/’/g,"'"),
        // .replace(/[『「]/g,"\"").replace(/[』」]/g,"\""),
        // .replace(/m/g, "m ")
        // .replace(/M/g, "M ")
        // .replace(/G/g, "G ")
        // .replace(/w/g, "w ")
        // .replace(/W/g, "W ")
        // .replace(/M/g, "m")
        // .replace(/F/g, "f")
        // .replace(/W/g, "w")
        // .replace(/O/g, "o"),
        // .replace(/( )?<[a-z A-Z0-9\-\/]+>( )?/g, "")
        // .replace(/<r/g, "")
        // .replace(/\>/g, "")
        // .replace(/<\/s/g, "")
        // .replace(/❛/g, "'")
        // .replace(/、/g, ", ")
        "\r\n"
        // name ? 72 - name.length - 2 : undefined
        // undefined
      ).replace(/＠/g, "＠　").trim();

      // if (message.split("\r\n").length >= 4) {
      //   message =
      //     "%XS14" +
      //     handleWordWrap(64, message.replace(/\r\n/g, " "), "\r\n");
      // }

      // .replace(/#/g, "＃")
      // .replace(/（/g, "(")
      // .replace(/）/g, ")")
      // .replace(/@/g, "＠");
      // .replace(/'/g,"’");
      // .replace(/m/g, "m ")
      // .replace(/M/g, "M ")
      // .replace(/G/g, "G ")
      // .replace(/w/g, "w ")
      // .replace(/W/g, "W ");
      // } catch (error) {
      //   message = rawMessage.replace(/#/g, "＃");
      // }

      // if (message.split("\r\n").length > 4) {
      //   // message = rawMessage.replace(/#/g, "＃");
      //   message = message.split("\r\n").slice(0,4).join("\r\n");
      // }
      // message +=
      //   (name ? "」" : "") +
      //   Array.from(Array(300).keys())
      //     .map((v) => "")
      //     .join(" ");

      // message = message
      //   .replace(/fs/g, "")
      //   .replace(/\\/g, "")
      //   .replace(/\:/g, "")
      //   .replace(/[\[\]]/g, "")
      //   .replace(/\$39;/g, "'")
      //   .replace(/'/g, "’");
      // if (!message.includes("pc")) {
      //   if (message.length > 30 || message.includes("[")) {
      //     const length = message
      //       .trim()
      //       .replace(/　/g, " ")
      //       .replace(/、/g, ", ")
      //       .split(" ").length;
      //     message =
      //       // "\\fs" +
      //       message
      //         .trim()
      //         .replace(/　/g, " ")
      //         .replace(/、/g, ", ")
      //         .split(" ")
      //         .map((v, index) => {
      //           // if (v === "") return v;
      //           if (v.includes("[") || v.includes("]")) {
      //             return v
      //               .trim()
      //               .replace(/fs/g, "")
      //               .replace(/\\/g, "")
      //               .replace(/\:/g, "")
      //               .replace(/[\[\]]/g, "")
      //               .replace(/\$39;/g, "'");
      //           }
      //           // return v;
      //           if (v === "") return v.replace(/\$39;/g, "'");
      //           if(length <= 17) return `\\fs[${v}]`.replace(/\$39;/g, "'");
      //           if(length >= 20) return `${v}`.replace(/\$39;/g, "'");
      //           return `\\fs[${v}]`.replace(/\$39;/g, "'");
      //           // if (index > 7 && index < length - 4) {
      //           // } else {
      //           //   return `${v}`.replace(/\$39;/g, "'");
      //           // }
      //         })
      //         .filter((v) => v !== "")
      //         .join(" ");
      //   }

      //   // if (name === undefined) {
      //   //   message = message
      //   //     .replace(/fs/g, "")
      //   //     .replace(/\\/g, "")
      //   //     .replace(/\:/g, "")
      //   //     .replace(/[\[\]]/g, "")
      //   //     .replace(/\$39;/g, "'");
      //   // }
      // }

      // message = message.replace(/'/g,"’")
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
    if (names !== undefined) object.names = names;
    if (message !== undefined) object.message = message;
    ans.push(object);
    console.log(`${i + 1}/${dataList.length}`);
  }
  await writeFile(filePath, JSON.stringify(ans, null, 2), "utf8");
}
