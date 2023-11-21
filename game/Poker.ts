import { pokerDB } from "../db/db";
import { Card, Deck } from "../gameComponents/Deck";
import { MembersList, MembersQManager } from "../gameComponents/Members";
import { Table } from "../gameComponents/Table";
import { User, UserId } from "../user/user";
import { Stack } from "../utils/stack";
import { PokerMember } from "./PokerMember";


enum rState{
    simple,
    waitingBet,
}


class Round{
    private _membersQ :Stack<PokerMember>;
    private _state :rState;
    private _lastBet :number|null = null;

    constructor(membersQ:Stack<PokerMember>, state:rState){
        this._membersQ = membersQ;
        this._state = state;
    }

    get state(){ return this._state; }

    //--------------------------------------------------------------------------------

    get lastBet(){ return this._lastBet }
    set lastBet(bet:number|null){ 
        this._lastBet = bet; 
    }

    public addLastBet(bet:number){
        if(this._lastBet == null){
            this._lastBet = bet;
            return;
        }
        this._lastBet += bet;
    }
    public resetLastBet(){
        this._lastBet = null;
    }

    //--------------------------------------------------------------------------------

    get activePlayer():PokerMember|null{
        return this._membersQ.peek();
    } 

    public nextPlayer():boolean{
        this._membersQ.pop();
        return false;
    }

    public isActivePlayer(member :PokerMember|null):boolean{
        return member != null && member.id == this.activePlayer!.id ? true : false
    }
}


enum combinationPower{
    high_card,
    pair,
    two_pair,
    three,
    straight,
    flush,
    full_house,
    four,
    straight_flush,
    royal_flush
}


export class Poker{

    // private _id :number;

    // get id(){ return this._id; }
    // set id(id :number){ this._id = id; }

    
    private deck = new Deck();
    private _table = new Table();
    
    private members = new MembersList<PokerMember>();
    private _qManager = new MembersQManager<PokerMember>(this.members);

    private rounds = new Stack<Round>;


    //--------------------------------------------------------------------------------

    public get roundState(){
        return this.rounds.peek()!.state;
    }
    public get lastBet(){
        return this.rounds.peek()!.lastBet;
    }
    public get activePlayer():PokerMember|null{
        return this.rounds.peek()!.activePlayer;
    } 

    public get table(){
        return this._table;
    } 

    //--------------------------------------------------------------------------------

    private newQ(){
        return this._qManager.getNewMembersQ();
    }

    private createSimpleRound(){
        this.rounds.push(new Round(this.newQ(), rState.simple));
    }

    private createWaitingBetRound(){
        let round = this.rounds.peek()

        if(round == null) return;
        if(this.roundState == rState.simple){
            this.rounds.push(new Round(this.newQ(), rState.waitingBet));
            return;
        }

        let prevRound = this.rounds.pop();
        let newRound = new Round(this.newQ(), rState.waitingBet);

        newRound.lastBet = prevRound!.lastBet;
        this.rounds.push(newRound);
    }

    private turn(){
        this.rounds.peek()!.nextPlayer();

        if(this.activePlayer != null) return;

        let prevRound = this.rounds.pop();
        let lastgs = prevRound!.state;
        
        if(lastgs == rState.simple){
            this.createSimpleRound();
            this.newRound();
        }
    }

    private doBet(bet :number){
        if(this.rounds.peek() == null) throw new Error("Round not found!");   
        if(this.activePlayer == null) throw new Error("Players not found on round!");

        if(this.activePlayer!.doBet(bet)){
            this.turn();
            this.rounds.peek()!.addLastBet(bet);
            this.createWaitingBetRound();
        }
    }

    private newRound(){
        this.rounds.peek()!.resetLastBet();
        let cardsTable = this._table.board.size;

        if(cardsTable == 5){
            this.end();
            return;
        }
        if(cardsTable > 0){
            this._table.getCard(this.deck.giveCard());
            return;
        }
        if(cardsTable == 0){
            this._table.getCard(this.deck.giveCard());
            this._table.getCard(this.deck.giveCard());
            this._table.getCard(this.deck.giveCard());
            return;
        }
    }

    //--------------------------------------------------------------------------------

    public start(){
        this.createSimpleRound();
    }

    private end(){
        console.log('end');
    }

    //--------------------------------------------------------------------------------

    public addMember(memberId :UserId){
        this.members.add(new PokerMember(memberId));
    }

    private kickMember(memberId: UserId){
        this._qManager.removeMember(memberId);
        
    }

    //--------------------------------------------------------------------------------

    public check():boolean{
        if(this.roundState == rState.waitingBet) return false;
        this.turn();
        return true;
    }

    public bet(bet :number):boolean{
        if(this.roundState == rState.waitingBet) return false;
        this.doBet(bet);
        this._table.getBet(bet);
        return true;
    }

    public raise(bet :number):boolean{
        if(this.lastBet == null){
            return this.bet(bet);
        }
        
        if(this.roundState != rState.waitingBet) return false;
        if(this.lastBet > bet) return false;

        this.doBet(bet);
        this._table.getBet(bet);
        return true;
    }

    public pass(memberId :UserId):boolean{
        if(this.roundState != rState.waitingBet) return false;
        
        this.kickMember(memberId);
        this.turn();
        return true;
    }

    public call():boolean{
        if(this.roundState != rState.waitingBet) return false;
        if(this.lastBet == null) return false;

        let bet = this.lastBet - this.activePlayer!.betOnRound;
        this.doBet(bet);
        this._table.getBet(bet);
        return true;
    }

    //--------------------------------------------------------------------------------

    public checkCombinaton(member :PokerMember){
        let hand = member.hand.cards;
        let board = this._table.board.cards;

        let possibleCombination = [...hand, ...board];

        possibleCombination.sort((v1, v2) =>{
            if(v1.rank < v2.rank) return -1;
            if(v1.rank > v2.rank) return 1;
            return 0;
        });

        return combinationPower.high_card;
    }

    //--------------------------------------------------------------------------------
}

class Bet{
    private _value: number;

    constructor(id:number){
        this._value = id;
    }

    public get value(){ return this._value }
}


export class PokerLobbyManager{
    public getGame(gameId :number){
        return pokerDB.get(gameId);
    }

    private canPlay(game :Poker, userId :UserId):boolean{
        if(game.activePlayer == null){
            console.log(`В игре id нет активного игрока`);
            return false;
        }
        return game.activePlayer.id.value == userId.value ? true : false;
    }

    createGame(){
        let id = pokerDB.set(new Poker());
        return id;
    }

    startGame(game :Poker){
        game.start();
    }

    check(game :Poker, userId :UserId){
        if(!this.canPlay(game, userId)) return;
        return game.check();
    }

    addMember(game :Poker, userId :UserId){
        game.addMember(userId);
    }

    getGameInfo(game :Poker){
        return {
            table: game.table,
            roundState: game.roundState,
            lastBet: game.lastBet
        }
    }
}





