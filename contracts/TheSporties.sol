
// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TheSporties is ERC721, Ownable {

    using SafeMath for uint256;
    
    event Transfer(address _to, uint _value);

    uint256 public constant itemPrice = 0.06 ether;
    uint64 public constant TOTAL_ITEMS = 10762;
    uint64 public constant RESERVED_ITEMS = 40;
    uint128 public constant MAX_ITEMS_PER_MINT = 10;
    string private constant IPFS_URI = "https://ipfs.io/ipfs/";

    bool public saleIsActive = false;

    constructor() ERC721("TheSporties", "TSPT") {
        _setBaseURI(IPFS_URI);
        //reserveItems(RESERVED_ITEMS);
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        msg.sender.transfer(balance);
        emit Transfer(msg.sender, balance);
    }

    function reserveItems(uint256 reservedItems) public onlyOwner {        
        require(reservedItems <= 100, "No more than 100 items can be reserved");
        uint supply = totalSupply();
        uint i;
        for (i = 0; i < reservedItems; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }
    
    function flipSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }
    
    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }
    
    function setTokenURI(uint256 tokenId, string memory _tokenURI) public onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    function mintTheSporties(uint numberOfTokens) public payable {
        require(saleIsActive, "Sale must be active to mint TheSporties");
        require(numberOfTokens <= MAX_ITEMS_PER_MINT, "Can't mint more than 10 TheSporties");
        require(totalSupply().add(numberOfTokens) <= TOTAL_ITEMS, "Purchase would exceed max supply of TheSporties");
        require(msg.value >= itemPrice.mul(numberOfTokens), "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < TOTAL_ITEMS) {
                _safeMint(msg.sender, mintIndex);
            }
        }
    }

}