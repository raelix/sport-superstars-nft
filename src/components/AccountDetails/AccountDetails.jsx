import React from "react";

const AccountDetails = ({ accountAddress }) => {
  return (
    <div className="flex-container">
      <div className="jumbotron">
        <h10 className="int-container">{accountAddress}</h10>
      </div>
    </div>
  );
};

export default AccountDetails;
