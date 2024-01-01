import { Client } from 'pg';

export class DB<T>{
    private mockDB = new Map<number, T>();

    // const client = new Client({
//     user: 'postgres',
//     host: 'mydb.dev',
//     database: 'postgres',
//     password: 'pass',
//     port: 5432,
//     ssl: false
// });
// client.connect();


    private id = 1;

    get(id :number){
        return this.mockDB.get(id);
    }

    set(game :T){
        this.mockDB.set(this.id, game);
        return this.id++;
    }

    delete(id :number){
        return this.mockDB.delete(id);
    }
}
