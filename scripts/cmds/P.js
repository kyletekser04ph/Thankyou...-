
module.exports = {
    config: {
        name: "p",
        version: "1.1",
        author: "--USER--",
        countDown: 5,
        role: 0,
        shortDescription: "Check system and box chat prefixes",
        longDescription: "Responds with the current system and box chat prefixes when triggered by the word 'muntaha'.",
        category: "no prefix",
    },
    onStart: async function () {},
    onChat: async function ({ event, message, getLang, api }) {
        const trigger = 'zep';

        if (event.body && event.body.toLowerCase() === trigger) {
            return message.reply(`╭〣Hey senpai, did you call me?\n〡\n╰◈➣ 🌐 System prefix: ${global.GoatBot.config.prefix}\n🛸 Your box chat prefix: ${utils.getPrefix(event.threadID)}`);
        }
    }
};
