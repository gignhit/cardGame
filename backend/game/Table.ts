import { CardsCollection } from "../gameComponents/CardCollection";
import { Card } from "../gameComponents/Deck";

export class Table{
    private _board :CardsCollection = new CardsCollection(5);
    private _spendMoney = new Map<number, number>();
    private _bank = 0;

    get board(){ return this._board; }
    get bank(){ return this._bank; }

    
    getSpendMoney(user_id :number){
        return this._spendMoney.get(user_id);
    }

    addBet(user_id :number, bet :number){
        if(bet < 0) throw new Error(`user ${user_id} can't do bet!`);

        let userBet = this._spendMoney.get(user_id);
        if(userBet == null){
            this._spendMoney.set(user_id, bet);
        } else {
            this._spendMoney.set(user_id, userBet + bet);
        }
        this._bank += bet;
        return true;  
    }

    takeCard(card :Card){
        this._board.add(card);
    }

    cleanTable(){
        this._board = new CardsCollection(5);
        this._spendMoney = new Map<number, number>();
        this._bank = 0;
    }
}