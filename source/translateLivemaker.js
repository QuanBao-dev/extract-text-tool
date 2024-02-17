const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { LIVEMAKER } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
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
  //   await translateOfflineSugoiCt2LongList(
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
  //     false,
  //     true,
  //     true,
  //     "EAGLS"
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
  //       "雫のいら立ったタイミングを見計らったように現れたヴ[r]ォイドに、熱い正義の炎を[ruby text=ほとばし]迸らせる。",
  //       "【浩輔】（仕事も終わったばっかだってのに、みんな元気だよなあ……）"
  //     ],
  //     2,
  //     true
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

  const listFileName = fs.readdirSync(LIVEMAKER.translation.folderPath);
  let start = 0;
  let numberAsync = LIVEMAKER.translation.numberOfFiles;

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
                `${LIVEMAKER.translation.folderPath}/${fileName}`,
                LIVEMAKER.translation.isSelects,
                LIVEMAKER.translation.isTagName,
                LIVEMAKER.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = LIVEMAKER.translation.numberOfFiles;
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
  // return await writeFile(
  //   filePath,
  //   `${fileContent}`,
  //   encoding,
  //   true
  // );

  const dumpFileContent = await readFile(
    filePath.replace(/csv/g, "txt"),
    encoding
  );
  let dataList = fileContent.split(/\r\n/g).reduce((ans, curr) => {
    if (curr.includes("\n")) {
      ans.push(...curr.split("\n"));
      return ans;
    }
    ans.push(curr);
    return ans;
  }, []);
  // console.log(dataList);
  let dumpList = dumpFileContent
    .replace(
      /<IMG SRC="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ\\]+.gal" [a-zA-Z= "0-9]+>/g,
      "\r\n"
    )
    .split(/\r\n/g)
    .map((v) =>
      v
        .replace(
          /<(\/)?STYLE( ID="[0-9]+")?( RUBY="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ]+")?>/g,
          ""
        )
    );
  // console.log(dumpList)
  // console.log(dataList);
  // let temp2 = [];
  // dataList.forEach((text) => {
  //   const textList = text.split("\n");
  //   textList.forEach((text) => temp2.push(text));
  // });
  // dataList = [...temp2];
  let temp = "";
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(dataList, 1, false)
    ).join("\r\n");
    return await writeFile(filePath, translatedFileContent, encoding);
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
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
      ans.push(rawText.replace(/\[Cock\]/g, ""));
      return ans;
    }, [])
    .slice(1);

  // translatedTextList = translatedTextList.map((text) => text + "[np]");
  // console.log(
  //   checkIsContinue(
  //     dumpList.filter((text) => text !== ""),
  //     "　　　　　　コツコツコツコツコツコツ"
  //   )
  // );
  // await delay(1000000);
  // let prefixList = [...rawTextList].reduce((ans, text, index) => {
  //   if (text.split(",")[3]) {
  //     ans.push(text.split(",").slice(0, 3).join(",") + ",");
  //     return ans;
  //   }
  //   ans.push("");
  //   return ans;
  // }, []);
  // console.log(dumpList)
  let translatedTextList = [...rawTextList].reduce((ans, text, index) => {
    const { isContinue } = checkIsContinue(
      dumpList.filter((text) => text !== ""),
      rawTextList[index - 1]
        ? rawTextList[index - 1].split(",")[0].includes("pylm")
          ? rawTextList[index - 1].split(",")[3].replace(/"/g, "")
          : rawTextList[index - 1].split(",")[0].replace(/"/g, "")
        : undefined
    );
    // if(text === `pylm:text:000005CB.lsb:61:45,000005DD,,"【部　員】`){
    //   console.log(isContinue)
    // }
    // console.log(text)
    // console.log(rawTextList[index - 1]
    //   ? rawTextList[index - 1].split(",")[0].includes("pylm")
    //     ? rawTextList[index - 1].split(",")[3].replace(/"/g, "")
    //     : rawTextList[index - 1].split(",")[0].replace(/"/g, "")
    //   : undefined, isContinue)
    if (isContinue) {
      // if (text.match(/("(,)?)/g)) {
      //   console.log(text);
      //   ans[ans.length - 1] += text;
      //   ans[ans.length - 1] = ans[ans.length - 1].replace(/"/g, "");
      //   return ans;
      // }
      let j = 1;
      if (ans[ans.length - j] === "@@") {
        do {
          if (ans[ans.length - j] !== "@@")
            ans[ans.length - j] += text.split(",")[0].includes("pylm")
              ? text.split(",")[3].replace(/"/g, "")
              : text.split(",")[0].replace(/"/g, "");
          j += 1;
        } while (ans[ans.length - j] === "@@");
      }

      ans[ans.length - j] += text.split(",")[0].includes("pylm")
        ? text.split(",")[3].replace(/"/g, "")
        : text.split(",")[0].replace(/"/g, "");
      ans[ans.length - j] = ans[ans.length - j].replace(/\"/g, "");
      ans.push("@@");
      // console.log(rawTextList[ans.length -1], ans[ans.length - 1])
      return ans;
    }
    ans.push(text.split(",")[3]);
    return ans;
  }, []);
  // const tempList =[...translatedTextList];
  translatedTextList = translatedTextList.filter(
    (text, index) => !(!rawTextList[index].includes("pylm") && text === "@@")
  );
  // for(let i = 0; i < tempList.length ; i ++){
  //   console.log({translated: translatedTextList[i], rawText:rawTextList[i]})
  // }
  const tempList = translatedTextList.filter((v) => v !== "@@");

  const translatedTempList = await translateOfflineSugoiCt2LongList(
    tempList,
    3,
    false,
    true,
    false,
    "kiri-mink"
  );
  let count2 = 0;
  translatedTextList = translatedTextList.reduce((ans, curr) => {
    if (curr !== "@@") {
      ans.push(translatedTempList[count2]);
      count2++;
      return ans;
    }
    ans.push(curr);
    return ans;
  }, []);
  // console.log({ translatedTextList, rawTextList });
  // console.log(translatedTextList);

  /////Replace comma
  // let translatedTextList = [...rawTextList].map((text) => {
  //   const temp = text.split(",").slice(4).join("、");
  //   return temp;
  // });
  // let translatedTextList = await translateOfflineSugoiCt2LongList(
  //   [...rawTextList].map((text) => {
  //     return text.split(",")[0].includes("pylm")
  //       ? text.split(",")[3].replace(/"/g, "")
  //       : text.split(",")[0].replace(/"/g, "");
  //   }),
  //   2,
  //   false,
  //   true,
  //   true,
  //   "srp"
  // );
  // console.log(translatedTextList);
  let count = 0;
  let isDisable = false;

  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  let translatedFileContent = rawTextList.reduce((ans, rawText, index) => {
    if (translatedTextList[count] !== undefined) {
      let temp = translatedTextList[count];
      // let prefix = prefixList[count];
      // if (rawText.match(/(^	)/g)) {
      //   temp = rawText.match(/(	)+/g)[0] + temp;
      // }
      temp = temp;
      // console.log({ translated: temp, rawText });
      // const originalText = rawText.split(",")[3]
      //   ? rawText.split(",")[3]
      //   : rawText.split(",")[0]
      //   ? rawText.split(",")[0]
      //   : "";
      if (!dataList.slice(1)[index].match(/,$/g)) {
        isDisable = true;
        ans.push(dataList.slice(1)[index]);
        return ans;
      }
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
        // rawText +
        //   (temp === "@@" || temp === "Original text" ? "" : temp).replace(
        //     /,( )?/g,
        //     "、"
        //   )
        dataList.slice(1)[index] +
          (temp === "@@"
            ? " "
            : '"' + temp.replace(/,( )?/g, "、").replace(/】/g, "】\r\n") + '"'
          ).replace(/」【/g, "」\r\n【")
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
    .slice(0, translatedFileContent.length - 1)
    .join("\r\n");
  // console.timeEnd(filePath);
  await writeFile(
    filePath,
    `ID,Label,Context,Original text,Translated text\r\n${translatedFileContent}`,
    encoding,
    true
  );
}
function checkIsContinue(dumpList, previousText) {
  // return false
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
    const dumpText = dumpList[i]
      .replace(/<[a-zA-Z0-9]+>/g, "")
      .replace(/ID="[0-9]+">/g, "");
    if (dumpText.replace(/[\r\n]/g, "") === text) {
      count++;
      if (count === objectCount[text]) {
        dumpTextIndex = i;
        break;
      }
    }
  }
  if (dumpTextIndex < 0) return isCheck;
  if (text) {
    if (dumpList[dumpTextIndex].includes("<PG>")) {
      isCheck = true;
    }
    do {
      dumpTextIndex++;
      if (dumpList[dumpTextIndex].trim() === "<PG>") {
        isCheck = true;
      }
    } while (!isCheck && dumpList[dumpTextIndex].match(/^[{]/g));
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
