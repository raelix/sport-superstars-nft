const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const recursive = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const path = require('path');
const rimraf = require('rimraf');

require('dotenv').config()

const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

const gateway_url = `https://gateway.pinata.cloud/ipfs`;

const metadata_dir = './metadata';

const images_dir = `${metadata_dir}/images`;

const tokens_dir = `${metadata_dir}/tokens`;

const metadata_blob = `${metadata_dir}/_metadata.json`;

const hashes_link = `${metadata_dir}/hashes_link.json`;

// loaded from .env file

const pinata_api_key = process.env.PINATA_API_KEY

const  pinata_secret_api_key = process.env.PINATA_SECRET_API_KEY


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

            hashes[baseFolder] = response.data.IpfsHash;

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


deployImages = () => {

    publishAndPinOnPinata(images_dir, deployMetadata);
};


deployMetadata = () => {

    let gatewayImagesURL = gateway_url + "/" + hashes["images"]

    rimraf.sync(tokens_dir);

    fs.mkdirSync(tokens_dir, { recursive: true });

    let metadataList = require(`.${metadata_blob}`);

    metadataList.forEach((metadata) => {

        metadata.image = gatewayImagesURL + '/' + metadata.image;
        metadata.external_url = metadata.image;

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

deployImages();