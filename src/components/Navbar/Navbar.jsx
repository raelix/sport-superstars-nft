import React from "react";
import icon from "./favicon-32x32.png";
import { Link } from "react-router-dom";
import AccountDetails from "../AccountDetails/AccountDetails";
import ConnectToMetamask from "../ConnectMetamask/ConnectToMetamask";
import Loading from "../Loading/Loading";
import { Component } from "react";



class Navbar extends Component {
  constructor(props) {
    super(props);
  }



  connectToMetamask = async () => {
    await window.ethereum.enable();
    window.location.reload();
  };

  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
        <div className="container">
          <img src={icon} alt="" />
          <Link to="/" className="navbar-brand ml-2">
            The Sporties
          </Link>
          <button
            className="navbar-toggler"
            data-toggle="collapse"
            data-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div id="navbarNav" className="collapse navbar-collapse">
            <ul
              style={{ fontSize: "0.8rem", letterSpacing: "0.2rem" }}
              className="navbar-nav ml-auto"
            >
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/mint" className="nav-link">
                  Mint
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/team" className="nav-link">
                  Team
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/roadmap" className="nav-link">
                  Roadmap
                </Link>
              </li>
              <li className="nav-item">
                {!this.props.parentState.metamaskConnected ? 
                ( <ConnectToMetamask connectToMetamask={this.connectToMetamask} />) 
                :
                  (<AccountDetails accountAddress={this.props.parentState.accountAddress} error={!this.props.parentState.contractDetected} />)
                }
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  };
};
export default Navbar;
