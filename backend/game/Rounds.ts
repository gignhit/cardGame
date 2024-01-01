export enum round{
    first = "first",
    second = "second",
    third = "third",
    fourth = "fourth",
    fifth = "fifth",
    betting = "betting"
}

export class Round{
    private _name :round;
    private _members :Action[];

    get name(){ return this._name; }

    get actions(){ return this._members; }

    constructor(name :round){
        this._name = name;
        this._members = [];
    }

    addAction(user_id :string, action :action, bet :number|null = null){
        this._members.push(new Action(user_id, action, bet));
    }
}

export enum action{
    check = "check",
    bet = "bet",
    raise = "raise",
    call = "call",
    pass = "pass"
}

export class Action{
    private user_id :string;
    private action :action;
    private _bet :number|null = null;

    get bet(){ return this._bet; }

    constructor(user_id :string, action :action, bet :number|null){
        this.user_id = user_id;
        this.action = action;
        this._bet = bet;
    }
}