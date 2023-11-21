import { Router , json } from "express";
import { PokerLobbyManager } from "../game/Poker";
import { User, UserId } from "../user/user";

const pokerManager = new PokerLobbyManager()

export const pokerRouter = Router();
pokerRouter.use(json());

pokerRouter.post('/create', (req, res) => {
    let game_id = pokerManager.createGame();
    res.json(JSON.stringify({game_id: game_id}));
});

pokerRouter.post('/start', (req, res) => {
    let game_id = req.body.game_id;
    let game = pokerManager.getGame(game_id);

    if(game == null){
        res.send('game undefined');
        return;
    }

    pokerManager.startGame(game);
    res.send('ok');
});

pokerRouter.post('/addMember', (req, res) => {
    let game_id = req.body.game_id;
    let game = pokerManager.getGame(game_id);

    let user_id = new UserId(req.body.user_id);

    if(game == null){
        res.send('game undefined');
        return;
    }

    pokerManager.addMember(game, user_id);
    res.send('ok');
});

pokerRouter.post('/check', (req, res) => {
    let game_id = req.body.game_id;
    let game = pokerManager.getGame(game_id);

    let user_id = new UserId(req.body.user_id);

    if(game == null){
        res.send('game undefined');
        return;
    }

    let result =  pokerManager.check(game, user_id);
    res.send(result);
});

pokerRouter.get('/', (req, res) => {
    let game_id = req.body.game_id;
    let game = pokerManager.getGame(game_id);

    if(game == null){
        res.send('game undefined');
        return;
    }

    res.json(JSON.stringify(pokerManager.getGameInfo(game)));
})