const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, rarity, width, height } = require('./layersLoader.js');

const outputFolder = "./metadata";
const outputImagesFolder = `${outputFolder}/images`;
// const MAX_ITEMS = 8888;
const MAX_ITEMS = 100;

// init canvas

let metadata = [];


// functions

const saveImage = (canvas, elementIndex) => {
    return fs.writeFileSync(`${outputImagesFolder}/${elementIndex}.png`, canvas.toBuffer("image/png"));
};


const loadLayer = async (layer, elementIndex, randomNumber) => {
    // get a random item of this layer
    let element = layer.elements[randomNumber];
    // console.log(`element ${element.attributeName}`);

    // console.log(`there is a ${layer.rarity[element.attributeName]} % of probability to see this`);
    addProperty(layer, element, elementIndex);
    return await loadImage(`${layer.location}${element.fileName}`);

};

const addProperty = async (layer, element, elementIndex) => {
    metadata[elementIndex].attributes.push({
        "trait_type": layer.name,
        "value": element.attributeName
    });
}

const addRarityProperty = (elementIndex, value) => {
    metadata[elementIndex].attributes.push({
        "trait_type": "Rarity",
        "value": value
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


const computeMetadataIndexRarity = (currentIndex) => {
    let totalLayers = layers.length;
    let sumLayersRarity = 0;
    metadata[currentIndex].attributes.forEach((item) => {
        sumLayersRarity += rarity[item.value];
    });
    return Math.floor(sumLayersRarity * 100 / (totalLayers * 100));
}

function write(array, path) {
    fs.writeFileSync(path, JSON.stringify(array, null, 2));
}

function read(path) {
    const fileContent = fs.readFileSync(path);
    const array = JSON.parse(fileContent);
    return array;
}

const main = async (elementIndex) => {

    if (elementIndex == MAX_ITEMS) {
        console.log('Generation completed. Saving metadata.');
        fs.writeFileSync(`${outputFolder}/_metadata.json`, JSON.stringify(metadata, null, 2));
        return;
    }

    const canvas = createCanvas(1000, 1000);
    const ctx = canvas.getContext("2d");
    let drawedLayers = 0;
    // push the empty item for this index
    metadata.push({
        id: `${elementIndex}`,
        name: `Sport Legends #${elementIndex}`,
        icon: "",
        description: `Sport Legends are here! Try to catch them!`,
        attributes: [],
    });

    for (let index = 0; index < layers.length; index++) {

        let layer = layers[index];

        // get the item id=elementIndex and layer at index
        const randomNumber = randomItems[elementIndex][index];

        let loadedLayer = await loadLayer(layer, elementIndex, randomNumber);

        ctx.drawImage(
            loadedLayer,
            layer.position.x,
            layer.position.y,
            layer.size.width,
            layer.size.height
        );
    }

    saveImage(canvas, elementIndex);
    let itemRarityPercentage = computeMetadataIndexRarity(elementIndex);
    addRarityProperty(elementIndex, itemRarityPercentage);
    console.log(`Generated image n. ${elementIndex}`);
    setTimeout(main, 1, ++elementIndex);
}


/* main */

let randomItems = {};

// N.B. If you want to save this random map you need to uncomment the `read` line and comment the `randomItems` and `write` one
randomItems = getRandomMap(MAX_ITEMS, layers);

write(randomItems, `${outputFolder}/_randomMap.json`);
// randomItems = read(`${outputFolder}/_randomMap.json`);

// let's start
setTimeout(main, 1, 0);
