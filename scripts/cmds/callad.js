const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

// Set your fixed group ID here
const FIXED_GROUP_ID = "6930534230319755"; // Replace with the fixed group ID

module.exports = {
  config: {
    name: "callad",
    version: "2.0",
    author: "TawsiN",
    countDown: 5,
    role: 0,
    description: {
      vi: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
      en: "send report, feedback, bug,... to admin bot"
    },
    category: "contacts admin",
    guide: {
      vi: "   {pn} <tin nhắn>",
      en: "   {pn} <message>"
    }
  },

  langs: {
    vi: {
      missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",
      sendByGroup: "\n- Được gửi từ nhóm: %1\n- Thread ID: %2",
      sendByUser: "\n- Được gửi từ người dùng",
      content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
      success: "Đã gửi tin nhắn của bạn về nhóm admin thành công!\n",
      failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về nhóm admin\nKiểm tra console để biết thêm chi tiết",
      reply: "📍 Phản hồi từ admin:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin",
      replySuccess: "Đã gửi phản hồi của bạn về admin thành công!"
    },
    en: {
      missingMessage: "Please enter the message you want to send to admin",
      sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
      sendByUser: "\n- Sent from user",
      content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",
      success: "Sent your message to the admin group successfully!\n",
      failed: "An error occurred while sending your message to the admin group\nCheck console for more details",
      reply: "📍 Reply from admin:\n─────────────────\n%1\n─────────────────\nReply this message to continue send message to admin",
      replySuccess: "Sent your reply to admin successfully!"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { senderID, threadID, isGroup } = event;
    
    if (!args[0]) return message.reply(getLang("missingMessage"));
    
    const senderName = await usersData.getName(senderID);
    const msg = "==📨 CALL ADMIN 📨=="
      + `\n- User Name: ${senderName}`
      + `\n- User ID: ${senderID}`
      + (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(item => mediaTypes.includes(item.type))
      )
    };

    try {
      const messageSend = await api.sendMessage(formMessage, FIXED_GROUP_ID);
      global.GoatBot.onReply.set(messageSend.messageID, {
        commandName,
        messageID: messageSend.messageID,
        threadID,
        messageIDSender: event.messageID,
        type: "userCallAdmin"
      });
      return message.reply(getLang("success"));
    } catch (err) {
      log.err("CALL ADMIN", err);
      return message.reply(getLang("failed"));
    }
  },

  onReply: async function ({ args, event, api, message, Reply, usersData, getLang }) {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          )
        };

        api.sendMessage(formMessage, threadID, (err) => {
          if (err) return message.err(err);
          message.reply(getLang("replySuccess"));
        }, messageIDSender);
        break;
      }
    }
  }
};
