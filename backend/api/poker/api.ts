import express, { Router } from 'express';
import events  from 'events';
import { PokerManager } from '../../game/PokerManager';
import { Action, Bet, CombinationResponse, GameId, PokerMemberResponse, TableResponse, UserId } from './schema';

export const emitter = new events.EventEmitter();
export const pokerRouter = Router();

pokerRouter.use(express.json());
let poker = new PokerManager();


pokerRouter.post('/create', (req, res) => {
    let game_id = poker.create();
    let messages :string[] = [`Created game id: ${game_id}`];

    emitter.emit(game_id.toString(), messages);
    res.json(game_id);
});

pokerRouter.post('/subscribe-poker', (req, res) => {
    let game_id :GameId;

    try{
        game_id = new GameId(req.body.game_id);
    } catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    if(poker.getGame(game_id) == null){
        res.status(400).send('game undefined, u need create game');
        return;
    }

    emitter.once(game_id.value.toString(), (messages :string[]) => {
        res.json(messages);
    })
});

pokerRouter.post('/join', (req, res) => {
    let game_id :GameId
    let messages :string[] = [];

    try{
        game_id = new GameId(req.body.game_id);
        messages.push(poker.addMember(game_id, new UserId(req.body.user_id)));
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
        messages.push(poker.start(game_id));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }

    emitter.emit(game_id.value.toString(), messages);
    res.status(200).send('ok');
});

pokerRouter.post('/action', (req, res) => {
    let game_id :GameId;
    let messages :string[] = [];
    try{
        game_id = new GameId(req.body.game_id);
        messages = [
            ...poker.action(
                game_id, 
                new UserId(req.body.user_id), 
                new Action(req.body.action), 
                new Bet(req.body.bet)
            )
        ];
        emitter.emit(game_id.value.toString(), messages);
        res.status(200).send('ok');
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/combination', (req, res) => {
    try{
        let combination = poker.getCombination(
            new GameId(Number(req.query.game_id)), 
            new UserId(req.query.user_id!.toString())
        );
        res.json(new CombinationResponse(combination.cards, combination.combination));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/table', (req, res) => {
    try{
        let table = poker.getTable(new GameId(Number(req.query.game_id)));

        res.json(new TableResponse(table.bank, table.board.cards));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/user', (req, res) => {
    try{
        let user = poker.getUser(
            new GameId(Number(req.query.game_id)),
            new UserId(req.query.user_id!.toString())
        )
        res.json(new PokerMemberResponse(user.id, user.hand.cards, user.money));
    }catch(err :any){
        res.status(400).send(err.message);
        return;
    }
});

pokerRouter.get('/test', (req, res) => {
    res.status(200).send('test succ');
})