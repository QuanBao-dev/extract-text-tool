module.exports = function delay(time) {
  return new Promise((resolve) => {
    let count = 0;
    console.log(
      `Wait for ${parseInt(time / 1000)} seconds for the server to reset`
    );
    let interval = setInterval(() => {
      count++;
      // console.log(`${count}/${time / 1000}`);
      if (count === parseInt(time / 1000)) {
        console.log("Done");
        clearInterval(interval);
        resolve("Done");
      }
    }, 1000);
  });
};
