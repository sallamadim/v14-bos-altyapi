const { SlashCommandBuilder } = require('discord.js')

const { database } = require('../../config/config')
const { Database } = require('quickmongo')
const db = new Database(database.mongodb_url)
db.connect()

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('')
        .setDescription(''),
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        

    }
}