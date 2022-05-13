import { sendToSpecific } from "../client_handler"
import Card, { cardDatabase, getCard } from "./Card"
import { Player } from "./Player"

export type RowIndex = 0 | 1 | 2 | 3
export const rowIndexes: RowIndex[] = [0, 1, 2, 3]
interface Row {
    0?: Card,
    1?: Card,
    2?: Card,
    3?: Card
}

export interface BattlePlayer {
    row1: Row
    row2: Row
    lives: number,
    hp: number,
    id: string,
    deck: string[],
    hand: string[]
}


const turnTime = 3
const turnsForCard = 4
const startingHealth = 40

export class Battle {
    playerA: BattlePlayer
    playerB: BattlePlayer

    private _firstTurn: 'a' | 'b' = 'a'
    private _turnInterval: NodeJS.Timer
    private _turnNumber = 0
    private _turnActions: {id: string, [key: string]: any}[] = []

    constructor(playerA: BattlePlayer, playerB: BattlePlayer) {
        this.playerA = playerA
        this.playerB = playerB

        this._firstTurn = Math.random() > 0.5 ? 'a' : 'b'
        this._turnInterval = setInterval(() => { this.turn() }, turnTime * 1000)
    }


    handleCard(col: RowIndex, a: BattlePlayer, aRow1: Card | undefined, aRow2: Card | undefined, b: BattlePlayer, bRow1: Card | undefined, bRow2: Card | undefined) {
        if (!aRow1) return

        let modAP = aRow1.AP + (aRow2?.AP || 0)
        // console.log(aRow1.name, modAP);
        if (bRow1 === undefined) {
            b.hp -= modAP
            this._turnActions.push({id: 'damage-player', target: b.id, damage: modAP})
            return
        }

        if (bRow2 === undefined) {
            b.hp -= Math.max(modAP - bRow1.DP, 1)
            this._turnActions.push({id: 'damage-player', target: b.id, damage: Math.max(modAP - bRow1.DP, 1)})
            return
        }

        bRow2.HP -= Math.max(1, modAP - (bRow1.DP + (bRow2.DP)))
        this._turnActions.push({id: 'damage-card', target: b.id, col: col, damage: Math.max(1, modAP - (bRow1.DP + (bRow2.DP)))})

        if(aRow1.ability) aRow1.ability(col, a, this)

        const card = b.row2[col]
        if (!card || card.HP > 0) return
        b.row2[col] = undefined
    }

    serialize() {
        const serialized = {
            playerA: this.playerA,
            playerB: this.playerB,
            turn: {
                number: this._turnNumber,
                startTime: Date.now(),
                endTime: Date.now() + (turnTime),
                actions: this._turnActions
            }
        }
        console.log(serialized.turn)
        return serialized 
    }

    handle(p1: BattlePlayer, p2: BattlePlayer): boolean {
        this.handleCard(0, p1, p1.row1[0], p1.row2[0], p2, p2.row1[0], p2.row2[0])
        this.handleCard(1, p1, p1.row1[1], p1.row2[1], p2, p2.row1[1], p2.row2[1])
        this.handleCard(2, p1, p1.row1[2], p1.row2[2], p2, p2.row1[2], p2.row2[2])
        this.handleCard(3, p1, p1.row1[3], p1.row2[3], p2, p2.row1[3], p2.row2[3])

        if (p2.hp > 0) return false
        p2.hp = startingHealth
        p2.lives -= 1
        if (p2.lives === 0) return true
        return false

    }

    cleanup() {
        clearInterval(this._turnInterval)
        battles = battles.filter(b => b !== this)
    }


    turn() {
        this._turnActions = [{id: 'turn-start'}] //
        this._turnNumber++
        let first = this._firstTurn === 'a' ? this.playerA : this.playerB
        let second = this._firstTurn === 'a' ? this.playerB : this.playerA

        if (this._turnNumber % turnsForCard === 0) {
            if (first.deck.length >= 1 && first.hand.length <= 3)
                first.hand.push(first.deck.shift() || '')
            if (second.deck.length >= 1 && second.hand.length <= 3)
                second.hand.push(second.deck.shift() || '')

            this._turnActions.push({id: 'draw'})
        }

        const firstWin = this.handle(first, second)
        if (firstWin) {
            sendToSpecific(first.id, JSON.stringify({ id: 'end-battle', type: 'win', condition: 'defeat' }))
            sendToSpecific(second.id, JSON.stringify({ id: 'end-battle', type: 'loss', condition: 'defeat' }))
            this.cleanup()
            return
        }
        const secondWin = this.handle(second, first)
        if (secondWin) {
            sendToSpecific(first.id, JSON.stringify({ id: 'end-battle', type: 'loss', condition: 'defeat' }))
            sendToSpecific(second.id, JSON.stringify({ id: 'end-battle', type: 'win', condition: 'defeat' }))
            this.cleanup()
            return
        }

        sendToSpecific(first.id, JSON.stringify({ id: 'update-battle', battle: this.serialize() }))
        sendToSpecific(second.id, JSON.stringify({ id: 'update-battle', battle: this.serialize() }))
    }

}

export let battles: Battle[] = []
export function setBattles(newBattles: Battle[]) {
    battles = newBattles
    console.log(battles)
}



function convertRow1(row: { 0?: string, 1?: string, 2?: string, 3?: string }): Row {
    return {
        0: getCard(row[0]),
        1: getCard(row[1]),
        2: getCard(row[2]),
        3: getCard(row[3])
    }
}

function getHand(deck: string[]): string[] {
    let hand: string[] = []
    for (let i = 0; i < deck.length && i < 4; i++) {
        let cardName = deck[i]
        deck.shift()
        hand.push(cardName)
    }
    return hand
}

function setupPlayer(id: string, data: Player): BattlePlayer {
    return {
        id: id,
        lives: 2,
        hp: startingHealth,
        row1: convertRow1(data.row1),
        row2: { 0: undefined, 1: undefined, 2: undefined, 3: undefined },
        hand: getHand(data.deck),
        deck: data.deck
    }
}

export function startBattle(aId: string, aData: Player, bId: string, bData: Player) {
    aData.deck = aData.deck.sort(() => Math.random() - 0.5)

    const battle: Battle = new Battle(
        setupPlayer(aId, aData),
        setupPlayer(bId, bData)
    )

    battles.push(battle)
    console.log(battles)

    sendToSpecific(aId, JSON.stringify({ id: 'start-battle', battle: battle.serialize() }))
    sendToSpecific(bId, JSON.stringify({ id: 'start-battle', battle: battle.serialize() }))
}