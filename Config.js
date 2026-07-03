require('dotenv').config()

const settings = {
    bot: {
        token: process.env.TOKEN,
        prefix: process.env.PREFIX,
        guildid: process.env.GUILD_ID
    }
}

module.exports = settings