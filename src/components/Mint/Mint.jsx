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
                        <span className="font-weight-bold">Mint TheSporties</span> :
                    </label>{" "}
                    <input
                        required
                        type="number"
                        name="tokenCount"
                        id="tokenCount"
                        value={this.state.tokenCount}
                        min="1"
                        max={this.props.parentState.maxItemsPerMint}
                        className="form-control w-50"
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
                    className="btn btn-outline-info mt-0 w-50"
                >
                    
                    {this.props.parentState.theSportiesCount >= this.props.parentState.theSportiesTotal ? 'SOLDOUT' : this.props.parentState.saleIsActive ? 'Mint (' + this.props.parentState.itemPrice * this.state.tokenCount + ' eth)' : 'SALE INACTIVE'}
                </button>
            </form>

        );
    }
}

export default Mint;
