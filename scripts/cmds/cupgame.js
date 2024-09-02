
module.exports = {
  config: {
    name: "cupgame",
    aliases: ["findball", "guesscup"], // Alternative names for the command
    version: "1.0",
    author: "--USER--",
    role: 0, // 0 = User, 1 = Moderator, 2 = Admin
    shortDescription: {
      en: "Guess which cup has the ball!",
    },
    longDescription: {
      en: "A simple luck-based game where you guess which cup has the ball. If you guess correctly, you win a reward!",
    },
    category: "Game",
    guide: {
      en: `
Usage: (bot prefix)cupgame
The bot will show three cups. Reply to the bot's message with the number (1, 2, or 3) where you think the ball is hidden.`
    }
  },
  langs: {
    en: {
      prompt_message: "🏆 🏆 🏆",
      invalid_choice: "Please choose a valid cup number (1, 2, or 3).",
      win_message: "🎉 Congratulations! The ball was under cup %1. You've won $%2!",
      lose_message: "😞 Sorry, the ball was under cup %1. Better luck next time!",
    },
  },
  onStart: async function ({ message, event, getLang, api }) {
    const { senderID, threadID } = event;

    // Send the initial prompt message with empty cups
    const msg = await message.reply(getLang("prompt_message"));

    // Set up the ball's position randomly
    const ballPosition = Math.floor(Math.random() * 3) + 1;

    // Function to handle user replies
    const handleReply = async (replyMessage) => {
      if (replyMessage.senderID !== senderID) return;  // Only process the original user's replies

      const userChoice = replyMessage.body.trim();

      if (!['1', '2', '3'].includes(userChoice)) {
        await message.reply(getLang("invalid_choice"));
        return;
      }

      const choiceNumber = parseInt(userChoice);

      // Reward calculation (randomized between 20 and 100)
      const minReward = 20;
      const maxReward = 100;
      const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;

      if (choiceNumber === ballPosition) {
        await message.reply(getLang("win_message", ballPosition, reward));
      } else {
        await message.reply(getLang("lose_message", ballPosition));
      }

      // Stop listening after processing the reply
      api.stopListening();
    };

    // Start listening for replies
    const stopListening = api.listen((error, replyMessage) => {
      if (error) return console.error(error);
      handleReply(replyMessage);
    });
  },
};