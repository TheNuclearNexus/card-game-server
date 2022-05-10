import { NextFunction, Request, Response } from "express";
import { battles, setBattles } from "./backend/Battle";
import { getPlayerData, setPlayerData } from "./backend/Player";
import { cardDatabase } from "./backend/Card";

interface Client {
    id: string;
    response: Response;
    x: number;
    y: number;
}

export let connectedClients: Client[] = []

export function sendToAll(data: string) {
    connectedClients.forEach(client => client.response.write(`data: ${data}\n\n`))
}
export function sendToSpecific(id: string, data: string) {
    connectedClients.find(client => client.id === id)?.response.write(`data: ${data}\n\n`)
}


export function getStrippedClients() {
    return connectedClients.map(c => ({id: c.id, x: c.x, y: c.y}))
}

export function clientHandler(request: Request, response: Response, next: NextFunction) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);

    const data = `data: ${JSON.stringify({
        id: 'init',
        clients: getStrippedClients(),
        cards: cardDatabase
    })}\n\n`;

    response.write(data);

    console.log(`Client connected: ${JSON.stringify(request.query)}`);

    const clientId = request.query.id as string;
    const x = Number.parseFloat(request.query.x as string);
    const y = Number.parseFloat(request.query.y as string);

    const newClient: Client = {
        id: clientId,
        response: response,
        x: x,
        y: y
    };

    if(!connectedClients.find(c => c.id === clientId))
        connectedClients.push(newClient);

    if(!getPlayerData(clientId))
        setPlayerData(clientId, {
            inventory: [],
            row1: {0:undefined, 1:undefined, 2:undefined, 3:undefined},
            deck: []
        })

    sendToAll(JSON.stringify({id: 'update-players', clients: getStrippedClients()}))

    const b = battles.find(b => b.playerA.id === clientId || b.playerB.id === clientId)
    if(b) {
        sendToSpecific(clientId, JSON.stringify({id: 'start-battle', battle: b.serialize(), notNew: true}))
    } else {
        sendToSpecific(clientId, JSON.stringify({id: 'goto-overworld'}))
    }

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        connectedClients = connectedClients.filter(client => client.id !== clientId);
        console.log(battles)

        // setBattles(battles.filter(b => {
        //     console.log(b)
        //     if(b.playerA.id === clientId) {
        //         console.log('Forfeitting ' + b.playerB.id + ' wins!')
        //         sendToSpecific(b.playerB.id, JSON.stringify({id: 'end-battle', type: 'win', condition: 'forfeit'}))
        //         return false
        //     }
        //     if(b.playerB.id === clientId) {
        //         console.log('Forfeitting ' + b.playerA.id + ' wins!')
        //         sendToSpecific(b.playerA.id, JSON.stringify({id: 'end-battle', type: 'win', condition: 'forfeit'}))
        //         return false
        //     }
        //     return true;
        // }))
        sendToAll(JSON.stringify({id: 'update-players', clients: getStrippedClients()}))
    });
}

