const fs = require('fs');
const path = require('path');
const { Discord, Events } = require('discord.js');
require("colors");

function getFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return [];

  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
}

module.exports = (client) => {

  const prefixPath = path.join(__dirname, '..', 'PrefixCommands');
  for (const filePath of getFilesRecursively(prefixPath)) {
    const command = require(filePath);
    if (!command.name || typeof command.execute !== 'function') {
      console.warn(`[AVISO] Prefix command "${path.relative(prefixPath, filePath)}" mal formatado.`.yellow);
      continue;
    }
    client.prefixCommands.set(command.name, command);
    (command.aliases || []).forEach((alias) => client.prefixCommands.set(alias, command));
  }

  const slashPath = path.join(__dirname, '..', 'SlashCommands');
  for (const filePath of getFilesRecursively(slashPath)) {
    const command = require(filePath);
    if (!command.data || typeof command.execute !== 'function') {
      console.warn(`[AVISO] Slash command "${path.relative(slashPath, filePath)}" mal formatado.`.yellow);
      continue;
    }
    client.slashCommands.set(command.data.name, command);
  }

  console.log(`[COMMANDS] ${client.prefixCommands.size} prefix | ${client.slashCommands.size} slash`.blue);


  client.once(Events.ClientReady, async () => {
    try {
      const commandsData = [...client.slashCommands.values()].map((cmd) => cmd.data.toJSON());

      if (process.env.GUILD_ID) {
        // Registra só num servidor específico -> atualiza na hora, ótimo pra dev.
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        await guild.commands.set(commandsData);
      } else {
        // Sem GUILD_ID -> registra globalmente (pode levar até 1h pra propagar).
        await client.application.commands.set(commandsData);
      }

      console.log(`[SLASH] ${commandsData.length} comando(s) registrado(s) na Discord.`.green);
    } catch (error) {
      console.error(`[ERRO] Falha ao registrar slash commands:`.red, error);
    }
  });

  const eventsPath = path.join(__dirname, '..', 'Events');
  const eventFiles = getFilesRecursively(eventsPath);
  for (const filePath of eventFiles) {
    const event = require(filePath);
    if (!event.name || typeof event.execute !== 'function') {
      console.warn(`[AVISO] Event "${path.relative(eventsPath, filePath)}" mal formatado.`.yellow);
      continue;
    }
    const method = event.once ? 'once' : 'on';
    client[method](event.name, (...args) => event.execute(client, ...args));
  }
  console.log(`[EVENTS] ${eventFiles.length} event(s) carregado(s).`.green);

  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      command.execute(client, message, args);
    } catch (error) {
      console.error(`[ERRO] prefix command "${commandName}":`.red, error);
      message.reply('Ocorreu um erro ao executar esse comando.').catch(() => {});
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`[ERRO] slash command "${interaction.commandName}":`.red, error);
      const payload = { content: 'Ocorreu um erro ao executar esse comando.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  });
};