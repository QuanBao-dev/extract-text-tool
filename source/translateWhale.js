const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { whale } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  whale.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  whale.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = whale.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  whale.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       // "「かおるこ先輩とは上手くいってるんでしょうね？　もし悲しませたりしていたら承知しないわよ」",
  //       // "「心配しなくても大丈夫だって。そもそも桜木はかおることしょっちゅう会って話してるんじゃないのか？」",
  //       // "「かおることか呼ばないで。イラッとくるから」",
  //       // `少女は愛らしい横顔とは相反する[rb,何処,どこ]か虚ろな表情で、わらべうたを口ずさんでいる。`,
  //       "<翔太>「……おはようございます。美沙希さん」",
  //       "<？？？>「もしもし、篠原です。……あら、あなた。おはよう。[ゆうべ/昨夜]はよく眠れた？」",
  //       "<美沙希>「だといいけど、電車は寒すぎるのよね。あら……急げば一本早い電車に乗れるかもしれないわ」",
  //       "腕時計を確認すると、足早にヒールを鳴らす。",
  //       "<翔太>「美沙希さんもお仕事忙しいんですか？」",
  //       "<美沙希>「うーん、今日は少しややこしい案件が入ってるの」",
  //       "難しい顔で頷く。",
  //       "父曰く、美沙希さんはそこそこの業績を出すやり手らしい。顧客からの評判もいいと言っていた。",
  //       "<美沙希>「あっ、忘れてた！　私も今日は遅くなるの。きっと寛さんも遅いと思うから、夕飯は……」",
  //     ],
  //     2,
  //     false,
  //     true,
  //     true
  //   )
  // );

  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       `&0"「こっち。こっちだよー」"#:NameSuffix`,
  //       `&1"「むにゃむにゃ……おっぱいだ　待ってよーあははははは」"`,
  //       `&13"澄野撫子。今日も寝坊しかけた俺と違って、昔からしっかり者の姉ちゃんだ。"&14"同い年でありながら、俺は体の隅々まで悲しいかな、今のような具合にしつけられている。"`,
  //       `&20"「朝ごはんを:NameSuffixと一緒に食べるのは当然じゃない」"42("DEL","02DrawFc.dat")`,
  //       `&53"「へ？　う、うん。(e)俺も姉ちゃんがいつも母さん達に内緒にしてくれる事には感謝してるよ！　ありがとな！」"`,
  //       `&28"「ハハハ…」"&29"俺は思わず引きつった笑みを浮かべる。これは、姉ちゃんが何かを訴える時の合図だ。"_Target=@CharC,`,
  //       `&46"どこから出したのか、５枚ほどの原稿用紙を差し出す姉ちゃん。それを埋める所要時間は経験から言って２時間～３時間。"#:NameSuffix`,
  //       `&34"我ながら分かりやすすぎるリアクションだ。"&35"姉ちゃんは箸をおくと、冷たさの漂う目で俺を見つめた。"_Target=@CharC,`,
  //     ],
  //     2,
  //     true
  //   )
  // );
  // await delay(10000000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       `m[703] = "「どのぐらい少しかというと、"`,
  //       `m[704] = "　伊澤先生担当…のはずが、他開発にドナドナになったので、"`,
  //       `m[705] = "　途中から途中まで…」"`,
  //       `m[706] = "「中途半端でごめんね、伊澤先生…"`,
  //       `m[707] = "　えっちもいっこだけ書きました。"`,
  //       `m[708] = "　先生はいつでも、おっぱい重そうでした。最巨乳！！」"`,
  //       `m[718] = "「…と一人ひっそりと葛」藤していた"`,
  //       `m[719] = "　開発に参加してまもなくの頃。"`,
  //       `m[720] = "　ちょも山さんとお酒を嗜みに行った時に聞いたお話が…"`,
  //       `m[721] = "：風麟さんとちょも山さんで、お遊びで　　　　　　　　："`,
  //       `m[722] = "：「各キャラに武器（エモノ）を持たせるなら…」という："`,
  //       `m[723] = "：お話をしていた時、　　　　　　　　　　　　　　　　："`,
  //       `m[724] = "：　風麟さんは　　　　　　　　　　　　　　　　　　　："`,
  //       `m[725] = "：　　　　　圭太の武器はスタンガンです　　　　　　　："`,
  //       `m[726] = "：　　　　　　　　　　　　　　　　　　とのたまった　："`,
  //       `m[727] = "「ス　タ　ン　ガ　ン　！」"`,
  //       `m[7602] = "『コーくん！？"`,
  //       `m[7603] = "　どうして、最近、来てくれないの？』"`,
  //     ],
  //     2,
  //     false,
  //     false,
  //     false
  //   )
  // );
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "【芙慈子@女性,S004_A01_0001】「あ、高杉君だ。こんばんわ～、そっか君の家この近くだね」",
  //       "【浩輔】（仕事も終わったばっかだってのに、みんな元気だよなあ……）",
  //     ],
  //     2,
  //     false,
  //     true,
  //     true,
  //     "whale"
  //   )
  // );
  // console.log(
  //   handleWordWrap(
  //     20,
  //     "The quick brown fox jumps over the lazy dog",
  //     "\n",
  //     5,
  //     undefined
  //   )
  // );
  // console.log(
  //   handleWordWrap(
  //     53,
  //     `&300"【車内アナウンス】「Next is... Ichiou Academy、Ichigakuen-mae、and the(e)exit is to the left. This is the Tozai Line of the(e)subway North-South Line.」"`,
  //     "\n",
  //     6
  //   )
  // );
  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       "【夕里@？？？,S001_A01_0009】「貴方が夜空を見上げた時、ひときわ大きく瞬いた星、[n]それがアタシなの」",
  //     ],
  //     1,
  //     true,
  //     whale,
  //     "srp"
  //   )
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(whale.translation.folderPath);
  let start = 0;
  let numberAsync = whale.translation.numberOfFiles;

  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              // await fixTranslatedFileKs(
              //   `./ks/${fileName}`,
              //   `${ks.translation.folderPath}/${fileName}`,
              //   "shiftjis"
              // );
              await translateFileKs(
                `${whale.translation.folderPath}/${fileName}`,
                whale.translation.isSelects,
                whale.translation.isTagName,
                whale.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = whale.translation.numberOfFiles;
      } while (start < listFileName.length);
      break;
    } catch (error) {
      console.log("Error:", error.message);
      await delay(10000);
      numberAsync--;
    }
  } while (numberAsync > 0);
  console.log("Done");
  await delay(10000000);
})();
let objectCount = {};

