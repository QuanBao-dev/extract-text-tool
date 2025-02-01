const fs = require("fs");
const {
  readFile,
  writeFile,
  convertCSVToJson,
  convertJsonToCSV,
  simpleWriteFile,
  saveBackup,
} = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { pinpoint } = require("../setting.json");
const AFHConvert = require("ascii-fullwidth-halfwidth-convert");
const converter = new AFHConvert();

const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
// const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  pinpoint.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  pinpoint.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = pinpoint.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  pinpoint.translation;
// [一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+
(async () => {
  // console.log(
  //   handleWordWrap(
  //     65,
  //     "It was about two kilometers from east to west, about five hundred meters from north to south, and it was long and thinly shaped, so you could walk around it once in an hour, but it was pretty wide inside.",
  //     "\r\n",
  //     10
  //   )
  // );
  // await delay(100000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     ["陰核こそは、女を愛撫する際の[ruby text=かなめ]要となるポイント――"],
  //     3,
  //     false,
  //     true,
  //     false,
  //     "kiriruby",
  //     "",
  //     false,
  //     false
  //   )
  // );
  // await delay(100000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       // "「かおるこ先輩とは上手くいってるんでしょうね？　もし悲しませたりしていたら承知しないわよ」",
  //       // "「心配しなくても大丈夫だって。そもそも桜木はかおることしょっちゅう会って話してるんじゃないのか？」",
  //       // "「かおることか呼ばないで。イラッとくるから」",
  //       // `少女は愛らしい横顔とは相反する[rb,何処,どこ]か虚ろな表情で、わらべうたを口ずさんでいる。`,
  //       // "そんな街の一角。やや小さめのマンションに、[一人称]の荷物を積んだトラックが停まった。[np]",
  //       // "たまには、[ヒロイン名]抜きで出かけるのも良いかなと思って出かけたんだけど……[np]",
  //       // "[愛子さん]が顔を赤くして言う。",
  //       // "[一人称]の前だと噛み殺してたのかもしれないな。"
  //       "[pv b=2 s=03ku007][m久美子]きゃっ！？　ダメっ！[en]",
  //       "[m洋]俺たち上級生が、校門前に集合してたらさ。下級生たちの妨げになるからだよ。たぶんな。[en]",
  //       "[m勇太]うんうん。ダイジョーブだよ。オレ、リコ先生のいいつけはちゃんと守るし♪[r]リコ先生の身体も、オレが命がけで守ってあげるからさ♪[en]",
  //       "[pv b=2 s=01ku003][m久美子]将来、結婚しちゃったりして。[en]",
  //       "[pv b=2 s=01na029][m渚]・・・大丈夫みたいです。[en]",
  //       "[m健二]お弁当、僕と勇太くんのぶん、ください。[en]"
  //     ],
  //     2,
  //     false,
  //     true,
  //     false,
  //     "kiri2",
  //     undefined,
  //     undefined,
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
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       `#何やら楽しげに、鼻歌でも奏でそうな様子で、|春日[かすが]|日向[ひなた]が花壇に水を撒いていた。`,
  //     ],
  //     2,
  //     false,
  //     false,
  //     false,
  //     "liar",
  //     "",
  //     false,
  //     false
  //   )
  // );
  // await delay(10000000);
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       // "雫のいら立ったタイミングを見計らったように現れたヴ[r]ォイドに、熱い正義の炎を[ruby text=ほとばし]迸らせる。",
  //       // "【浩輔】（仕事も終わったばっかだってのに、みんな元気だよなあ……）",
  //       // "「夜舟流着地術・参式――“<Rはごろもひとえ>羽衣一重</R>”」",
  //       // "<1032,610102,121>「──いいか、二つに一つだ。このままデコを吹っ飛ばされるか、それとも<r・・・・>愉快な嘘</r>を白状して許しを請うか。選べ」",
  //       // "<4604,611643,63>彼らの立っていた横の石壁が不自然に<r・・・・・>盛り上がる</r>。",
  //       // "<4244,113309,60>「タウン誌で“凪沙のＢ級グルメ名店10”にも選ばれたんだから」",
  //       "「はっ、女王陛下の<ruby text='みこころ'>御心</ruby>のままに」",
  //       "「にゃはー<font color='0xf37eb8' edge='0x000000'><img src='font\\mark\\cat'></font>」",
  //       `「八[ruby text="ほ　づ　み"]月朔日さんですよねー。八月朔日茉莉さん。さっきアキくんがお腹痛いーっていなかった間に、自己紹介あったんですよー」`,
  //     ],
  //     2,
  //     false,
  //     true,
  //     false,
  //     "kiriruby"
  //   )
  // );
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       "叶太",
  //       "こころ",
  //       "千依",
  //       "めぐり",
  //       "常夜",
  //       "楓美",
  //       "いのり",
  //       "未愛",
  //       "小雀",
  //       "叶梨",
  //       "未来",
  //       "大河",
  //       "光生",
  //       "怜",
  //       "夜行",
  //     ],
  //     4,
  //     false,
  //     true,
  //     false,
  //     "srp"
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
  // console.log(
  //   await translateOfflineSugoiCt2LongList(
  //     [
  //       `視界は[ルビ rb = "霞/かす"]み、このまま倒れ込んでしまいたいという考えが脳内を支配した。`,
  //       `名刺に書かれた名前は野生[ルビ rb = "熊雄/くまお"]。`,
  //       `「[ルビ rb = "野生/のせ"]先生よ」`,
  //     ],
  //     3,
  //     false,
  //     false,
  //     false,
  //     "kiriruby"
  //   )
  // );
  // await delay(10000000);
  const listFileName = fs.readdirSync(pinpoint.translation.folderPath);
  let start = 0;
  let numberAsync = pinpoint.translation.numberOfFiles;

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
                `${pinpoint.translation.folderPath}/${fileName}`,
                pinpoint.translation.isSelects,
                pinpoint.translation.isTagName,
                pinpoint.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = pinpoint.translation.numberOfFiles;
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
  let count2 = 0;
  let dataList = [];
  const fileContent = await readFile(filePath, encoding);
  // return await writeFile(filePath, convertCSVToJson(fileContent), "utf8");
  // return await writeFile(filePath, convertJsonToCSV(fileContent), "utf8");

  dataList = fileContent.split(/\r\n/g);
  if (fileContent.includes("# error")) return;
  // do {
  //   const fileContent = await readFile(filePath, encoding);
  //   // const translatedRawFileContent = await readFile(filePath.replace("BGI","BGI_output"),encoding)
  //   objectCount = {};
  //   // const dumpFileContent = await readFile(
  //   //   filePath.replace(/csv/g, "txt"),
  //   //   encoding
  //   // );
  //   dataList = fileContent.split(/\r\n/g);
  //   if (dataList.length === 1) {
  //     encoding = "shiftjis";
  //     continue;
  //   }
  //   break;
  // } while (true);

  // console.log(dataList);
  // .map((v) => v.replace(/\[ruby:/g, "").replace(/\[\/ruby\]/g, "").replace(/\]/g,""));
  // let rawTranslatedDataList = translatedRawFileContent.split(/\r\n/g);
  // let dumpList = dumpFileContent.split(/\r\n/g);
  // console.log(dataList);
  // let temp2 = [];
  // dataList.forEach((text) => {
  //   const textList = text.split("\n");
  //   textList.forEach((text) => temp2.push(text));
  // });
  // dataList = [...temp2];
  // console.log(dataList)
  // return await writeFile(
  //   filePath,
  //   dataList.filter(v => v !== "").join("\r\n"),
  //   "utf16"
  // );
  let temp = "";
  console.time(filePath);
  if (isSelect) {
    const translatedFileContent = (
      await translateSelectCenterTextList(dataList, 3, false, pinpoint, "srp")
    ).join("\r\n");
    return await writeFile(
      filePath,
      translatedFileContent,
      encoding,
      false,
      true
    );
  }
  let isNewDialog = true;
  let count3 = 0;
  let listCount = [];
  const suffixList = [];
  // console.log(dataList)
  let isScript = false;
  let rawTextList = dataList
    .reduce((ans, rawText, index) => {
      if (!pinpoint.translation.isNoFilter) {
        if (rawText.match(/(endscript)|(\.case 1)|(},)/g)) {
          isScript = false;
        }
        if (
          // !rawText.match(/\[en\]/g)
          // !rawText.match(/\[[>>地]+\]/g)
          // !rawText.match(/^(\[ruby )/g)
          // !rawText.match(/\[p\]\[p\]/g)
          // !rawText.match(regExp)
          // !rawText.match(/^"/g)
          // ||
          (rawText.trim().match(containRegExpI) &&
            !rawText.trim().match(exceptRegExpI)) ||
          rawText.trim() === "" ||
          isScript
          // !rawText.match(/(^\[─+\])/g)
          // index === 0
          // !rawText.match(containRegExpG2) || rawText.match(/^;/g)
          // rawText.match(containTagNameRegExpI)
          // !rawText.match(containTagNameRegExpI)
          // false
        ) {
          if (rawText.match(/(iscript)|(^\.select)|(select={)/g)) {
            isScript = true;
          }
          // console.log(rawText);
          isNewDialog = true;
          return ans;
        }
      }
      if (ans.length > 0 && isNewDialog === false) {
        dataList[index - 1] = dataList[index - 1].replace(/［Ｔｅｍｐ］/, "");
        ans[ans.length - 1] = ans[ans.length - 1].replace(/［Ｔｅｍｐ］/, "");
      }
      ans.push(rawText + "［Ｔｅｍｐ］");
      dataList[index] = dataList[index] + "［Ｔｅｍｐ］";
      isNewDialog = false;
      return ans;
    }, [])
    .reduce((ans, rawText) => {
      // if (rawText.match(/^(\[ruby text=")/g))
      //   rawText = rawText.replace("[ruby text=", "").replace('"]', "");
      if (pinpoint.translation.isNoFilter) {
        ans.push(
          rawText
            .replace(/［Ｔｅｍｐ］/g, "")
            .replace(/\[SF\]/g, "ユウト")
            .replace(/\[SL\]/g, "シグルス")
            .replace(/\[HF\]/g, "ユウト")
        );
        return ans;
      }
      count3++;
      temp += (rawText.trim() === "---" ? "" : rawText) + " ";
      if (rawText.match(/［Ｔｅｍｐ］/)) {
        // suffixList.push(
        //   temp.match(/(\[[a-zA-Z =\[\]_]+\]+)$/g)[0].replace(/\[Ｔｅｍｐ\]/g, "")
        // );
        ans.push(
          temp
            .replace(/\[font size=[0-9]+\]/g, "")
            .replace(/［Ｔｅｍｐ］/g, "")
            .replace(/\[r\](\\)?/g, "")
            .replace(/／/g, "")
            .replace(/\[r\]/g, "")
          // .trim()
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
  // console.log(rawTextList)
  // const translatedTextList = [...rawTextList].map((v)=>v.slice(0,v.length - 1).replace("]","]\r\n")+"]");
  // console.log(rawTextList)
  // const translatedTextList = rawTextList.map((text) => {
  //   if(text.length > 125){
  //     return `<font size ='-6'>${text}</font>`
  //   }
  //   return text;
  // });
  // let isAdd = false;
  // console.log(rawTextList)
  // const translatedTextList = rawTextList.map((v) => {
  //   if(!v.match(/^[【『「（《]/g)){
  //     return "　"+v
  //   }
  //   return v.replace(/^\(/g,"（");
  // })
  // const translatedTextList = [...rawTextList].map((v) =>
  //   converter.toFullWidth(v)
  // );
  // const translatedTextList = [...rawTextList];
  const translatedTextList = await translateOfflineSugoiCt2LongList(
    rawTextList,
    // .reduce((ans, text) => {
    //   if (isAdd) {
    //     if (!text.includes("+")) {
    //       isAdd = false;
    //     }
    //     let temp;
    //     for (let i = ans.length; i > 0; i--) {
    //       if (!!ans[i]) {
    //         temp = i;
    //         break;
    //       }
    //     }
    //     ans[temp] += text;
    //     ans[temp] = ans[temp].replace(/\+/g,"")
    //     ans.push("");
    //     return ans;
    //   }
    //   if (text.includes("+")) {
    //     isAdd = true;
    //   }
    //   ans.push(text);
    //   return ans;
    // }, []),
    // .map((v) => v.replace(/\\2/g,"雅彦"))
    // .map((v) => {
    //   console.log({v})
    //   return v.match(/@nm t="([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ【『「（《》】』」）]+)?"/g)[0].replace(/@nm t="/g,"").replace(/"/g,"")
    // })
    3,
    false,
    true,
    false,
    "kiriruby",
    "",
    false,
    false
  );
  // const translatedTextList = rawTextList.map((v) => `@font size="25"\r\n`+v)
  // .map((v) => converter.toFullWidth(v).replace(/］/g,"]").replace(/［/g,"["));
  // .map((text) => {
  //   if(!text.includes("[pre]")) return  text + "[pre]";
  //   return text
  // });

  // console.log({translatedTextList})
  // const translatedTextList = await translateSelectCenterTextList(
  //   rawTextList,
  //   3,
  //   true,
  //   pinpoint,
  //   "srp"
  // );
  // const translatedTextList = rawTextList.reduce((ans, curr) => {
  //   if (curr.trim() === "") return ans;
  //   if (!curr.trim().match(/^(<)/g)) {
  //     ans[ans.length - 1] = ans[ans.length - 1].trim() + " " + curr;
  //     return ans;
  //   }
  //   ans.push(curr);
  //   return ans;
  // }, []);
  // return await writeFile(filePath, translatedTextList.join("\r\n")+"\r\n", encoding);
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
  //   3,
  //   false,
  //   true,
  //   true,
  //   "BGI"
  // );
  // let translatedTextList = rawTranslatedDataList.map((rawTranslatedText, index) => {
  //   if(rawTranslatedText.includes("<R")) return rawTextList[index];
  //   return rawTranslatedText
  // })

  let count = 0;
  let isDisable = false;
  // return await writeFile(filePath, translatedTextList.join("\n")+"\n", "utf8");
  isScript = false;
  let translatedFileContent = dataList.reduce((ans, rawText, index) => {
    if (!pinpoint.translation.isNoFilter) {
      if (rawText.match(/(endscript)|(\.case 1)|(},)/g)) {
        isScript = false;
      }
      if (
        // !rawText.match(/^((\[姫)|(\[日向)|(\[星音))|(\[font )/g)
        // rawText.match(/^(\[ruby )/g)
        // !rawText.match(/^(\[p\]\[p\])/g)
        // !rawText.match(/mruby/g)
        // !rawText.match(/\[[>>地]+\]/g)
        // !rawText.match(regExp)
        // !rawText.match(/^"/g) ||
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === "" ||
        isScript
        // !rawText.match(containRegExpG2) || rawText.match(/^;/g)
        // rawText.match(containTagNameRegExpI)
      ) {
        if (rawText.match(/(iscript)|(^\.select)|(select=)/g)) {
          isScript = true;
        }
        isDisable = false;
      }
      if (isDisable) return ans;
      if (
        // !rawText.match(/\[en\]/g)
        // !rawText.match(/(^\[和琴先輩\])|(^\[日向ちゃん\])/g)
        // !rawText.match(/^(\[ruby )/g)
        // !rawText.match(/^(\[星音)/g)
        // !rawText.match(/\[p\]\[p\]/g)
        // !rawText.match(/mruby/g)
        // !rawText.match(/^『[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟～＆。●・♡＝…：、―]/g)
        // !rawText.match(/\[[>>地]+\]/g)
        // !rawText.match(regExp)
        // !rawText.match(/^"/g)
        // ||
        (rawText.trim().match(containRegExpI) &&
          !rawText.trim().match(exceptRegExpI)) ||
        rawText.trim() === "" ||
        isScript
        // !rawText.match(/(^\[─+\])/g)
        // !rawText.match(containTagNameRegExpI)
        // index === 0
        // !rawText.match(containRegExpG2)|| rawText.match(/^;/g)
        // rawText.match(containTagNameRegExpI)
      ) {
        if (rawText.match(/(iscript)|(^\.select)|(select=)/g)) {
          isScript = true;
        }
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
      temp = temp.replace(/!/g, "！");
      // const rawNameTag = rawText.match(/@nm t="([一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ【『「（《》】』」）]+)?"/g)[0].replace(/@nm t="/g,"").replace(/"/g,"");
      // let isRtContained = rawText.includes("rt");
      // const textTemp = (temp.match(/[0-9]+ (【.+】)?/g) || [""])[0];
      // const prefixNumber = textTemp.split(" ")[0];
      // const prefixName = textTemp.split(" ").slice(1).join(" ");
      // if (!temp.match(/[【『「（《》】』」）]/g)) temp = "　" + temp;
      ans.push(
        // handleWordWrap(
        //   Math.floor(temp.length / listCount[count]) < 41
        //     ? Math.floor(temp.length / listCount[count])
        //     : 45,
          temp
        //   "\r\n",
        //   listCount[count]
        // )
        // handleWordWrap(71, temp.replace(/’/g,"'"), "\r\n", listCount[count])
        // "[font size=20]\r\n"+temp
        // `{"exfont", size="f2"},\r\n${temp}\r\n{"exfont"},`

        // .replace(/ /g, "　")
        // .replace(/time/g, "tｉme")
        // .replace(/Time/g, "Tｉme")
        // .replace(/Jump/g, "Jｕmp")
        // .replace(/jump/g, "jｕmp")
        // .replace(/run/g, "rｕn")
        // .replace(/end/g, "ｅnd")
        // .replace(/♥/g, "{image=gui/heart.png}{alt}heart{/alt}")
        // count2 === 0 && temp.includes("【")
        //   ? prefixNumber +
        //       " " +
        //       converter.toFullWidth(
        //         prefixName + temp.replace(/[0-9]+ (【.+】)?/g, "")
        //       )
        //   : temp

        // "@font size=22\n" + temp
        // temp.replace(/if/g, "ｉf").replace(/time/g, "tｉme").replace(/else/g, "ｅlse").replace(/:/g, "：")
        // .replace(/@/g, "＠")
        // (!temp.includes("[") ? "　" : "") + temp
        // handleWordWrap(71, temp, "\\n").replace(/(\\n)$/g, "")
        // handleWordWrap(50, temp, "\r\n", listCount[count])
        // prefix + (temp === "@@" ? "" : temp).replace(/,( )?/g, "、")
        // ("　"+temp).replace(/　「/g,"「")
        // rawText.replace(/@nm t="[一-龠ぁ-ゔァ-ヴーａ-ｚＡ-Ｚ０-９々〆〤ヶｦ-ﾟァ-ヶぁ-んァ-ヾｦ-ﾟ〟！～？＆。●・♡＝…：＄αβ%％●＜＞♀♂♪─〇☆―〜゛×・○♥　、☆＆『』‥ⅠⅡⅢⅣⅤ『』《》￥ｎ]+"/g,`@nm t="${temp}"${!isRtContained ? ` rt="${rawNameTag}"`:""}`)
        // temp
        // .replace(/,( )?/g, "、")
        // .replace(/、/g, ", ")
        // .replace(/[◆✩♥♡●♪]/g, "")
        // .replace(/❛/g, "’")
        // .replace(/é/g, "e")
        // .replace(/ō/g, "o")
        // .replace(/[àâ]/g, "a")
      );
      // if (prefixName) count2++;
      if (pinpoint.translation.isArtemis) ans.push('					{"rt2"},');
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
    .join("\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding, false, true);
  // await saveBackup();
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
