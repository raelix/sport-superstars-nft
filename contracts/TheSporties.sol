
// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TheSporties is ERC721, Ownable {

    using SafeMath for uint256;
    
    event Transfer(address _to, uint _value);

    uint256 public constant itemPrice = 0.05 ether;
    uint64 public constant RESERVED_ITEMS = 27;
    uint64 public constant GIFT_ITEMS = 50;
    uint64 public constant ADOPT_ITEMS = 7700;
    uint64 public constant TOTAL_ITEMS = ADOPT_ITEMS + GIFT_ITEMS + RESERVED_ITEMS;
    uint128 public constant MAX_ITEMS_PER_MINT = 10;

    uint256 private giftItems = 0;
    string private constant IPFS_GUESS_ITEM = "ipfs://QmWuCeHL1uajjNELKfeH18azZ3KSB1YffTtbjaNJqZp19f";
    bool public saleIsActive = false;

    constructor() ERC721("TheSporties", "TSPT") {
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        msg.sender.transfer(balance);
        emit Transfer(msg.sender, balance);
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

    function getGiftItems() public view returns( uint256 ){
        return giftItems;
    }


    function reserveItems() public onlyOwner {        
        require(totalSupply().add(RESERVED_ITEMS) <= TOTAL_ITEMS, "Reserved items would exceed max supply");
        uint supply = totalSupply();
        uint i;
        for (i = 0; i < RESERVED_ITEMS; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function airdropForCommunity( address [] memory recipients ) public onlyOwner {
        require(recipients.length + giftItems < GIFT_ITEMS + 1, "Can't gift more than 50 items");
        require(totalSupply().add(recipients.length) <= TOTAL_ITEMS, "Gift items would exceed max supply");
        uint256 supply = totalSupply();        
        for( uint256 i ; i < recipients.length; i++ ){
            _safeMint(recipients[i], supply + i );
            giftItems += 1;
        }
    }

    function mintTheSporties(uint numberOfTokens) public payable {
        require(saleIsActive, "Sale must be active to mint");
        require(numberOfTokens <= MAX_ITEMS_PER_MINT, "Can't mint more than 10 items");
        require(totalSupply().add(numberOfTokens) <= TOTAL_ITEMS, "Purchase would exceed max supply");
        require(msg.value == itemPrice.mul(numberOfTokens), "Ether value sent is not correct");
        
        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < TOTAL_ITEMS) {
                _safeMint(msg.sender, mintIndex);
            }
        }
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = baseURI();
        if( bytes(baseURI).length == 0 ){
            return IPFS_GUESS_ITEM;
        }
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, Strings.toString(tokenId))) : "";
    }
}