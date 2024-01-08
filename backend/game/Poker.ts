import { emitter } from "../api/poker/api";
import { DB } from "../db/db";

import { Card, CardRank, Deck } from "../gameComponents/Deck";
import { Round, action, round } from "./Rounds";
import { Table } from "./Table";
import { MembersList, PokerMember } from "./members";

enum combination{
    hightCard,
    pair,
    twoPair,
    three,
    straight,
    flush,
    fullHouse,
    four,
    straightFlush,
    royalFlush
}

class PokerCombination{
    combination: combination;
    cards: Card[];

    constructor(comb :combination, cards :Card[]){
        this.cards = cards;
        this.combination = comb;
    }
}


export class Poker{
    private deck = new Deck();
    private _membersList = new MembersList();

    private roudsHistory :Round[] = [];
    private _table = new Table();

    get membersList(){ return this._membersList; }
    get table(){ return this._table; }

    private _playing :boolean = false;

    get playing(){ return this._playing;}
    

    start(){
        if(this._membersList.size < 2) throw new Error(`need 2 and more members!`);
        this.dealCards(this._membersList.list);
        this.roudsHistory.push(new Round(round.first));
        this._playing = true;
    }

    private dealCards(members :PokerMember[]){
        members.forEach( m => {
            m.takeCard(this.deck.giveCard());
            m.takeCard(this.deck.giveCard());
        });
    }

    addMember(id :string){
        this._membersList.add(new PokerMember(id));
    }

    deleteMember(id :string){
        this._membersList.delete(id);
    }

    chekOnNewRound(){
        if(this.getCurrentRound().name != round.betting && this.getCurrentRound().actions.length >= this._membersList.size){
            return this.newRound();
        }
        return null
    }

    private newRound(){
        let lastRound = this.getCurrentRound()
        let message :string;

        if(this.membersList.size == 1){
            return this.ending(this._membersList.list[0]);
        }

        switch(lastRound.name){
            case round.first:
                this.roudsHistory.push(new Round(round.second));
                this._table.takeCard(this.deck.giveCard());
                this._table.takeCard(this.deck.giveCard());
                this._table.takeCard(this.deck.giveCard());
                message = `new round ${round.second}`;
                break;
            case round.second:
                this.roudsHistory.push(new Round(round.third));
                this._table.takeCard(this.deck.giveCard());
                message = `new round ${round.third}`;
                break;
            case round.third:
                this.roudsHistory.push(new Round(round.fourth));
                this._table.takeCard(this.deck.giveCard());
                message = `new round ${round.fourth}`;
                break;
            case round.fourth:
                this.roudsHistory.push(new Round(round.fifth));
                message = `new round ${round.fifth}`;
                break;
            case round.fifth:
                message = this.endGame();
                break;
            default:
                throw new Error(`newRound crushed`);
        }
        return message;
    }

    private endGame(){
        if(this.membersList.size == 1){
            return this.ending(this._membersList.list[0]);
        }

        let memberCombinations = new Map<PokerMember, PokerCombination>();

        this.membersList.list.forEach( user => {
            memberCombinations.set(user, this.findCombination(user.id));
        });

        let winner :PokerMember = this.membersList.list[0];

        for(let [member, combination] of memberCombinations){
            if(member.id == this.membersList.list[0].id){
                continue;
            }
            if(combination.combination == memberCombinations.get(winner)!.combination){

                if(combination.cards.slice(-1)[0].rank > memberCombinations.get(winner)!.cards.slice(-1)[0].rank){
                    winner = member;
                    continue;
                }

                if(combination.cards.slice(-1)[0].rank == memberCombinations.get(winner)!.cards.slice(-1)[0].rank){
                    let m1 = this.findHightCard(winner.hand.cards);
                    let m2 = this.findHightCard(member.hand.cards);

                    if(m1[0].rank < m2[0].rank){
                        winner = member;
                    }
                    continue;
                }
            }
            if(combination.combination > memberCombinations.get(winner)!.combination){
                winner = member;
            }
        }
        this.membersList.list.forEach( user => {
            user.finishGame();
        });

        return this.ending(winner);
    }

