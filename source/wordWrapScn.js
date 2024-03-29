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
    let ans = [];
    for (let j = 0; j < texts.length; j++) {
      const text = texts[j];

      if (typeof text[1][0][1] === "string") {
        const tempText = handleWordWrap(
          scn.wordWrap.maxCharPerLines,
          text[1][0][1].replace(/\% /g, "％ ").replace(/\n/g, " "),
          "\n"
        )
          .replace(/、/g, ", ")
          .replace(/。/g, ". ");
        const textList = tempText.split("\n");
        const filterSpecialPrefixRegExp = new RegExp(
          "%(n)?[0-9]+([;. ,])?( )+",
          "g"
        );
        text[1][0][1] = textList.join("\n");
        // text[2] = textList.join("\n");
        // if (text[2].replace(/\\n/g, " ").length > 172) {
        text[1][0][1] =
          "%75; " +
          handleWordWrap(
            64,
            text[1][0][1]
              .trim()
              .replace(filterSpecialPrefixRegExp, "")
              .replace(/\n/g, " "),
            "\n"
          );
        // }
        // if (text[4] && text[4].meswintype === "comic") {
        //   text[2] =
        //     "%70; " +
        //     handleWordWrap(
        //       77,
        //       text[2].trim().replace(filterSpecialPrefixRegExp, ""),
        //       "\\n"
        //     );
        // }
        // else
        // if (text[2].replace(/\\n/g, " ").length > 162) {
        //   text[2] =
        //     "%60; " +
        //     handleWordWrap(
        //       85,
        //       text[2].trim().replace(filterSpecialPrefixRegExp, ""),
        //       "\\n"
        //     );
        // } else
        // if (text[2].replace(/\\n/g, " ").length > 135) {
        //   text[2] =
        //     "%65; " +
        //     handleWordWrap(
        //       81,
        //       text[2].trim().replace(filterSpecialPrefixRegExp, ""),
        //       "\\n"
        //     );
        // } else if (textList.length > 2) {
        //   text[2] =
        //     "%70; " +
        //     handleWordWrap(
        //       70,
        //       text[2].trim().replace(filterSpecialPrefixRegExp, ""),
        //       "\\n"
        //     );
        // }
        ans.push(text);
        // if (textList.length > 3) {
        //   const temp = Object.values(deepCloning(text));
        //   temp[2] = textList.slice(3).join("\\\n");
        //   temp[2] = null;
        //   // console.log(ans[ans.length - 1])
        //   ans.push(temp);
        //   // console.log(ans[ans.length - 1])
        //   // console.log("--------")
        // }

        continue;
      }
      ans.push(text);
      // text[2][1] = await Promise.all(
      //   text[2][1].map(async (textChild) => {
      //     if (textChild === null) return null;
      //     const temp = await handleWordWrap(58, textChild, "\\\n");
      //     return temp;
      //   })
      // );
      // text[2] = await handleWordWrap(68, text[2], "\\\n");

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
      //     const temp = handleWordWrap(lengthWordWrap, textChild, "\\\n");
      //     return temp;
      //   })
      // );
    }
    data.scenes[indexText].texts = [...ans];
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

function deepCloning(object) {
  let obj = {};
  for (let i in object) {
    obj[i] = object[i];
    if (obj[i] === null) continue;
    if (typeof object[i] == "object") {
      if (!object[i].length) {
        obj[i] = deepCloning(object[i]);
      } else {
        obj[i] = Object.values(deepCloning(object[i]));
      }
    }
  }
  return obj;
}