async function translateFileKs(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  objectCount = {};
  // const dumpFileContent = await readFile(
  //   filePath.replace(/csv/g, "txt"),
  //   encoding
  // );
  let dataList = fileContent.split(/\n/g);
  // let dumpList = dumpFileContent.split(/\r\n/g);
  // console.log(dataList);
  // let temp2 = [];
  // dataList.forEach((text) => {
  //   const textList = text.split("\n");
  //   textList.forEach((text) => temp2.push(text));
  // });
  // dataList = [...temp2];
  let temp = "";
  console.time(filePath);
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(
        dataList.map((v) => {
          if (v.match(/^【/g)) {
            return v.replace(/'/g, "’").replace(/"/g, "”");
          }
          return v;
        }),
        3,
        false,
        whale,
        "srp"
      )
    ).join("\n");
    return await writeFile(filePath, translatedFileContent, encoding);
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (!whale.translation.isNoFilter) {
        if (
          (rawText.trim().match(containRegExpI) &&
            !rawText.trim().match(exceptRegExpI)) ||
          rawText.trim() === ""
          // index === 0
          // !rawText.match(containRegExpG2)
          // rawText.match(containTagNameRegExpI)
          // !rawText.match(containTagNameRegExpI)
          // false
        ) {
          isNewDialog = true;
          return ans;
        }
      }
      if (ans.length > 0 && isNewDialog === false) {
        dataList[index - 1] = dataList[index - 1].replace(/\[Cock\]/, "");
        ans[ans.length - 1] = ans[ans.length - 1].replace(/\[Cock\]/, "");
      }
      ans.push(rawText + "[Cock]");
      dataList[index] = dataList[index] + "[Cock]";
      isNewDialog = false;
      return ans;
    }, [])
    .reduce((ans, rawText) => {
      if (whale.translation.isNoFilter) {
        ans.push(rawText.replace(/\[Cock\]/g, ""));
        return ans;
      }
      count3++;
      temp += " " + (rawText.trim() === "---" ? "" : rawText.trim());
      if (rawText.match(/\[Cock\]/)) {
        // suffixList.push(
        //   temp
        //     .replace(/\[Cock\]/g, "")
        //     .replace(/\[np\]/g, "")
        //     .replace(/\[r\]/g, "")
        //     .replace(/\[haret\]/g, "")
        //     .replace(/\n/g, " ")
        //     .replace(/／/g, "")
        //     .trim()
        //     .match(/\[[a-zA-Z =\[\]]+\]+/g)[0]
        // );
        ans.push(
          temp
            .replace(/\[[a-zA-Z =\[\]]+\]+/g, "")
            .replace(/\[haret\]/g, "")
            .replace(/\[Cock\]/g, "")
            .replace(/\[np\]/g, "")
            .replace(/\[r\]/g, "")
            .replace(/\n/g, " ")
            .replace(/／/g, "")
            .trim()
        );
        temp = "";
        listCount.push(count3);
        count3 = 0;
      }
      return ans;
    }, []);
  // let temp2 = "";
  // const translatedTextList = rawTextList.map((text) => {
  //   if (text.match(/^#/g)) {
  //     temp2 = text
  //       .split(",")[0]
  //       .replace(/#/g, "")
  //       .replace(":NameSuffix", "Masato");
  //     if (temp2 !== "") temp2 = "【" + temp2 + "】";
  //     return text;
  //   }
  //   if (text.match(/^&/g)) {
  //     const splittedTextList = text.split('"');
  //     splittedTextList[1] = temp2 + splittedTextList[1];
  //     temp2 = "";
  //     return splittedTextList.join('"');
  //   }
  //   temp2 = "";
  //   return text;
  // });
  // const translatedTextList = rawTextList.map((text) => {
  //   const splittedTexts = text.split('"');
  //   splittedTexts[1] = handleWordWrap(50, splittedTexts[1], "(e)").replace(
  //     /^((】 )?）)/g,
  //     ""
  //   );
  //   if (splittedTexts[1].match(/】（/g)) {
  //     splittedTexts[1] += "）";
  //   }
  //   return splittedTexts.join('"');
  // });
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    3,
    false,
    true,
    true,
    "whale"
  );
  // const translatedTextList = rawTextList.map((v) => {
  //   if (v === ".") {
  //     return "";
  //   }
  //   return v;
  // });
  // let translatedTextList = handleWordWrapGlue(rawTextList,100000,"\\n")

  // const translatedTextList = rawTextList
  // .map((text)=> text.replace(/, /g,"、"))
  // .map((text) => {
  //   const splittedTexts = text.split('"');
  //   if (splittedTexts[2] === "") {
  //     return splittedTexts.slice(0, 2).join('"') + '"';
  //   }
  //   return (
  //     splittedTexts.slice(0, 2).join('"') +
  //     '"' +
  //     "\r\n" +
  //     splittedTexts.slice(2).join('"')
  //   );
  // });
  // .map(
  //   (text) => text.replace(/&/g, "\r\n&")
  //   // "&" + text.split("&").slice(1).join("\r\n&").split("#").join("\r\n#")
  // );
  // console.log(rawTextList)
  // let translatedTextList = await translateSelectCenterTextList(
  //   rawTextList,
  //   2,
  //   false
  // );

  // translatedTextList = translatedTextList.map((text) => text + "[np]");
  // console.log(
  //   checkIsContinue(
  //     dumpList.filter((text) => text !== ""),
  //     "射精を促す刺激を、たっぷりと堪能するように、"
  //   )
  // );
  // let prefixList = [...rawTextList].reduce((ans, text, index) => {
  //   // if (text.split(",")[3]) {
  //   //   ans.push(text.split(",").slice(0, 3).join(",") + ",");
  //   //   return ans;
  //   // }
  //   ans.push(text.split(",").slice(0, 4).join(",") + ",");
  //   return ans;
  //   ans.push("");
  //   return ans;
  // }, []);

  // let translatedTextList = [...rawTextList].map((text) => {
  //   const temp = text.split(",").slice(4).join("、");
  //   return temp;
  // });
  // let translatedTextList = await translateOfflineSugoiCt2LongList(
  //   // [...rawTextList].map((text) => {
  //   //   return text.split(",")[0].includes("pylm")
  //   //     ? text.split(",")[3].replace(/"/g, "")
  //   //     : text.split(",")[0].replace(/"/g, "");
  //   // }),
  //   rawTextList,
  //   2,
  //   false,
  //   true,
  //   true,
  //   "whale"
  // );

  // let translatedTextList = [...rawTextList].reduce((ans, text, index) => {
  //   const { isContinue } = checkIsContinue(
  //     dumpList.filter((text) => text !== ""),
  //     rawTextList[index - 1]
  //       ? rawTextList[index - 1].split(",")[0].includes("pylm")
  //         ? rawTextList[index - 1].split(",")[3].replace(/"/g, "")
  //         : rawTextList[index - 1].split(",")[0].replace(/"/g, "")
  //       : undefined
  //   );
  //   if (isContinue) {
  //     // if (text.match(/("(,)?)/g)) {
  //     //   console.log(text);
  //     //   ans[ans.length - 1] += text;
  //     //   ans[ans.length - 1] = ans[ans.length - 1].replace(/"/g, "");
  //     //   return ans;
  //     // }
  //     let j = 1;
  //     if (ans[ans.length - j] === "@@") {
  //       do {
  //         if (ans[ans.length - j] !== "@@")
  //           ans[ans.length - j] += text.split(",")[0].includes("pylm")
  //             ? text.split(",")[3].replace(/"/g, "")
  //             : text.split(",")[0].replace(/"/g, "");
  //         j += 1;
  //       } while (ans[ans.length - j] === "@@");
  //     }

  //     ans[ans.length - j] += text.split(",")[0].includes("pylm")
  //       ? text.split(",")[3].replace(/"/g, "")
  //       : text.split(",")[0].replace(/"/g, "");
  //     ans[ans.length - j] = ans[ans.length - j].replace(/\"/g, "");
  //     ans.push("@@");
  //     return ans;
  //   }
  //   ans.push(text.split(",")[3]);
  //   return ans;
  // }, []);

  // translatedTextList = await translateOfflineSugoiCt2LongList(
  //   translatedTextList,
  //   1000000,
  //   false,
  //   true,
  //   false
  // );
  // .reduce(())
  // console.log(translatedTextList)
  // let translatedTextList = [...rawTextList].map((v) => {
  //   return handleWordWrap(47, v, "\r\n");
  // });
  // let i = 0;
  // let translatedTextList = [...rawTextList];
  // do {
  //   const currentText = translatedTextList[i]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const nextText = translatedTextList[i + 1]
  //     .replace(/m\[[0-9]+\] = "/g, "")
  //     .replace(/"$/g, "");
  //   const prefix = translatedTextList[i].match(/m\[[0-9]+\] = "/g)[0];
  //   const nextPrefix = translatedTextList[i + 1].match(/m\[[0-9]+\] = "/g)[0];
  //   const wordWrappedText = handleWordWrap(44, currentText, "\\n");
  //   const splittedTextList = wordWrappedText.split("\\n");
  //   if (nextText === "@@" && splittedTextList.length > 1) {
  //     translatedTextList[i] =
  //       prefix +
  //       splittedTextList[0].replace(/[『「]/g, "“").replace(/[」』]/g, "”") +
  //       '"';
  //     translatedTextList[i + 1] =
  //       nextPrefix +
  //       " " +
  //       splittedTextList
  //         .slice(1)
  //         .join(" ")
  //         .replace(/[『「]/g, "“")
  //         .replace(/[」』]/g, "”") +
  //       '"';
  //   }
  //   translatedTextList[i] = translatedTextList[i]
  //     .replace(/[『「]/g, "“")
  //     .replace(/[」』]/g, "”");
  //   i++;
  // } while (i < translatedTextList.length - 1);

  // translatedTextList = rawTextList.map((text) => {
  //   const prefix = text.match(/m\[[0-9]+\] = "/g);
  //   return (
  //     prefix +
  //     handleWordWrap(
  //       80,
  //       text.replace(/m\[[0-9]+\] = "/g, "").replace(/"$/g, ""),
  //       "\\r\\n"
  //     ) +
  //     '"'
  //   );
  // });
  // const translatedTextList = rawTextList;
  // console.log(translatedTextList);
  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  let translatedFileContent = dataList.reduce((ans, rawText, index) => {
    if (!whale.translation.isNoFilter) {
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === ""
        // !rawText.match(containRegExpG2)
        // rawText.match(containTagNameRegExpI)
      )
        isDisable = false;
      if (isDisable) return ans;
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === ""
        // !rawText.match(containTagNameRegExpI)
        // index === 0
        // !rawText.match(containRegExpG2)
        // rawText.match(containTagNameRegExpI)
      ) {
        ans.push(rawText);
        return ans;
      }
    }
    if (translatedTextList[count] !== undefined) {
      let temp = translatedTextList[count];
      // let prefix = prefixList[count];
      // if (rawText.match(/(^	)/g)) {
      //   temp = rawText.match(/(	)+/g)[0] + temp;
      // }
      temp = temp;
      ans.push(
        // handleWordWrap(
        //   Math.floor(temp.length / listCount[count]) < 41
        //     ? Math.floor(temp.length / listCount[count])
        //     : 46,
        //   temp,
        //   "\r\n",
        //   listCount[count]
        // )
        // handleWordWrap(57, temp, "\\n")
        // handleWordWrap(56, temp, "\r\n", listCount[count], undefined)
        // prefix + (temp === "@@" ? "" : temp).replace(/,( )?/g, "、")
        temp
        // .replace(/,( )?/g, "、")
        // + suffixList[count]
        // .replace(/、/g, ", ")
        // .replace(/[◆✩♥♡●♪]/g, "")
        // .replace(/❛/g, "’")
        // .replace(/é/g, "e")
        // .replace(/ō/g, "o")
        // .replace(/[àâ]/g, "a")
      );
    } else {
      ans.push("");
    }
    isDisable = true;
    count++;
    return ans;
  }, []);
  // .filter((text) => text !== "" && text !== ",")
  translatedFileContent = translatedFileContent
    // .slice(0, translatedFileContent.length - 2)
    .join("\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding);
}
// [...$0.querySelectorAll(".mainbox")].reduce((ans, curr) => {
//   const characters = [...curr.querySelectorAll(".chardetails")];
//   characters.forEach((character) => {
//     if (character.querySelector("tr b"))
//       ans[character.querySelector("tr b").textContent] =
//         character.querySelector("tr a").textContent;
//   });
//   return ans;
// }, {});
// ○○○○
