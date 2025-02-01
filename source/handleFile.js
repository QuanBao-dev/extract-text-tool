const iconv = require("iconv-lite");
const fs = require("fs");

function convertJsonToCSV(fileContent) {
  let dataList = fileContent.split("\r\n");
  dataList = JSON.parse(dataList);
  let ans = "";
  let keys = Object.keys(dataList[0]).map((v) => {
    if (v === "name") return "Key";
    return "Value";
  });
  ans += keys.join(",") + "\r\n";
  for (let i = 0; i < dataList.length; i++) {
    let data = dataList[i];
    let values = Object.values(data);
    values[1] = '"' + values[1] + '"';
    ans += values.join(",") + "\r\n";
  }
  return ans;
}

function convertCSVToJson(fileContent) {
  let dataList = fileContent.split("\r\n");
  dataList = dataList.slice(0, dataList.length - 1);
  const ans = [];
  let saveKeyList = [];
  let updatedDataList = [];
  for (let i = 0; i < dataList.length; i++) {
    text = dataList[i];
    if (!text.includes(",")) {
      updatedDataList[updatedDataList.length - 1] += text;
      updatedDataList[updatedDataList.length - 1] =
        updatedDataList[updatedDataList.length - 1];
      continue;
    }
    updatedDataList.push(text);
  }
  dataList = updatedDataList;
  for (let i = 0; i < dataList.length; i++) {
    text = dataList[i];
    splittedText = text.split(",");
    let obj = {};
    if (i === 0) {
      saveKeyList = [...splittedText];
      continue;
    }
    for (let j = 0; j < splittedText.length; j++) {
      for (let k = 0; k < saveKeyList.length; k++) {
        obj[saveKeyList[k] === "Value" ? "message" : "name"] = splittedText[k]
          .replace(/"/g, "")
          .replace(/\n/g, "");
      }
    }
    ans.push(obj);
  }
  return JSON.stringify(ans, null, 2);
}

async function readFile(filePath, encoding = "utf8") {
  try {
    const bufferData = await fs.promises.readFile(filePath);
    let text = iconv.decode(bufferData, encoding);
    return text;
  } catch (error) {
    console.error("Fail to read file:", error);
  }
}

async function writeFile(filePathInput, text, encoding, isBom, isUnityBin) {
  try {
    console.log("Write file");
    let filePathOutput = filePathInput.split("/");
    filePathOutput[1] += "_output";
    let fileContentRaw;
    if (isUnityBin) fileContentRaw = await readFile(filePathInput, "ISO8859-1");
    let dataTextList = text.split("\r\n");
    // console.log(fileContentRaw.split("\r\n")[0])
    dataTextList = dataTextList.map((text, key) => {
      if (key === 0 || key === 1 || key === 2) {
        if (isUnityBin) {
          return iconv.encode(
            fileContentRaw.split("\r\n")[key] + "\r\n",
            // text,
            "ISO8859-1"
          );
        }
        return iconv.encode(
          // fileContentRaw.split("\r\n")[key] + "\r\n",
          text,
          "ISO8859-1"
        );
      }
      return iconv.encode(text + "\r\n", encoding);
    });
    if (!fs.existsSync(filePathOutput.slice(0, 2).join("/"))) {
      fs.mkdirSync(filePathOutput.slice(0, 2).join("/"));
    }
    if (isBom) {
      return await fs.promises.writeFile(
        filePathOutput.join("/"),
        "\ufeff" + iconv.encode(text, encoding)
      );
    }
    if (isUnityBin) {
      return await fs.promises.writeFile(
        filePathOutput.join("/"),
        Buffer.concat(dataTextList)
      );
    }
    await fs.promises.writeFile(
      filePathOutput.join("/"),
      iconv.encode(text, encoding)
    );
  } catch (error) {
    console.error("Fail to write file:", error);
  }
}

async function simpleReadFile(filePath, encoding) {
  try {
    return await readFile(filePath, encoding);
  } catch (error) {
    console.error("Fail to read file:", error);
  }
}
async function simpleWriteFile(filePath, text, encoding) {
  try {
    console.log("Simple write file");
    await fs.promises.writeFile(filePath, iconv.encode(text, encoding));
  } catch (error) {
    console.error("Fail to write file:", error);
  }
}

async function saveBackup() {
  let cacheTranslation = await readFile("./cacheTranslation2.json", "utf8");
  console.log("savebackup");
  await simpleWriteFile("./cacheTranslation.json", cacheTranslation, "utf8");
}

module.exports = {
  readFile,
  writeFile,
  simpleWriteFile,
  simpleReadFile,
  convertCSVToJson,
  convertJsonToCSV,
  saveBackup,
};
