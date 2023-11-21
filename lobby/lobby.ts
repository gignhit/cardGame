import { User, UserId } from "../user/user";

class Lobby{
    id :number;
    members :User[];

    joinToLobby(id :UserId, name :string){
        let user = new User(id.value, name);
        this.members.push(user);
    }
    
    leaveLobby(){}

    createGame(){}
}