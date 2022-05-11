import { NextFunction, Request, Response } from "express";
import { rowIndexes } from "./backend/Battle";
import { getCard } from "./backend/Card";
import { getPlayerData, Player, Row, setPlayerData } from "./backend/Player";

function serializeData(player: Player): any {
    return {
        inventory: player.inventory.map(name => getCard(name)),
        deck: player.deck.map(name => getCard(name)),
        row1: {
            [0]: getCard(player.row1[0]),
            [1]: getCard(player.row1[1]),
            [2]: getCard(player.row1[2]),
            [3]: getCard(player.row1[3])
        }
    }
}

export function getPlayerHandler(request: Request, response: Response, next: NextFunction) {
    const id = request.query.id as string;
    const player = getPlayerData(id);
    if(!player) {
        response.send('Player not found!').status(403).end();
        return;
    }
    response.send(serializeData(player)).status(200).end()
}

function countCards(deck: string[], row1: Row, inventory: string[]): {[key: string]: number} {
    const counts: {[key: string]: number} = {};
    for(const card of deck) {
        counts[card] = counts[card] ? counts[card] + 1 : 1;
    }
    console.log(row1)
    for(const idx of rowIndexes) {
        const card = row1[idx]
        if(!card) continue;
        counts[card] = counts[card] ? counts[card] + 1 : 1;
    }
    for(const card of inventory) {
        counts[card] = counts[card] ? counts[card] + 1 : 1;
    }

    return counts;
}

function doCountsMatch(counts1: {[key: string]: number}, counts2: {[key: string]: number}): boolean {
    for(const card of Object.keys(counts1)) {
        if(counts1[card] !== counts2[card]) return false;
    }
    return true;
}

export function postPlayerHandler(request: Request, response: Response, next: NextFunction) {
    const id = request.query.id as string;
    const player = getPlayerData(id);
    if(!player) {
        response.send('Player not found!').status(403).end();
        return;
    }
    if(!request.body) {
        response.send('No body!').status(403).end();
        return
    }
    const deck = request.body.deck as string[];
    const row1 = request.body.row1 as Row;
    const inventory = request.body.inventory as string[];
    
    let newCardCount = countCards(deck, row1, inventory);
    console.log(newCardCount)
    let oldCardCount = countCards(player.deck, player.row1, player.inventory);
    console.log(oldCardCount)
    if(!doCountsMatch(newCardCount, oldCardCount)) {
        response.send('Invalid card counts!').status(403).end();
        return;
    }

    player.deck = deck;
    player.row1 = row1;
    player.inventory = inventory;

    setPlayerData(id, player)
    response.send(serializeData(player)).status(200).end()
}