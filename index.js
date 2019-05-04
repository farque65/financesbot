var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var app = express();
var _ = require('lodash');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 1337));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is FinanceBot Server');
});

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

            request({
                url: 'https://www.googleapis.com/auth/spreadsheets.readonly',
                spreadsheetId: process.env.SHEET_ID,
                auth: process.env.FINNOW_ID,
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
                console.log("NO ERROR ", response, body);
                
                //send reply
                sendMessage(event.sender.id, {text: reply});
            });    
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

