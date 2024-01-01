import {RESTPostAPIChatInputApplicationCommandsJSONBody} from 'discord.js'
import { REST, Routes } from 'discord.js';
import { CLIENT_ID } from './env';


export default async function registrationCommands(commands :Array<RESTPostAPIChatInputApplicationCommandsJSONBody>, rest :REST) {
    try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}