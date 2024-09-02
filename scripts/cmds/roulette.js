module.exports = {
  config: {
    name: "roulette",
    version: "1.2",
    author: "--USER--",
    countDown: 15,
        role: 0,
    shortDescription: {
      en: "Roulette game",
    },
    longDescription: {
      en: "A comprehensive roulette game where you can bet on colors, even/odd, or specific numbers.",
    },
    category: "Game",
    guide: {
      en: `
│ /roulette <option> <amount>
│ Example: /roulette red 50
│ Options: red, black, even, odd, or a number between 0 and 36`
    }
  },
  langs: {
    en: {
      invalid_bet: "Please place a valid bet amount.",
      not_enough_money: "You don't have enough money to place this bet.",
      choose_option: "Please choose an option to bet on: 'red', 'black', 'even', 'odd', or a specific number (0-36).",
      invalid_option: "Invalid option. Choose 'red', 'black', 'even', 'odd', or a number between 0 and 36.",
      spin_message: "Spinning the roulette wheel...",
      win_message: "Congratulations! The ball landed on %1. You win $%2!",
      lose_message: "Sorry, the ball landed on %1. You lose $%2.",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const betOption = args[0] && args[0].toLowerCase();
    const betAmount = parseInt(args[1]);

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalid_bet"));
    }

    if (betAmount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    if (!betOption || (!['red', 'black', 'even', 'odd'].includes(betOption) && (isNaN(parseInt(betOption)) || parseInt(betOption) < 0 || parseInt(betOption) > 36))) {
      return message.reply(getLang("choose_option"));
    }

    const wheelNumbers = Array.from({ length: 37 }, (_, i) => i);  // 0 to 36
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    const resultNumber = wheelNumbers[Math.floor(Math.random() * wheelNumbers.length)];
    const resultColor = redNumbers.includes(resultNumber) ? 'red' : blackNumbers.includes(resultNumber) ? 'black' : 'green';
    const resultParity = resultNumber === 0 ? 'none' : resultNumber % 2 === 0 ? 'even' : 'odd';

    await message.reply(getLang("spin_message"));

    await new Promise(resolve => setTimeout(resolve, 2000));

    let winnings = 0;
    if ((betOption === 'red' && resultColor === 'red') || 
        (betOption === 'black' && resultColor === 'black') ||
        (betOption === 'even' && resultParity === 'even') ||
        (betOption === 'odd' && resultParity === 'odd') ||
        (parseInt(betOption) === resultNumber)) {
      if (['red', 'black', 'even', 'odd'].includes(betOption)) {
        winnings = betAmount * 2;
      } else if (parseInt(betOption) === resultNumber) {
        winnings = betAmount * 35;
      }
    } else {
      winnings = -betAmount;
    }

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const resultMessage = winnings > 0 
      ? getLang("win_message", resultNumber, winnings)
      : getLang("lose_message", resultNumber, betAmount);

    return message.reply(resultMessage);
  },
};
