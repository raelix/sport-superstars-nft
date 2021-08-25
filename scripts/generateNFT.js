const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require('./layersLoader.js');

const outputFolder = "./metadata";
const outputImagesFolder = `${outputFolder}/images`;
const MAX_ITEMS = 10;

// init canvas

let metadata = [];


// functions

const saveLayer = (canvas, elementIndex) => {
    fs.writeFileSync(`${outputImagesFolder}/${elementIndex}.png`, canvas.toBuffer("image/png"));
};


const drawLayer = async (ctx, layer, elementIndex, randomNumber) => {
    // get a random item of this layer
    let element = layer.elements[randomNumber];
    console.log(`there is a ${layer.rarity} % of probability to see this`);
    addProperty(layer, element, elementIndex);
    return await loadImage(`${layer.location}${element.fileName}`);

};

const addProperty = async (layer, element, elementIndex) => {
    metadata[elementIndex].attributes.push({
        "trait_type": layer.name,
        "value": element.attributeName
    });
}


const getRandom = (layers) => {
    let random = [];
    for (let i = 0; i < layers.length; i++) {
        random.push(Math.floor(Math.random() * layers[i].elements.length));
    }
    return random;
}

const getRandomMap = (MAX_ITEMS, layers) => {
    const randomMap = {};
    for (let elementIndex = 0; elementIndex < MAX_ITEMS; elementIndex++) {
        let currentElement = getRandom(layers);
        do {
            currentElement = getRandom(layers);
        } while (currentElement in randomMap);
        randomMap[currentElement] = currentElement; // this is useful to search for a duplicate random O(1)
        randomMap[elementIndex] = currentElement; // this is useful to get the random of an item O(n)
    }
    return randomMap;
}


function write(array, path) {
    fs.writeFileSync(path, JSON.stringify(array, null, 2));
}

function read(path) {
    const fileContent = fs.readFileSync(path);
    const array = JSON.parse(fileContent);
    return array;
}

// main
let randomItems = {};
// N.B. If you want to save this random map you need to uncomment the `read` line and comment the `randomItems` and `write` one
randomItems = getRandomMap(MAX_ITEMS, layers);
write(randomItems, `${outputFolder}/_randomMap.json`);
// randomItems = read(`${outputFolder}/_randomMap.json`);

for (let elementIndex = 0; elementIndex < MAX_ITEMS; elementIndex++) {

    const canvas = createCanvas(1000, 1000);
    const ctx = canvas.getContext("2d");
    // push the empty item for this index
    metadata.push({
        id: `${elementIndex}`,
        name: `TheSporties #${elementIndex}`,
        icon: "",
        description: `The real #${elementIndex} item`,
        attributes: [],
    });

    layers.forEach((layer, index) => {
        // get the item id=elementIndex and layer at index
        const randomNumber = randomItems[elementIndex][index];
        drawLayer(ctx, layer, elementIndex, randomNumber).then((image) => {
            ctx.drawImage(
                image,
                layer.position.x,
                layer.position.y,
                layer.size.width,
                layer.size.height
            );

            saveLayer(canvas, elementIndex);
        });

    });

    console.log("Creating element id: " + elementIndex);
}


fs.writeFileSync(`${outputFolder}/_metadata.json`, JSON.stringify(metadata, null, 2));
