const axios = require("axios");
const { getPrefix } = global.utils;
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "alldl",
    version: "1.0",
    author: "--USER--",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download video from a given URL",
    },
    longDescription: {
      en: "Download video from a URL using the provided API.",
    },
    category: "utilities",
    guide: {
      en: "{pn} <video_url>: Download video from the provided URL."
    },
    priority: 1
  },

  langs: {
    en: {
      success: "Your download link: %1",
      error: "Failed to retrieve the download link. Please try again with a valid URL.",
      noUrl: "Please provide a URL to download the video from.",
    }
  },

  onStart: async function({ message, args, event, threadsData, getLang }) {
    if (args.length === 0) {
      return message.reply(getLang("noUrl"));
    }

    const url = args[0];
    const apiUrl = `https://samirxpikachuio.onrender.com/alldl?url=${encodeURIComponent(url)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.downloadUrl) {
        message.reply(getLang("success", response.data.downloadUrl));
      } else {
        message.reply(getLang("error"));
      }
    } catch (error) {
      console.error(error);
      message.reply(getLang("error"));
    }
  }
};