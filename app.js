'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const soap = require('soap');
const countries = require('./lib/eu-countries'); // List of EU countries

const app = express();
const port = process.env.PORT || 8888;
const endpoint = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

// Disable "X-Powered-By" for security
app.disable('x-powered-by');

// Set the view engine and environment
app.set('view engine', 'ejs');
app.set('env', 'development');

// Middleware for serving static files and favicon
app.use(favicon(path.join(__dirname, 'favicon.png')));
app.use('/public', express.static(path.join(__dirname, 'public'), {
    maxAge: 0,
    dotfiles: 'ignore',
    etag: false
}));

// Body parsers for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Render the main page with the form
app.get('/', (req, res) => {
    res.render('index', { countries });
});

// Handle the VAT validation request
app.post('/validate', async (req, res) => {
    const { country, vat } = req.body;

    // Ensure inputs are provided
    if (!country || !vat) {
        return res.status(400).send('Country and VAT number are required');
    }

    const params = {
        countryCode: country,
        vatNumber: vat
    };

    try {
        // Create a SOAP client and validate VAT
        const createClient = (endpoint) => {
            return new Promise((resolve, reject) => {
                soap.createClient(endpoint, (err, client) => {
                    if (err) reject(err);
                    else resolve(client);
                });
            });
        };

        const client = await createClient(endpoint);


        
        const [result] = await client.checkVatAsync(params);

        // Send the result back to the user
        res.json({
            valid: result.valid,
            companyName: result.name || 'N/A',
            companyAddress: result.address || 'N/A',
            countryCode: result.countryCode,
            vatNumber: result.vatNumber
        });
    } catch (error) {
        console.error('SOAP Validation Error:', error.message);
        res.status(500).send('Error validating VAT. Please try again later.');
    }
});

// Handle errors during development
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        console.error('Development Error:', err.message);
        res.status(err.status || 500).send(err.message || 'Internal Server Error');
    });
}

// Fallback error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).send('An error occurred.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
