import axios, { AxiosInstance } from 'axios';
import { ChatInputCommandInteraction, TextBasedChannel, User } from 'discord.js';
import { pokerSessions } from '../Poker/PokerSessions';
// const BASE_URL = 'http://localhost:3000';

class Api{
    get poker(){ return new PokerAPI(); }
}
export const API = new Api();

export enum action{
    check = "check",
    bet = "bet",
    raise = "raise",
    call = "call",
    pass = "pass"
}

class PokerAPI{
    private instance:AxiosInstance;
    private BASE_URL = 'http://localhost:3000/poker'

    constructor(){
        this.instance = axios.create();
        this.instance.defaults.baseURL = this.BASE_URL;
        this.instance.defaults.headers.post['Content-Type'] = 'application/json';
    }

    create(){
        const url = '/create';
        return this.instance.post(url);
    }

    subscribe(game_id :number){
        const url = '/subscribe-poker';
        const data = {game_id};
        return this.instance.post(url, data);
    }

    private subscribing(game_id :number, interaction :ChatInputCommandInteraction){
        this.subscribe(game_id)
            .then( res => {
                this.sendMessage(interaction, res.data);
            })
            .catch( err => {
                console.log(err.message);
            });
    }

    private sendMessage(interaction :ChatInputCommandInteraction, messages :string[]){
        const userIdWord = /(?<userid>\b(?:user id)\w*)(?<colon>\ :|\$)(?<usernums>\ \d+)/;
        let userIdStr = /\ \d+/;

        messages.forEach( message => {
            if(message.match(userIdWord) != null){
                let user_id = message.match(userIdStr)![0].trim();
                console.log(pokerSessions.getUser(interaction.guild!.id, user_id)!.username);
                message = message.replace(userIdWord, `${pokerSessions.getUser(interaction.guild!.id, user_id)!.globalName}`);
            }
            interaction.channel!.send({content: message});
        });
    }

    start(game_id :number, interaction :ChatInputCommandInteraction){
        const url = '/start';
        const data = {game_id};
        
        this.subscribing(game_id, interaction);
        
        return this.instance.post(url, data);
    }

    join(game_id :number, user_id :string, interaction :ChatInputCommandInteraction){
        const url = '/join';
        const data = {game_id, user_id};

        this.subscribing(game_id, interaction);

        return this.instance.post(url, data);
    }

    check(game_id :number, user_id :string, interaction :ChatInputCommandInteraction){
        const url = '/action';
        const data = {game_id, user_id, action :action.check, bet :null};

        this.subscribing(game_id, interaction);
        
        return this.instance.post(url, data);
    }

    bet(game_id :number, user_id :string, bet :number, interaction :ChatInputCommandInteraction){
        const url = '/action';
        const data = {game_id, user_id, action :action.bet, bet};

        this.subscribing(game_id, interaction);


        return this.instance.post(url, data);
    }

    raise(game_id :number, user_id :string, bet :number, interaction :ChatInputCommandInteraction){
        const url = '/action';
        const data = {game_id, user_id, action :action.raise, bet};

        this.subscribing(game_id, interaction);

        return this.instance.post(url, data);
    }

    call(game_id :number, user_id :string, interaction :ChatInputCommandInteraction){
        const url = '/action';
        const data = {game_id, user_id, action :action.call, bet :null};

        this.subscribing(game_id, interaction);

        return this.instance.post(url, data);
    }
    pass(game_id :number, user_id :string, interaction :ChatInputCommandInteraction){
        const url = '/action';
        const data = {game_id, user_id, action :action.pass, bet :null};

        this.subscribing(game_id, interaction);

        return this.instance.post(url, data);
    }

    getCombination(game_id :number, user_id :string){
        const url = `/combination?game_id=${game_id}&user_id=${user_id}`;
        return this.instance.get(url);
    }

    getTable(game_id :number){
        const url = `/table?game_id=${game_id}`;
        return this.instance.get(url);
    }
    
    getUser(game_id :number, user_id :string){
        const url = `/user?game_id=${game_id}&user_id=${user_id}`;
        return this.instance.get(url);
    }
}