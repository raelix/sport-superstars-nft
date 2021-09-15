const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const recursive = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const path = require('path');
const rimraf = require('rimraf');
const program = require('commander');

require('dotenv').config()

const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

const gateway_url = `ipfs://`;

// const gateway_url = `https://gateway.pinata.cloud/ipfs`;

const metadata_dir = './metadata';

// loaded from .env file

const pinata_api_key = process.env.PINATA_API_KEY

const pinata_secret_api_key = process.env.PINATA_SECRET_API_KEY


let hashes = {};


publishAndPinOnPinata = async (directoryPath, callback) => {

    let fileCount = 0;

    let baseFolder = "";

    recursive.readdirr(directoryPath, function (err, dirs, files) {

        let data = new FormData();

        files.forEach((file) => {
            if (baseFolder == "")
                baseFolder = basePathConverter(directoryPath, file).split('/')[0];
            fileCount++;
            data.append(`file`, fs.createReadStream(file), {
                filepath: basePathConverter(directoryPath, file)
            })
        });

        return axios.post(url,
            data,
            {
                maxContentLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'pinata_api_key': pinata_api_key,
                    'pinata_secret_api_key': pinata_secret_api_key
                }
            }
        ).then(function (response) {
            // set the key of this hash with the name of the base folder

            hashes[directoryPath.split('/').pop()] = response.data.IpfsHash;

            console.log("Hash : " + response.data.IpfsHash);
            console.log("new files: " + !response.data.isDuplicate);
            console.log("files count: " + fileCount);
            callback();

        }).catch(function (error) {
            console.log("Error ---");
            console.log(error);
        });
    });
}


deployMetadata = () => {

    // let gatewayImagesURL = gateway_url + "/" + hashes[images_dir.split('/').pop()]
    let gatewayImagesURL = gateway_url + hashes[images_dir.split('/').pop()]

    rimraf.sync(tokens_dir);

    fs.mkdirSync(tokens_dir, { recursive: true });

    let metadataList = require(`.${metadata_blob}`);

    metadataList.forEach((metadata) => {

        if (fixed_image_name !== undefined)
            metadata.image = gatewayImagesURL + '/' + fixed_image_name;
        else
            metadata.image = gatewayImagesURL + '/' + metadata.id + '.png';
            

        metadata.external_url = "https://sportsuperstars.io";

        let metadataFullName = `${tokens_dir}/${metadata.id}`

        console.log(`Creating metadata token file ${metadataFullName}`);

        fs.writeFileSync(metadataFullName, JSON.stringify(metadata, null, 2));
    });

    publishAndPinOnPinata(tokens_dir, saveConfigFile);
}


saveConfigFile = () => {
    hashes["gatewayUrl"] = gateway_url
    const st = JSON.stringify(hashes, null, 2);
    fs.writeFileSync(hashes_link, st);
}


program.version('0.0.1');

program.requiredOption('-i, --images-dir <path to the images directory>',
    'provide the full path to the images directory to upload.', `${metadata_dir}/images`);

program.requiredOption('-m, --input-metadata <path to the input metadata blob>',
    'provide the full path to the metadata blob json file.', `${metadata_dir}/_metadata.json`);

program.requiredOption('-t, --tokens-dir <path to the output tokens directory>',
    'provide the full path to the output tokens metadata directory to upload.', `${metadata_dir}/tokens`);

program.requiredOption('-l, --hash-links <path to the output hash links>',
    'provide the full path to the output file with addresses.', `${metadata_dir}/hashes_link.json`);

program.option('-f, --fixed-image-name <the name of the fixed image>',
    'Optional. provide the name of the image (including the extension) that will be used as reference for all tokens from the images directory on IPFS.');


program.option('-f, --fixed-image-name <the name of the fixed image>',
    'Optional. provide the name of the image (including the extension) that will be used as reference for all tokens from the images directory on IPFS.');

program.parse(process.argv);

const options = program.opts();

const images_dir = options.imagesDir;

const tokens_dir = options.tokensDir;

const metadata_blob = options.inputMetadata;

const hashes_link = options.hashLinks;

const fixed_image_name = options.fixedImageName;

publishAndPinOnPinata(images_dir, deployMetadata);

// node scripts/publishAndPin.js \
// -i ./question-mark \
// -m ./metadata/_metadata-presale.json \
// -t ./metadata/tokens-presale \
// -l ./metadata/hash_presale.json \
// -f question-mark.png

// node scripts/publishAndPin.js \
// -i ./metadata/images \
// -m ./metadata/_metadata.json \
// -t ./metadata/tokens \
// -l ./metadata/hash.json 