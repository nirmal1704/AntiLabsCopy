const https = require('https');

const data = JSON.stringify({
    name: 'antilabs_preset',
    unsigned: true,
    folder: 'antilabs_uploads'
});

const options = {
    hostname: 'api.cloudinary.com',
    port: 443,
    path: '/v1_1/dhrntytra/upload_presets',
    method: 'POST',
    auth: '736662161265298:zGjeRhYIFYaZlwsy7Uuk_xVbQYg',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        console.log('RESPONSE_BODY:', body);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e);
});

req.write(data);
req.end();
