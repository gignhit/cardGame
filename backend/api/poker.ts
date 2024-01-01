import express, { Router } from 'express';
import events  from 'events';
import { PokerManager } from '../game/PokerManager';

export const emitter = new events.EventEmitter();


export const pokerRouter = Router();
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
    private _value :string;
    get value(){ return this._value; }

    constructor(id :string){
        if(id == undefined) throw new Error(`user_id undefined`);
        if(typeof id != 'string') throw new Error(`user_id ${id} not int`);
        this._value = id;
    }
}


pokerRouter.post('/create', (req, res) => {
    let game_id = poker.create();
    let messages :string[] = [`Created game id: ${game_id}`];

    emitter.emit(game_id.toString(), messages);
    res.json(game_id);
});

//need get
pokerRouter.post('/subscribe-poker', (req, res) => {
    let game_id :GameId;

    // console.log(req.body)

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

    emitter.once(game_id.value.toString(), (messages :string[]) => {
        res.json(messages);
    })
});

pokerRouter.post('/join', (req, res) => {
    let game_id :GameId;
    let user_id :UserId;

    let messages :string[] = [];

    try{
        game_id = new GameId(req.body.game_id);
        user_id = new UserId(req.body.user_id);

        console.log(user_id.value)

        messages.push(poker.addMember(game_id.value, user_id.value));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    emitter.emit(game_id.value.toString(), messages);
    res.status(200).send('ok');
});

pokerRouter.post('/start', (req, res) => {
    let game_id :GameId;
    let messages :string[] = [];
    try{
        game_id = new GameId(req.body.game_id);
        messages.push(poker.start(game_id.value));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    emitter.emit(game_id.value.toString(), messages);
    res.status(200).send('ok');
});

pokerRouter.post('/action', (req, res) => {
    let game_id :GameId;
    let user_id :UserId;
    
    //!fix
    let action :string = req.body.action;
    let bet :number|null = req.body.bet;

    let messages :string[] = [];

    try{
        game_id = new GameId(req.body.game_id);
        user_id = new UserId(req.body.user_id);

        messages = [...poker.action(game_id.value, user_id.value, action, bet)];
        emitter.emit(game_id.value.toString(), messages);
        res.status(200).send('ok');
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});


pokerRouter.get('/combination', (req, res) => {
    try{
        let game_id = new GameId(Number(req.query.game_id));
        let user_id = new UserId(req.query.user_id!.toString());

        // console.log(game_id);
        // console.log(user_id);

        let result = poker.getCombination(game_id.value, user_id.value);
        console.log(result);

        res.json(result);
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/table', (req, res) => {
    try{
        let game_id = new GameId(Number(req.query.game_id));
        res.json(poker.getTable(game_id.value));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/user', (req, res) => {
    try{
        let game_id = new GameId(Number(req.query.game_id));
        let user_id = new UserId(req.query.user_id!.toString());
        res.json(poker.getUser(game_id.value, user_id.value));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/test', (req, res) => {
    res.status(200).send('test succ');
})