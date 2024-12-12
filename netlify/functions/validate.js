const fetch = require('node-fetch'); // Use axios or fetch as preferred

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // Parse the incoming request body
        const { country, vat } = JSON.parse(event.body || '{}');

        if (!country || !vat) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Country and VAT number are required' }),
            };
        }

        console.log('Input Data:', { country, vat });

        // REST API URL with placeholders replaced
        const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vat}`;

        // Make a request to the REST API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`VAT validation failed with status ${response.status}`);
        }

        const result = await response.json();

        console.log('API Response:', result);

        // Format the response for the client
        return {
            statusCode: 200,
            body: JSON.stringify({
                valid: result.valid,
                companyName: result.traderName || 'N/A',
                companyAddress: result.traderAddress || 'N/A',
                countryCode: country,
                vatNumber: vat,
            }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
        };
    }
};



// const soap = require('soap');
// const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

// exports.handler = async (event) => {
//     if (event.httpMethod !== 'POST') {
//         return {
//             statusCode: 405,
//             body: 'Method Not Allowed',
//         };
//     }

//     try {
//         // Parse the request body
//         const { country, vat } = JSON.parse(event.body || '{}');

//         if (!country || !vat) {
//             return {
//                 statusCode: 400,
//                 body: JSON.stringify({ error: 'Country and VAT number are required' }),
//             };
//         }

//         console.log('Input Data:', { country, vat });

//         // Helper to create SOAP client
//         const createClient = (endpoint) => {
//             return new Promise((resolve, reject) => {
//                 soap.createClient(endpoint, (err, client) => {
//                     if (err) reject(err);
//                     else resolve(client);
//                 });
//             });
//         };

//         const client = await createClient(endpoint);
//         const params = { countryCode: country, vatNumber: vat };

//         console.log('SOAP Params:', params);

//         // Helper to validate VAT
//         const validateVat = (client, params) => {
//             return new Promise((resolve, reject) => {
//                 client.checkVat(params, (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 });
//             });
//         };

//         const result = await validateVat(client, params);

//         console.log('SOAP Response:', result);

//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 valid: result.valid,
//                 companyName: result.name || 'N/A',
//                 companyAddress: result.address || 'N/A',
//                 countryCode: result.countryCode,
//                 vatNumber: result.vatNumber,
//             }),
//         };
//     } catch (error) {
//         console.error('Error:', error.message);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
//         };
//     }
// };
