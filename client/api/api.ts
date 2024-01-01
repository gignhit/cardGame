import axios, { AxiosInstance } from 'axios';
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

    start(game_id :number){
        const url = '/start';
        const data = {game_id};
        return this.instance.post(url, data);
    }

    subscribe(game_id :number){
        const url = '/subscribe-poker';
        const data = {game_id};
        return this.instance.post(url, data);
    }

    join(game_id :number, user_id :number){
        const url = '/join';
        const data = {game_id, user_id};
        return this.instance.post(url, data);
    }

    check(game_id :number, user_id :number){
        const url = '/action';
        const data = {game_id, user_id, action :action.check, bet :null};
        return this.instance.post(url, data);
    }

    bet(game_id :number, user_id :number, bet :number){
        const url = '/action';
        const data = {game_id, user_id, action :action.bet, bet};
        return this.instance.post(url, data);
    }

    raise(game_id :number, user_id :number, bet :number){
        const url = '/action';
        const data = {game_id, user_id, action :action.raise, bet};
        return this.instance.post(url, data);
    }

    call(game_id :number, user_id :number){
        const url = '/action';
        const data = {game_id, user_id, action :action.call, bet :null};
        return this.instance.post(url, data);
    }
    pass(game_id :number, user_id :number){
        const url = '/action';
        const data = {game_id, user_id, action :action.pass, bet :null};
        return this.instance.post(url, data);
    }

    getCombination(game_id :number, user_id :number){
        const url = `http://localhost:3000/poker/combination?game_id=${game_id}&user_id=${user_id}`;
        return this.instance.get(url);
    }

    getTable(game_id :number){
        const url = `http://localhost:3000/poker/table?game_id=${game_id}`;
        return this.instance.get(url);
    }
    
    getUser(game_id :number, user_id :number){
        const url = `http://localhost:3000/poker/user?game_id=${game_id}&user_id=${user_id}`;
        return this.instance.get(url);
    }
}