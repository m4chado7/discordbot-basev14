/*
╔══════════════════════════════════════════╗
║           DiscordBotBase                 ║
║                                          ║
║   By:      m4chado7                      ║
║   GitHub:  github.com/m4chado7           ║
║   Discord: m4chado7_                     ║
╚══════════════════════════════════════════╝ 
*/

const Discord = require("discord.js");
const settings = require("./Config");
const loadHandler = require('./handler');

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.DirectMessages,
        Discord.IntentsBitField.Flags.GuildInvites,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildPresences,
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildMessageReactions,
        Discord.IntentsBitField.Flags.GuildVoiceStates,
        Discord.IntentsBitField.Flags.GuildMessages
    ],
    partials: [
        Discord.Partials.User,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.Channel,
        Discord.Partials.GuildMember
    ]
});

client.prefixCommands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.prefix = settings.bot.prefix;
 
loadHandler(client);

process.on('unhandledRejection', (reason, p) => {
    if (reason?.code === 'UND_ERR_CONNECT_TIMEOUT') return;
    if (reason?.code === 'ECONNRESET') return;
    console.error('[ Event Error: unhandledRejection ]', p, 'reason:', reason);
});

process.on("uncaughtException", (err, origin) => {
    console.error('[ Event Error: uncaughtException ]', err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('[ Event Error: uncaughtExceptionMonitor ]', err, origin);
});

client.login(settings.bot.token);