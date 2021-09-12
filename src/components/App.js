
import { Redirect, HashRouter, Route } from "react-router-dom";
import Web3 from "web3";
import "./App.css";
import SportLegends from "../build/SportLegends.json";
import React, { Component } from "react";
import Mint from "./Mint/Mint";
import Team from "./Team/Team";
import Roadmap from "./Roadmap/Roadmap";
import Navbar from "./Navbar/Navbar";
import Loading from "./Loading/Loading"

import radar from "./images/radar.png";


// import { withRouter } from "react-router";

const NetworksBinding = {
  4: 'https://rinkeby.etherscan.io'
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delay: 3000,
      loading: false
      // accountAddress: "",
      // loading: true,
      // smartContract: null,
      // metamaskConnected: false,
      // contractDetected: false,
      // currentNetId: -1,
      // accountEthBalance: 0,
      // accountTokenBalance: 0,
      // isAddressAllowedForPreSale: false,
      // preSaleIsActive: false,
      // saleIsActive: false,
      // itemPrice: 0,
      // maxItemsPerMint: 0,
      // mintedTokenCount: 0,
      // totalTokenCount: 0,
      // preSaleItemsCount: 0,
      // maxPreSaleItemsCount: 0,
      // giftItemsCount: 0,
      // maxGiftItemsCount: 0
    };
  }

  componentDidMount = async () => {
    // https://blog.bitsrc.io/polling-in-react-using-the-useinterval-custom-hook-e2bcefda4197 
    this.setState({ loading: true });
    await this.loadWeb3();
    if (!this.state.skipBrowser)
      await this.loadBlockchainData();
    else
      this.setState({ loading: false });
    if (this.state.contractDetected)
      this.interval = setInterval(this.getContractData, this.state.delay)
    else
      this.setState({ loading: false });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.delay !== this.state.delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.getContractData, this.state.delay)
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      this.setState({ skipBrowser: true });
      window.alert(
        "Non-Ethereum browser detected. The data can't be fetched!"
      );
    }
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ loading: true });
    if (accounts.length === 0) {
      // MetaMask not connected
      this.setState({ metamaskConnected: false });
      this.setState({ loading: false });
    } else {
      // Metamask connected
      this.setState({ metamaskConnected: true });
      this.setState({ accountAddress: accounts[0] });
      const networkId = await web3.eth.net.getId();
      this.setState({ currentNetId: networkId });
      const networkData = SportLegends.networks[networkId];
      if (networkData) {
        // Connected to the right network
        const smartContract = new web3.eth.Contract(SportLegends.abi, networkData.address);
        this.setState({ smartContract });
        this.setState({ contractDetected: true });
      } else {
        // Connected to the wrong network
        this.setState({ contractDetected: false });
        this.setState({ loading: false });
      }
    }
  };

  getContractData = async () => {
    const web3 = window.web3;
    const smartContract = this.state.smartContract;
    const accountEthBalance = web3.utils.fromWei(await web3.eth.getBalance(this.state.accountAddress), "Ether");
    const accountTokenBalance = await smartContract.methods.balanceOf(this.state.accountAddress).call();
    const isAddressAllowedForPreSale = await smartContract.methods.isAddressAllowedForPreSale(this.state.accountAddress).call();
    const saleIsActive = await smartContract.methods.saleIsActive().call();
    const preSaleIsActive = await smartContract.methods.preSaleIsActive().call();
    const mintedTokenCount = await smartContract.methods.totalSupply().call();
    const totalTokenCount = await smartContract.methods.TOTAL_ITEMS().call();
    const preSaleItemsCount = await smartContract.methods.getPreSaleItems().call();
    const maxPreSaleItemsCount = await smartContract.methods.PREADOPT_ITEMS().call();
    const giftItemsCount = await smartContract.methods.getGiftItems().call();
    const maxGiftItemsCount = await smartContract.methods.GIFT_ITEMS().call();
    const maxItemsPerMint = await smartContract.methods.MAX_ITEMS_PER_MINT().call();
    let itemPrice = await smartContract.methods.itemPrice().call();
    itemPrice = web3.utils.fromWei(itemPrice.toString(), "Ether");
    this.setState({ accountEthBalance });
    this.setState({ accountTokenBalance });
    this.setState({ isAddressAllowedForPreSale });
    this.setState({ preSaleIsActive });
    this.setState({ saleIsActive });
    this.setState({ itemPrice });
    this.setState({ maxItemsPerMint });
    this.setState({ mintedTokenCount });
    this.setState({ totalTokenCount });
    this.setState({ preSaleItemsCount });
    this.setState({ maxPreSaleItemsCount });
    this.setState({ giftItemsCount });
    this.setState({ maxGiftItemsCount });
    console.log(this.state);
    // console.log(`Minted token: ${mintedTokenCount}`);
    // console.log(`Total token: ${totalTokenCount}`);
    // console.log(`Max items per mint: ${maxItemsPerMint}`);
    // console.log(`Item price: ${itemPrice} eth`);
    // console.log(`Token user balance: ${accountTokenBalance}`);
    // console.log(`User eth balance: ${accountEthBalance}`);
    // console.log(`Network ID: ${this.state.currentNetId}`);
    // console.log(`${saleIsActive ? 'Sale active' : 'Sale inactive'}`);
    this.setState({ loading: false });
    // setTimeout(this.getContractData(), 1000);
  }

  mint = async (tokenCount, isPreSale) => {
    const netID = this.state.currentNetId;
    this.setState({ loading: true });
    const totalPrice = this.state.itemPrice * tokenCount;
    console.log(`Total mint price: ${totalPrice} - is pre-sale? ${isPreSale}`);
    if (!isPreSale)
      this.state.smartContract.methods
        .mintSportLegends(tokenCount)
        .send({ from: this.state.accountAddress, value: window.web3.utils.toWei(totalPrice.toString(), "Ether") })
        .on("confirmation", function (res) {
          if (res === 1)
            window.alert('Confirmed!');

        })
        .on('error', function (error) {
          window.alert(error.message);
        })
        .on('transactionHash', function (transactionHash) {
          const transactionURL = NetworksBinding[netID] + '/tx/' + transactionHash;
          window.alert(`You can check your transaction ${transactionURL}`);
        })
        .on('receipt', function (receipt) {
          console.log(receipt.contractAddress)
        });
    else {
      this.state.smartContract.methods
        .mintPreSaleSportLegends(tokenCount)
        .send({ from: this.state.accountAddress, value: window.web3.utils.toWei(totalPrice.toString(), "Ether") })
        .on("confirmation", function (res) {
          if (res === 1)
            window.alert('Confirmed!');

        })
        .on('error', function (error) {
          window.alert(error.message);
        })
        .on('transactionHash', function (transactionHash) {
          const transactionURL = NetworksBinding[netID] + '/tx/' + transactionHash;
          window.alert(`You can check your transaction ${transactionURL}`);
        })
        .on('receipt', function (receipt) {
          console.log(receipt.contractAddress)
        });
    }
  }


  render() {
    return (
      <div className="d-flex h-100 mx-auto flex-column">
        <HashRouter basename="/">

          <Navbar parentState={(this.state)} />

          <Route
            path="/"
            exact
            render={() => {
              if (this.state.loading) {
                return (
                  <Loading />
                )
              }
              else
                return (
                  <div class="d-flex w-75 mx-auto flex-column p-3 text-center text-black">
                    <p class="text-center h1 my-3 brick-font">
                      Welcome to the Sport Superstars hera where 7,777 unique players lives on the Ethereum blockchain! They born to change the sport NFT collectibles market,  based on ERC-721 token, coming around the universe are programmatically and randomly generated starting from 7 breed and 7 sports properties and more than 1,6 million possible combinations. Each player will also have in-game stats that will be fundamental for future roadmap milestones. We plan to mostly work on collaborations in the near future, but check the Roadmap for further information!
                    </p>
                    <div class="d-flex p-3 text-center">
                      <img src={radar} />
                      <div class="d-flex flex-column my-auto">
                        <p class="text-center h1 m-5 brick-font">
                          Each Superstar will will have a unique identity, starting from the name, shirt number and a set of attributes that will help him to dominate his sport.
                          <br />
                          <br />
                          Collect the game changers, rule the game with the best players in the universe!
                        </p>
                        <a class="btn btn-outline-info btn-dark btn-lg px-5 mx-auto my-auto button-text" href="#/mint">GET YOURS</a>
                      </div>                    
                    </div>
                  </div>
                )
            }
            }
          />
          <Route
            path="/mint"
            render={() => {
              if (!this.state.contractDetected) {
                window.alert("connect to MetaMask and to the Ethereum mainnet before try to mint.")
                return (
                  <Redirect from="/mint" to="/" />
                )
              }
              if (this.state.loading) {
                return (
                  <Loading />
                )
              }
              else
                return (
                  <Mint
                    mint={this.mint}
                    parentState={this.state}
                    enableButton={this.state}
                  />
                )
            }
            }
          />
          <Route
            path="/team"
            render={() => {
              return (
                <Team/>
              )
            }}
          />
          <Route
            path="/roadmap"
            render={() => {
              return (
                <Roadmap/>
              )
            }}
          />
        </HashRouter>
        <div class="footer mt-1 mx-auto ">
          <a class="m-2" href="https://twitter.com/SportSuperstars">
            <svg src="https://a.com" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" viewBox="0 0 16 16">
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
            </svg>
          </a>
          <a class="m-2" href="https://discord.gg/yEbTMAnxCY">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" viewBox="0 0 16 16">
              <path d="M6.552 6.712c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888.008-.488-.36-.888-.816-.888zm2.92 0c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888s-.36-.888-.816-.888z" />
              <path d="M13.36 0H2.64C1.736 0 1 .736 1 1.648v10.816c0 .912.736 1.648 1.64 1.648h9.072l-.424-1.48 1.024.952.968.896L15 16V1.648C15 .736 14.264 0 13.36 0zm-3.088 10.448s-.288-.344-.528-.648c1.048-.296 1.448-.952 1.448-.952-.328.216-.64.368-.92.472-.4.168-.784.28-1.16.344a5.604 5.604 0 0 1-2.072-.008 6.716 6.716 0 0 1-1.176-.344 4.688 4.688 0 0 1-.584-.272c-.024-.016-.048-.024-.072-.04-.016-.008-.024-.016-.032-.024-.144-.08-.224-.136-.224-.136s.384.64 1.4.944c-.24.304-.536.664-.536.664-1.768-.056-2.44-1.216-2.44-1.216 0-2.576 1.152-4.664 1.152-4.664 1.152-.864 2.248-.84 2.248-.84l.08.096c-1.44.416-2.104 1.048-2.104 1.048s.176-.096.472-.232c.856-.376 1.536-.48 1.816-.504.048-.008.088-.016.136-.016a6.521 6.521 0 0 1 4.024.752s-.632-.6-1.992-1.016l.112-.128s1.096-.024 2.248.84c0 0 1.152 2.088 1.152 4.664 0 0-.68 1.16-2.448 1.216z" />
            </svg>
          </a>
        </div>
        <footer class="footer mt-2 mx-auto ">

          <p class="h3"
          ><span >© </span> 2021 Sport Superstars</p>
        </footer>
      </div>
    );
  }
}

export default App;
