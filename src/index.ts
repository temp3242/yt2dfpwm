import express from 'express';
import getData from './convert.js'
const app = express()
const port = 3000;

app.get('/:id', async (req, res) => {
    const data = await getData(req.params.id);
    res.writeHead(200, {'Content-Type': 'application/octet-stream'});
    res.end(data, 'binary');
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
