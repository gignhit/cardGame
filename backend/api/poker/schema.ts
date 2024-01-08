import { action } from "../../game/Rounds";
import { Card, CardRank } from "../../gameComponents/Deck";

export class PokerMemberResponse {
    public id :string;
    public hand :CardResponse[];
    public money :number;

    constructor(id :string, hand :Card[], money :number){
        this.id = id;
        this.money = money;
        this.hand = [];
        hand.forEach( c => {
            this.hand.push(new CardResponse(c.rank, c.suit));
        });
    }
}

export class CardResponse {
    public rank :number;
    public suit :string;

    constructor(rank :number, suit :string){
        this.rank = rank;
        this.suit = suit;
    }
}

export class TableResponse {
    public board :CardResponse[];
    public bank :number;

    constructor(bank :number, cards :Card[]){
        this.bank = bank;
        this.board = [];
        cards.forEach( c => {
            this.board.push(new CardResponse(c.rank, c.suit));
        });
    }
}

export class CombinationResponse {
    public cards :CardResponse[];
    public combination :string;

    constructor(cards :Card[], combination :number){
        this.cards = [];
        cards.forEach( c => {
            this.cards.push(new CardResponse(c.rank, c.suit));
        });

        this.combination = CardRank[combination];
    }
}

export class GameId{
    private _value :number;
    get value(){ return this._value; }

    constructor(id :number){
        if(id == undefined) throw new Error(`game id undefined`);
        if(typeof id != 'number') throw new Error(`game id ${id} not int`);
        this._value = id;
    }
}

export class UserId{
    private _value :string;
    get value(){ return this._value; }

    constructor(id :string){
        if(id == undefined) throw new Error(`user id undefined`);
        if(typeof id != 'string') throw new Error(`user id ${id} not string`);
        this._value = id;
    }
}

export class Action{
    private _value :string;
    get value(){ return this._value; }

    constructor(strAction :string){
        if(strAction == undefined) throw new Error(`action undefined`);
        if(typeof strAction != 'string') throw new Error(`action ${strAction} not string`);
        if(action[strAction as keyof typeof action] == null) throw new Error(`action undefined`);
        this._value = action[strAction as keyof typeof action];
    }
}

export class Bet{
    private _value :number|null;
    get value(){ return this._value; }

    constructor(bet :number|null){
        if(bet === undefined) throw new Error(`action undefined`);
        if(typeof bet != 'number' || typeof bet != null) throw new Error(`action ${bet} not number || null`);
        this._value = bet;
    }
}
