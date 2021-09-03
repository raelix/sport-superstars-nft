import React, { Component } from "react";

class Mint extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenCount: 1
        };
    }

    mint = (tokenCount) => {
        this.props.mint(tokenCount);
    };

    render() {
        return (
            <div class="d-flex flex-row  overflow-hidden p-3 text-center bg-light">
            <div class= "mx-3 mt-3 w-100"></div>
            <div class= "ml-auto mr-3 mt-3 ">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    this.mint(
                        this.state.tokenCount
                    );
                }}
            >
                <div className="form-group mt-4 ">
                    <label htmlFor="tokenCount">
                        <span className="font-weight-bold">Mint Sport Legends</span> :
                    </label>{" "}
                    <input
                        required
                        type="number"
                        name="tokenCount"
                        id="tokenCount"
                        value={this.state.tokenCount}
                        min="1"
                        max={this.props.parentState.maxItemsPerMint}
                        className="form-control  mt-0 "
                        placeholder="Enter new price"
                        onChange={(e) =>
                            this.setState({
                                tokenCount: e.target.value,
                            })
                        }
                    />
                </div>
                <button
                    type="submit"
                    disabled={!this.props.parentState.saleIsActive}
                    style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                    className="btn btn-outline-info mt-0 "
                >
                    
                    {this.props.parentState.sportLegendsCount >= this.props.parentState.sportLegendsTotal ? 'SOLDOUT' : this.props.parentState.saleIsActive ? 'Mint (' + this.props.parentState.itemPrice * this.state.tokenCount + ' eth)' : 'SALE INACTIVE'}
                </button>
            </form>
            </div>
            </div>
        );
    }
}

export default Mint;
