import { cardDatabase } from "./backend/Card";
import * as fs from 'fs'

let names = []
for(let c of cardDatabase) {
    names.push(c.name)
}
fs.writeFileSync('./data/card_names.json', JSON.stringify(names, null, 2))