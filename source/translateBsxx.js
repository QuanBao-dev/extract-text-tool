const { readFile, writeFile } = require("./handleFile");
const {
  translateSelectCenterTextList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const { bsxx } = require("../setting.json");
const fs = require("fs");
const delay = require("./delay");
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "川島 響子",
  //       "川島 雪舞",
  //       "北川 亜季",
  //       "北川 千景"
  //     ],
  //     1
  //   )
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(bsxx.translation.folderPath);
  for (let i = 0; i < listFileName.length; i++) {
    await translateFileBsxx(
      bsxx.translation.folderPath + "/" + listFileName[i]
    );
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
  let temp = "";
  const narrowedContentText = await translateOfflineSugoiCt2LongList(
    contentText.reduce((ans, curr) => {
      if (temp !== curr) {
        ans.push(curr);
      }
      temp = curr;
      return ans;
    }, []),
    bsxx.translation.numberOfSentences
  );
  const translatedContentText = narrowedContentText.reduce((ans, curr) => {
    if (curr === "")
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
    else {
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
    }
    return ans;
  }, []);
  const ans = prefixList
    .map(
      (prefixText, index) =>
        prefixText +
        (translatedContentText[index] ? translatedContentText[index] : "")
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
  const matchedTextList = await translateOfflineSugoiLongList(
    reduce((ans, curr) => {
      const matchedText = curr.match(/(\\A)|(\\B)/g);
      if (matchedText && curr !== matchedText[0]) {
        ans.push(curr);
      }
      return ans;
    }, []),
    300
  );
  let count = 0;
  const translatedContentText = contentRawText.reduce((ans, curr, index) => {
    const matchedText = curr.match(/(\\A)|(\\B)/g);
    if (matchedText && curr !== matchedText[0]) {
      ans.push(prefixList[index] + matchedTextList[count]);
      count++;
    } else {
      ans.push(dataList[index]);
    }
    return ans;
  }, []);
  console.log(
    contentRawText.reduce((ans, curr) => {
      const matchedText = curr.match(/(\\A)|(\\B)/g);
      if (matchedText && curr !== matchedText[0]) {
        ans.push(curr);
      }
      return ans;
    }, []),
    matchedTextList
  );
  const ans = translatedContentText.join("\r\n");
  await writeFile("./Bsxx_output/bsxx.dat.txt", ans, "utf8");
}

function extractThePrefix(text) {
  const matchedText = text.match(/[◇◆].+[◇◆]/g);
  if (!matchedText) return "";
  return matchedText[0];
}

function removeThePrefix(text) {
  return text.replace(/[◇◆].+[◇◆]/g, "");
}
