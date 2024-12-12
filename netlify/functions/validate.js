const soap = require('soap');
const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

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
                body: 'Country and VAT number are required',
            };
        }

        console.log('Country:', country, 'VAT:', vat);

        // Helper to create SOAP client
        const createClient = (endpoint) => {
            return new Promise((resolve, reject) => {
                soap.createClient(endpoint, (err, client) => {
                    if (err) reject(err);
                    else resolve(client);
                });
            });
        };

        // Perform VAT validation
        const client = await createClient(endpoint);
        const params = { countryCode: country, vatNumber: vat };

        const validateVat = (client, params) => {
            return new Promise((resolve, reject) => {
                client.checkVat(params, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        };

        const result = await validateVat(client, params);

        console.log('SOAP Response:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                valid: result.valid,
                companyName: result.name || 'N/A',
                companyAddress: result.address || 'N/A',
                countryCode: result.countryCode,
                vatNumber: result.vatNumber,
            }),
        };
    } catch (error) {
        console.error('Validation Error:', error.message);
        return {
            statusCode: 500,
            body: `Error validating VAT: ${error.message}`,
        };
    }
};
