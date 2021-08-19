import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import "./App.css";
import Web3 from "web3";
import TheSporties from "../build/TheSporties.json";

import FormAndPreview from "../components/FormAndPreview/FormAndPreview";
import AllCryptoBoys from "./AllCryptoBoys/AllCryptoBoys";
import AccountDetails from "./AccountDetails/AccountDetails";
import ContractNotDeployed from "./ContractNotDeployed/ContractNotDeployed";
import ConnectToMetamask from "./ConnectMetamask/ConnectToMetamask";
import Loading from "./Loading/Loading";
import Navbar from "./Navbar/Navbar";
import MyCryptoBoys from "./MyCryptoBoys/MyCryptoBoys";
import Queries from "./Queries/Queries";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: "",
      accountBalance: "",
      theSportiesContract: null,
      theSportiesCount: 0,
      theSportiesTotal: 0,
      loading: true,
      metamaskConnected: false,
      contractDetected: false
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
        theSportiesTotal = theSportiesTotal.toNumber();
        this.setState({ theSportiesCount });
        this.setState({ theSportiesTotal });
        console.log(`Minted token: ${theSportiesCount}`);
        console.log(`Total token: ${theSportiesTotal}`);
        console.log(`Balance: ${tokenBalance}`);
        this.setState({ loading: false });
      } else {
        this.setState({ contractDetected: false });
      }
      this.setState({ loading: false });
      // const networkId = await web3.eth.net.getId();
    }
  };



  render() {
    return (
      <div className="container">
        <>
          <HashRouter basename="/">
            <Navbar parentState={(this.state)}/>
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
                <tr />
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
