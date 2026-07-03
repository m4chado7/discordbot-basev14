require('dotenv').config()

const settings = {
    bot: {
        token: process.env.TOKEN,
        prefix: process.env.PREFIX
    }
}

module.exports = settings