const iconv = require("iconv-lite");
const fs = require("fs");

async function readFile(filePath, encoding = "utf8") {
  try {
    const bufferData = await fs.promises.readFile(filePath);
    let text = iconv.decode(bufferData, encoding);
    return text;
  } catch (error) {
    console.error("Fail to read file:", error);
  }
}

async function writeFile(filePathInput, text, encoding) {
  try {
    let filePathOutput = filePathInput.split("/");
    filePathOutput[1] += "_output";
    // const fileContentRaw = await readFile(filePathInput, "ISO8859-1");
    let dataTextList = text.split("\r\n");
    dataTextList = dataTextList.map((text, key) => {
      // if (key === 0) {
      //   return iconv.encode(
      //     fileContentRaw.split("\r\n")[key] + "\r\n",
      //     "ISO8859-1"
      //   );
      // }
      return iconv.encode(text + "\r\n", encoding);
    });
    if (!fs.existsSync(filePathOutput.slice(0, 2).join("/"))) {
      fs.mkdirSync(filePathOutput.slice(0, 2).join("/"));
    }
    // await fs.promises.writeFile(
    //   filePathOutput.join("/"),
    //   "\ufeff" + Buffer.concat(dataTextList)
    // );
    await fs.promises.writeFile(
      filePathOutput.join("/"),
      iconv.encode(text, encoding)
    );
  } catch (error) {
    console.error("Fail to write file:", error);
  }
}

module.exports = {
  readFile,
  writeFile,
};
