import { Poker } from '../game/Poker';


class PokerDB {
    private fakeDB = new Map<number, Poker>();

    private id = 1;

    get(id :number){
        return this.fakeDB.get(id);
    }

    set(game :Poker){
        this.fakeDB.set(this.id, game);
        return this.id++;
    }

    delete(id :number){
        return this.fakeDB.delete(id);
    }
}

export const pokerDB = new PokerDB();