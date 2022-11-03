const handleWordWrap = require("./handleWordWrap");
const iconv = require("iconv-lite");
const fs = require("fs");
const { scn } = require("../setting.json");
const delay = require("./delay");
(async () => {
  const listFileName = fs.readdirSync(scn.wordWrap.folderPath);
  await Promise.all(
    listFileName.map(async (fileName) => {
      return await wordWrapScn(`${scn.wordWrap.folderPath}/${fileName}`);
    })
  );
  console.log("done");
  await delay(10000000);
})();

async function wordWrapScn(filePath) {
  const bufferData = await fs.promises.readFile(filePath, {});
  const text = iconv.decode(bufferData, "utf8");
  console.log("start:" + filePath);
  const data = JSON.parse(text);
  // if (!data.scenes) return;
  // await Promise.all(
  //   data.scenes.map(async (scene) => {
  //     if (!scene.selects) return scene;
  //     let selects = scene.selects;
  //     selects = await Promise.all(
  //       selects.map(async (select) => {
  //         select.text = handleWordWrap(56, select.text);
  //         return select;
  //       })
  //     );
  //     console.log(selects);
  //   })
  // );
  for (let indexText = 0; indexText < data.scenes.length; indexText++) {
    if (!data.scenes[indexText].texts) {
      continue;
    }
    let texts = data.scenes[indexText].texts;
    for (let j = 0; j < texts.length; j++) {
      const text = texts[j];
      if (typeof text[1][0][1] === "string") {
        text[1][0][1] = (await handleWordWrap(scn.wordWrap.maxCharPerLines, text[1][0][1], "\\n")).replace(/、/g,", ").replace(/。/g,". ");
        continue;
      }
      // text[2][1] = await Promise.all(
      //   text[2][1].map(async (textChild) => {
      //     if (textChild === null) return null;
      //     const temp = await handleWordWrap(58, textChild, "\\n");
      //     return temp;
      //   })
      // );
      // text[2] = await handleWordWrap(68, text[2], "\\n");

      // text[1][0] = await Promise.all(
      //   text[1][1].map(async (textChild, index) => {
      //     // if (index === 0 && textChild === null) {
      //     //   const tagName = capitalize(await translateJapaneseToEng(text[0]));
      //     //   return tagName;
      //     // }
      //     // if (index !== 1) return textChild;
      //     if (typeof textChild !== "string") return textChild;
      //     let lengthWordWrap = scn.wordWrap.maxCharPerLines;
      //     // if (textChild[0] === "(") lengthWordWrap = 65;
      //     const temp = handleWordWrap(lengthWordWrap, textChild, "\\n");
      //     return temp;
      //   })
      // );
    }
  }
  console.log("End:", filePath);
  const buffer = iconv.encode(JSON.stringify(data, null, 2), "utf8");
  let filePathOutput = filePath.split("/");
  filePathOutput[1] += "_output";
  if (
    !fs.existsSync(filePathOutput.slice(0, filePathOutput.length - 1).join("/"))
  ) {
    fs.mkdirSync(filePathOutput.slice(0, filePathOutput.length - 1).join("/"));
  }
  await fs.promises.writeFile(filePathOutput.join("/"), buffer);
}
