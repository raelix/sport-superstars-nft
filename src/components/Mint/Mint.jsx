import React, { Component } from "react";
import Button from "../Button/Button";

const SOLDOUT = "SOLDOUT"
const NOT_YET_READY = "SALE INACTIVE"
const PRE_SALE_ACTIVE_BUT_CANT = "YOU ARE NOT ELIGIBLE FOR PRE-SALE"
const PRE_SALE_ACTIVE_SOLDOUT = "PRE-SALE SOLDOUT"
const PRE_SALE_ACTIVE = "PRE-SALE MINT"
const SALE_ACTIVE = "MINT"

class Mint extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tokenCount: 1
        };
    }


    mint = (tokenCount, isPreSale = false) => {
        this.props.mint(tokenCount, isPreSale);
    };

    isEnabledMintButton = () => {
        return (this.props.parentState.saleIsActive ||
            (this.props.parentState.preSaleIsActive && this.props.parentState.isAddressAllowedForPreSale)) &&
            (this.props.parentState.mintedTokenCount < this.props.parentState.totalTokenCount)
    }

    getButtonText = () => {
        let state = this.props.parentState;
        if (state.mintedTokenCount >= state.totalTokenCount) {
            return SOLDOUT
        }
        else if (!state.saleIsActive && !state.preSaleIsActive) {
            return NOT_YET_READY
        }
        else if (state.preSaleIsActive && !state.isAddressAllowedForPreSale) {
            return PRE_SALE_ACTIVE_BUT_CANT
        }
        else if (state.preSaleIsActive && state.isAddressAllowedForPreSale && state.preSaleItemsCount >= state.maxPreSaleItemsCount) {
            return PRE_SALE_ACTIVE_SOLDOUT
        }
        else if (state.preSaleIsActive && state.isAddressAllowedForPreSale && state.preSaleItemsCount < state.maxPreSaleItemsCount) {
            return PRE_SALE_ACTIVE + ' (' + (this.props.parentState.itemPrice * this.state.tokenCount).toFixed(2) + ' eth) '
        }
        else if (state.saleIsActive && state.mintedTokenCount < state.totalTokenCount) {
            return SALE_ACTIVE + ' (' + (this.props.parentState.itemPrice * this.state.tokenCount).toFixed(2) + ' eth) '
        }
    }

    getMaxItemsPerMint = () => {
        return this.props.parentState.maxItemsPerMint
    }

    isPreSale = () => {
        return !this.props.parentState.saleIsActive && this.props.parentState.preSaleIsActive
    }

    getPercentageMinted = () => {
        if (!this.isPreSale())
            return ((this.props.parentState.mintedTokenCount * 100) / this.props.parentState.totalTokenCount).toFixed(2)
        else
            return ((this.props.parentState.preSaleItemsCount * 100) / this.props.parentState.maxPreSaleItemsCount).toFixed(2)
    }

    getMintedStatisticString = () => {
        if (!this.isPreSale())
            return  `${this.props.parentState.mintedTokenCount} / ${this.props.parentState.totalTokenCount} Minted`
        else
            return `${this.props.parentState.preSaleItemsCount} / ${this.props.parentState.maxPreSaleItemsCount} Minted on pre-sale`
    }

    render() {
        return (
            <div class="d-flex flex-column p-3 text-center">
                <div class="ml-auto mr-auto mt-3 "></div>
                <div class="mt-3 w-50 ml-auto mr-auto">
                    <div class="progress" style={{"box-shadow": "2px 2px 1px #888888"}}>
                        <div 
                        class="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                        style={{ width: this.getPercentageMinted() + "%" }}
                        role="progressbar" 
                        aria-valuenow={this.getPercentageMinted()} 
                        aria-valuemin="0" 
                        aria-valuemax="100" ></div>
                    </div>
                </div>
                <div class="ml-auto mr-auto mt-3 big-text">{this.getMintedStatisticString()}</div>
                <div class="ml-auto mr-auto mt-3 medium-text">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.mint(
                                this.state.tokenCount, this.isPreSale()
                            );
                        }}
                    >
                        <div className="form-group mt-4 ">
                            <label htmlFor="tokenCount">
                                <span >Mint Sport Superstars</span> :
                            </label>
                            <input
                                required
                                type="number"
                                name="tokenCount"
                                id="tokenCount"
                                value={this.state.tokenCount}
                                min="1"
                                max={this.getMaxItemsPerMint()}
                                className="form-control  mt-0 "
                                placeholder="Enter token count"
                                onChange={(e) => this.setState({ tokenCount: e.target.value })}
                            />
                        </div>
                        <Button
                            active={this.isEnabledMintButton()}
                            text={this.getButtonText()}
                        />
                    </form>
                </div>
            </div>
        );
    }
}

export default Mint;
