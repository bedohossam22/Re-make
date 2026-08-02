import 'dotenv/config';
import express from 'express';
import connectDB from './config/Mongodb';

const app = express();


connectDB();

app.use(express.json());

//routes
app.get('/', (req, res) => {
    res.send(`running nigga`);
})

export default app;