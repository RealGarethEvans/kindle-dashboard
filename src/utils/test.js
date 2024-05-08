'use strict';

const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const hbs = require('hbs');
const nationalRail = require('../apis/national-rail');

require('dotenv').config();
const config = {
    WIDTH: parseInt(process.env.WIDTH),
    HEIGHT: parseInt(process.env.HEIGHT),
};

function pngFromFile(){
    filePath = path.join(__dirname, '..', '..', 'assets/test-images.hello.png');
    console.log(filePath);
    svgexport.render(filePath, (err, stdout) => {
        if(err) throw err;
    })
}

function testCanvas(text='Hello'){
    //const canvas = createCanvas(config.HEIGHT, config.thingy);
    const canvas = createCanvas(config.WIDTH, config.HEIGHT, 'svg'); //width and height are swapped here because we'll be rotating it.
    const context = canvas.getContext("2d");
    
    //ctx.rotate(Math.PI /2);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, config.WIDTH, config.HEIGHT);
    context.fillStyle = "#444444";
    context.fillRect(10, 10, 100, 10);
    context.fillRect(config.WIDTH-110, 10, 100, 10);
    context.fillRect(10, config.HEIGHT-20, 100, 10);
    context.fillRect(config.WIDTH-110, config.HEIGHT-20, 100, 10);

    context.fillStyle = "#000000";
    context.font = "32px Arial";
    context.fillText(text, 10, 50);
    
    return canvas;
}

async function helloPng(text="png") {
    const canvas = testCanvas(text);
    const buffer = canvas.toBuffer("image/png");
    return buffer;
}

async function helloSvg(text="svg") {
    const canvas = testCanvas(text);
    const buffer = canvas.toBuffer("image/svg+xml");
    return buffer;
}

