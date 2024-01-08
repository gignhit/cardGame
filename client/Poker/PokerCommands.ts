import { 
    ChatInputCommandInteraction, 
    GuildMember, 
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { ICommand } from "../ICommand";
import { pokerSessions } from "./PokerSessions";
import { API } from "../api/api";


export class Command{
    create(commandName:string):ICommand|null{
        switch(commandName){
            case CreateCommand.CommandName:
                return new CreateCommand();
            case StartCommand.CommandName:
                return new StartCommand();
            case JoinCommand.CommandName:
                return new JoinCommand();
            case CheckCommand.CommandName:
                return new CheckCommand();
            case BetCommand.CommandName:
                return new BetCommand();
            case RaiseCommand.CommandName:
                return new RaiseCommand();
            case CallCommand.CommandName:
                return new CallCommand();
            case PassCommand.CommandName:
                return new PassCommand();
            case CombinationCommand.CommandName:
                return new CombinationCommand();
            case GetTableCommand.CommandName:
                return new GetTableCommand();
            case GetUser.CommandName:
                return new GetUser();
            case GetUserCards.CommandName:
                return new GetUserCards();
            case GetUserMoney.CommandName:
                return new GetUserMoney();
            case GetBankCommand.CommandName:
                return new GetBankCommand();
            case GetTableCardsCommand.CommandName:
                return new GetTableCardsCommand();

            default:
                throw new Error(`commandName ${commandName} undefined`);
        }
    }
}

enum CardsRank{
    ':two:',
    ':three:',
    ':four:',
    ':five:',
    ':six:',
    ':seven:',
    ':eight:',
    ':nine:',
    ':keycap_ten:',
    ':regional_indicator_j:',
    ':regional_indicator_q:',
    ':regional_indicator_k:',
    ':regional_indicator_a:',
}

enum CardsSuit{
    'Hearts' = ':hearts:',
    'Clubs' = ':clubs:',
    'Spades' = ':spades:',
    'Diamonds' = ':diamonds:'
}

function replaceCardsView(cards :Array<{rank :number, suit :string}>){
    let result = '';

    cards.forEach( card => {
        if(card.rank == 13){
            result += ':black_joker: ';
            return;
        }
        result += CardsRank[card.rank] + CardsSuit[card.suit as keyof typeof CardsSuit] + ' ';
    });

    return result;
}

export class CreateCommand extends ICommand{
    static CommandName: string = 'create';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('create')
            .setDescription("create poker session"); 
    }

    execute(interaction :ChatInputCommandInteraction): void {
        API.poker.create()
            .then( res => {
                let gameId :number = res.data;
                pokerSessions.create(gameId, interaction.guildId!);
                interaction.reply(res.data.toString());
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: JSON.stringify(err.message), ephemeral: true});
            });
    }
}


export class StartCommand extends ICommand{
    static CommandName: string = 'start';

    private static _subCommand = new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription("start poker");
    
    static get subCommand(){ return this._subCommand; }
 
    execute(interaction :ChatInputCommandInteraction): void {
        let gameId = pokerSessions.getGameIdByGuildId(interaction.guildId!);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }

        API.poker.start(gameId, interaction)
            .then( () => {
                interaction.reply({content: 'You started game', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: JSON.stringify(err.message), ephemeral: true});
            });
    }
}


export class JoinCommand extends ICommand{
    static CommandName: string = 'join';
    
    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('join')
            .setDescription('join to poker session');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }
        
        let gameId = pokerSessions.getGameIdByGuildId(interaction.guildId!);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }

        console.log('\bset user before '+ member.id);
        
        let userId = pokerSessions.setUser(interaction.guildId!, member.user);

        console.log('\bset user after '+ userId);

        API.poker.join(gameId, member.id, interaction)            
            .then( () => {
                interaction.reply({content: 'You joined game', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: JSON.stringify(err.message), ephemeral: true});
            });
    }
}


