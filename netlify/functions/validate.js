exports.handler = async (event) => {
    const fetch = (await import('node-fetch')).default;

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed. Use GET.' }),
        };
    }

    try {
        // Get country and vat from query parameters (not from request body)
        const { country, vat } = event.queryStringParameters;

        // Ensure the required parameters are present
        if (!country || !vat) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Country and VAT number are required' }),
            };
        }

        // Construct the API URL with dynamic country and VAT number
        const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vat}`;

        // Make the request to the VAT validation API (using GET method)
        const response = await fetch(apiUrl);

        // Log the raw response text to debug the issue
        const rawResponse = await response.text(); // Get the raw response as text
        console.log('Raw API Response:', rawResponse);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`VAT validation failed with status ${response.status}`);
        }

        // Attempt to parse the raw response as JSON
        const result = JSON.parse(rawResponse); // Attempt JSON parsing

        // Log the parsed response
        console.log('Parsed API Response:', result);

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
