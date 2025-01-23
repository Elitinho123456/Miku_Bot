const { rainbow } = require('colors')

require ('dotenv').config()

const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        color: 'rainbow'
    }
}

module.exports = config