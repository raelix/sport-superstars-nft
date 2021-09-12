
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
                      Welcome to the Sport Superstars hera where 7,777 unique players lives on the Ethereum blockchain! 
                      They were born to change the sport NFT collectibles market, based on ERC-721 token. 
                      They are coming from all around the universe, 
                      programmatically and randomly generated starting from 7 races and 7 sports properties, 
                      from more than 1,6 million possible combinations. 
                      Each player will also have in-game stats that will be fundamental for future roadmap milestones. 
                      We plan to mostly work on collaborations in the near future, but check the Roadmap for further information!
                    </p>
                    <div class="d-flex p-3 text-center">
                      <img src={radar} class="radar-chart" />
                      <div class="d-flex flex-column my-auto">
                        <p class="text-center h1 m-5 brick-font">
                          In addition to esthetic properties and cool extras,
                          each Superstar will will have a unique identity, starting from the name, 
                          shirt number and a set of attributes that will help him to dominate his sport.
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
          <a class="m-2" href="https://twitter.com/SportSuperstars" target="_blank">
            <svg src="https://a.com" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" viewBox="0 0 16 16">
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
            </svg>
          </a>
          <a class="m-2" href="https://discord.gg/yEbTMAnxCY" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" viewBox="0 0 16 16">
              <path d="M6.552 6.712c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888.008-.488-.36-.888-.816-.888zm2.92 0c-.456 0-.816.4-.816.888s.368.888.816.888c.456 0 .816-.4.816-.888s-.36-.888-.816-.888z" />
              <path d="M13.36 0H2.64C1.736 0 1 .736 1 1.648v10.816c0 .912.736 1.648 1.64 1.648h9.072l-.424-1.48 1.024.952.968.896L15 16V1.648C15 .736 14.264 0 13.36 0zm-3.088 10.448s-.288-.344-.528-.648c1.048-.296 1.448-.952 1.448-.952-.328.216-.64.368-.92.472-.4.168-.784.28-1.16.344a5.604 5.604 0 0 1-2.072-.008 6.716 6.716 0 0 1-1.176-.344 4.688 4.688 0 0 1-.584-.272c-.024-.016-.048-.024-.072-.04-.016-.008-.024-.016-.032-.024-.144-.08-.224-.136-.224-.136s.384.64 1.4.944c-.24.304-.536.664-.536.664-1.768-.056-2.44-1.216-2.44-1.216 0-2.576 1.152-4.664 1.152-4.664 1.152-.864 2.248-.84 2.248-.84l.08.096c-1.44.416-2.104 1.048-2.104 1.048s.176-.096.472-.232c.856-.376 1.536-.48 1.816-.504.048-.008.088-.016.136-.016a6.521 6.521 0 0 1 4.024.752s-.632-.6-1.992-1.016l.112-.128s1.096-.024 2.248.84c0 0 1.152 2.088 1.152 4.664 0 0-.68 1.16-2.448 1.216z" />
            </svg>
          </a>
          <a class="m-2" href="https://opensea.io/collection/sport-superstars" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 90 90" fill="black">
            <path d="M90 45C90 69.8514 69.8514 90 45 90C20.1486 90 0 69.8514 0 45C0 20.1486 20.1486 0 45 0C69.8566 0 90 20.1486 90 45Z" fill="black"/>
            <path d="M22.2011 46.512L22.3953 46.2069L34.1016 27.8939C34.2726 27.6257 34.6749 27.6535 34.8043 27.9447C36.76 32.3277 38.4475 37.7786 37.6569 41.1721C37.3194 42.5683 36.3948 44.4593 35.3545 46.2069C35.2204 46.4612 35.0725 46.7109 34.9153 46.9513C34.8413 47.0622 34.7165 47.127 34.5824 47.127H22.5432C22.2196 47.127 22.0301 46.7756 22.2011 46.512Z" fill="#d3e3ff"/>
            <path d="M74.38 49.9149V52.8137C74.38 52.9801 74.2783 53.1281 74.1304 53.1928C73.2242 53.5812 70.1219 55.0052 68.832 56.799C65.5402 61.3807 63.0251 67.932 57.4031 67.932H33.949C25.6362 67.932 18.9 61.1727 18.9 52.8322V52.564C18.9 52.3421 19.0803 52.1618 19.3023 52.1618H32.377C32.6359 52.1618 32.8255 52.4022 32.8024 52.6565C32.7099 53.5072 32.8671 54.3764 33.2693 55.167C34.0461 56.7435 35.655 57.7283 37.3934 57.7283H43.866V52.675H37.4673C37.1391 52.675 36.9449 52.2959 37.1345 52.0277C37.2038 51.9214 37.2824 51.8104 37.3656 51.6856C37.9713 50.8257 38.8358 49.4895 39.6958 47.9684C40.2829 46.9421 40.8516 45.8463 41.3093 44.746C41.4018 44.5472 41.4758 44.3438 41.5497 44.1449C41.6746 43.7936 41.804 43.4653 41.8965 43.1371C41.9889 42.8597 42.0629 42.5684 42.1369 42.2956C42.3542 41.3617 42.4467 40.3723 42.4467 39.3459C42.4467 38.9437 42.4282 38.523 42.3912 38.1207C42.3727 37.6815 42.3172 37.2423 42.2617 36.8031C42.2247 36.4147 42.1554 36.031 42.0814 35.6288C41.9889 35.0416 41.8595 34.4591 41.7115 33.8719L41.6607 33.65C41.5497 33.2478 41.4573 32.864 41.3278 32.4618C40.9626 31.1996 40.5418 29.9698 40.098 28.8186C39.9362 28.3609 39.7512 27.9217 39.5663 27.4825C39.2935 26.8213 39.0161 26.2203 38.7619 25.6516C38.6324 25.3927 38.5214 25.1569 38.4105 24.9165C38.2857 24.6437 38.1562 24.371 38.0268 24.112C37.9343 23.9132 37.8279 23.7283 37.754 23.5434L36.9634 22.0824C36.8524 21.8836 37.0374 21.6478 37.2546 21.7079L42.2016 23.0487H42.2155C42.2247 23.0487 42.2294 23.0533 42.234 23.0533L42.8859 23.2336L43.6025 23.437L43.866 23.511V20.5706C43.866 19.1512 45.0034 18 46.4089 18C47.1116 18 47.7496 18.2866 48.2073 18.7536C48.665 19.2206 48.9517 19.8586 48.9517 20.5706V24.935L49.4787 25.0829C49.5204 25.0968 49.562 25.1153 49.599 25.143C49.7284 25.2401 49.9133 25.3835 50.1491 25.5591C50.3341 25.7071 50.5329 25.8874 50.7733 26.0723C51.2495 26.4561 51.8181 26.9508 52.4423 27.5194C52.6087 27.6628 52.7706 27.8107 52.9185 27.9587C53.723 28.7076 54.6245 29.5861 55.4845 30.557C55.7249 30.8297 55.9607 31.1071 56.2011 31.3984C56.4415 31.6943 56.6958 31.9856 56.9177 32.2769C57.209 32.6652 57.5233 33.0674 57.7961 33.4882C57.9256 33.687 58.0735 33.8904 58.1984 34.0892C58.5497 34.6209 58.8595 35.1711 59.1554 35.7212C59.2802 35.9755 59.4097 36.2529 59.5206 36.5257C59.8489 37.2608 60.1078 38.0098 60.2742 38.7588C60.3251 38.9206 60.3621 39.0963 60.3806 39.2535V39.2904C60.436 39.5124 60.4545 39.7482 60.473 39.9886C60.547 40.756 60.51 41.5235 60.3436 42.2956C60.2742 42.6239 60.1818 42.9336 60.0708 43.2619C59.9598 43.5763 59.8489 43.9045 59.7056 44.2143C59.4282 44.8569 59.0999 45.4996 58.7115 46.1006C58.5867 46.3225 58.4388 46.5583 58.2908 46.7802C58.129 47.016 57.9626 47.238 57.8146 47.4553C57.6112 47.7327 57.3939 48.0239 57.172 48.2828C56.9732 48.5556 56.7697 48.8284 56.5478 49.0688C56.2381 49.434 55.9422 49.7808 55.6324 50.1137C55.4475 50.331 55.2487 50.5529 55.0452 50.7517C54.8464 50.9736 54.643 51.1724 54.4581 51.3573C54.1483 51.6671 53.8894 51.9075 53.6721 52.1063L53.1635 52.5733C53.0896 52.638 52.9925 52.675 52.8908 52.675H48.9517V57.7283H53.9079C55.0175 57.7283 56.0716 57.3353 56.9223 56.6141C57.2136 56.3598 58.485 55.2594 59.9876 53.5997C60.0384 53.5442 60.1032 53.5026 60.1771 53.4841L73.8668 49.5265C74.1211 49.4525 74.38 49.6467 74.38 49.9149Z" fill="#d3e3ff"/>
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
