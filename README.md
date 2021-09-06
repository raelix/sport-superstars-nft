# Sport Legends NFT

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
truffle migrate
```
#### Test smart contract
```
truffle test
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