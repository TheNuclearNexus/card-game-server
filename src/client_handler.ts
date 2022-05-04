import { NextFunction, Request, Response } from "express";
import { cardDatabase } from "./Card";

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

    connectedClients.push(newClient);

    sendToAll(JSON.stringify({id: 'update-players', clients: getStrippedClients()}))

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        connectedClients = connectedClients.filter(client => client.id !== clientId);
    });
}

