const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateOfflineSugoiLongList,
  translateOfflineSugoiCt2LongList,
  excludeTranslateText,
} = require("./translateJapanese");
const { med } = require("../setting.json");
const delay = require("./delay");
// const handleWordWrap = require("./handleWordWrap");
const { translateSelectCenterTextList } = require("./translateJapanese");
const handleWordWrap = require("./handleWordWrap");
const handleWordWrapGlue = require("./handleWordWrapGlue");
const containRegExpI = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "i"
);
const containRegExpG = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain,
  "g"
);
const containRegExpG2 = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedContain2,
  "g"
);
const exceptRegExpI = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "i"
);
const exceptRegExpG = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept,
  "g"
);
const exceptRegExpG2 = new RegExp(
  med.translation.regExpToExcludeSentenceNotNeedTranslatedExcept2,
  "g"
);

const containTagNameRegExpI = new RegExp(
  med.translation.regExpToFilterSentenceContainTagName,
  "i"
);
const addedString = med.translation.addedString;
const { addedStringAfterTranslation, addedPrefixAfterTranslation } =
  med.translation;
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
  //       `m[72286] = "むしろ、さらなる快楽を求めるように、浅ましく\${ruby text=うごめ }蠢\${/ruby}いていた。"`,
  //       `m[24983] = "身体の深奥に、新たな生命の\${ruby text=ほうが }萌芽\${/ruby}を感じる。"`
  //     ],
  //     2,
  //     false,
  //     true,
  //     true,
  //     "ain"
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
  //   handleWordWrapGlue(
  //     [
  //       `m[61264] = "Are you dissatisfied with the scenario I wrote？It’s a problem before "`,
  //       `m[61265] = "! "`,
  //       `m[61266] = "The punch line has changed!"`,
  //     ],
  //     10000,
  //     "\\r\\n",
  //     true
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

  const listFileName = fs.readdirSync(med.translation.folderPath);
  let start = 0;
  let numberAsync = med.translation.numberOfFiles;

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
              await translateFileMed(
                `${med.translation.folderPath}/${fileName}`,
                med.translation.isSelects,
                med.translation.isTagName,
                med.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = med.translation.numberOfFiles;
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

async function translateFileMed(filePath, isSelect, isTagName, encoding) {
  const fileContent = await readFile(filePath, encoding);
  const json = JSON.parse(fileContent);
  // console.log(json);
  const rawTexts = Object.keys(json);
  let saveIndex = null;
  const handledTexts = rawTexts.reduce((ans, curr, index) => {
    // if (curr.match(/^　/g)) {
    //   if (saveIndex === null) saveIndex = index;
    //   ans[saveIndex - 1] += curr;
    //   ans.push(" ");
    //   return ans;
    // } else {
    //   saveIndex = null;
    // }
    if (!curr.match(/[a-zA-Z_]/g)) {ans.push(curr); return ans};
    return ans;
  }, []);
  const translationList = await translateOfflineSugoiCt2LongList(
    handledTexts,
    3,
    false,
    true,
    false,
    "ain"
  );
  let count = 0;
  const ans = rawTexts.reduce((ans, curr, index) => {
    if(curr.match(/[a-zA-Z_]/g)) {
      ans[curr] = "";
      return ans;
    }
    ans[curr] = translationList[count];
    count++;
    return ans;
  }, {});
  await writeFile(filePath, JSON.stringify(ans, null, 2), encoding);
}
