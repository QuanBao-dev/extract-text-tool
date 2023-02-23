const fs = require("fs");
const { readFile, writeFile } = require("./handleFile");
const {
  translateSelectCenterTextList,
  translateOfflineSugoiCt2LongList,
} = require("./translateJapanese");
const { rpgm } = require("../setting.json");
const delay = require("./delay");
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
  //       "雫のいら立ったタイミングを見計らったように現れたヴ[r]ォイドに、熱い正義の炎を[ruby text=ほとばし]迸らせる。"
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
  // await delay(10000000);
  // console.log(
  //   await translateSelectCenterTextList(
  //     [
  //       "「私なんかより、グイーネの方がよほど人を導くのが上手い。　紋章は私を先に選んでしまって後悔してるだろうな。」",
  //       "「どうせならあいつらも呼んで『やれ』ばよかったかな？『一緒に大陸を救った英雄様を調教しましょう！』ってなぁはっはっはっはっは！！」",
  //     ],
  //     2,
  //     true
  //   )
  // );
  // await delay(10000000);

  const listFileName = fs.readdirSync(rpgm.translation.folderPath);
  let start = 0;
  let numberAsync = rpgm.translation.numberOfFiles;

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
              await translateFileRPGM(
                `${rpgm.translation.folderPath}/${fileName}`,
                rpgm.encoding
              );
            })
        );
        start += numberAsync;
        numberAsync = rpgm.translation.numberOfFiles;
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

async function translateFileRPGM(filePath, encoding) {
  const fileContent = await readFile(filePath, encoding);
  objectCount = {};
  console.time(filePath);
  const dataRawList = fileContent
    .split("> BEGIN STRING\r\n")
    .map((text) => text.split("\r\n"));
  // const textDialogueList = dataRawList.map((data) => {
  //   const dialogueList = data.slice(1).filter((v) => {
  //     return !v.includes(">") && v !== "";
  //   });
  //   return dialogueList.join("");
  // });
  const characterNameList = [];
  const textDialogueList = dataRawList.map((data, index) => {
    if (index === 0) {
      characterNameList.push("");
      return "";
    }
    let indexEndString = data.findIndex((v) => v.includes("> CONTEXT"));
    if (indexEndString < 0) return data.join("\r\n");
    let temp = "";
    let i = indexEndString - 1;
    let finalText = "";
    while (data[i] && !data[i].includes(">")) {
      if (data[i + 1].match(/^[「『（【{\\]/g)) {
        if (!data[i + 1].slice(0,data[i + 1].length - 1).match(/[】』」）}]/g)) {
          break;
        }
      }
      temp = data[i] + temp.trim();
      finalText = data[i];
      i--;
    }
    if (data[i + 1] && data[i + 1].match(/^[「『（【{\\]/g)) {
      characterNameList.push(data[i] || "");
    } else {
      characterNameList.push("");
    }
    return temp;
  });
  // console.log(textDialogueList)
  // const characterNameList = dataRawList.map((data) => {
  //   return data[0];
  // });
  // const translatedDialogueList = textDialogueList;
  // const translatedCharacterNameList = characterNameList;

  const translatedDialogueList = await translateSelectCenterTextList(
    textDialogueList,
    2,
    true
  );
  const translatedCharacterNameList = await translateSelectCenterTextList(
    characterNameList,
    1,
    false
  );
  let isDialogueNext = false;
  const dataList = dataRawList.map((data) => {
    return data
      .reduce((ans, text) => {
        if (text.includes("> CONTEXT") && isDialogueNext === true) {
          ans.push(text);
          return ans;
        }
        if (isDialogueNext === false) {
          ans.push(text);
        } else {
          ans.push("##@@$$");
          isDialogueNext = false;
        }
        if (text.includes("> CONTEXT")) {
          isDialogueNext = true;
        }
        return ans;
      }, [])
      .join("\r\n");
  });
  count = 0;
  const translatedFileContent = dataList
    .map((v, index) => {
      return v.replace(
        "##@@$$",
        translatedCharacterNameList[index] +
          (translatedCharacterNameList[index] !== "" ? "\r\n" : "") +
          translatedDialogueList[index]
      );
    })
    .join("> BEGIN STRING\r\n");
  console.timeEnd(filePath);
  await writeFile(filePath, translatedFileContent, encoding);
}

function isHavingSpecialCharacter(dataTextList) {
  let check = false;
  for (let i = 0; i < dataTextList.length; i++) {
    if (dataTextList[i].match(/[\[・]/g)) {
      check = true;
    }
  }
  return check;
}
