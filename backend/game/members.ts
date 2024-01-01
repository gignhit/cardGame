import { CardsCollection } from "../gameComponents/CardCollection";
import { Card } from "../gameComponents/Deck";

export class PokerMember{
    private _id :number;
    private _hand :CardsCollection = new CardsCollection(2);
    private _inGame :boolean = true;
    private _money = 0;

    get id(){ return this._id; }
    get hand(){ return this._hand; }

    constructor(id: number){
        this._id = id;
        this.receiveMoney();
    }

    takeCard(card :Card){
        this._hand.add(card);
    }

    receiveMoney(){
        let min = 20;
        let max = 50;
        this._money = Math.floor(Math.random() * (max - min + 1)) * 10;
    }

    doBet(bet :number):number{
        if(this._money < bet) return -1;
        this._money -= bet;
        return bet;
    }

    takeBank(money :number){
        this._money += money;
    }

    finishGame(){
        this._hand = new CardsCollection(2);
    }
}

export class MembersList{
    private _list :PokerMember[] = [];

    get list(){ return this._list; }
    get size(){ return this._list.length; }

    add(member :PokerMember){
        let finded = this._list.find( m => m.id == member.id );

        if(finded != null) throw new Error(`member already added`);
        if(this.size >= 6) throw new Error(`max amount players`);

        console.log('here');
        this._list.push(member);
    }

    delete(id :number){
        this._list.filter( m => m.id != id );
    }

    getMember(user_id :number){
        return this._list.find( m => m.id == user_id );
    }
}