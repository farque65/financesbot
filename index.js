var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var _ = require('lodash');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_PATH = 'token.json';


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 1337));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is FinanceBot Server');
});

//Update comments
// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
	/** UPDATE YOUR VERIFY TOKEN **/
	const VERIFY_TOKEN = PAGE_ACCESS_TOKEN;

	// Parse params from the webhook verification request
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	  
	// Check if a token and mode were sent
	if (mode && token) {
	
	  // Check the mode and token sent are correct
	  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		
		// Respond with 200 OK and challenge token from the request
		console.log('WEBHOOK_VERIFIED');
		res.status(200).send(challenge);
	  
	  } else {
		// Responds with '403 Forbidden' if verify tokens do not match
		res.sendStatus(403);      
	  }
	}
  });


app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            
            var reply;

            // Send Test Message
            if(_.isEqual(event.message.text, 'test_message')) {
                reply = "Hello, test message confirmed";
            }

            authorize(JSON.parse(process.env.GDRIVE_ID), listMajors);
            
        } 
    }
    res.sendStatus(200);
});


// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function authorize(credentials, callback) {

    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    return getNewToken(oAuth2Client, callback);
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    oAuth2Client.getToken('4/QAF2c96VwbEAfvlpV6eLyYc1Yt8gkH8Z181xGSlQA5aGZWayGhKg1z8', (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        console.log(oAuth2Client);
        oAuth2Client.setCredentials(token);
        callback(oAuth2Client);
    });
}


function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'DATA!A1:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`);
      });
      sendMessage(event.sender.id, {text: reply});
    } else {
      console.log('No data found.');
    }
  });
}