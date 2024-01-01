import { 
	REST, 
	RESTPostAPIChatInputApplicationCommandsJSONBody, 
	Routes
} from 'discord.js';
import { TOKEN, CLIENT_ID } from './env';
import { PokerBot } from './Poker/PokerBot';


async function registrationCommands(commands :RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

const pokerBot = new PokerBot(TOKEN);

registrationCommands([pokerBot.commands]);


 