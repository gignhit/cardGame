import { Stack } from "../utils/stack";

export enum CardSuit {
    Diamonds = "Diamonds",
    Hearts = "Hearts",
    Clubs = "Clubs" ,
    Spades = "Spades",
    Red = "Red",
    Black = "Black"
}

export enum CardRank {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
    Joker
}

export class Card{
    private _suit: CardSuit; //масть
    private _rank: CardRank; //значение карты
    private _ownerId: string|null = null;

    constructor(suit: CardSuit, rank: CardRank){
        this._suit = suit;
        this._rank = rank;
        let _rank = rank;
    }

    public get suit(){
        return this._suit;
    }

    public get rank(){
        return this._rank;
    }

    public set owner(userId:string){
        this._ownerId = userId;
    }

    public get owner(): string | null {
        return this._ownerId;
    }
}



export class Deck {
    private cards: Stack<Card> = new Stack();

    constructor(minRank :CardRank = CardRank.Two, withJoker :boolean = true) {
        this.shuffle(this.createBase(minRank, withJoker))
            .forEach(c => this.cards.push(c));
    }

    public giveCard(): Card {
        let card = this.cards.pop();
        if (card == null) {
            throw Error("deck empty");
        }
        return card;
    }

    private createBase(minRank :CardRank, withJoker :boolean): Card[] {
        let cards: Card[] = [];

        for (let r = minRank; r <= CardRank.Ace; r++){
            Object.values(CardSuit).map(s => {
                if(CardSuit[s] != CardSuit.Red && CardSuit[s] != CardSuit.Black){
                    cards.push(new Card(CardSuit[s], r))
                }
            });
        }
        if(withJoker){
            cards.push(
                new Card(CardSuit.Red, CardRank.Joker),
                new Card(CardSuit.Black, CardRank.Joker),
            );
        }
        return cards;
    }

    private shuffle(arr :Card[]): Card[]{
        let l = arr.length;

        while(l){
            let i = Math.floor(Math.random() * l--);
            let t = arr[l]
            arr[l] = arr[i];
            arr[i] = t;
        }
        return arr;
    }
}
