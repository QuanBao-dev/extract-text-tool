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
    if (!fs.existsSync(filePathOutput.slice(0, 2).join("/"))) {
      fs.mkdirSync(filePathOutput.slice(0, 2).join("/"));
    }

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
