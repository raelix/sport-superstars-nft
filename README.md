# Sport Legends NFT
This project allows to fully build a new NFT collection on Ethereum block-chain and mint them through a ReactJS based website.

There are some key features:
- Image generation is completely random, based on pre-defined percentages, different SVG layers will be combined together. This will result in different clustering groups (common, rare, super-rare).
- The website is built with ReactJS and Web3.
- The generated images will be pushed to IPFS for resiliency and privacy.
- The smart-contract is ERC721 and it leaverage the openzeppelin-solidity library.
- Utility scrits are located under ./scripts folder.


### Discord Group Invite

https://discord.gg/EcgEet9G

### Generate gif
```
convert -resize 50% -delay 20 -loop 0 metadata/images/*.png output.gif
```
### Run the DApp Locally
#### Install truffle
```
npm install -g truffle
```
#### Install ganache-cli
```
npm i ganache-cli
```
#### Run ganache-cli
```
ganache-cli --port 7545 --quiet
```
#### Open new terminal window and clone this repository
```
git clone https://github.com/raelix/sport-legends.git
```
#### Install dependencies
```
npm install
```
#### Compile smart contract
```
truffle compile
```
#### Deploy smart contract to ganache
```
truffle migrate --reset --network rinkeby
```
#### Test smart contract
```
truffle console --network rinkeby
```
#### Start DApp
```
npm start
```
#### Open metamask browser wallet and connect network to Localhost 7545.
#### Import accounts from ganache-cli into the metamask browser wallet to make transactions on the DApp.

### Flatten contract
```
npm install -g truffle-flattener
truffle-flattener contracts/SportLegends.sol > SportLegends.sol
```


### Inkscape useful batch command
N.B. the layers must be visible (up to now we have sublayers as well so this approach needs to be revisited)
```bash
for lay in $(inkscape --query-all NFT.svg  | grep "g" | grep -v svg | awk -F, '{print $1}'); do 
inkscape NFT.svg -i $lay -j -C --export-png=testme/$lay.png; 
done
```

### Work-arounds
```
export NODE_OPTIONS=--openssl-legacy-provider
```

### COSTS
The cost = Gas Price x Amount of Gas consumed
Cost = 80 Gwei * 2683987M = 214718960M Gwei = 0.21471896eth
Cost = 50 Gwei * 2683987M = 134199350M Gwei = 0.13419935eth

