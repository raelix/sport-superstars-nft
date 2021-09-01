const program = require('commander')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')

require('dotenv').config()

program.version('0.0.1');

program.option('-f, --file-path <file>', 'provide the full path to the file that needs to be uploaded.');

program.parse(process.argv);

const options = program.opts();

const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`

const gateway_url = `https://gateway.pinata.cloud/ipfs`

const pinata_api_key = process.env.PINATA_API_KEY

const pinata_secret_api_key = process.env.PINATA_SECRET_API_KEY


publishAndPinOnPinata = async (filePath) => {

    let data = new FormData();

    fileName = filePath.split('/').pop();

    data.append(`file`, fs.createReadStream(filePath), {
        filepath: fileName
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

        console.log(`URL: ${gateway_url}/${response.data.IpfsHash}`);
        // console.log("Duplicate: " + !response.data.isDuplicate);

    }).catch(function (error) {
        console.log("Error ---");
        console.log(error);
    });
}

if (options.filePath) {
    console.log(`The file ${options.filePath} will be uploaded and pinned to Pinata`);
}

publishAndPinOnPinata(options.filePath);

