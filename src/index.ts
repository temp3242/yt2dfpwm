import express from 'express';
import getData, { checkUrl } from './convert.js';
const app = express()
const port = 3000;

app.get('/video/:id?', async (req, res, next) => {

    if (!req.params.id) { res.sendStatus(400); next(); return }
    else {
        if (checkUrl(req.params.id)) {
            try {
                const data = await getData(req.params.id);
                res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                res.end(data, 'binary');
            } catch (e) {
                res.status(500).send(e)
            }
        }
        else res.sendStatus(400);
    }
})

app.get('/', (_req, res) => {
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
