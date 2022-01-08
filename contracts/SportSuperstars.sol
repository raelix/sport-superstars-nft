// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SportSuperstars is ERC721, Ownable {

    using SafeMath for uint256;
    uint public constant GIFT_ITEMS = 70;
    uint public constant PREADOPT_ITEMS = 700;
    uint public constant TOTAL_ITEMS = 7777;
    uint public constant MAX_ITEMS_PER_MINT = 10;
    uint256 public constant itemPrice = 0.06 ether;
    uint public giftItems = 0;
    uint public preSaleItems = 0;
    bool public saleIsActive = false;
    bool public preSaleIsActive = false;
    mapping (address => uint256) private _preSaleAddress;

    constructor() ERC721("Sport Superstars", "SSS") {
    }

    function giftSportSuperstars( address [] memory recipients ) public onlyOwner {
        require(recipients.length + giftItems < GIFT_ITEMS + 1, "Max gift");
        require(totalSupply().add(recipients.length) <= TOTAL_ITEMS, "Max supply");
        uint supply = totalSupply(); 
        uint temp = 0;       
        for( uint i ; i < recipients.length; i++ ){
            _safeMint(recipients[i], supply + i );
            temp += 1;
        }
        giftItems += temp;
    }

    function mintPreSaleSportSuperstars(uint tokens) public payable {
        require(preSaleIsActive, "Pre-sale not active");
        require(_preSaleAddress[msg.sender] > 0, "Not allowed pre-mint");
        require(tokens + preSaleItems < PREADOPT_ITEMS + 1, "Pre-sale exceed");
        require(tokens <= MAX_ITEMS_PER_MINT, "Max 10 items");
        require(totalSupply().add(tokens) <= TOTAL_ITEMS, "Purchase exceed");
        require(msg.value == itemPrice.mul(tokens), "Ether not correct");
        for(uint i = 0; i < tokens; i++) {
            uint mintIndex = totalSupply();
            if (mintIndex < TOTAL_ITEMS && preSaleItems < PREADOPT_ITEMS + 1) {
                _safeMint(msg.sender, mintIndex);
                preSaleItems += 1;
            }
        }
    }

    function mintSportSuperstars(uint tokens) public payable {
        require(saleIsActive, "Sale not active");
        require(tokens <= MAX_ITEMS_PER_MINT, "Max 10 items");
        require(totalSupply().add(tokens) <= TOTAL_ITEMS, "Purchase exceed");
        require(msg.value == itemPrice.mul(tokens), "Ether not correct");   
        for(uint i = 0; i < tokens; i++) {
            uint mintIndex = totalSupply();
            if (mintIndex < TOTAL_ITEMS) {
                _safeMint(msg.sender, mintIndex);
            }
        }
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token doesn't exist");
        string memory baseURI = baseURI();
        if( bytes(baseURI).length == 0 ){
            return "ipfs://QmWuCeHL1uajjNELKfeH18azZ3KSB1YffTtbjaNJqZp19f";
        }
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, Strings.toString(tokenId))) : "";
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        msg.sender.transfer(balance);
    }
    
    function flipSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }
    
    function flipPreSaleState() public onlyOwner {
        preSaleIsActive = !preSaleIsActive;
    }

    function setPreSalesAddresses( address [] memory recipients ) public onlyOwner {   
        for( uint i ; i < recipients.length; i++ ){
            _preSaleAddress[recipients[i]] = 1;
        }
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    function isAddressAllowedForPreSale(address recipient ) public view returns( bool ) {   
        return _preSaleAddress[recipient] > 0;
    }

    function reserveItems(uint numberOfTokens) public onlyOwner {        
        require(totalSupply().add(numberOfTokens) <= TOTAL_ITEMS, "Exceed max supply");
        uint supply = totalSupply();
        for (uint i = 0; i < numberOfTokens; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }


}