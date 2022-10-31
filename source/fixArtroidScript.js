const fs = require("fs");
const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
(async () => {
  const listFileName = fs.readdirSync("./artroid");
  await Promise.all(
    listFileName.map(async (fileName) => {
      await fixAtroidScript("./artroid/" + fileName);
    })
  );
  console.log("Done");
  await delay(1000000);
})();

async function fixAtroidScript(filePath) {
  const fileContent = await readFile(filePath, "utf8");
  const textList = fileContent.split("\r\n");
  const text = textList
    .map((text) => {
      return text.replace(/, zone=".+"/g, "");
    })
    .join("\r\n");
  await writeFile(filePath, text, "utf8");
}