function svgFromText(res){
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="600" viewBox="0 0 800 600">
    <rect x="-80" y="-60" width="960" height="720" fill="rgb(100%, 100%, 100%)" fill-opacity="1"/>
    <path fill-rule="nonzero" fill="rgb(26.666667%, 26.666667%, 26.666667%)" fill-opacity="1" d="M 10 10 L 110 10 L 110 20 L 10 20 Z M 10 10 "/>
    <path fill-rule="nonzero" fill="rgb(26.666667%, 26.666667%, 26.666667%)" fill-opacity="1" d="M 690 10 L 790 10 L 790 20 L 690 20 Z M 690 10 "/>
    <path fill-rule="nonzero" fill="rgb(26.666667%, 26.666667%, 26.666667%)" fill-opacity="1" d="M 10 580 L 110 580 L 110 590 L 10 590 Z M 10 580 "/>
    <path fill-rule="nonzero" fill="rgb(26.666667%, 26.666667%, 26.666667%)" fill-opacity="1" d="M 690 580 L 790 580 L 790 590 L 690 590 Z M 690 580 "/>
    <path fill-rule="nonzero" fill="rgb(0%, 0%, 0%)" fill-opacity="1" d="M 10.984375 45.046875 L 13.765625 44.609375 C 13.917969 45.726562 14.351562 46.582031 15.070312 47.171875 C 15.78125 47.769531 16.78125 48.066406 18.0625 48.0625 C 19.351562 48.066406 20.308594 47.804688 20.9375 47.273438 C 21.558594 46.75 21.871094 46.132812 21.875 45.421875 C 21.871094 44.789062 21.59375 44.289062 21.046875 43.921875 C 20.65625 43.675781 19.699219 43.355469 18.171875 42.96875 C 16.105469 42.449219 14.675781 42 13.882812 41.617188 C 13.082031 41.238281 12.476562 40.710938 12.070312 40.039062 C 11.65625 39.367188 11.453125 38.625 11.453125 37.8125 C 11.453125 37.074219 11.621094 36.390625 11.960938 35.757812 C 12.296875 35.128906 12.757812 34.605469 13.34375 34.1875 C 13.777344 33.867188 14.375 33.59375 15.132812 33.367188 C 15.886719 33.144531 16.695312 33.03125 17.5625 33.03125 C 18.863281 33.03125 20.007812 33.21875 20.992188 33.59375 C 21.976562 33.96875 22.703125 34.476562 23.171875 35.117188 C 23.640625 35.757812 23.960938 36.617188 24.140625 37.6875 L 21.390625 38.0625 C 21.265625 37.210938 20.902344 36.542969 20.304688 36.0625 C 19.703125 35.585938 18.855469 35.347656 17.765625 35.34375 C 16.46875 35.347656 15.546875 35.558594 15 35.984375 C 14.445312 36.414062 14.171875 36.914062 14.171875 37.484375 C 14.171875 37.851562 14.285156 38.179688 14.515625 38.46875 C 14.742188 38.773438 15.101562 39.023438 15.59375 39.21875 C 15.871094 39.324219 16.699219 39.566406 18.078125 39.9375 C 20.066406 40.472656 21.453125 40.90625 22.242188 41.242188 C 23.023438 41.582031 23.640625 42.074219 24.09375 42.71875 C 24.539062 43.367188 24.765625 44.167969 24.765625 45.125 C 24.765625 46.0625 24.492188 46.945312 23.945312 47.773438 C 23.398438 48.601562 22.609375 49.242188 21.578125 49.695312 C 20.546875 50.148438 19.378906 50.375 18.078125 50.375 C 15.917969 50.375 14.273438 49.929688 13.148438 49.03125 C 12.015625 48.140625 11.296875 46.8125 10.984375 45.046875 Z M 32.71875 50 L 26.40625 33.40625 L 29.375 33.40625 L 32.9375 43.34375 C 33.320312 44.417969 33.671875 45.535156 34 46.6875 C 34.246094 45.816406 34.597656 44.761719 35.046875 43.53125 L 38.734375 33.40625 L 41.625 33.40625 L 35.34375 50 Z M 43.59375 51.375 L 46.328125 51.78125 C 46.441406 52.625 46.757812 53.238281 47.28125 53.625 C 47.976562 54.144531 48.929688 54.40625 50.140625 54.40625 C 51.4375 54.40625 52.445312 54.144531 53.15625 53.625 C 53.863281 53.101562 54.339844 52.371094 54.59375 51.4375 C 54.734375 50.859375 54.804688 49.660156 54.796875 47.828125 C 53.566406 49.277344 52.035156 50 50.203125 50 C 47.921875 50 46.15625 49.179688 44.90625 47.53125 C 43.65625 45.890625 43.03125 43.914062 43.03125 41.609375 C 43.03125 40.027344 43.316406 38.566406 43.890625 37.226562 C 44.460938 35.890625 45.292969 34.859375 46.382812 34.125 C 47.46875 33.398438 48.746094 33.03125 50.21875 33.03125 C 52.175781 33.03125 53.789062 33.824219 55.0625 35.40625 L 55.0625 33.40625 L 57.65625 33.40625 L 57.65625 47.75 C 57.65625 50.332031 57.390625 52.160156 56.867188 53.242188 C 56.335938 54.316406 55.503906 55.167969 54.367188 55.796875 C 53.222656 56.417969 51.820312 56.730469 50.15625 56.734375 C 48.175781 56.730469 46.574219 56.285156 45.359375 55.398438 C 44.136719 54.503906 43.550781 53.164062 43.59375 51.375 Z M 45.921875 41.40625 C 45.917969 43.585938 46.351562 45.175781 47.21875 46.171875 C 48.082031 47.175781 49.164062 47.675781 50.46875 47.671875 C 51.757812 47.675781 52.84375 47.175781 53.71875 46.179688 C 54.59375 45.1875 55.03125 43.628906 55.03125 41.5 C 55.03125 39.472656 54.578125 37.941406 53.679688 36.90625 C 52.773438 35.878906 51.6875 35.363281 50.421875 35.359375 C 49.167969 35.363281 48.105469 35.871094 47.234375 36.882812 C 46.355469 37.902344 45.917969 39.410156 45.921875 41.40625 Z M 10 21.03125 "/>
    </svg>
    `;
    res.set('Content-Type', 'image/svg+xml');
    res.send(svgText);

}

function hbsHtml(res) {
    console.log('Handlebars handling html');
    res.render('example-index.hbs', {
        title: 'This is a title',
        caption: 'this is a caption',
    })
};

function hbsSvg(res){
    console.log('Handlebars handling svg');
    res.render('test-template.hbs', {
        title: 'This is a title',
        caption: 'this is a caption',
        station: 'The road of Queens',
    });
}

function railText(res) {
    console.log('getting the rail text');
    // railText().then((text) => {res.send(text)});
    res.send(nationalRail.railText());
}

module.exports = {
    pngFromFile,
    helloPng,
    helloSvg,
    //testMagick,
    svgFromText,
    hbsHtml,
    hbsSvg,
    railText,
}
