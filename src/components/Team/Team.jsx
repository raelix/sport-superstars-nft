import React, { Component } from "react";
import facco from "../images/facco.png";
import raelix from "../images/raelix.png";
import giammy from "../images/giammy.png";

class Team extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div class="d-flex flex-column my-5 ">

                <text class="d-flex h1 mr-auto ml-auto">The Sport Superstars team</text>
                <div class="d-flex flex-row w-50 my-3 mx-auto justify-content-around sss-card">
                    <img src={giammy}  />
                    <div class="d-flex my-auto flex-column">
                        <p class="sss-card-title brick-font text-black">Giammy</p>
                        <p class="sss-card-text brick-font">Developer</p>
                    </div>
                </div>
                <div class="d-flex flex-row w-50 my-3 mx-auto justify-content-around sss-card">
                    <div class="d-flex my-auto flex-column">
                        <p class="sss-card-title brick-font text-black">Raelix</p>
                        <p class="sss-card-text brick-font">Designer</p>
                    </div>
                    <img src={raelix}  />
                </div>
                <div class="d-flex flex-row w-50 my-3 mx-auto justify-content-around sss-card">
                    <img src={facco}  />
                    <div class="d-flex my-auto flex-column">
                        <p class="sss-card-title brick-font text-black">Facco</p>
                        <p class="sss-card-text brick-font">Roadmap</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Team;
