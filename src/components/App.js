import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import "./App.css";
import Web3 from "web3";
import TheSporties from "../build/TheSporties.json";

import Mint from "./Mint/Mint";
import Navbar from "./Navbar/Navbar";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const NetworksBinding = {
  4: 'https://rinkeby.etherscan.io'
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: "",
      accountBalance: "",
      theSportiesContract: null,
      theSportiesCount: 0,
      theSportiesTotal: 0,
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
      const networkData = TheSporties.networks[networkId];
      if (networkData) {
        const theSportiesContract = web3.eth.Contract(
          TheSporties.abi,
          networkData.address
        );
        this.setState({ theSportiesContract });
        this.setState({ contractDetected: true });
        const theSportiesCount = await theSportiesContract.methods.totalSupply().call();
        let theSportiesTotal = await theSportiesContract.methods.TOTAL_ITEMS.call();
        const tokenBalance = await theSportiesContract.methods.balanceOf(accounts[0]).call();
        const maxItemsPerMint = await theSportiesContract.methods.MAX_ITEMS_PER_MINT.call();
        let itemPrice = await theSportiesContract.methods.itemPrice().call();
        const saleIsActive = await theSportiesContract.methods.saleIsActive.call();
        theSportiesTotal = theSportiesTotal.toNumber();
        itemPrice = web3.utils.fromWei(itemPrice.toString(), "Ether");
        this.setState({ theSportiesCount });
        this.setState({ theSportiesTotal });
        this.setState({ maxItemsPerMint });
        this.setState({ itemPrice });
        this.setState({ saleIsActive });
        console.log(`Minted token: ${theSportiesCount}`);
        console.log(`Total token: ${theSportiesTotal}`);
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
    this.state.theSportiesContract.methods
      .mintTheSporties(tokenCount)
      .send({ from: this.state.accountAddress, value: window.web3.utils.toWei(totalPrice.toString(), "Ether") })
      // .send({ from: this.state.accountAddress, value: window.web3.utils.toWei('0.0001', "Ether") })
      .on("confirmation", function (res) {
        console.log(`Confirmed by the ${res} block`);
        if (res == 1)
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
      <div className="container">
        <>
          <HashRouter basename="/">
            <Navbar parentState={(this.state)} />
            <Route
              path="/"
              exact
              render={() => (
                <div />
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
        </>
      </div>
    );
  }
}

export default App;
