module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp", "pp","dp"],
    version: "1.2",
    author: "--USER--",
    countDown: 10,
    role: 0,
    shortDescription: "Show a user's profile image",
    longDescription: "Show the profile image of a tagged user, the user who sent the command, or the user whose message is replied to.",
    category: "image",
    guide: {
      en: "   {pn} @tag - Shows the profile image of the tagged user\n"
         + "{pn} - Shows your profile image\n"
         + "Use the command as a reply to a message to show the profile image of the person whose message you're replying to."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];

    // Your UIDs to prevent others from accessing your profile information
    const yourUids = ["100080195076753"]; // Add your UIDs here

    // Determine whose profile to fetch based on the command's context
    let targetUID;
    if (event.type === "message_reply") {
      targetUID = event.messageReply.senderID;
    } else if (uid2) {
      targetUID = uid2;
    } else {
      targetUID = uid1;
    }

    // Check if the target UID is in the restricted list
    if (yourUids.includes(targetUID)) {
      return message.reply("You don't have permission to access this information.");
    }

    // Fetch and send the profile image
    const avt = await usersData.getAvatarUrl(targetUID);
    message.reply({
      body: "⊰「Profile」⊱",
      attachment: await global.utils.getStreamFromURL(avt)
    });
  }
};