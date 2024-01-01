import { 
	SlashCommandBuilder, 
	Client, 
	GatewayIntentBits 
} from 'discord.js';
import { BetCommand, CallCommand, CheckCommand, CombinationCommand, Command, CreateCommand, GetTableCommand, GetUser, JoinCommand, PassCommand, RaiseCommand, StartCommand} from './PokerCommands';
import { API } from '../api/api';
import { pokerSessions } from './PokerSessions';


export class PokerBot{
    private intents :Array<GatewayIntentBits> = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ];

    private client = new Client({ intents: this.intents });
    private _commands = new SlashCommandBuilder()
        .setName('poker')
        .setDescription('poker commands');

    get commands(){ return this._commands.toJSON(); }


    constructor(token :string){
        this.client.login(token);
    
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;
            new Command().create(interaction.options.getSubcommand())?.execute(interaction);

            API.poker.subscribe(pokerSessions.getGameIdByGuildId(interaction.guildId!)!)
                .then( res => {
                    interaction.channel!.send({content: JSON.stringify(res.data) + ' subscribe'});
                })
                .catch( err => {
                    console.log(err.message);
                    // interaction.channel!.send({content: err.message + ' subscribe'});
                });
        });
    
        this._commands.addSubcommand( () => CreateCommand.subCommand);
        this._commands.addSubcommand( () => StartCommand.subCommand);
        this._commands.addSubcommand( () => JoinCommand.subCommand);
        this._commands.addSubcommand( () => CheckCommand.subCommand);
        this._commands.addSubcommand( () => BetCommand.subCommand);
        this._commands.addSubcommand( () => RaiseCommand.subCommand);
        this._commands.addSubcommand( () => CallCommand.subCommand);
        this._commands.addSubcommand( () => PassCommand.subCommand);
        this._commands.addSubcommand( () => CombinationCommand.subCommand);
        this._commands.addSubcommand( () => GetTableCommand.subCommand);
        this._commands.addSubcommand( () => GetUser.subCommand);
    }
}