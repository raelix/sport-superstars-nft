const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers } = require('./layersLoader.js');
const { namesGenerator } = require('./namesGenerator.js')

const outputFolder = "./metadata";
const outputImagesFolder = `${outputFolder}/images`;
// const MAX_ITEMS = 8888;
const MAX_ITEMS = 10;

const RANDOM_PROPERTIES = [
    "Offence",
    "Defence",
    "Speed",
    "Stamina",
    "Technique",
    "Strength",
    "Morale",
    "Fitness"
]

const FLIP_PROPERTIES = [
    "Morale",
    "Fitness"
]

// init canvas

let metadata = [];

let metadataPreReveal = [];


// functions

const saveImage = (canvas, elementIndex) => {
    return fs.writeFileSync(`${outputImagesFolder}/${elementIndex}.png`, canvas.toBuffer("image/png"));
};


const loadLayer = async (layer, elementIndex, randomNumber) => {
    // get a random item of this layer
    let element = layer.elements[randomNumber];
    addProperty(layer, element, elementIndex);
    return await loadImage(`${layer.location}${element.fileName}`);

};

const addProperty = async (layer, element, elementIndex) => {
    metadata[elementIndex].attributes.push({
        "trait_type": layer.name,
        "value": element.attributeName
    });
}

const addLevelProperty = (elementIndex, name, value, displayType) => {
    let attributes = {
        "trait_type": name,
        "value": value
    }
    if (displayType) {
        attributes["display_type"] = displayType;
    }
    metadata[elementIndex].attributes.push(attributes);
}

const randomIntFromInterval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const getOneOnTen = () => {
    return randomIntFromInterval(1, 10) == 1
}

const getRandom = (layers) => {
    let random = [];
    let levels = {}
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];
        let randomNumber = Math.floor(Math.random() * layer.elements.length);
        if (layer.name === "Number") {
            levels["name"] = `${namesGenerator()} #${layer.elements[randomNumber].attributeName}`
        }
        random.push(randomNumber);
    }
    for (let i = 0; i < RANDOM_PROPERTIES.length; i++) {
        let randomPropertyName = RANDOM_PROPERTIES[i];
        if (
            (FLIP_PROPERTIES.indexOf(randomPropertyName) === -1) ||
            (FLIP_PROPERTIES.indexOf(randomPropertyName) !== -1 && getOneOnTen())
        ) {
            levels[randomPropertyName] = randomIntFromInterval(30, 99);
        }
    }
    random.push(levels);
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

const main = async (elementIndex) => {

    if (elementIndex == MAX_ITEMS) {
        console.log('Generation completed. Saving metadata.');
        fs.writeFileSync(`${outputFolder}/_metadata.json`, JSON.stringify(metadata, null, 2));
        fs.writeFileSync(`${outputFolder}/_metadata-presale.json`, JSON.stringify(metadataPreReveal, null, 2));
        return;
    }

    const canvas = createCanvas(1000, 1000);
    const ctx = canvas.getContext("2d");
    let drawedLayers = 0;
    // push the empty item for this index
    let itemEmpty = {
        id: `${elementIndex}`,
        icon: "",
        description: `Sport Superstars are here! Try to catch them!`,
        attributes: [],
    };

    metadata.push(itemEmpty);

    metadataPreReveal.push(JSON.parse(JSON.stringify(itemEmpty)));


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

    // at the end of the layers list there is a map with the level properties
    const propertiesMap = randomItems[elementIndex][layers.length];

    metadata[elementIndex]["name"] = propertiesMap["name"];

    metadataPreReveal[elementIndex]["name"] = propertiesMap["name"];

    for (let i = 0; i < RANDOM_PROPERTIES.length; i++) {
        let randomPropertyName = RANDOM_PROPERTIES[i];
        let value = propertiesMap[randomPropertyName];

        if (value !== undefined && FLIP_PROPERTIES.indexOf(randomPropertyName) === -1)
            addLevelProperty(elementIndex, randomPropertyName, value)

        if (value !== undefined && FLIP_PROPERTIES.indexOf(randomPropertyName) !== -1)
            addLevelProperty(elementIndex, randomPropertyName, value, "boost_percentage")
    }
    // comment here if you want speed up and save just the metadata
    saveImage(canvas, elementIndex);

    console.log(`Generated image n. ${elementIndex}`);
    setTimeout(main, 1, ++elementIndex);
}


/* main */

let randomItems = {};

// N.B. If you want to save this random map you need to uncomment the `read` line and comment the `randomItems` and `write` one
randomItems = getRandomMap(MAX_ITEMS, layers);

write(randomItems, `${outputFolder}/seed.json`);
// randomItems = read(`${outputFolder}/seed.json`);

// let's start
setTimeout(main, 1, 0);
