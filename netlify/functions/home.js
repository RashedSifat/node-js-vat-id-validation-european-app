const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const countries = require('../../lib/eu-countries');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const template = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>EU VAT Validation</title>
        </head>
        <body>
            <h1>Validate VAT Numbers</h1>
            <form action="/validate" method="GET">
                <label for="country">Country:</label>
                <select name="country" id="country">
                    <% countries.forEach(country => { %>
                        <option value="<%= country.code %>"><%= country.name %></option>
                    <% }) %>
                </select>
                <br>
                <label for="vat">VAT Number:</label>
                <input type="text" id="vat" name="vat" required>
                <br>
                <button type="submit">Validate</button>
            </form>
        </body>
        </html>
    `;

    const html = ejs.render(template, { countries });

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html,
    };
};
