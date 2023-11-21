import express from 'express';
import { pokerRouter } from './api/poker';

const PORT = process.env.PORT || 3000;
let app = express();
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello world');
})

app.use('/poker', pokerRouter);