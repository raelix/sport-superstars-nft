import React from "react";
import metamaskIcon from "./metamask.svg";

const ConnectToMetamask = ({ connectToMetamask }) => {
  return (
    <div className="jumbotron">
      <button
        onClick={connectToMetamask}
        className="btn btn-primary d-flex align-items-center"
        style={{ fontSize: "0.65rem" }}
      >
        Connect Metamask{" "}
        <img
          src={metamaskIcon}
          alt="metamask-icon"
          style={{ width: "2rem", marginLeft: "0.5rem" }}
        />
      </button>
    </div>
  );
};

export default ConnectToMetamask;
