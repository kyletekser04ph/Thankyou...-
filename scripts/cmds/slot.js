const axios = require('axios');

module.exports = {
    config: {
        name: "slot",
        version: "1.0",
        author: "--USER--",
        countDown: 5,
        role: 0,
        description: {
            vi: "Trò chơi slot với hệ thống thưởng",
            en: "Slot game with reward system"
        },
        category: "𝗚𝗔𝗠𝗘",
    },
    onStart: async function ({ api, args, message, event, usersData, getLang }) {
        const { senderID } = event;
        const userData = await usersData.get(senderID);
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply({ body: "Enter a valid and positive amount to have a chance to win double." });
        }

        if (amount > userData.money) {
            return message.reply({ body: "You don't have enough money to bet that amount." });
        }

        const fruitEmojis = ["🍒", "🍇", "🍊", "🍉", "🍎", "🍓", "🍏", "🍌"];
        const finalSlot1 = Math.random() < 0.05 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
        const finalSlot2 = Math.random() < 0.3 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
        const finalSlot3 = Math.random() < 0.02 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];

        const winnings = calculateWinnings(finalSlot1, finalSlot2, finalSlot3, amount);

        await usersData.set(senderID, {
            money: userData.money + winnings,
            data: userData.data,
        });

        const messageText = getSpinResultMessage(finalSlot1, finalSlot2, finalSlot3, winnings);
        return message.reply({ body: messageText });
    }
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
    if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
        return betAmount * 3;
    } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
        return betAmount * 2;
    } else if (slot1 === slot2 && slot2 === slot3) {
        return betAmount * 1.8;
    } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
        return betAmount * 1.5;
    } else {
        return -betAmount;
    }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings) {
    if (winnings > 0) {
        if (slot1 === "🍓" && slot2 === "🍓" && slot3 === "🍓") {
            return `Jackpot! You won ${winnings} with three 🍓 symbols!`;
        } else {
            return `You won ${winnings}! [ ${slot1} | ${slot2} | ${slot3} ]`;
        }
    } else {
        return `You lost ${-winnings}. [ ${slot1} | ${slot2} | ${slot3} ]`;
    }
}
