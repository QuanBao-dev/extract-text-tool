const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
} = require("./translateJapanese");
const { bsxx } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");

(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "緑野の瑞風…Shaonが使う回復系の天眷。対象１体を回復する。怪我をしてない対象に、この天眷をかけると生命力が溢れ各能力が上昇する。",
  //       "「かおるこ先輩とは上手くいってるんでしょうね？　もし悲しませたりしていたら承知しないわよ」",
  //       "「心配しなくても大丈夫だって。そもそも桜木はかおることしょっちゅう会って話してるんじゃないのか？」",
  //       "「かおることか呼ばないで。イラッとくるから」",
  //       "少なくともこの俺……\n\A\Bはそう思っている。"
  //     ],
  //     2,
  //     undefined,
  //     true,
  //     true,
  //     "srp"
  //   )
  // );
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "　　ドクンッ……！　ドクッ、ドクッ、ドクッ……",
  //       "「あっ　あんっ、いいっ？",
  //       "　熱いのが子宮に流れ込んでくるっ",
  //       "　ああ……あはぁああああっ」",
  //       `「 How is it, Mom? Does it feel good?      」`,
  //       "「ぁっ……ぉっ、ぉぅ……♥　ぶ、ぐ……ぐぇ……ぇ、ぇぇ……♥",
  //       "「\\A\\B君、\n　ちょっといいかしら？」"
  //     ],
  //     3,
  //     false,
  //     true,
  //     true
  //   )
  // );
  // await delay(10000000);

  try {
    const listFileName = fs.readdirSync(bsxx.translation.folderPath);
    for (let i = 0; i < listFileName.length; i++) {
      await translateFileBsxx(
        bsxx.translation.folderPath + "/" + listFileName[i]
      );
    }
  } catch (error) {
    console.log(error);
  }
  await delay(10000000);
})();

async function translateFileBsxx(filePath) {
  const text = await readFile(filePath, "utf8");
  console.log(filePath);
  const dataList = text.split("\r\n");
  let contentText = dataList.map((text) => {
    return removeThePrefix(text);
  });
  console.time(filePath);
  const prefixList = dataList.map((text) => {
    return extractThePrefix(text);
  });
  // return retranslatedSpecificLines();
  let temp = "";
  // const narrowedContentText = await translateOfflineSugoiCt2LongList(
  //   contentText.reduce((ans, curr) => {
  //     if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
  //       ans.push(curr.replace(/\\n/g, "").replace(//g, "♥"));
  //     }
  //     temp = curr;
  //     return ans;
  //   }, []),
  //   bsxx.translation.numberOfSentences,
  //   undefined,
  //   true,
  //   true
  // );
  const narrowedContentText = await translateOfflineSugoiCt2LongList(
    contentText.reduce((ans, curr) => {
      if (temp !== curr && curr !== "" && !curr.match(/\/\//g)) {
        ans.push(curr.replace(/\\n/g, "")
        // .replace(//g, "♥")
        );
      }
      temp = curr;
      return ans;
    }, []),
    bsxx.translation.numberOfSentences,
    false,
    true,
    true,
    "srp"
  );
  const translatedContentText = narrowedContentText.reduce((ans, curr) => {
    ans.push(
      curr
        .replace(/『“/g, "『")
        .replace(/”』/g, "』")
        .replace(/『+/g, "『")
        .replace(/』+/g, "』")
        .replace(/\u275b/g, "")
        .replace(/\xe9/g, "e")
        .replace(/\u2013/g, "-")
        .replace(/\xef/g, "i")
        .replace(/\xe0/g, "a")
    );
    ans.push(
      curr
        .replace(/『“/g, "『")
        .replace(/”』/g, "』")
        .replace(/『+/g, "『")
        .replace(/』+/g, "』")
        .replace(/\u275b/g, "")
        .replace(/\xe9/g, "e")
        .replace(/\u2013/g, "-")
        .replace(/\xef/g, "i")
        .replace(/\xe0/g, "a")
    );
    ans.push("");
    return ans;
  }, []);
  const ans = prefixList
    .map(
      (prefixText, index) =>
        prefixText +
        (translatedContentText[index]
          ? translatedContentText[index]
          : ""
        ).replace(/XXX/g, "")
    )
    .join("\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, ans, "utf8");
}

async function retranslatedSpecificLines() {
  const [rawText, text] = await Promise.all([
    readFile("./Bsxx/bsxx.dat.txt"),
    readFile("./Bsxx_output/bsxx.dat.txt"),
  ]);
  const dataList = text.split("\r\n");
  const rawDataList = rawText.split("\r\n");
  let contentRawText = rawDataList.map((text) => {
    return removeThePrefix(text);
  });

  const prefixList = rawDataList.map((text) => {
    return extractThePrefix(text);
  });
  const matchedTextList = await translateOfflineSugoiCt2LongList(
    contentRawText.reduce((ans, curr) => {
      const matchedText = curr.match(//g);
      if (matchedText && curr !== matchedText[0]) {
        ans.push(curr.replace(//g, ""));
      }
      return ans;
    }, []),
    1,
    false,
    false,
    true
  );
  let count = 0;
  const translatedContentText = contentRawText.reduce((ans, curr, index) => {
    const matchedText = curr.match(//g);
    if (matchedText && curr !== matchedText[0]) {
      ans.push(prefixList[index] + matchedTextList[count]);
      count++;
    } else {
      ans.push(dataList[index]);
    }
    return ans;
  }, []);
  // B0005261
  // console.log(
  //   contentRawText.reduce((ans, curr) => {
  //     const matchedText = curr.match(//g);
  //     if (matchedText && curr !== matchedText[0]) {
  //       ans.push(curr);
  //     }
  //     return ans;
  //   }, []),
  //   matchedTextList
  // );
  const ans = translatedContentText.join("\r\n");
  await writeFile("./Bsxx_output/bsxx.dat.txt", ans, "utf8");
}

function extractThePrefix(text) {
  // const matchedText = text.match(/[●○].+[○●]/g);
  const matchedText = text.match(/[<◆◇].+[◆◇>](\\b)?/g);
  if (!matchedText) return "";
  return matchedText[0];
}

function removeThePrefix(text) {
  return text.replace(/[<◆◇].+[◆◇>](\\b)?/g, "");
}
// ○○○○
