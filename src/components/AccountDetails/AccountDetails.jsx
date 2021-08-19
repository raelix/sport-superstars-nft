import React from "react";
import metamaskIcon from "../ConnectMetamask/metamask.svg";

const AccountDetails = ({ accountAddress }) => {
  return (
    <div className="flex-container">
      <div className="int-container">
        <img
          src={metamaskIcon}
          alt="metamask-icon"
          style={{ width: "1.5rem", marginLeft: "0.30rem" }}
        />
        <h10 >{accountAddress.substring(0, 6)}..{accountAddress.substring(accountAddress.length - 4, accountAddress.length)}</h10>
      </div>
    </div>
  );
};

export default AccountDetails;
