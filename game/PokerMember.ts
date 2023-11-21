import { CardsCollection } from "../gameComponents/CardCollection";
import { Card } from "../gameComponents/Deck";
import { IMember } from "../gameComponents/Members";
import { UserId } from "../user/user";

export class PokerMember implements IMember{
    private _id :UserId;
    // private _name :string;
    
    private _hand :CardsCollection = new CardsCollection(2);
    private _money = 0;
    private _betOnRound = 0;
    private _inGame = true;


    constructor(id: UserId){
        this._id = id;
    }

    get id(){ return this._id; }
    get hand(){ return this._hand; }
    get inGame(){ return this._inGame; }

    get betOnRound(){ return this._betOnRound; }

    get money(){ return this._money; }
    set money(amount:number){
        this.money += amount;
    }

    public doBet(bet :number):boolean{
        if(this._money - bet < 0) return false;
        this._money -= bet;
        this._betOnRound += bet;
        return true;
    }

    public takeCard(card :Card){
        this._hand.add(card);
    }

    public leave(){
        this._hand.throwCards();
        this._betOnRound = 0;
        this._inGame = false;
    }
}