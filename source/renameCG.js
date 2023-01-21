const fs = require("fs");
const {
  translateOfflineSugoiCt2LongList,
  translateOfflineSugoiCt2,
} = require("./translateJapanese");

// (async () => {
//   const listFileName = fs.readdirSync("./CG");
//   let renameList = [];
//   for (let i = 0; i < listFileName.length; i++) {
//     const v = listFileName[i];
//     const temp = v.split("／");
//     const nameCharacter = temp[1];
//     if (nameCharacter &&nameCharacter.length <= 2) {
//       temp[1] = await translateOfflineSugoiCt2(nameCharacter);
//       if (temp[1].match(/ /g)) {
//         temp[1] = nameCharacter;
//       }
//     }
//     renameList.push(temp.join("／"));
//   }

//   for (let i = 0; i < listFileName.length; i++) {
//     const fileName = listFileName[i];
//     fs.rename("./CG/" + fileName, "./CG_output3/" + renameList[i], (v) => {
//       console.log(v);
//     });
//   }
// })();
(async () => {
  const listFileName = fs.readdirSync("./spt");
  let renameList = [];
  for (let i = 0; i < listFileName.length; i++) {
    const v = listFileName[i];
    temp = v
      .replace("A0", "A")
      .replace("B0", "B")
      .replace("C0", "C")
      .replace("D0", "D")
      .replace("E0", "E")
      .replace("W0", "W");
    renameList.push(temp);
  }

  for (let i = 0; i < listFileName.length; i++) {
    const fileName = listFileName[i];
    fs.rename("./spt/" + fileName, "./spt_output/" + renameList[i], (v) => {
      console.log(v);
    });
  }
})();