    private ending(user :PokerMember){
        user.takeBank(this._table.bank);
        this._playing = false;
        this.roudsHistory = [];

        this.table.cleanTable();
        user.finishGame();
        
        return `Winner user id : ${user.id} have bank ${this._table.bank}`;
    }

    
    private getCurrentRound():Round{
        let lastRound = this.roudsHistory.slice(-1)[0];
        if(lastRound.name == round.betting && lastRound.actions.length >= this._membersList.size){
            let notBetRound = this.roudsHistory
                .slice()
                .reverse()
                .find( r => r.name != round.betting);

            if(notBetRound == null) throw new Error(`round undefined`);
            return notBetRound;
        }
        return lastRound;
    }

    private historyLogs(){
        console.log('\n')
        console.log('----------------------------------------------------');
        this.roudsHistory.forEach( r => {
            console.log(r.name);
            r.actions.forEach( a => {
                console.log(a);
            })
        })
    }

    check(user_id :string){
        if(this.getCurrentRound().name == round.betting){
            throw new Error(`U can't do '${action.check}', u need do bet or wait`);
        }
        this.getCurrentRound().addAction(user_id, action.check);
        this.historyLogs();
        return `user id : ${user_id} - ${action.check}!`;
    }

    bet(user_id :string, bet :number){
        if(this.getCurrentRound().name == round.betting){
            throw new Error(`U can't do '${action.bet}', first bet already been`);
        }
        this._table.addBet(user_id, this._membersList.getMember(user_id)!.doBet(bet));
        this.roudsHistory.push(new Round(round.betting));
        this.getCurrentRound().addAction(user_id, action.bet, bet);
        this.historyLogs();
        return `user id : ${user_id} - ${action.bet}!, bet = ${bet}`;
    }

    call(user_id :string){
        if(this.getCurrentRound().name != round.betting){
            throw new Error(`U can't do '${action.call}', no bets!`);
        }
        let previosBet = this.getCurrentRound().actions.slice(-1)[0].bet;
        console.log('previosBet' + previosBet);
        this._table.addBet(user_id, this._membersList.getMember(user_id)!.doBet(previosBet!));
        this.getCurrentRound().addAction(user_id, action.call, previosBet);
        this.historyLogs();
        return `user id : ${user_id} - ${action.call}!`;
    }

    raise(user_id :string, bet :number){
        if(this.getCurrentRound().name != round.betting){
            return this.bet(user_id, bet)
        }
        let previosBet = this.getCurrentRound().actions.slice(-1)[0].bet;
        if( bet < previosBet!) throw new Error(`U can't do '${action.raise}', bet less previos bet`);

        this._table.addBet(user_id, this._membersList.getMember(user_id)!.doBet(bet));
        this.roudsHistory.push(new Round(round.betting));
        this.getCurrentRound().addAction(user_id, action.raise, bet);
        this.historyLogs();
        return `user id : ${user_id} - ${action.raise}!, bet = ${bet}`;
    }

    pass(user_id :string){
        this._membersList.delete(user_id);
        this.historyLogs();

        if(this.membersList.size == 1){
            return this.ending(this._membersList.list[0]);
        }

        return `user id : ${user_id} - ${action.pass}!`;
    }

