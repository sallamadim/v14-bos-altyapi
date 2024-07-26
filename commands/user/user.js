const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    cooldown: 7,
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows some information about user.'),
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        
        await interaction.reply(`Your username is, ${interaction.user.username}, you joined at ${interaction.member.joinedAt}.`)
    }
}