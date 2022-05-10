import { NextFunction, Request, Response } from "express";
import { battles, startBattle } from "./backend/Battle";
import { cardDatabase, getCard } from "./backend/Card";
import { getPlayerData, Player } from "./backend/Player";
import { connectedClients, sendToAll, sendToSpecific } from "./client_handler";

function validatePlayerData(data: Player) {
    return data.deck.length > 0 && (data.row1[0] || data.row1[1] || data.row1[2] || data.row1[3])
}

export function battleHandler(request: Request, response: Response, next: NextFunction) {
    const id = request.query.id as string;
    console.log(id)

    if(id === 'start-battle') {
        const aId = request.query.me as string
        const bId = request.query.op as string
        if(battles.find(b => b.playerA.id === aId || b.playerB.id === aId || b.playerB.id === bId || b.playerA.id === bId)) {
            console.log('player in battle')
            response.send('Player already in battle!').status(403).end()
            return;
        }
        const aData = getPlayerData(aId)
        const bData = getPlayerData(bId)

        if(!validatePlayerData(aData)) {
            console.log('invalid cards')
            response.send('You do not have your cards setup!').status(403).end()
            return
        }
        if(!validatePlayerData(bData)) {
            console.log('invalid cards')
            response.send('Enemy does not have cards setup!').status(403).end()
            return
        }


        console.log('success')
    
        startBattle(aId, aData, bId, bData)
    } else if (id === 'play-card') {
        const pid = request.query.me as string;
        const cardIdx = Number.parseInt(request.query.from as string);
        const rowIdx = Number.parseInt(request.query.to as string);

        const battle = battles.find(b => b.playerA.id === pid || b.playerB.id === pid);
        if(!battle) return

        const player = battle.playerA.id === pid ? battle.playerA : battle.playerB;
        const handCardName = player.hand.splice(cardIdx, 1);
        const handCard = getCard(handCardName[0]);
        const row = handCard?.type === 1 ? player.row1 : player.row2;

        if(!row) return
        row[rowIdx as 0|1|2|3] = handCard;

        sendToSpecific(battle.playerA.id, JSON.stringify({id: 'update-battle', battle: battle.serialize()}))
        sendToSpecific(battle.playerB.id, JSON.stringify({id: 'update-battle', battle: battle.serialize()}))
    }
    response.send('ok').status(200).end()
}