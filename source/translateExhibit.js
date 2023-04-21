const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
const { Iconv } = require("iconv");
(async () => {
  const listFileName = fs.readdirSync("./Exhibit");
  let start = 0;
  let numberAsync = 1;
  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              await translateFileExhibit(`./Exhibit/${fileName}`);
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
const iconv = require("iconv-lite");

async function translateFileExhibit(filePath) {
  let fileContent = await readFile(filePath, "shiftjis");
  // const textList = fileContent
  //   .replace(/(ﾇﾏ)|(ｸ)|(Ｐゴシック)|(ＭＳ)|(ﾈ)|(%)|(ｮ)|(ﾐ)|(ｴ)|(ﾀ)|(ﾝ)/g, "")
  //   .match(
  //     /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○“”♥　、☆]+/g
  //   );
  // let ans = fileContent;
  // if (textList) {
  //   const translatedTextList = await translateOfflineSugoiCt2LongList(
  //     textList,
  //     2,
  //     false,
  //     true,
  //     true,
  //     "srp"
  //   );
  //   ans = fileContent;
  //   textList.forEach((v, index) => {
  //     if (v.length !== 1) {
  //       ans = ans.replace(v, translatedTextList[index]);
  //     }
  //   });
  // }
  // fileContent = ans;
  let backupData = [];
  let sjisBuffer = iconv.encode(fileContent, "shiftjis");
  const fileContentBinary = await readFile(filePath, "ISO8859-1 ");
  const isoBuffer = iconv.encode(fileContentBinary, "ISO8859-1");
  const intermediateIsoBuffer = [...isoBuffer];
  let intermediateSjisBuffer = [...sjisBuffer].reduce((ans, v, index) => {
    if (
      intermediateIsoBuffer[index] === 244 &&
      intermediateIsoBuffer[index + 1] === 252
    ) {
      ans.push(63);
    }
    ans.push(v);
    return ans;
  }, []);
  console.log(intermediateSjisBuffer, intermediateIsoBuffer);

  // console.log({fileContent,fileContentBinary})
  intermediateSjisBuffer.forEach((v, index) => {
    if (v === 63) {
      backupData.push(intermediateIsoBuffer[index]);
    }
  });
  let count = 0;
  fileContent = iconv.decode(intermediateSjisBuffer, "shiftjis");
  const textList = fileContent.match(
    /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶァ-ヶぁ-んァ-ヾ〟！～？＆。●・♡＝…：＄αβ％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆]+/g
  );
  let ans = fileContent;
  if (textList) {
    const translatedTextList = await translateOfflineSugoiCt2LongList(
      textList,
      2,
      false,
      true,
      false,
      "srp"
    );
    textList.forEach((v, index) => {
      ans = ans.replace(
        v,
        translatedTextList[index]
          .replace(/\?( )?/g, "？")
          .replace(/!( )?/g, "！")
      );
    });
  }
  fileContent = ans;
  sjisBuffer = iconv.encode(fileContent, "shiftjis");
  intermediateSjisBuffer = [...sjisBuffer];
  sjisBuffer = Buffer.from([
    ...intermediateSjisBuffer.reduce((ans, v, index) => {
      if (v === 63) {
        ans.push(backupData[count]);
        count++;
        return ans;
      }
      ans.push(v);
      return ans;
    }, []),
  ]);
  console.log(intermediateSjisBuffer, intermediateIsoBuffer, [...sjisBuffer]);
  let filePathOutput = filePath.split("/");
  filePathOutput[1] += "_output";
  if (!fs.existsSync(filePathOutput.slice(0, 2).join("/"))) {
    fs.mkdirSync(filePathOutput.slice(0, 2).join("/"));
  }
  await fs.promises.writeFile(filePathOutput.join("/"), sjisBuffer);
  // await writeFile(filePath, iconv.encode(fileContent,"shiftjis"), "shiftjis");
}

function replace(/*Buffer*/ data, /*Buffer*/ pattern, /*Buffer*/ replace) {
  let position = data.indexOf(pattern);

  while (position !== -1) {
    data.fill(0, /*from*/ position, /*to*/ position + pattern.length);

    replace.copy(
      /*to*/ data,
      /*at*/ position,
      /*from*/ 0,
      /*to*/ pattern.length
    );
    // continue search:
    position = data.indexOf(
      pattern,
      /*starting at*/ position + pattern.length + 1
    );
  }
}
