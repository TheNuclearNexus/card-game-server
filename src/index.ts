import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { clientHandler, connectedClients } from './client_handler';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const PORT = 3000;


app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`)
})

app.get('/connect', clientHandler);
app.get('/status', (request, response) => response.json({clients: connectedClients.length}));
