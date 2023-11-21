import { Card } from "../gameComponents/Deck";
import { UserId } from "../user/user";
import { Stack } from "../utils/stack";

export interface IMember{
    id:UserId;
    inGame:boolean;
    leave():void;
    takeCard(card :Card):void;
}

export class MembersList<T extends IMember>{
    private _membersList :T[] = [];

    public get list(){
        return this._membersList;
    }

    public getById(memberId: UserId):T|null{
        let res = this._membersList.find( m => m.id.value == memberId.value);
        return  res != undefined ? res : null;
    }

    public add(member:T){
        let find = this._membersList.find(m => m.id.value == member.id.value);
        if(find != null){
            console.log('участник уже есть')
            return;
        }
        if(member.inGame){
            this._membersList.push(member);
        }
    }
    
    public delete(memberId: UserId){
        this._membersList = this._membersList
            .filter( m => 
                m.id.value != memberId.value
            );
    }

    public enableMembers(){
        this._membersList.forEach( m => {
            m.inGame = true;
        })
    }
}

export class MembersQManager<T extends IMember>{
    private _Qmembers :Stack<T> = new Stack();
    private _membersList :MembersList<T>;

    get size(){
        return  this._Qmembers.size;
    }

    constructor(membersList :MembersList<T>){
        this._membersList = membersList;
    }
        
    public getNewMembersQ():Stack<T>{
        let q = new Stack<T>();
        this._membersList.list.forEach(m=>{
            if(m.inGame) q.push(m);
        })
        return q;
    }

    public removeMember(memberId: UserId){
        this._Qmembers.pop()!.leave();
    }

    public pop():T | null{
        return this._Qmembers.pop();
    }
}