const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const handleWordWrap = require("./handleWordWrap");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const converter = new AFHConvert();

(async () => {
  const filePathInput = "./anim_output/script.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const json = JSON.parse(jsonRawText);
  const rawTextList = Object.keys(json);
  // const rawTextList = json;
  const translationList = rawTextList.map((rawText, index) => {
    // const wordWrappedText = handleWordWrap(44,json[rawText],"\\N");
    // if(wordWrappedText.split("\\N").length > 3) return json[rawText].replace(/( )|(@@)/g,"\t");
    // if (rawText.includes("\\N")) return "";
    // return handleWordWrap(63, json[rawText], " ")
    //   .replace(/( )|(@@)/g, "\t")
    //   .replace(/[「“”」]/g, '"');
    // return handleWordWrap(55, json[rawText].replace(/(<unk>(")?)/g, " "), "\r\n");
    // console.log(rawText)
    return handleWordWrap(
      60,
      // converter.toFullWidth(
      json[rawText],
      // )
      // .replace(/♪/g,"")
      // .replace(/@n/g, "")
      // .replace(/@k/g, "Tomoya")
      // .replace(/@Gn01/gi, "Kasahara")
      // .replace(/(<unk>(")?)/g, " ").replace(/　/g," "),
      "\\N"
    ).replace(/ /g, "\t");

    // if(json[rawText] === "@@") return " "
    // return handleWordWrap(
    //   87,
    //   json[rawText],
    //   "@n"
    // )

    // .replace(/＄０/g,"Katsuma").replace(/Aguya/g,"Kaguya").replace(/[“”]/g,"\"");
    // if (json[rawText].split("\\N").length >= 4) {
    //   return (
    //     json[rawText] +
    //     Array.from(Array(json[rawText].split("\\N").length - 1).keys())
    //       .map(() => "\\N")
    //       .join("")
    //   );
    // }
    // return json[rawText];

    return handleWordWrap(
      78,
      json[rawText].replace(/(<unk>(")?)/g, " "),
      "\r\n"
    );
    // return json[rawText].replace(/(<unk>(")?)|(@b)/g, " ");
  });
  const ans = {};
  translationList.forEach((translatedText, index) => {
    ans[rawTextList[index]] = translatedText;
    // .replace(/[【『「《》】』」‘’”“]/g,"\"").replace(/―/g,"-");
  });
  await writeFile(filePathInput, JSON.stringify(ans, null, 2), "utf8");
  console.log("Done");
  await delay(10000000);
})();
