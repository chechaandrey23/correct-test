import express from 'express';

import {calcPrice} from './calc.price.mjs';

const app = express();
const port = 3003;

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello Correct!')
});

app.post('/', (req, res) => {
	res.send(calcPrice(req.body.language, req.body.count, ![null, undefined, '', 'none', 'doc', 'docx', 'rtf'].includes(req.body.mimetype)));
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