    findCombination(user_id :string){
        let memberCards = this._membersList.getMember(user_id)!.hand.cards;
        let tableCards = this._table.board.cards;

        let cards = [...memberCards, ...tableCards]
            .sort( ( prev, next ) => {
                if(prev.rank > next.rank){
                    return 1;
                }
                if(prev.rank < next.rank){
                    return -1;
                }
                return 0;
            });

        let combinationFinders = new Map<combination, Card[]>([
            [combination.hightCard, this.findHightCard(memberCards)],
            [combination.pair, this.findPair(cards)],
            [combination.twoPair, this.twoPair(cards)],
            [combination.three, this.findThree(cards)],
            [combination.straight, this.findStraight(cards)],
            [combination.flush, this.findFlush(cards)],
            [combination.fullHouse, this.findFullHouse(cards)],
            [combination.four, this.findFour(cards)],
            [combination.straightFlush, this.findStraightFlush(cards)],
            [combination.royalFlush, this.findRoyalFlush(cards)]
        ]);

        console.log(combinationFinders);
        let cardCombination :combination = combination.hightCard;

        for(let [c, cards] of combinationFinders){
            if(c > cardCombination && cards.length > 0){
                cardCombination = c;
            }
        }

        let res = new PokerCombination(cardCombination, combinationFinders.get(cardCombination)!);

        return res ;
    }

    private findHightCard(memberCards :Card[]) :Card[]{
        return  memberCards[0].rank > memberCards[1].rank ? [memberCards[0]] : [memberCards[1]];
    }

    private findPairIdxs(sortedCards :Card[]){
        for(let i = sortedCards.length - 1; i >= 1; i--){
            if(sortedCards[i].rank == CardRank.Joker){
                return [i-1, i];
            }
            if(sortedCards[i].rank == sortedCards[i-1].rank){
                return [i-1, i];
            }
        }
        return [];
    }

    private findPair(sortedCards :Card[]):Card[]{
        let pairIndex = this.findPairIdxs(sortedCards);

        if(pairIndex.length == 0) return [];

        return [ 
            sortedCards[pairIndex[0]], 
            sortedCards[pairIndex[1]] 
        ];;
    }

    private twoPair(sortedCards :Card[]):Card[]{
        let firstPairIdx :number[] = this.findPairIdxs(sortedCards);

        if(firstPairIdx.length == 0) return [];
        
        let cards = sortedCards.slice();

        cards.splice(firstPairIdx[1], 1);
        cards.splice(firstPairIdx[0], 1);

        let secondPairIdx :number[] = this.findPairIdxs(cards);

        if(secondPairIdx.length == 0) return [];

        return [
            sortedCards[firstPairIdx[0]], 
            sortedCards[firstPairIdx[1]], 
            sortedCards[secondPairIdx[0]], 
            sortedCards[secondPairIdx[1]] 
        ];
    }

    private findThreeIdxs(sortedCards :Card[]) :number[]{
        for(let i = sortedCards.length - 1; i >= 2; i--){
            if(sortedCards[i].rank == CardRank.Joker){
                let pair = this.findPairIdxs(sortedCards.slice(0, i - 1));
                if(pair.length == 0) {
                    return [];
                }
                return [i, ...pair];
            }
            if(sortedCards[i].rank == sortedCards[i-1].rank && sortedCards[i-1].rank == sortedCards[i-2].rank){
                return [i-2, i-1, i];
            }
        }
        return [];
    }

    private findThree(sortedCards :Card[]):Card[]{
        let threeIdxs = this.findThreeIdxs(sortedCards);
        if(threeIdxs.length == 0) return [];

        return [ 
            sortedCards[threeIdxs[0]],
            sortedCards[threeIdxs[1]], 
            sortedCards[threeIdxs[2]] 
        ];
    }

    private findStraight(sortedCards :Card[]):Card[]{
        let possibleStraight :Card[] = [];

        if(sortedCards.length < 5) return [];

        for(let i = 0; i < sortedCards.length; i++){
            if(sortedCards[i+1] == null) continue;
            if(sortedCards[i+1].rank == sortedCards[i].rank + 1 || sortedCards[i].rank == CardRank.Joker){
                if(sortedCards[i].rank == CardRank.Ace || sortedCards[i].rank == CardRank.Joker){
                    possibleStraight.push(sortedCards[i]);
                    i = 0;
                }
                possibleStraight.push(sortedCards[i]);
            } else {
                possibleStraight = [];
            }
        }

        return possibleStraight.length >= 5 ? possibleStraight.slice(-5) : [];
    }

