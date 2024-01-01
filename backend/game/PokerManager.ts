import { DB } from "../db/db";
import { Poker } from "./Poker";
import { Round, action, round } from "./Rounds";

export class PokerManager{
    private db = new DB<Poker>();

    getGame(id :number){
        return this.db.get(id);
    }
    
    create(){
        let game = new Poker()
        let game_id = this.db.set(game);
        
        return game_id;
    }

    start(game_id :number){
        let game = this.getGame(game_id);
        if(game != null && !game.playing){
            game.start();
            return 'game started';
        } 
        throw new Error(`game id ${game_id} not created`);
    }

    addMember(game_id :number, user_id :string) :string{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 
        if(!game.playing){
            game.addMember(user_id);
            return `user id : ${user_id} joined to game id : ${game_id}`;
        }
        throw new Error(`game id ${game_id} already playing`);
    }

    deleteMember(game_id :number, user_id :string):string{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        game.deleteMember(user_id);
        return `user id : ${user_id} kicked in game id : ${game_id}`;
    }

    action(game_id :number, user_id :string, act :string, bet :number|null = null):string[]{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        if(game.membersList.getMember(user_id) == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        let message :string;

        switch(act){
            case action.bet:
                if(bet == null) throw new Error(`bet undefined`);
                message = game.bet(user_id, bet);
                break;
            case action.raise:
                if(bet == null) throw new Error(`bet undefined`);
                message = game.raise(user_id, bet);
                break;
            case action.pass:
                message = game.pass(user_id);
                break;
            case action.check:
                message = game.check(user_id);    
                break;
            case action.call:
                message = game.call(user_id);
                break;
            default:
                throw new Error(`action undefined`);
        }

        let res = game.chekOnNewRound();
        if(res != null){
            return [message, res];
        }
        return [message];
    }

    getTable(game_id :number){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        return game.table;
    }

    getUser(game_id :number, user_id :string){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        let member = game.membersList.getMember(user_id); 

        if(member == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        return member;
    }

    getCombination(game_id :number, user_id :string){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        }

        let member = game.membersList.getMember(user_id); 

        if(member == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        return game.findCombination(user_id);
    }
    

}
