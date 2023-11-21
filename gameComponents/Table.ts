import { CardsCollection } from "./CardCollection";
import { Card } from "./Deck";

export class Table{
    private _board = new CardsCollection(5);
    private _bank = 0;

    get board(){ return this._board; }
    get bank(){ return this._bank; }

    public getBet(bet :number){
        this._bank += bet;
    }

    public getCard(card:Card){
        this._board.add(card)
    }
}