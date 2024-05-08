'use strict';

/* Just testing the gmail interface */

const { getNewMessage } = require ('../apis/gmail');

// const result = await getLatestMessage();
// console.log('Result is', result);

getNewMessage().then(result => {console.log('result is', result)});
console.log('done');
