const { config } = global.GoatBot;
const { client } = global;
const fs = require('fs');

module.exports = {
  config: {
    name: "whitelistthread",
    aliases: ["wt"],
    version: "2.2",
    author: "--USER--",
    role: 2,
    shortDescription: {
      en: "Manage thread IDs in the whitelist."
    },
    longDescription: {
      en: "Add, delete, list, enable, or disable thread IDs in the whitelist. Only admins can manage these settings."
    },
    category: "developer",
    guide: {
      en: "{pn} [add | del | list | enable | disable] [thread ID (for add/del)]"
    }
  },

  onStart: async function ({ message, args, threadsData }) {
    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(client.dirConfig));
    } catch (err) {
      console.error('Error loading config:', err);
    }

    const whiteListModeThread = config.whiteListModeThread || { enable: false, whiteListThreadIds: [] };
    const whiteListThreadIds = whiteListModeThread.whiteListThreadIds;
    const action = args[0];
    const threadId = args[1];

    const saveConfig = () => fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

    switch (action) {
      case "add":
        if (!threadId) return message.reply("Please provide a valid thread ID to add.");
        if (whiteListThreadIds.includes(threadId)) {
          return message.reply(`Thread ID ${threadId} is already in the whitelist.`);
        }
        const threadDataToAdd = await threadsData.get(threadId);
        whiteListThreadIds.push(threadId);
        saveConfig();
        return message.reply(`Thread "${threadDataToAdd.threadName}" (${threadId}) has been added to the whitelist.`);

      case "del":
        if (!threadId) return message.reply("Please provide a valid thread ID to remove.");
        const indexToRemove = whiteListThreadIds.indexOf(threadId);
        if (indexToRemove === -1) {
          return message.reply(`Thread ID ${threadId} is not in the whitelist.`);
        }
        const threadDataToRemove = await threadsData.get(threadId);
        whiteListThreadIds.splice(indexToRemove, 1);
        saveConfig();
        return message.reply(`Thread "${threadDataToRemove.threadName}" (${threadId}) has been removed from the whitelist.`);

      case "list":
        if (whiteListThreadIds.length === 0) {
          return message.reply("The whitelist is currently empty.");
        }
        const threadNames = await Promise.all(whiteListThreadIds.map(id => threadsData.get(id).then(data => data.threadName)));
        const threadList = whiteListThreadIds.map((id, index) => `${index + 1}. ${threadNames[index]} (${id})`).join('\n');
        return message.reply(`Whitelisted threads:\n${threadList}`);

      case "enable":
        whiteListModeThread.enable = true;
        saveConfig();
        return message.reply("Whitelist mode has been enabled.");

      case "disable":
        whiteListModeThread.enable = false;
        saveConfig();
        return message.reply("Whitelist mode has been disabled.");

      default:
        return message.reply("Invalid action. Usage: /whitelistthread [add/del/list/enable/disable] [thread ID (for add/del)].");
    }
  }
};