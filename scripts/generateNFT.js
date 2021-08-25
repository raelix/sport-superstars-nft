const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const {layers,width,height} = require('./layersLoader.js');

const outputFolder = "./metadata";
const outputImagesFolder = `${outputFolder}/images`;
const MAX_ITEMS = 100;

// init canvas

let metadata = [];


// functions

const saveLayer = (canvas, elementIndex) => {
    fs.writeFileSync(`${outputImagesFolder}/${elementIndex}.png`, canvas.toBuffer("image/png"));
};


const drawLayer = async (ctx, layer, elementIndex) => {
    // get a random item of this layer
    let indexAreYouLucky = Math.floor(Math.random() * layer.elements.length);
    let element = layer.elements[indexAreYouLucky];
    addProperty(layer, element, elementIndex);
    return await loadImage(`${layer.location}${element.fileName}`);
    
  };

const addProperty = async (layer, element, elementIndex) => {
    metadata[elementIndex].attributes.push({
        "trait_type": layer.name,
        "value": element.attributeName
    });
}

// main

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

    layers.forEach((layer) => {
        drawLayer(ctx, layer, elementIndex).then( (image) => {
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


fs.writeFileSync(`${outputFolder}/_metadata.json`, JSON.stringify(metadata));
