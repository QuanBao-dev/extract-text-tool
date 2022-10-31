require("events").EventEmitter.setMaxListeners(100);
const { translateOfflineSugoiLongList } = require("./translateJapanese");
const fs = require("fs");
const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const { scn } = require("../setting.json");
(async () => {
  // console.log(
  //   await translateOfflineSugoiLongList(["「シャルちゃん、誕生日おめでとう。えへへ、おうちが近いから、お誕生日会で遅くまで残れるのっていいね」"])
  // );
  const listFileName = fs.readdirSync(scn.translation.folderPath);
  for (let i = 0; i < listFileName.length; i++) {
    await translateScn(scn.translation.folderPath + "/" + listFileName[i]);
  }
  console.log("Done");
  await delay(100000);
})();

async function translateScn(filePathInput) {
  console.log(filePathInput);
  const content = await readFile(filePathInput, "utf8");
  const dataJson = JSON.parse(content);

  if (!dataJson.scenes)
    return await writeFile(
      filePathInput,
      JSON.stringify(content, null, 2),
      "utf8"
    );

  for (let i = 0; i < dataJson.scenes.length; i++) {
    const scene = dataJson.scenes[i];

    if (scn.translation.isSelects) {
      if (!scene.selects) continue;
      let selects = scene.selects;
      selects = await Promise.all(
        selects.map(async (select) => {
          select.text = (await translateOfflineSugoiLongList([select.text]))[0];
          return select;
        })
      );
      continue;
    }

    if (!scene.texts) continue;
    texts = scene.texts;
    const contentList = texts.map((text) => {
      return text[2];
    });
    const tagNameList = texts.map((text) => {
      return text[1] || text[0];
    });
    let [translatedContentList, translatedTagNameList] = await Promise.all([
      translateOfflineSugoiLongList(
        contentList,
        scn.translation.numberOfSentences
      ),
      translateOfflineSugoiLongList(
        tagNameList,
        scn.translation.numberOfSentences
      ),
    ]);

    for (let j = 0; j < texts.length; j++) {
      const text = texts[j];
      text[1] = translatedTagNameList[j];
      text[2] = translatedContentList[j];
      // console.log(text[1],text[0]);
    }
  }
  await writeFile(filePathInput, JSON.stringify(dataJson, null, 2), "utf8");
}

// async function translateScn(filePath) {
//   console.log("Start: ", filePath);
//   const bufferData = await fs.promises.readFile(filePath, {});
//   const text = iconv.decode(bufferData, "utf8");
//   const data = JSON.parse(text);

//   if (!data.scenes) return;

//   let start = 0;
//   const numberAsync = scn.translation.numberOfScenes;
//   console.time(filePath);
//   do {
//     await Promise.all(
//       data.scenes.slice(start, start + numberAsync).map(async (scene) => {
//         return await handleSceneAsync(scene, scn.translation.isSelects);
//       })
//     );
//     start += numberAsync;
//     console.log(filePath, `${start}/${data.scenes.length}`);
//     console.timeLog(filePath);
//   } while (start < data.scenes.length);

//   // for (let indexText = 0; indexText < data.scenes.length; indexText++) {
//   //   let scene = data.scenes[indexText];
//   //   await handleScene(scene);
//   //   console.log(filePath, `${indexText}/${data.scenes.length}`);
//   //   console.timeEnd(filePath);
//   // }

//   console.log("End: ", filePath);
//   console.timeEnd(filePath);
//   const buffer = iconv.encode(JSON.stringify(data, null, 2), "utf8");
//   let filePathOutput = filePath.split("/");
//   filePathOutput[1] += "_output";
//   if (
//     !fs.existsSync(filePathOutput.slice(0, filePathOutput.length - 1).join("/"))
//   ) {
//     fs.mkdirSync(filePathOutput.slice(0, filePathOutput.length - 1).join("/"));
//   }
//   await fs.promises.writeFile(filePathOutput.join("/"), buffer);
// }

// async function handleSceneAsync(scene, isSelects, isTranslated) {
//   if (isSelects) {
//     if (!scene.selects) return scene;
//     let selects = scene.selects;
//     selects = await Promise.all(
//       selects.map(async (select) => {
//         select.text = (await translateOfflineSugoiLongList([select.text]))[0];
//         return select;
//       })
//     );
//     console.log(selects);
//     return scene;
//   }

//   if (!scene.texts) return scene;
//   let texts = scene.texts;
//   const contentList = texts.map((text) => {
//     return text[1][0][1];
//   });
//   const tagNameList = texts.map((text) => {
//     return text[1][0][0] || text[0];
//   });
//   if (!isTranslated) {
//     let [translatedContentList, translatedTagNameList] = [
//       await translateOfflineSugoiLongList(
//         contentList,
//         scn.translation.numberOfSentences
//       ),
//       await translateOfflineSugoiLongList(
//         tagNameList,
//         scn.translation.numberOfSentences
//       ),
//     ];
//     for (let j = 0; j < texts.length; j++) {
//       const text = texts[j];
//       text[1][0][0] = translatedTagNameList[j];
//       text[1][0][1] = translatedContentList[j];
//       // console.log(text[1][0]);
//     }
//     return scene;
//   }
//   let translatedContentList = contentList;
//   let translatedTagNameList = tagNameList;
//   translatedTagNameList = translatedTagNameList.map((v) => {
//     if (v === null) return null;
//     v = replaceTagName(v, [2], "g");
//     v = replaceTagName(v, [3], "i");
//     return v;
//   });
//   translatedContentList = translatedContentList.map((v) => {
//     if (v === null) return null;
//     const percent = v.match(/[0-9]+\%/g);
//     if (percent) {
//       v = v.replace(
//         new RegExp(percent[0], "g"),
//         percent[0].replace(/\%/g, " percent")
//       );
//     }
//     v = replaceTagName(v, [2], "g");
//     v = replaceTagName(v, [3], "i");
//     return v;
//   });
//   for (let j = 0; j < texts.length; j++) {
//     const text = texts[j];
//     text[1][0][0] = translatedTagNameList[j];
//     text[1][0][1] = translatedContentList[j];
//     // console.log(text[1][0]);
//   }
//   return scene;
// }
