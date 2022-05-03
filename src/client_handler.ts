import { NextFunction, Request, Response } from "express";

interface Client {
    id: string;
    response: Response;
    x: number;
    y: number;
}

export let connectedClients: Client[] = []
export function clientHandler(request: Request, response: Response, next: NextFunction) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);

    const data = `data: ${JSON.stringify({
        clients: connectedClients

    })}\n\n`;

    response.write(data);

    const clientId = request.query.id as string;
    const x = Number.parseInt(request.query.x as string);
    const y = Number.parseInt(request.query.y as string);

    const newClient: Client = {
        id: clientId,
        response: response,
        x: x,
        y: y
    };

    connectedClients.push(newClient);

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        connectedClients = connectedClients.filter(client => client.id !== clientId);
    });
}

