import React from "react";
import metamaskIcon from "../ConnectMetamask/metamask.svg";

const AccountDetails = ({ accountAddress, error }) => {
  return (
    <div class="flex-container"> 
      <div class="flex-container int-container">
        <img
          src={metamaskIcon}
          alt="metamask-icon"
          style={{ width: "1.5rem", marginRight: "0.35rem" }}
        />
        <p class="h5 m-2 standard-font text-light">{error ? "Wrong Network" : accountAddress.substring(0, 6) + '...' + accountAddress.substring(accountAddress.length - 4, accountAddress.length)}</p>
      </div>
    </div>
  );
};

export default AccountDetails;
