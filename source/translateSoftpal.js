const delay = require("./delay");
const { readFile, writeFile } = require("./handleFile");
const handleWordWrap = require("./handleWordWrap");
const {
  translateOfflineSugoiLongList,
  translateTextSugoiWebsite,
  translateTextListSugoiWebsite,
} = require("./translateJapanese");
(async () => {
  // console.log(
  //   await translateOfflineSugoiLongList(
  //     [
  //       "久阪 雪光",
  //     ],
  //     150
  //   )
  // );
  // const onlineNewModel = await translateTextSugoiWebsite("見ると、腰の左右に二丁の拳銃をぶら下げている。\r\nいまどき珍しい<rオートマチックピストル>自動式拳銃</r>だった。");
  // const offlineOldModel = (await translateOfflineSugoiLongList(["見見見"]))[0];

  // console.log({
  //   originalText: "見見見",
  //   offlineOldModel,
  //   onlineNewModel,
  // });
  console.log(
    await translateOfflineSugoiLongList(
      [
        "ちゃあんと受け止めるから、思いっきりいっちゃってぇ",
        "言われりゃ、大人しく出しますって……",
        "「ささっ、ググッといっちゃって下さい！」",
      ],
      10
    )
  );
  await delay(1000000);

  const filePathInput = "./softpal/script.json";
  const jsonRawText = await readFile(filePathInput, "utf8");
  const json = JSON.parse(jsonRawText);
  const rawTextList = json;
  // const translationList = await translateTextListSugoiWebsite(
  //   rawTextList.map(({ message, name }) => {
  //     return message;
  //   }),
  //   4
  // );
  const translationList = rawTextList.map(({ message, name }) => {
    return handleWordWrap(
      60,
      message.replace(/( )?<[a-z A-Z0-9]+>( )?/g, ""),
      "\r\n"
    );
  });
  // const translationList = rawTextList.map(({ message, name }) => {
  //   return message.replace(/<[a-zA-Z0-9]+>( )?/g,"");
  // });
  // const tagNameList = await translateTextListSugoiWebsite(
  //   rawTextList.map(({ message, name }) => {
  //     return name || "";
  //   }),
  //   4
  // );
  const tagNameList = rawTextList.map(({ message, name }) => {
    return name || "";
  });

  let ans = [];
  translationList.forEach((translatedText, index) => {
    const name = tagNameList[index];
    if (name === "") ans.push({ message: translatedText });
    else ans.push({ message: translatedText, name });
  });

  await writeFile(filePathInput, JSON.stringify(ans, null, 2), "utf8");
  console.log("Done");
  await delay(1000000);
})();
