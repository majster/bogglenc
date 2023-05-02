'use strict';

// [START functionsimport]
const functions = require('firebase-functions');
// [END functionsimport]
// [START additionalimports]
const https = require('https');
// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({
  origin: true,
});
// [END additionalimports]

// [START all]
/**
 * Returns the server's date. You must provide a `format` URL query parameter or `format` value in
 * the request body with which we'll try to format the date.
 *
 * Format must follow the Node moment library. See: http://momentjs.com/
 *
 * Example format: "MMMM Do YYYY, h:mm:ss a".
 * Example request using URL query parameters:
 *   https://us-central1-<project-id>.cloudfunctions.net/date?format=MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a
 * Example request using request body with cURL:
 *   curl -H 'Content-Type: application/json' /
 *        -d '{"format": "MMMM Do YYYY, h:mm:ss a"}' /
 *        https://us-central1-<project-id>.cloudfunctions.net/date
 *
 * This endpoint supports CORS.
 */
// [START trigger]
exports.wordCheck = functions.region('europe-west1').https.onRequest((req, res) => {
  // [END trigger]
  // [START sendError]
  // Forbidding PUT requests.
  if (req.method !== 'GET') {
    res.status(404).send('Not Found!');
    return;
  }
  // [END sendError]

  // [START usingMiddleware]
  // Enable CORS using the `cors` express middleware.
  cors(req, res, () => {
    // [END usingMiddleware]
    // Reading date format from URL query parameter.
    // [START readQueryParam]
    let word = req.query.word;
    // [END readQueryParam]
    // Reading date format from request body query parameter
    if (!word) {
      // [START readBodyParam]
      word = req.body.format;
      // [END readBodyParam]
    }

    if (!word) {
      res.status(400).send('Missing parameter!');
      return;
    }
    // [START sendResponse]

    https.get(`https://fran.si/ajax/iskanje/autocomplete?query=${req.query.word}`, franRes => {
      let data = [];
      const headerDate = franRes.headers && franRes.headers.date ? franRes.headers.date : 'no response date';
      console.log('Status Code:', franRes.statusCode);
      console.log('Date in Response header:', headerDate);

      franRes.on('data', chunk => {
        data.push(chunk);
      });

      franRes.on('end', () => {
        console.log('Response ended: ');
        const franData = JSON.parse(Buffer.concat(data).toString());

        for(const franEntry of franData) {
          if(franEntry === req.query.word){
            res.status(200).send(franEntry);
            return;
          }
        }

        res.status(400).send('Wrong guess!');
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
    })

    // res.status(200).send('jaja');
    // [END sendResponse]
  });
});
// [END all]
