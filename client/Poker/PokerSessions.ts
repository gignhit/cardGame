import { GuildMember } from "discord.js";

export class UserId{
    private _value: number;
    get value(){ return this._value;}

    constructor(value :number){
        this._value = value;
    }
}

class PokerSession{
    gameId :number;
    users :Array<GuildMember> = [];

    guildId :string;

    constructor(gameId :number, guildId :string){
        this.gameId = gameId;
        this.guildId = guildId;
    }
}

class PokerSessions{

    private sessions :PokerSession[] = [];

    constructor(){}

    getGameIdByUserId(member :GuildMember) :number | undefined{
        return this.sessions.find( session => {
            return session.users.find( user => user.id == member.id) != null ? true : false;
        })?.gameId;
    }   

    
    getGameIdByGuildId(guid_id :string) :number | undefined{
        return this.sessions.find(session => session.guildId == guid_id)?.gameId;
    }

    create(gameId :number, guidId :string){
        this.sessions.push(new PokerSession(gameId, guidId));
    }

    setUser(guidId :string, user :GuildMember){
        let session = this.sessions.find( session => session.guildId == guidId);
        if(session == null) return false;
        session.users.push(user);
        return true;
    }
}

export const pokerSessions = new PokerSessions();