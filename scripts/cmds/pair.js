const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    version: "1.5",
    author: "--USER--",
    role: 0,
    shortDescription: "Find your perfect match!",
    longDescription: "This command pairs you with another user in the chat based on gender and generates a compatibility percentage.",
    category: "fun",
    guide: "{pn}",
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      // Paths for cached images
      const pathImg = `${__dirname}/cache/background.png`;
      const pathAvt1 = `${__dirname}/cache/avt1.png`;
      const pathAvt2 = `${__dirname}/cache/avt2.png`;

      // Retrieve sender's ID and user information
      const senderID = event.senderID;
      const threadInfo = await api.getThreadInfo(event.threadID);
      const allUsers = threadInfo.userInfo;

      // Retrieve sender's name and gender
      const senderInfo = allUsers.find(user => user.id === senderID);
      const senderGender = senderInfo.gender;
      const senderName = (await api.getUserInfo(senderID))[senderID].name;

      // Filter potential matches based on gender
      const botID = api.getCurrentUserID();
      let candidates = allUsers.filter(user => user.id !== senderID && user.id !== botID);
      
      if (senderGender === "FEMALE") {
        candidates = candidates.filter(user => user.gender === "MALE");
      } else if (senderGender === "MALE") {
        candidates = candidates.filter(user => user.gender === "FEMALE");
      }

      // Ensure there are candidates available
      if (candidates.length === 0) {
        return api.sendMessage("No suitable match found in the chat.", event.threadID);
      }

      // Randomly select a match
      const match = candidates[Math.floor(Math.random() * candidates.length)];
      const matchID = match.id;
      const matchName = (await api.getUserInfo(matchID))[matchID].name;

      // Generate a random compatibility percentage
      const compatibility = Math.floor(Math.random() * 100) + 1;

      // Define background images
      const backgrounds = [
        "https://i.postimg.cc/wjJ29HRB/background1.png",
        "https://i.postimg.cc/zf4Pnshv/background2.png",
        "https://i.postimg.cc/5tXRQ46D/background3.png",
      ];
      const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Fetch avatars and background image
      const [avatar1Buffer, avatar2Buffer, backgroundBuffer] = await Promise.all([
        axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=YOUR_ACCESS_TOKEN`, { responseType: "arraybuffer" }),
        axios.get(`https://graph.facebook.com/${matchID}/picture?width=720&height=720&access_token=YOUR_ACCESS_TOKEN`, { responseType: "arraybuffer" }),
        axios.get(randomBackground, { responseType: "arraybuffer" }),
      ]);

      // Save the images locally
      await fs.writeFile(pathAvt1, Buffer.from(avatar1Buffer.data, "utf-8"));
      await fs.writeFile(pathAvt2, Buffer.from(avatar2Buffer.data, "utf-8"));
      await fs.writeFile(pathImg, Buffer.from(backgroundBuffer.data, "utf-8"));

      // Create a canvas and draw the images
      const baseImage = await loadImage(pathImg);
      const avatar1 = await loadImage(pathAvt1);
      const avatar2 = await loadImage(pathAvt2);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar1, 100, 150, 300, 300);
      ctx.drawImage(avatar2, 900, 150, 300, 300);

      // Save the final image and send the message
      const finalImageBuffer = canvas.toBuffer();
      await fs.writeFile(pathImg, finalImageBuffer);

      await api.sendMessage({
        body: `💘 Successful pairing! ${senderName} and ${matchName} are matched! 🥳 Compatibility: ${compatibility}%`,
        mentions: [
          { tag: `${senderName}`, id: senderID },
          { tag: `${matchName}`, id: matchID }
        ],
        attachment: fs.createReadStream(pathImg)
      }, event.threadID);

      // Clean up cached images
      await Promise.all([fs.unlink(pathAvt1), fs.unlink(pathAvt2), fs.unlink(pathImg)]);
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while processing the pairing command. Please try again later.", event.threadID);
    }
  }
};