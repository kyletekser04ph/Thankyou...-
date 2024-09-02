
module.exports = {
  config: {
    name: "coinflip",
    aliases: ["flipcoin", "cflip"], // Alternative names for the command
    version: "1.0",
    author: "--USER--",
    role: 0, // 0 = User, 1 = Moderator, 2 = Admin
    shortDescription: {
      en: "Flip a coin and bet on heads or tails!",
    },
    longDescription: {
      en: "A simple luck-based game where you flip a coin and bet on heads or tails. If you guess correctly, you win double your bet; if not, you lose the bet.",
    },
    category: "Game",
    guide: {
      en: `
(prefix)coinflip <amount> <heads/tails>
Bet on a coin flip. If you guess correctly, you'll win double your bet! If not, you'll lose your bet.
Example: (prefix)coinflip 100 heads`
    }
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to bet.",
      invalid_choice: "Please choose either 'heads' or 'tails'.",
      not_enough_money: "You don't have enough money to make this bet.",
      win_message: "🎉 Congratulations! You won the coin flip and earned $%1!",
      lose_message: "😞 Sorry, you lost the coin flip and lost $%1.",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const betAmount = parseInt(args[0]);
    const choice = args[1] ? args[1].toLowerCase() : null;

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (betAmount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    if (choice !== "heads" && choice !== "tails") {
      return message.reply(getLang("invalid_choice"));
    }

    const coinFlipResult = Math.random() < 0.5 ? "heads" : "tails";
    const win = choice === coinFlipResult;

    if (win) {
      const winnings = betAmount * 2;
      await usersData.set(senderID, {
        money: userData.money + winnings,
        data: userData.data,
      });
      return message.reply(getLang("win_message", winnings));
    } else {
      await usersData.set(senderID, {
        money: userData.money - betAmount,
        data: userData.data,
      });
      return message.reply(getLang("lose_message", betAmount));
    }
  },
};