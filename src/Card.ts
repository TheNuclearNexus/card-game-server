/*
Format of the cards:

[Row 1 card]:
Known as the "attacking" cards because that's what they do- on a player's turn, all of their Row 1 cards
attack straight ahead with AP damage; the row 1 card opposing those cards will "block" and the damage going
through is lowered by DP amount

[Row 2 card]:
Known as the "booster" cards because they add to the stats of the row 1 card in front of them. This is a
passive effect for all row 2 cards, but will go away if the card is destroyed. The card is destroyed when
its HP drops to 0. Any damage not blocked by a row 1 card will be dealt to this card, but if this card
is destroyed, then any damage is dealt to the defending player

[Traits]:
Some row 1 cards will have a special ability called a "trait" which will activate every time they attack.
A card with a trait will have inheritly lowered stats to ensure balance. Possible traits include:
+Pierce(1 damage is dealt to the defending player every time this card attacks)
+Bleed(1 damage is dealt to the row 2 card opposing the attack card, if possible)
+Holy(Attacking player gains 1 HP every time this card attacks)
+Curse(Attacking player loses 1 HP every time this card attacks)
*/

export default interface Card {
    name: string;           // Name of the card; should be unique for each card
    image: string;          // art of the card(on standby)
    type: number;           // Type of the card; row 1 or row 2
    description: string;    // Any traits the card has
    HP: number;             // Health points, if a row 2 card
    AP: number;             // Attack points, if a row 1 card
    DP: number;             // Defense points, if a row 1 card
}

export let cardDatabase = [
    //row 1 Cards:
    {
        name: 'Loyal Guard Dog', description: '', image: '', type: 1, HP: 0, AP: 2, DP: 3
    },

    {
        name: 'Red Eyed ViperFang', description: '', image: '', type: 1, HP: 0, AP: 3, DP: 1
    },

    {
        name: 'Azurite Statue', description: '+Holy', image: '', type: 1, HP: 0, AP: 2, DP: 1
    },

    {
        name: 'Gilded Monkey', description: '+Holy', image: '', type: 1, HP: 0, AP: 1, DP: 3
    },

    {
        name: 'Crypt Dweller', description: '+Bleed', image: '', type: 1, HP: 0, AP: 1, DP: 2
    },

    {
        name: 'Honeybee Knight', description: '+Pierce', image: '', type: 1, HP: 0, AP: 1, DP: 3
    },

    {
        name: 'Platinum Spirit', description: '+Pierce', image: '', type: 1, HP: 0, AP: 2, DP: 1
    },

    {
        name: 'Shrine Haunt', description: '+Curse', image: '', type: 1, HP: 0, AP: 4, DP: 2
    },


    //Row 2 Cards:
    { //row 2 cards; buffs are described by ap and dp stats
        name: 'Bamboo Armor', description: '', image: '', type: 2, HP: 4, AP: 0, DP: 2
    },

    {
        name: 'Azurite Ring', description: '', image: '', type: 2, HP: 3, AP: 3, DP: 0
    },

    {
        name: 'Stag Shell', description: '', image: '', type: 2, HP: 4, AP: 1, DP: 2
    },

    {
        name: 'Bone Heirloom', description: '', image: '', type: 2, HP: 3, AP: 2, DP: 1
    },

    {
        name: 'Meteorite Bracelet', description: '', image: '', type: 2, HP: 2, AP: 3, DP: 3
    },

    {
        name: 'Magma Gauntlets', description: '', image: '', type: 2, HP: 2, AP: 2, DP: 3
    },

    {
        name: 'Winter Blessing', description: '', image: '', type: 2, HP: 5, AP: 1, DP: 1
    },

    {
        name: 'Lotus Shield', description: '', image: '', type: 2, HP: 3, AP: 0, DP: 3
    }
]