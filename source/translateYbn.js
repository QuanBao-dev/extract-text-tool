const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const delay = require("./delay");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");

(async () => {
  const listFileName = fs.readdirSync("./ybn");
  let start = 0;
  let numberAsync = 1;
  // console.log(
  //   await translateSelectCenterTextList([
  //     "「いえいえ。こうして収容されている私の口添えなど、微々たるものです。全て≪南保／なんぼ≫さんのお眼鏡に適った操様の実力ですわ」",
  //   ])
  // );
  // await delay(100000000);
  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              await translateFileYbn(`./ybn/${fileName}`, "utf8");
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

async function translateFileYbn(filePath, encoding) {
  const fileContent = await readFile(filePath, encoding);
  let isNewDialogue = false;
  const textList = fileContent.split("\r\n").reduce((ans, text) => {
    if (text === "") {
      ans.push("");
      return ans;
    }
    if (text === "    ") {
      ans.push("    ");
      return ans;
    }
    if (!text.match(/(^(<【))|(^(【))/g) && isNewDialogue === false) {
      ans.push(text);
      return ans;
    }
    if (
      text.match(/(^(<【))|(^(【))/g) ||
      [
        "初回通知を出す",
        "２回目以降通知を出さない",
        "ＯＰムービー初回",
        "ＯＰムービー２回目以降",
        "ＯＰムービー終了",
        "挿入歌初回",
        "挿入歌２回目以降",
        "挿入歌終了",
      ].includes(text) === true
    ) {
      isNewDialogue = true;
      ans.push(text);
    } else {
      for (let i = ans.length - 1; i > 0; i--) {
        if (ans[i] !== "    ") {
          ans[i] += " "+ text;
          break;
        }
      }
      ans.push("    ");
    }
    return ans;
  }, []);
  // const translatedTextList = await translateSelectCenterTextList(textList, 50);
  // let translatedTextList = textList.map((text) => text.replace(/\\r\\n/g," "))
  const translatedTextList = textList.reduce((ans, text, index) => {
    let i = index + 1;
    let count = 1;
    if (text === "    ") {
      return ans;
    }
    while (textList[i] === "    ") {
      i++;
      count++;
    }
    const wordWrappedTextList = handleWordWrap(143, text, "\n", count).split(
      "\n"
    );
    if (wordWrappedTextList.length !== count) {
      ans.push(
        ...wordWrappedTextList,
        ...Array.from(Array(count - wordWrappedTextList.length).keys()).map(
          () => "----"
        )
      );
      return ans;
    }
    ans.push(...wordWrappedTextList);
    return ans;
  }, []);
  await writeFile(filePath, translatedTextList.join("\r\n"), "utf8");
}