    private findFlush(cards :Card[]):Card[]{
        let flushCounter = new Map<string, Card[]>();

        if(cards.length < 5) return [];

        for(let i = 0; i < cards.length; i++){
            if(cards[i].rank == CardRank.Joker){
                for(let c of flushCounter.values()){
                    c.push(cards[i]);
                }
                continue;
            }
            let flushcards = flushCounter.get(cards[i].suit);
            if(flushcards == null){
                flushCounter.set(cards[i].suit, []);
                continue;
            }
            flushcards.push(cards[i]);
            flushCounter.set(cards[i].suit, flushcards);
        }

        for(let c of flushCounter.values()){
            if(c.length >= 5) return c.slice(-5);
        }

        return [];
    }

    private findFullHouse(sortedCards :Card[]):Card[]{
        let threeIdxs = this.findThreeIdxs(sortedCards);
        if(threeIdxs.length == 0) return [];

        let three :Card[] = [];
        for(let i = threeIdxs.length - 1; i >= 0; i--){
            three.push(sortedCards[threeIdxs[i]]);
            sortedCards.splice(threeIdxs[i], 1);
        }

        let pairIdxs = this.findPairIdxs(sortedCards);
        if(pairIdxs.length == 0) return [];

        let pair :Card[] = [];
        pairIdxs.forEach( i => {
            pair.push(sortedCards[i]);
        });

        return [...three, ...pair];
    }

    private findFour(sortedCards :Card[]):Card[]{

        let four :Card[] = [];

        for(let i = sortedCards.length - 1; i >= 3 || four.length == 4; i--){
            if(sortedCards[i].rank == CardRank.Joker){
                four.push(sortedCards[i]);
                continue;
            }
            if(four.length == 1){
                let three = this.findThree(sortedCards.slice(0, i-1));
                if(three.length == 0) return [];
                return [...four, ...three];
            }
            if(four.length == 2){
                let pair = this.findPair(sortedCards.slice(0, i-1));
                if(pair.length == 0) return [];
                return [...four, ...pair];
            }
            if(sortedCards[i].rank == sortedCards[i-1].rank 
                && sortedCards[i-2].rank == sortedCards[i-3].rank 
                && sortedCards[i].rank == sortedCards[i-3].rank
            ){
                for(let j = i-3; j < sortedCards.length; j++){
                    four.push(sortedCards[j]);
                }
            }
        }
        return four.length < 4 ? [] : four;
    }

    private findStraightFlush(sortedCards :Card[]):Card[]{
        if(sortedCards.length < 5) return [];

        let possibleStraight :Card[] = [];

        for(let i = 0; i < sortedCards.length; i++){
            if(sortedCards[i+1] == null) continue;
            if(sortedCards[i+1].rank == sortedCards[i].rank + 1 || sortedCards[i].rank == CardRank.Joker){
                if(sortedCards[i].rank == CardRank.Ace || sortedCards[i].rank == CardRank.Joker){
                    possibleStraight.push(sortedCards[i]);
                    i = 0;
                }
                possibleStraight.push(sortedCards[i]);
            } else {
                possibleStraight = [];
            }
        }
        if(possibleStraight.length < 5) return [];

        return this.findFlush(possibleStraight);
    }
    private findRoyalFlush(sortedCards :Card[]):Card[]{
        let straightFlush = this.findStraightFlush(sortedCards);

        if(straightFlush.length == 0) return [];

        if(
            straightFlush[0].rank == CardRank.Ten && 
            (straightFlush.slice(-1)[0].rank == CardRank.Ace || straightFlush.slice(-1)[0].rank == CardRank.Joker)
        ){
            return straightFlush;
        }

        return [];
    }
}

/*
    проверить pass
*/