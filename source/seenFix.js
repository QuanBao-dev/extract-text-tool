const { readFile, writeFile } = require("./handleFile");
const fs = require("fs");
const { translateOfflineSugoiCt2LongList } = require("./translateJapanese");
const delay = require("./delay");
const iconv = require("iconv-lite");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();
const { weirdToNormalChars } = require("weird-to-normal-chars");

(async () => {
  const listFileName = fs.readdirSync("./Seen_fix");
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
              await fixSeenFile(`./Seen_fix/${fileName}`);
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

async function fixSeenFile(filePath) {
  const binaryContent = await readFile(filePath, "ISO8859-1");
  const binaryBuffer = iconv.encode(binaryContent, "ISO8859-1");
  let intermediateBinaryBuffer = [...binaryBuffer];
  // console.log(intermediateBinaryBuffer);
  let isOpen = false;
  intermediateBinaryBuffer = binaryBuffer.map((v, index) => {
    if (
      v === 34 &&
      binaryBuffer[index + 1] === 129 &&
      binaryBuffer[index + 2] === 121
    ) {
      isOpen = true;
      return 32;
    }
    if (isOpen && v === 34 && binaryBuffer[index + 1] === 35) {
      isOpen = false;
      return 32;
    }
    return v;
  });
  // console.log(intermediateBinaryBuffer)
  let filePathOutput = filePath.split("/");
  filePathOutput[1] += "_output";
  if (!fs.existsSync(filePathOutput.slice(0, 2).join("/"))) {
    fs.mkdirSync(filePathOutput.slice(0, 2).join("/"));
  }
  await fs.promises.writeFile(
    filePathOutput.join("/"),
    Buffer.from(intermediateBinaryBuffer)
  );
}

function insertArrayInPos(element, array, position) {
  return [...array.slice(0, position), element, ...array.slice(position)];
}
