import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { clientHandler, connectedClients } from './client_handler';
import { locationHandler } from './location_handler';
import { battleHandler } from './battle_handler';
import { getPlayerHandler, postPlayerHandler } from './player_handler';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const PORT = 3000;



app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`)
})

app.get('/images', (req, res) => {
  res.sendFile(process.cwd() + '/images/' + req.query.name + '.png', {dotfiles: 'allow'});
})
app.get('/audio', (req, res) => {
  res.sendFile(process.cwd() + '/audio/' + req.query.name + '.mp3', {dotfiles: 'allow'});
})

app.get('/player', getPlayerHandler)
app.post('/player', postPlayerHandler)

app.get('/connect', clientHandler);
app.post('/battle', battleHandler)
app.post('/location', locationHandler)
app.get('/status', (request, response) => response.json({clients: connectedClients.length}));
