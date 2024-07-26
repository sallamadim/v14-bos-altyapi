const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')
const fs = require('fs')
const path = require('node:path')
const { bot, database } = require('./config/config')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] })


const { Database } = require('quickmongo')
const db = new Database(database.mongodb_url)
db.connect()
db.on('ready', async() => {
	console.log('Quickmongo connected to the database.')
})



/* going to fix issue with that.
const mongoose = require('mongoose')
mongoose.connect(database.mongodb_url, {
	useNewUrlParser: true,
  	useUnifiedTopology: true,
  	useFindAndModify: true,
  	useCreateIndex: true
})
	
mongoose.connection.on('connected', () => {
	console.log('Mongoose connnected to the database.')
})
*/




client.commands = new Collection();
client.cooldowns = new Collection();

// COMMAND HANDLING.
const foldersPath = path.join(__dirname, 'commands')
const commandsFolders = fs.readdirSync(foldersPath)
for (const folder of commandsFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)

        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log('A command is missing execute or data part.')
        }
    }
}
// COMMAND HANDLING.



// EVENT HANDLING.
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
// EVENT HANDLING.



client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`There is no command named as ${interaction.commandName}.`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `You are going too fast.Wait <t:${expiredTimestamp}:R> seconds to use that again.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'Error.', ephemeral: true });
		} else {
			await interaction.reply({ content: 'Error.', ephemeral: true });
		}
	}
});


client.login(bot.bot_token)