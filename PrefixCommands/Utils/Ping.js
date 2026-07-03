const Discord = require("discord.js");
require("colors");

module.exports = {
  name: 'ping',
  aliases: ['!!'],
  execute(client, message, args) {
    message.reply(`🏓 Pong! Latência: ${client.ws.ping}ms`);
  },
};