'use strict';

/* Here we check locally whether any new email has been saved,
 * and we launch the process that checks for new email.
 * We don't wait for that to respond, as that adds ages to the load time;
 * we just trust that any new email will be there for us next time.
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const he = require('he');
const { getNewMessage } = require('../apis/gmail');

const dataPath = path.join( process.cwd(), 'assets', 'data', 'email.json' );


async function emailTemplateData(){
    getNewMessage(); // We fire and forget this — its purpose is to have any new email ready for us by the next time we're here
    const maxCharacters = parseInt(process.env.EMAIL_CHARACTER_WRAP);
    
    // let emailText = fallbackText; // A placeholder for when we do the actual work
    const email = getEmailText();
    // const { emailSender, emailText } = getEmailText(); // A placeholder for when we do the actual work
    const emailStrings = getEmailStrings(email.body, maxCharacters);
    const fontSize = parseInt( process.env.EMAIL_FONT_SIZE);
    const emailY1 = parseInt( process.env.EMAIL_Y);
    const emailY2 = emailY1 + fontSize;
    const emailX = parseInt( process.env.EMAIL_X);
    const emailSenderX = parseInt(process.env.WIDTH) - emailX;
    let emailSender;
    if (email.from){
        emailSender = "from: " + email.from;
    } else {
        emailSender = '';
    }

    return{
        EMAIL_X: emailX,
        EMAIL_Y_1: emailY1,
        EMAIL_Y_2: emailY2,
        EMAIL_FONT_FAMILY: process.env.EMAIL_FONT_FAMILY,
        EMAIL_FONT_SIZE: fontSize,
        EMAIL_SENDER_FONT_SIZE: process.env.EMAIL_SENDER_FONT_SIZE,
        EMAIL_TEXT_1: he.decode(emailStrings[0]),
        EMAIL_TEXT_2: he.decode(emailStrings[1]),
        EMAIL_SENDER: emailSender,
        EMAIL_SENDER_X: emailSenderX,
    }
}

function getEmailText(){
    if(fs.existsSync(dataPath)){
        const savedData = JSON.parse( fs.readFileSync(dataPath));    
        if(savedData && savedData.body){
            console.log('got something');
            return savedData;
        } else {
            console.log('got nothing');
            return {
                body: process.env.EMAIL_FALLBACK_TEXT,
                from: '' };
        }
    } else { //there's no file
        console.log('no email file');
        return { body: process.env.EMAIL_FALLBACK_TEXT }
    }
}



function getEmailStrings(text, maxCharacters){
    const returnStrings = [''];
    let words = text.trim().split(/\s+/);
    // console.log ('words are:', words);
    // console.log('number of lines is ', returnStrings.length)
    let charCount = 0;
    words.forEach( word => {
        // console.log("currently at", charCount, "characters");
        // console.log('word is', word);
        // console.log("and it's", word.length, "characters long");
        if(maxCharacters - charCount < word.length){ // then we're about to go over and need to wrap
            returnStrings.push( word + ' ');
            charCount = word.length + 1;
        } else {
            returnStrings[returnStrings.length - 1] += word + ' ';
            charCount += word.length + 1;
        }
    });
    console.log('lines are', returnStrings);
    return returnStrings;
}

module.exports = { emailTemplateData };