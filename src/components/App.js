
import { HashRouter, Route } from "react-router-dom";
import Web3 from "web3";
import "./App.css";
import SportLegends from "../build/SportLegends.json";
import React, { Component } from "react";
import Mint from "./Mint/Mint";
import Navbar from "./Navbar/Navbar";
import { withRouter } from "react-router";

const NetworksBinding = {
  4: 'https://rinkeby.etherscan.io'
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: "",
      accountBalance: "",
      sportLegendsContract: null,
      sportLegendsCount: 0,
      sportLegendsTotal: 0,
      maxItemsPerMint: 0,
      itemPrice: 0.0,
      loading: true,
      metamaskConnected: false,
      contractDetected: false,
      currentNetId: -1,
      saleIsActive: false
    };
  }

  componentWillMount = async () => {
    await this.loadWeb3();
    await this.loadBlockchainData();
  };

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      this.setState({ metamaskConnected: false });
    } else {
      this.setState({ metamaskConnected: true });
      this.setState({ loading: true });
      this.setState({ accountAddress: accounts[0] });
      let accountBalance = await web3.eth.getBalance(accounts[0]);
      accountBalance = web3.utils.fromWei(accountBalance, "Ether");
      this.setState({ accountBalance });
      const networkId = await web3.eth.net.getId();
      this.setState({ currentNetId: networkId });
      const networkData = SportLegends.networks[networkId];
      console.log(networkData);
      if (networkData) {
        const sportLegendsContract = new web3.eth.Contract(
          SportLegends.abi,
          networkData.address
        );
        this.setState({ sportLegendsContract });
        this.setState({ contractDetected: true });
        const sportLegendsCount = await sportLegendsContract.methods.totalSupply().call();
        const sportLegendsTotal = await sportLegendsContract.methods.TOTAL_ITEMS().call();
        const tokenBalance = await sportLegendsContract.methods.balanceOf(accounts[0]).call();
        const maxItemsPerMint = await sportLegendsContract.methods.MAX_ITEMS_PER_MINT().call();
        let itemPrice = await sportLegendsContract.methods.itemPrice().call();
        const saleIsActive = await sportLegendsContract.methods.saleIsActive().call();
        itemPrice = web3.utils.fromWei(itemPrice.toString(), "Ether");
        this.setState({ sportLegendsCount });
        this.setState({ sportLegendsTotal });
        this.setState({ maxItemsPerMint });
        this.setState({ itemPrice });
        this.setState({ saleIsActive });
        console.log(`Minted token: ${sportLegendsCount}`);
        console.log(`Total token: ${sportLegendsTotal}`);
        console.log(`Max items per mint: ${maxItemsPerMint}`);
        console.log(`Item price: ${itemPrice} eth`);
        console.log(`Token user balance: ${tokenBalance}`);
        console.log(`User eth balance: ${accountBalance}`);
        console.log(`Network ID: ${networkId}`);
        console.log(`${saleIsActive ? 'Sale active' : 'Sale inactive'}`);
        this.setState({ loading: false });
      } else {
        this.setState({ contractDetected: false });
      }
      this.setState({ loading: false });
    }
  };

  mint = async (tokenCount) => {
    console.log('Mint please');
    const netID = this.state.currentNetId;
    this.setState({ loading: true });
    const totalPrice = this.state.itemPrice * tokenCount;
    console.log(`Total mint price: ${totalPrice}`);
    this.state.sportLegendsContract.methods
      .mintSportLegends(tokenCount)
      .send({ from: this.state.accountAddress, value: window.web3.utils.toWei(totalPrice.toString(), "Ether") })
      // .send({ from: this.state.accountAddress, value: window.web3.utils.toWei('0.0001', "Ether") })
      .on("confirmation", function (res) {
        console.log(`Confirmed by the block ${res}`);
        if (res === 1)
          window.alert('Confirmed!');

      })
      .on('error', function (error) {
        window.alert(error.message);
      })
      .on('transactionHash', function (transactionHash) {
        console.log(transactionHash);
        const transactionURL = NetworksBinding[netID] + '/tx/' + transactionHash;
        window.alert(`You can check your transaction ${transactionURL}`);
      })
      .on('receipt', function (receipt) {
        console.log('receipt')
        console.log(receipt.contractAddress)
      });
  }


  render() {
    return (
      <div className="d-flex h-100 mx-auto flex-column">
        <HashRouter basename="/">
          
          <Navbar parentState={(this.state)} />

          <Route
            path="/"
            exact
            render={() => (
              <div>
                <p class="text-light text-center h2 m-5">The Sport Legends are here!</p>
                <a class="btn btn-orange rounded-pill btn-lg px-5 mt-0 mt-md-3 mt-lg-4" href="#/mint">GET STARTED</a>
              </div>
            )}
          />
          <Route
            path="/mint"
            render={() => (
              <Mint mint={this.mint} parentState={this.state} />
            )}
          />
          <Route
            path="/team"
            render={() => (
              <tr />
            )}
          />
          <Route
            path="/roadmap"
            render={() => (
              <tr />
            )}
          />
        </HashRouter>
        <div class="footer mt-auto mx-auto ">
          <a class="m-2" href="https://google.it">
          <svg src="https://a.com" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-twitter" viewBox="0 0 16 16">
            <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
          </svg>
          </a>
          <a class="m-2" href="https://google.it">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-discord" viewBox="0 0 16 16">
            <path d="M6.552 6.712c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888.008-.488-.36-.888-.816-.888zm2.92 0c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888s-.36-.888-.816-.888z" />
            <path d="M13.36 0H2.64C1.736 0 1 .736 1 1.648v10.816c0 .912.736 1.648 1.64 1.648h9.072l-.424-1.48 1.024.952.968.896L15 16V1.648C15 .736 14.264 0 13.36 0zm-3.088 10.448s-.288-.344-.528-.648c1.048-.296 1.448-.952 1.448-.952-.328.216-.64.368-.92.472-.4.168-.784.28-1.16.344a5.604 5.604 0 0 1-2.072-.008 6.716 6.716 0 0 1-1.176-.344 4.688 4.688 0 0 1-.584-.272c-.024-.016-.048-.024-.072-.04-.016-.008-.024-.016-.032-.024-.144-.08-.224-.136-.224-.136s.384.64 1.4.944c-.24.304-.536.664-.536.664-1.768-.056-2.44-1.216-2.44-1.216 0-2.576 1.152-4.664 1.152-4.664 1.152-.864 2.248-.84 2.248-.84l.08.096c-1.44.416-2.104 1.048-2.104 1.048s.176-.096.472-.232c.856-.376 1.536-.48 1.816-.504.048-.008.088-.016.136-.016a6.521 6.521 0 0 1 4.024.752s-.632-.6-1.992-1.016l.112-.128s1.096-.024 2.248.84c0 0 1.152 2.088 1.152 4.664 0 0-.68 1.16-2.448 1.216z" />
          </svg>
          </a>
        </div>
        <footer class="footer mt-2 mx-auto ">

          <p style={{ fontSize: "0.8rem", letterSpacing: "0.1rem", color: "black" }}
            class="copyright"><span >© </span> 2021 Sport Legends</p>
        </footer>
      </div>
    );
  }
}

export default App;
