const fs = require("fs");
const width = 1000;
const height = 1000;
const dir = "./input";

const orderedFolders = ["background", "body", "sport", "eyes", "hair", "accessories", "look", "number"];

const getAttributeFromFileName = (_str) => {
    // Explanation:
    // 1. replace the rarity with empty string
    // 2. remove the extentions
    // 3. replace the underscore with space
    // 4. ^\w : first character of the string
    //    | : or
    //    \s\w : first character after whitespace
    //    (^\w|\s\w) Capture the pattern.
    //    g Flag: Match all occurrences.
    let name = _str
        .replace(/_[0-9]+/i, '')
        .slice(0, -4)
        .replace(/_/g, " ")
        .replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    return name;
};

const getOccurrences = (_str) => {
    let matchResult = _str.match(/_([0-9]+).png/)
    return matchResult.length > 0 ? matchResult[1] : 1;
}

const getElements = (path) => {
    return fs
        .readdirSync(path)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((i, index) => {
            let result = [];
            let occurrences = getOccurrences(i);
            for (let index = 0; index < occurrences; index++) {
                result.push({
                    attributeName: getAttributeFromFileName(i),
                    fileName: i,
                })
            }
            // Not working - switching to the simple form above :)
            // let elements = Array.from(Array(getOccurrences(i))) //generate an array with getOccurrences size
            // .map( () => {  // then map empty elements with the same content up to occurrences 
            //     return {
            //     attributeName: getAttributeFromFileName(i),
            //     fileName: i,
            // }});

            return result;
        }).reduce((flattened, element) => flattened.concat(element), []);
};

const getElementsRarityByFolder = (path) => {
    let result = {};
    let totalOccurrences = getElements(path).length;
    fs
        .readdirSync(path)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .forEach((i) => {
            let occurrences = getOccurrences(i);
            result[getAttributeFromFileName(i)] = Math.floor((occurrences * 100 / totalOccurrences));
        });
    return result;
};

// const getElementsRarityMap = (orderedFolders) => {
//     let result = {};
//     orderedFolders.forEach((item, index) => {
//         let currentFolder = getElementsRarityByFolder(`${dir}/${item}/`);
//         result = { ...result, ...currentFolder }
//     });
//     return result;
// }

// occurrences:total length=x:100
const generateLayersList = (orderedFolders, layers) => {
    orderedFolders.forEach((item, index) => {
        layers.push({
            id: index,
            name: item.replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
            location: `${dir}/${item}/`,
            elements: getElements(`${dir}/${item}/`),
            // rarity: getElementsRarity(`${dir}/${item}/`),
            position: { x: 0, y: 0 },
            size: { width: width, height: height },
        });
    }
    );
    return layers;
}

const layers = generateLayersList(orderedFolders, []);

// const rarity = getElementsRarityMap(orderedFolders);

// module.exports = { layers, rarity, width, height };
module.exports = { layers };