export class CheckCommand extends ICommand{
    static CommandName: string = 'check';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('check')
            .setDescription('do check');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }

        console.log(gameId);
        
        API.poker.check(gameId, member.id, interaction)
            .then( () => {
                interaction.reply({content: 'do check succ', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class BetCommand extends ICommand{
    static CommandName: string = 'bet';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('bet')
            .setDescription('do bet')
            .addNumberOption( option =>
                option
                    .setName('bet_value')
                    .setDescription('bet value')
                    .setRequired(true)
            );
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }

        API.poker.bet(gameId, member.id, interaction.options.getNumber('bet_value')!, interaction)
            .then( () => {
                interaction.reply({content: 'do check succ', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class RaiseCommand extends ICommand{
    static CommandName: string = 'raise';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('raise')
            .setDescription('do raise')
            .addNumberOption( option =>
                option
                    .setName('bet_value')
                    .setDescription('bet value')
                    .setRequired(true)
            );
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }

        API.poker.raise(gameId, member.id, interaction.options.getNumber('bet_value')!, interaction)
            .then( () => {
                interaction.reply({content: 'do check succ', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class CallCommand extends ICommand{
    static CommandName: string = 'call';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('call')
            .setDescription('do call');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.call(gameId, member.id, interaction)
            .then( () => {
                interaction.reply({content: 'do call succ', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class PassCommand extends ICommand{
    static CommandName: string = 'pass';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('pass')
            .setDescription('do pass');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.pass(gameId, member.id, interaction)
            .then( () => {
                interaction.reply({content: 'do pass succ', ephemeral: true});
            })
            .catch( err => {
                console.log(err.message);
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class CombinationCommand extends ICommand{
    static CommandName: string = 'my_combination';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('my_combination')
            .setDescription('check my possible combination');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getCombination(gameId, member.id)
            .then( res => {
                let cards = replaceCardsView(res.data.cards);
                let combination = res.data.combination;

                interaction.reply({content: `Your cards - ${cards}, combination: ${combination}`, ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class GetTableCommand extends ICommand{
    static CommandName: string = 'table';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('table')
            .setDescription('check table');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getTable(gameId)
            .then( res => {
                interaction.reply({content: JSON.stringify(res.data), ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class GetTableCardsCommand extends ICommand{
    static CommandName: string = 'table_cards';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('table_cards')
            .setDescription('check table cards');
    }


    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getTable(gameId)
            .then( res => {
                interaction.reply({content: replaceCardsView(res.data.board), ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class GetBankCommand extends ICommand{
    static CommandName: string = 'bank';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('bank')
            .setDescription('check bank');
    }


    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByUserId(member);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getTable(gameId)
            .then( res => {
                interaction.reply({content: res.data.bank, ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}


export class GetUser extends ICommand{
    static CommandName: string = 'user';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('user')
            .setDescription('check user');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByGuildId(interaction.guildId!);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getUser(gameId, member.id)
            .then( res => {
                interaction.reply({content: JSON.stringify(res.data), ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}



export class GetUserCards extends ICommand{
    static CommandName: string = 'my_cards';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('my_cards')
            .setDescription('check user cards');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByGuildId(interaction.guildId!);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getUser(gameId, member.id)
            .then( res => {
                interaction.reply({content: replaceCardsView(res.data.hand), ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}

export class GetUserMoney extends ICommand{
    static CommandName: string = 'my_money';

    static get subCommand(){ 
        return new SlashCommandSubcommandBuilder()
            .setName('my_money')
            .setDescription('check user money');
    }

    execute(interaction :ChatInputCommandInteraction): void {
        let member = interaction.member;
        if(!(member instanceof GuildMember)){
            interaction.reply({content: 'user_id err', ephemeral: true});
            return;
        }

        let gameId = pokerSessions.getGameIdByGuildId(interaction.guildId!);
        if(gameId == undefined){
            interaction.reply('You not a member in any game');
            return;
        }
        
        API.poker.getUser(gameId, member.id)
            .then( res => {
                interaction.reply({content: res.data.money.toString(), ephemeral: true});
            })
            .catch( err => {
                interaction.reply({content: err.message, ephemeral: true});
            });
    }
}