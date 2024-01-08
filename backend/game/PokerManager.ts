import { GameId, UserId, Action, Bet} from "../api/poker/schema";
import { DB } from "../db/db";
import { Poker } from "./Poker";
import { Round, action, round } from "./Rounds";

export class PokerManager{
    private db = new DB<Poker>();

    getGame(game_id :GameId){
        return this.db.get(game_id.value);
    }
    
    create(){
        let game = new Poker()
        let game_id = this.db.set(game);
        
        return game_id;
    }

    start(game_id :GameId){
        let game = this.getGame(game_id);
        if(game != null && !game.playing){
            game.start();
            return 'game started';
        } 
        throw new Error(`game id ${game_id} not created`);
    }

    addMember(game_id :GameId, user_id :UserId) :string{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 
        if(!game.playing){
            game.addMember(user_id.value);
            return `user id : ${user_id} joined to game id : ${game_id}`;
        }
        throw new Error(`game id ${game_id} already playing`);
    }

    deleteMember(game_id :GameId, user_id :UserId):string{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        game.deleteMember(user_id.value);
        return `user id : ${user_id} kicked in game id : ${game_id}`;
    }

    action(game_id :GameId, user_id :UserId, act :Action, bet :Bet):string[]{
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        if(game.membersList.getMember(user_id.value) == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        let message :string;

        switch(act.value){
            case action.bet:
                if(bet.value == null) throw new Error(`bet undefined`);
                message = game.bet(user_id.value, bet.value);
                break;
            case action.raise:
                if(bet.value == null) throw new Error(`bet undefined`);
                message = game.raise(user_id.value, bet.value);
                break;
            case action.pass:
                message = game.pass(user_id.value);
                break;
            case action.check:
                message = game.check(user_id.value);    
                break;
            case action.call:
                message = game.call(user_id.value);
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

    getTable(game_id :GameId){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        return game.table;
    }

    getUser(game_id :GameId, user_id :UserId){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        } 

        let member = game.membersList.getMember(user_id.value); 

        if(member == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        return member;
    }

    getCombination(game_id :GameId, user_id :UserId){
        let game = this.getGame(game_id);
        if(game == null){
            throw new Error(`game id ${game_id} undefined`);
        }

        let member = game.membersList.getMember(user_id.value); 

        if(member == null){
            throw new Error(`user id not member game ${game_id}`);
        }

        return game.findCombination(user_id.value);
    }
    

}
