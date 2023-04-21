const fs = require("fs");
const delay = require("./delay");

(async () => {
  const listFileName = fs.readdirSync("./wafflepak");
  let start = 0;
  let numberAsync = 1;

  do {
    try {
      do {
        // await translateScn(`./scn/${listFileName[start]}`);
        await Promise.all(
          listFileName
            .slice(start, start + numberAsync)
            .map(async (fileName) => {
              console.log("Start:", fileName);
              const patchFolder = `./wafflepak/${
                fileName.replace(".txt", "") + "116120116"
              }`;
              if (!fs.existsSync(patchFolder)) {
                fs.mkdirSync(patchFolder);
              }
              const oldPathFile = `./wafflepak/${fileName}`;
              const newPathFile =
                "./wafflepak/" +
                fileName.replace(".txt", "") +
                "116120116" +
                "/" +
                fileName;
              fs.renameSync(oldPathFile, newPathFile);
              console.log(oldPathFile, newPathFile);
            })
        );
        start += numberAsync;
        numberAsync = 1;
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
