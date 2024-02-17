const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { AST } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  AST.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  AST.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = AST.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  AST.translation;
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
  //       // "雫のいら立ったタイミングを見計らったように現れたヴ[r]ォイドに、熱い正義の炎を[ruby text=ほとばし]迸らせる。",
  //       // "【浩輔】（仕事も終わったばっかだってのに、みんな元気だよなあ……）",
  //       "「Wh-What are you going to do... ? No、ahh... Don't rub that on me!」<END>",
  //     ],
  //     2,
  //     false,
  //     true,
  //     true,
  //     "ast"
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
  //   await translateSelectCenterTextList(["\\c[lexn]リベレーター"], 1)
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(AST.translation.folderPath);
  let start = 0;
  let numberAsync = AST.translation.numberOfFiles;

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
                `${AST.translation.folderPath}/${fileName}`,
                AST.translation.isSelects,
                AST.translation.isTagName,
                AST.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = AST.translation.numberOfFiles;
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
  // const translatedRawFileContent = await readFile(filePath.replace("BGI","BGI_output"),encoding)
  objectCount = {};
  // const dumpFileContent = await readFile(
  //   filePath.replace(/csv/g, "txt"),
  //   encoding
  // );
  let dataList = fileContent.split(/\n/g);
  if (!isSelect)
    dataList = fileContent
      .split(/\n/g)
      .map((v) => v.replace(/<FONT SIZE=[0-9]+>/g, ""));
  // let rawTranslatedDataList = translatedRawFileContent.split(/\r\n/g);
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
      await translateSelectCenterTextList(dataList, 3, false, AST, "cst")
    ).join("\n");
    return await writeFile(filePath, translatedFileContent, encoding);
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === ""
      ) {
        isNewDialog = true;
        return ans;
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
      count3++;
      temp += " " + (rawText.trim() === "---" ? "" : rawText.trim());
      if (rawText.match(/\[Cock\]/)) {
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
  // console.log(rawTextList);
  let translatedTextList = await translateOfflineSugoiCt2LongList(
    // [...rawTextList].map((text) => {
    //   return text.split(",")[0].includes("pylm")
    //     ? text.split(",")[3].replace(/"/g, "")
    //     : text.split(",")[0].replace(/"/g, "");
    // }),
    rawTextList,
    3,
    false,
    true,
    false,
    "ast",
    "Eroit"
  );

  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  let translatedFileContent = dataList.reduce((ans, rawText, index) => {
    if (!AST.translation.isNoFilter) {
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
      temp = temp;
      ans.push(temp);
      if (AST.translation.isArtemis) ans.push('					{"rt2"},');
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
function checkIsContinue(dumpList, previousText) {
  let isContinue = false;
  let isBr = false;
  const previousDumpText = dumpList.find((text) => text.includes(previousText));
  if (previousDumpText) {
    if (!checkFoundPG(dumpList, previousText)) {
      isContinue = true;
    }
  }
  return { isContinue, isBr };
}
function checkFoundPG(dumpList, text) {
  let isCheck = false;
  if (!objectCount[text]) objectCount[text] = 0;
  objectCount[text] += 1;
  let dumpTextIndex = -1;
  let count = 0;
  for (let i = 0; i < dumpList.length; i++) {
    const dumpText = dumpList[i];
    if (dumpText.replace(/<[a-zA-Z0-9]+>/g, "") === text) {
      count++;
      if (count === objectCount[text]) {
        dumpTextIndex = i;
        break;
      }
    }
  }
  // console.log(dumpTextIndex)
  if (dumpTextIndex < 0) return isCheck;
  if (text) {
    if (dumpList[dumpTextIndex].includes("<PG>")) {
      isCheck = true;
    }
    if (!isCheck) {
      do {
        dumpTextIndex++;
        if (dumpList[dumpTextIndex] === "<PG>") {
          isCheck = true;
        }
      } while (!isCheck && dumpList[dumpTextIndex].match(/^[{]/g));
    }
  }
  // console.log(isCheck)
  return isCheck;
}
async function fixTranslatedFileKs(filePathTranslated, filePathRaw, encoding) {
  const fileContent = await readFfile(filePathTranslated, encoding);
  let dataList = fileContent.split(/\n/i);
  let check = true;
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].trim().match(/\[rb/g)) {
      console.log(dataList[i]);
      check = false;
      break;
    }
  }
  // console.log(dataList.length,check);
  if (check) {
    fs.unlinkSync(filePathRaw);
  }
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
