const axios = require("axios");
const path = require("path");
async function extractTextFromImage(filePath) {
  let fullImagePath = path.resolve(filePath);
  let result = await axios({
    url: `http://localhost:8575/`,
    method: "post",
    data: JSON.stringify({
      content: fullImagePath,
      message: "convert image to text",
    }),
    headers: { "Content-Type": "application/json" },
  });
  return result.data;
}

module.exports = extractTextFromImage;
