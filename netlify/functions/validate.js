const fetch = require('node-fetch'); // Ensure node-fetch is installed

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        // Parse the request body
        const { country, vat } = JSON.parse(event.body || '{}');

        // Ensure the required parameters are present
        if (!country || !vat) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Country and VAT number are required' }),
            };
        }

        // Construct the API URL with dynamic country and VAT number
        const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vat}`;

        // Make the request to the VAT validation API
        const response = await fetch(apiUrl);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`VAT validation failed with status ${response.status}`);
        }

        // Parse the response body as JSON
        const result = await response.json();

        // Log the response for debugging
        console.log('API Response:', result);

        // Send a structured response to the client
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
        // Log the error
        console.error('Error:', error.message);

        // Return the error response to the client
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
        };
    }
};
