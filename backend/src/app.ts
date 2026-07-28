import 'dotenv/config';
import express from 'express';

const app = express();

app.use(express.json());

//routes
app.get('/', (req, res) => {
    res.send(`running nigga`);
})

export default app;