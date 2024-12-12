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

    const templatePath = path.resolve(__dirname, '../../views/index.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const html = ejs.render(template, { countries });

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html,
    };
};
