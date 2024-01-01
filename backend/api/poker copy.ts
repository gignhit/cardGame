import express, { Router } from 'express';
import events  from 'events';
import { PokerManager } from '../game/Poker';

const emitter = new events.EventEmitter();


// export const pokerRouter = Router();
const pokerRouter = Router();
pokerRouter.use(express.json());

let poker = new PokerManager();


class GameId{
    private _value :number;
    get value(){ return this._value; }

    constructor(id :number){
        if(id == undefined) throw new Error(`game id undefined`);
        if(typeof id != 'number') throw new Error(`game id ${id} not int`);
        this._value = id;
    }
}

class UserId{
    private _value :number;
    get value(){ return this._value; }

    constructor(id :number){
        if(id == undefined) throw new Error(`user_id undefined`);
        if(typeof id != 'number') throw new Error(`user_id ${id} not int`);
        this._value = id;
    }
}


pokerRouter.get('/subscribe-poker', (req, res) => {
    let game_id :GameId;

    try{
        game_id = new GameId(req.body.game_id);
    } catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    if(poker.getGame(game_id.value) == null){
        res.status(400).send('game undefined, u need create game');
        return;
    }

    emitter.once(game_id.value.toString(), (message) => {
        res.json(message);
    })
});

pokerRouter.post('/create', (req, res) => {
    let game_id = poker.create();
    let message = `Created game id: ${game_id}`;

    emitter.emit(game_id.toString(), message);
    res.json(game_id);
});

pokerRouter.post('/join', (req, res) => {
    let game_id :GameId;
    let user_id :GameId;

    try{
        game_id = new GameId(req.body.game_id);
        user_id = new GameId(req.body.user_id);

        poker.addMember(game_id.value, user_id.value);
    } catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    let message = `user id:${user_id.value} joined to game id:${game_id.value}`;
    emitter.emit(game_id.value.toString(), message);
    res.status(200).send('ok');
})