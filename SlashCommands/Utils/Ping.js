const { Discord, SlashCommandBuilder } = require('discord.js');
require("colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com o ping do bot'),

  async execute(interaction, client) {
    await interaction.reply(`🏓 Pong! Latência: ${client.ws.ping}ms`);
  },
};