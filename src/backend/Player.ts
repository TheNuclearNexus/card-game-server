import Card from "./Card";
import * as fs from 'fs'

export interface Row {
    0?: string
    1?: string
    2?: string
    3?: string
}
export interface Player {
    inventory: string[]
    row1: Row,
    deck: string[]
}

if(!fs.existsSync('data')) {
    fs.mkdirSync('data')
}
if(!fs.existsSync('data/player.db')) {
    fs.writeFileSync('data/player.db', JSON.stringify({}))
}

export function getPlayerData(id: string) {
    const db: {[key: string]: Player} = JSON.parse(fs.readFileSync('data/player.db', {encoding: 'utf-8'}))
    return db[id]
}

export function setPlayerData(id: string, data: Player) {
    const db: {[key: string]: Player} = JSON.parse(fs.readFileSync('data/player.db', {encoding: 'utf-8'}))
    db[id] = data
    fs.writeFileSync('data/player.db', JSON.stringify(db, null, 2))
}