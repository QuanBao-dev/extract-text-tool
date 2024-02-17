const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  translateSelectCenterTextList,
  translateJapaneseToEng,
} = require("./translateJapanese");
const fs = require("fs");
const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const { scn } = require("../setting.json");
// const handleWordWrap = require("./handleWordWrap");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const converter = new AFHConvert();

(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "「なぜ化け物に襲われるようになると知ってて、魔法使いになったの? まさか、ただの 興味本位?」",
  //     ],
  //     2,
  //     false,
  //     true,
  //     true,
  //     "scn"
  //   )
  // );
  // console.log(
  //   await translateJapaneseToEng(
  //     "「Kuh... ahh, I can't take it anymore...!」",
  //     false,
  //     3,
  //     3
  //   )
  // );
  // await delay(1000000);
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
  // const rawContent = await readFile(
  //   filePathInput.replace("./scn", "./scn_raw"),
  //   "utf8"
  // );
  const dataJson = JSON.parse(content);
  let ans = [];
  // const rawDataJson = JSON.parse(rawContent);
  if (!dataJson.scenes)
    return await writeFile(
      filePathInput,
      JSON.stringify(content, null, 2),
      "utf8"
    );

  for (let i = 0; i < dataJson.scenes.length; i++) {
    const scene = dataJson.scenes[i];
    // const rawScene = rawDataJson.scenes[i];
    if (scn.translation.isSelects) {
      if (!scene.selects) continue;
      let selects = scene.selects;
      selects = await Promise.all(
        selects.map(async (select) => {
          if (!select.text) return select;
          select.text = (
            await translateOfflineSugoiCt2LongList(
              [select.text],
              1,
              false,
              true,
              false,
              "srp"
            )
          )[0];
          // select.text = select.text.replace(/[\{\}\[\]]/g, '"');
          return select;
        })
      );
      continue;
    }
    let count2 = 0;
    if (!scene.texts) continue;
    let texts = scene.texts;
    // let rawTexts = [...rawScene.texts];
    // let contentList = rawTexts.filter((text, index) => {
    //   const rawText =
    //     typeof rawTexts[index][7] === "string"
    //       ? rawTexts[index][7]
    //       : rawTexts[index][2];
    //   return rawText.includes("城にぃ");
    // });
    let contentList = texts.map((text, index) => {
      // return typeof text[7] === "string" ? text[7] : text[2];
      // return typeof text[8] === "string" ? text[8] : text[2];
      return typeof text[1][0][4] === "string" ? text[1][0][4] : text[1][0][1];
      return text[1][0][1];
    });
    // const contentList = texts.map((text) => {
    //   return text[1][0][1];
    // });
    // const contentList = texts.reduce((ans, text, key) => {
    //   if (text[1][0][1].includes("%70;")) {
    //     console.log(text[1][0][1]);
    //     ans.push(rawTexts[key][1][0][1]);
    //   }
    //   return ans;
    // }, []);
    // const tagNameList = texts.map((text) => {
    //   return text[1][0][0] || text[0];
    // });
    const tagNameList = texts.map((text) => {
      // return text[1] || text[0];
      return text[1][0][0] || text[0];
    });
    // let translatedContentList = handleWordWrapGlue(contentList, 58, "\\n");
    // let [translatedContentList, translatedTagNameList] = await Promise.all([
    //   Promise.resolve(contentList),
    //   translateOfflineSugoiCt2LongList(tagNameList, 1),
    // ]);
    // let [translatedContentList, translatedTagNameList] = await Promise.all([
    //   translateOfflineSugoiCt2LongList(contentList, 2, false, false, true),
    //   Promise.resolve(tagNameList),
    // ]);
    // let translatedTagNameList = tagNameList.map((v) => {
    //   if (!v) return v;
    //   return v;
    // });

    let [translatedContentList, translatedTagNameList] = await Promise.all([
      translateOfflineSugoiCt2LongList(
        contentList.map((v) => v.replace(/\\n/g, "")),
        3,
        false,
        true,
        false,
        "scn"
      ),
      translateOfflineSugoiCt2LongList(
        tagNameList,
        1,
        undefined,
        true,
        false,
        "scn"
      ),
    ]);

    // console.log(translatedContentList);
    // let count = 0;
    // for (let j = 0; j < texts.length; j++) {
    //   const text = texts[j];
    //   text[1][0][0] = translatedTagNameList[j];
    //   if (text[1][0][1].includes("%70;")) {
    //     text[1][0][1] = translatedContentList[count];
    //     count++;
    //   }
    //   // console.log(text[1],text[0]);
    // }
    let count = 0;
    for (let j = 0; j < texts.length; j++) {
      const text = texts[j];
      // const rawText =
      //   typeof rawTexts[j][7] === "string" ? rawTexts[j][7] : rawTexts[j][2];
      text[1][0][0] =
        typeof translatedTagNameList[j] === "string"
          ? translatedTagNameList[j]
              .replace(/&/g, "＆")
              .replace(/%/g, "％")
              .replace(/;/g, "；")
              .replace(/\./g, "")
          : translatedTagNameList[j];
      text[1][0][1] = await translatedContentList[count]
        .replace(/[\{\}\[\]]/g, '"')
        .replace(/\\n/g, " ")
        .replace(/&/g, "＆");
      count++;

      ///////////////////////spanish
      // console.log(text[1][0][1]);
      // const rawText = text[1][0][1];
      // text[1][0][1] = await translateJapaneseToEng(
      //   translatedContentList[count]
      //     .replace(/\\n/g, " ")
      //     .replace(/「/g, "")
      //     .replace(/」/g, ""),
      //   false,
      //   3,
      //   10
      // );
      // if (rawText.match(/「/g) && rawText.match(/」/g)) {
      //   text[1][0][1] = "「" + text[1][0][1] + "」";
      // }
      // console.log(text[1][0][1]);
      // console.log("-----------");
      // count++;
      ////////////////////////
      // if (rawText.includes("城にぃ")) {
      //   text[2] = translatedContentList[count]
      //     .replace(/[\{\}\[\]]/g, '"')
      //     .replace(/&/g, "＆");
      //   count++;
      // }
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

function handleBracket(text) {
  const listOfChoice = [
    `[…。♪:：〟！～『「」』？]`,
    "…",
    "(([『「」』])$)|(^([『「」』]))",
    "(^([『「」』]))",
    "(([『「」』])$)",
  ];
  let temp = text;
  if (
    text.trim().match(new RegExp(listOfChoice[3], "g")) &&
    !text.trim().match(new RegExp(listOfChoice[4], "g"))
  ) {
    if (text.trim().match(new RegExp(listOfChoice[3], "g"))[0] === "「")
      temp += "」";
    if (text.trim().match(new RegExp(listOfChoice[3], "g"))[0] === "『")
      temp += "』";
  }
  // if (
  //   text.trim().match(new RegExp(listOfChoice[4], "g")) &&
  //   !text.trim().match(new RegExp(listOfChoice[3], "g"))
  // ) {
  //   if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "」")
  //     temp = "「" + temp;
  //   if (text.trim().match(new RegExp(listOfChoice[4], "g"))[0] === "』")
  //     temp = "『" + temp;
  // }
  return temp;
}
