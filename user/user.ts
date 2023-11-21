export class UserId{
    private _value: number;

    constructor(id:number){
        this._value = id;
    }

    public get value(){ return this._value }
}

export class User{
    id: UserId;
    name: string;

    constructor(id:number, name:string){
        this.id = new UserId(id);
        this.name = name;
    }
}