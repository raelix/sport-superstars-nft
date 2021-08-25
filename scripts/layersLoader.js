const fs = require("fs");
const width = 1000;
const height = 1000;
const dir = "./input";

const orderedFolders = ["background", "corpo", "fisso", "occhi", "capelli", "accessori"];

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
            for (let index = 0; index < occurrences; index++){
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
        });
};


const generateLayersList = (orderedFolders, layers) => {
    orderedFolders.forEach((item, index) => {
        layers.push({
            id: index,
            name: item,
            location: `${dir}/${item}/`,
            elements: getElements(`${dir}/${item}/`).reduce((flattened, element) => flattened.concat(element), []),
            position: { x: 0, y: 0 },
            size: { width: width, height: height },
        });
    }
    );
    return layers;
}

const layers = generateLayersList(orderedFolders, []);


module.exports = { layers, width, height };