import { Card } from "./Deck";

export class CardsCollection{
    private _collection :Card[] = [];
    private _maxsize :number|null;
    private _size = 0;

    public get size(){
        return this._size;
    }

    constructor(maxsize :number|null){
        this._maxsize = maxsize;
    }

    public get cards(){
        return this._collection;
    }

    public add(card:Card){
        if(this._maxsize == null){
            this._size = this._collection.push(card);
            return this._collection.length;
        }
        if(this._size + 1 <= this._maxsize){
            this._size = this._collection.push(card);
            return this._collection.length;
        } 

        throw new Error("max cards amount in hand!");
    }

    public pop(){
        return this._collection.pop();
    }

    public throwCards(){
        this._collection = [];
    }
}