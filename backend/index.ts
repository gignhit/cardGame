import express from 'express';
import cors from 'cors';
import events  from 'events';

import { pokerRouter } from './api/poker';
import { userRouter } from './api/user';



const emitter = new events.EventEmitter();

const PORT = process.env.PORT || 3000;
let app = express();
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

app.use(express.json());
app.use(cors<express.Request>());

app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/poker', pokerRouter);
app.use('/users', userRouter);

