'use strict';

/*  checks if there's a new recent message and writes it to a file
    Much of this code is pasted directly from https://developers.google.com/gmail/api/quickstart/nodejs
*/

const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const Moment = require('moment');
require('dotenv').config();

const dataPath = path.join(process.cwd(), 'assets', 'data');

async function getNewMessage() {
    console.log('getting the latest message');

    const timeToGoBack = parseInt(process.env.EMAIL_DAYS_TO_GO_BACK) * 24 * 60 * 60 * 1000; //That's two days in milliseconds
    // due = Moment(line.expectedTime).format('HH:mm');

    const timeAfter = Moment(new Date(Date.parse(new Date()) - timeToGoBack)).format('YY/MM/DD');
    console.log('looking for emails after', timeAfter);
    const query = 'in:inbox after:' + timeAfter;
    console.log('Query is', query);
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list(
        {
            userId: 'me',
            q: query,
        }, (err, res) => {
            if (err) {
                throw new Error(err);
            }
            if (res.data.messages) {
                // This section only reports what it's got
                console.log("I've got", res.data.messages.length, "messages");
                res.data.messages.forEach(message => {
                    gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                    }, (err, res) => {
                        console.log("Here's a message:");
                        res.data.payload.headers.forEach(header => {
                            if (header.name == 'From') {
                                console.log("It's from", header.value);
                            }
                        });
                        console.log("And it says:", res.data.snippet);
                    });
                });
                let returnMessage = {};
                gmail.users.messages.get({
                    userId: 'me',
                    id: res.data.messages[0].id,
                }, (err, res) => {
                    console.log("This is the message I'm dealing with:");
                    res.data.payload.headers.forEach(header => {
                        if (header.name == 'From') {
                            console.log("It's from", header.value);
                            returnMessage.from = header.value;
                        }
                    });
                    console.log("And it says:", res.data.snippet);
                    returnMessage.body = res.data.snippet;
                    saveMessage(returnMessage);
                });
            } else {
                console.log('nothing');
                saveMessage({});
                // return ([]);
            }
        }
    );
}

async function saveMessage(message){
    console.log("let's save our message:", message);
    const dataFilename = 'email.json';
    try {
        fs.writeFile( path.join(dataPath, dataFilename), JSON.stringify(message) );
    } catch (error) {
        console.log("trouble writing the message to a file:", error);
    }
}


/* The following functions are pasted from the example at https://developers.google.com/gmail/api/quickstart/nodejs */

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(dataPath, 'gmail-token.json');
const CREDENTIALS_PATH = path.join(dataPath, 'gmail-credentials.json');

console.log('paths are', TOKEN_PATH, 'and', CREDENTIALS_PATH);

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log(err);
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        console.log('got a client');
        return client;
    }
    console.log("No client, so I'll get one");
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}


module.exports = { getNewMessage };