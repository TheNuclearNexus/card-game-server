import { NextFunction, Request, Response } from "express";
import { connectedClients, sendToAll } from "./client_handler";

export function locationHandler(request: Request, response: Response, next: NextFunction) {
    const id = request.query.id as string;
    const x = Number.parseFloat(request.query.x as string);
    const y = Number.parseFloat(request.query.y as string);

    const c = connectedClients.find(c => c.id === id)
    if(c === undefined) {response.end(); return}
    c.x = x
    c.y = y
    console.log('send locations')
    sendToAll(JSON.stringify({id: 'update-players', clients: connectedClients.map(c => ({id: c.id, x: c.x, y: c.y}))}))
}