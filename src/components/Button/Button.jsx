import React, { Component } from "react";

class Button extends Component {

    render() {
        return (
            <button
                type="submit"
                disabled={!this.props.active}
                // style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                className="btn btn-dark btn-outline-info mt-0">
                {this.props.text}
            </button>

        );
    }
}

export default Button;
