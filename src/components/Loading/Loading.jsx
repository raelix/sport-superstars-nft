import React from "react";
import RingLoader from "react-spinners/RingLoader";

const Loading = () => {
  return (
  <div
    style={{
      "margin": "auto",
      "display": "block"
    }}>

    <RingLoader
      color="black"
      css={{
        "margin-bottom": "50px !important",
        "margin": "auto",
        "display": "block"
      }}
      size={150} />

    <text class="standard-font">Loading data from the Blockchain</text>

  </div>)
};

export default Loading;
