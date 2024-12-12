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
        // Check if the query parameters exist and log them
        const queryParams = event.queryStringParameters;
        console.log("Query Parameters:", queryParams);

        // Get country and vat from query parameters (not from request body)
        const { country, vat } = queryParams;

        // Log the values for debugging
        console.log("Country:", country);
        console.log("VAT:", vat);

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

        // Log the raw response text for debugging
        const rawResponse = await response.text(); // Get the raw response as text
        console.log('Raw API Response:', rawResponse);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`VAT validation failed with status ${response.status}`);
        }

        // Attempt to parse the response as JSON
        const result = JSON.parse(rawResponse); // Parse the raw response into a JSON object

        // Log the parsed response for debugging
        console.log('Parsed API Response:', result);

        // Remove the newline character from VAT number, if present
        const vatNumber = result.vatNumber ? result.vatNumber.trim() : 'N/A';

        // Return the validated result
        return {
            statusCode: 200,
            body: JSON.stringify({
                valid: result.valid,
                status: result.userError,
                UserName: result.name,
                companyName: result.traderName || 'N/A',
                companyAddress: result.traderAddress || 'N/A',
                countryCode: country,
                vatNumber: vatNumber, // Cleaned VAT number
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
