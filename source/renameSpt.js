const fs = require("fs");

(async () => {
  const listFileName = fs.readdirSync("./spt");
  for (let i = 0; i < listFileName.length; i++) {
    const fileName = listFileName[i];
    if (fileName.match("_0000_00"))
      fs.rename(
        "./spt/" + fileName,
        "./spt_output/" + fileName.replace(/(_0000_00)$/g, ""),
        (v) => {
          console.log(v);
        }
      );
  }
})();
