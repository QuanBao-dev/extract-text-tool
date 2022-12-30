const fs = require("fs");
const delay = require("./delay");
const { writeFile } = require("./handleFile");
(async() => {
  const listFileName = fs.readdirSync("./CG");
  // create manifest
  const ans = [];
  ans.push("#ALICEPACK");
  ans.push("MamanCG.afa");
  listFileName.forEach((v) => ans.push(v));
  await writeFile("./CG/manifest",ans.join("\n"),"utf8")
  await delay(10000000)
})()