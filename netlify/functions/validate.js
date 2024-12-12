const soap = require('soap');
const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const { country, vat } = JSON.parse(event.body);

    if (!country || !vat) {
        return {
            statusCode: 400,
            body: 'Country and VAT number are required',
        };
    }

    const createClient = (endpoint) => {
        return new Promise((resolve, reject) => {
            soap.createClient(endpoint, (err, client) => {
                if (err) reject(err);
                else resolve(client);
            });
        });
    };

    const params = { countryCode: country, vatNumber: vat };

    try {
        const client = await createClient(endpoint);
        const [result] = await client.checkVatAsync(params); // Ensure `checkVatAsync` is available in the WSDL client.

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
        console.error('SOAP Validation Error:', error.message);
        return {
            statusCode: 500,
            body: 'Error validating VAT. Please try again later.',
        };
    }
};
