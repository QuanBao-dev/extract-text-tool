const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
const iconv = require("iconv-lite");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();
const { weirdToNormalChars } = require("weird-to-normal-chars");
const handleWordWrap = require("./handleWordWrap");

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

async function translateFileExhibit(filePath) {
  const binaryContent = await readFile(filePath, "ISO8859-1");
  const binaryBuffer = iconv.encode(binaryContent, "ISO8859-1");
  let intermediateBinaryBuffer = [...binaryBuffer];
  // console.log(intermediateBinaryBuffer);
  intermediateBinaryBuffer = intermediateBinaryBuffer.reduce(
    (ans, v, index) => {
      if (
        (intermediateBinaryBuffer[index] === 240 &&
          intermediateBinaryBuffer[index + 1] === 74 &&
          intermediateBinaryBuffer[index + 2] !== 0) ||
        (intermediateBinaryBuffer[index] === 74 &&
          intermediateBinaryBuffer[index - 1] === 240 &&
          intermediateBinaryBuffer[index + 1] !== 0)
      ) {
        return ans;
      }
      ans.push(v);
      return ans;
    },
    []
  );
  // console.log(intermediateBinaryBuffer);
  await fs.promises.writeFile(filePath, Buffer.from(intermediateBinaryBuffer));

  let fileContent = await readFile(filePath, "shiftjis");
  fileContent = fileContent;
  let backupData = [];
  let sjisBuffer = iconv.encode(fileContent, "shiftjis");
  let fileContentBinary = await readFile(filePath, "ISO8859-1");
  fileContentBinary = fileContentBinary;
  const isoBuffer = iconv.encode(fileContentBinary, "ISO8859-1");
  let intermediateIsoBuffer = [...isoBuffer];
  let intermediateSjisBuffer = [...sjisBuffer];
  // console.log(intermediateSjisBuffer, intermediateIsoBuffer);
  intermediateSjisBuffer = intermediateSjisBuffer.map((v, index) => {
    // if([250,233].includes(v)) return 63
    if (v === 250 && [...sjisBuffer][index + 1] === 223) return 63;
    if (v === 223 && [...sjisBuffer][index - 1] === 250) return 63;
    return v;
  });
  let i = 0;
  while (i < intermediateSjisBuffer.length) {
    if (intermediateSjisBuffer[i] !== 63) {
      i++;
      continue;
    }
    while (intermediateSjisBuffer[i] === 63) {
      i++;
    }
    if (intermediateSjisBuffer[i] !== intermediateIsoBuffer[i]) {
      intermediateSjisBuffer = insertArrayInPos(63, intermediateSjisBuffer, i);
      i++;
    }
  }
  // console.log(intermediateSjisBuffer, intermediateIsoBuffer);

  // console.log({ fileContent, fileContentBinary });
  intermediateSjisBuffer.forEach((v, index) => {
    if (v === 63) {
      backupData.push(intermediateIsoBuffer[index]);
    }
  });
  let count = 0;
  fileContent = iconv.decode(intermediateSjisBuffer, "shiftjis");
  const rubyList6 =
    fileContent.match(
      /《[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠ΩA-Za-z0-9]+:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠ΩA-Za-z0-9]+》/g
    ) || [];
  for (let i = 0; i < rubyList6.length; i++) {
    if (rubyList6[i].match(/[a-zA-Z0-9]/g)) {
      rubyList6[i] = "";
    }
    fileContent = fileContent.replace(
      /《[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠ΩA-Za-z0-9]+:[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞（）♀♂♪（）─〇☆―〜゛×・○『“”♥　、☆＆？＠ΩA-Za-z0-9]+》/i,
      (rubyList6[i].split(":")[1] || rubyList6[i].split(":")[0])
        .replace("《", "")
        .replace("》", "")
    );
  }
  const textList = fileContent
    .replace(/(Ｐゴシック)|(ＭＳ)|(ﾇﾏ)|(名無し)/gi, "")
    .match(
      /[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶァ-ヶぁ-んァ-ヾ〟！～？＆。●♡＝…：＄αβ％●＜＞（）♀♂♪（）─〇☆―〜゛×○『“”♥　、☆＆【『「（《》】』」）・\n]+/g
    );
  // console.log(fileContent);
  // console.log(textList.join("\n"));
  let ans = fileContent;
  if (textList) {
    let translatedTextList = await translateOfflineSugoiCt2LongList(
      textList,
      2,
      false,
      true,
      false,
      "srp",
      undefined,
      true
    );
    // translatedTextList = [textList[0], ...translatedTextList.slice(1)];
    // translatedTextList = [...translatedTextList];
    textList.forEach((v, index) => {
      // console.log(
      //   translatedTextList[index]
      //     .replace(/[–―」]/gi, "")
      //     .replace(/\?( )?/gi, "？")
      //     .slice(14, 15)
      // );
      let temp = handleWordWrap(
        63,
        weirdToNormalChars(
          translatedTextList[index]
            .replace(/[–―]/gi, "-")
            .replace(/ç/gi, "c")
            .replace(/\?( )?/gi, "？")
        ),
        "\n"
      );
      if (temp.split("\n").length > 3)
        temp = weirdToNormalChars(
          translatedTextList[index]
            .replace(/[–―]/gi, "-")
            .replace(/ç/gi, "c")
            .replace(/\?( )?/gi, "？")
        );
      ans = ans.replace(
        new RegExp(v, "i"),
        temp
        // .slice(14, 15)
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
  // console.log(intermediateSjisBuffer, intermediateIsoBuffer, [...sjisBuffer]);
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

function insertArrayInPos(element, array, position) {
  return [...array.slice(0, position), element, ...array.slice(position)];
}
