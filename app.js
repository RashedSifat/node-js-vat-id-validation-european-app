const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Port for the server to listen on
// const port = process.env.PORT || 8888;

// Route to handle GET request for VAT validation
app.get('/validate', async (req, res) => {
  const { country, vat } = req.query;

  // Ensure that both country and VAT number are provided
  if (!country || !vat) {
    return res.status(400).json({ error: 'Country and VAT number are required' });
  }

  try {
    // Construct the API URL using the provided country and VAT number
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${vat}`;

    // Make the GET request to the EU VAT API
    const response = await fetch(apiUrl);

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`VAT validation failed with status: ${response.status}`);
    }

    // Parse the response from the VAT API
    const data = await response.json();

    console.log(data.name);

    // Return the data received from the API
    res.status(200).json({
      valid: data.valid,
      companyName: data.traderName || 'N/A',
      companyAddress: data.traderAddress || 'N/A',
      countryCode: country,
      vatNumber: vat,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
