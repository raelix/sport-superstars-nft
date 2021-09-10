import React, { Component } from "react";


const ROADMAP_ITEMS = [
    "Official Website, Discord and Twitter are online, the project will be added to Incoming Projects in rarity.tools",
    "During the 2 (cambiare o 2 o 3) weeks before the mint we will distribute 40 players to early adopters and moderators, or thought giveaways. 15 players will be assigned to the team",
    "700 players will be available to mint in early access, one day before the open mint",
    "Mint will be officially opened on Friday October 1st at 20PM EST",
    "Sport players full images and attributes will be revealed 7 days after the mint",
    "10 more revealed players will be distributed through contests and giveaways",
    "Part of the mint revenue will be used to buy the floor items on OpenSea and keep the floor price high",
    "The team will work on involving real sport players to represent their own sport and keep the hype high",
    "Collaborations with artists will create more limited editions players",
    "Listening to the community suggestions we will investigate how to involve in the coolest way our players in an NFT based sport game",
    "2nd gen and much more!!",
];

class Roadmap extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div class="d-flex flex-column my-2 ">
                { ROADMAP_ITEMS.map(function(item, index) {
                        return <div class="d-flex flex-row w-75 my-3 mx-auto justify-content-around sss-card">
                        <div class="d-flex flex-column">
                            <p class="mt-5 sss-card-big brick-font">{index * 10}%</p>
                        </div>
                        <div class="d-flex flex-column w-50">
                            <p class="mt-5 sss-card-text brick-font">{item}</p>
                        </div>
                    </div>
                    })
                }
                
            </div>
        );
    }
}

export default Roadmap;
