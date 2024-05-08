'use strict';

// serves some test images
const path = require('path');
const express = require('express');
const { helloPng, helloSvg, testMagick, svgFromText, hbsHtml, hbsSvg, railText } = require('../../utils/test');

const testRouter = express.Router();

testRouter.use((req, __res, next) => {
    console.log('Here we are in the test router');
    console.log(`And the request is for ${req.url}`);
    next();
})

testRouter.get('/', (__req, res, next) => {
    console.log('And here we are in the GET function');
    res.send('Hello');
});

testRouter.use('/static-svg', (req, res) => { res.sendFile(path.join(__dirname, '../../../assets/test-images/static-test.svg'))});
testRouter.use('/static-png', (req, res) => { res.sendFile(path.join(__dirname, '../../../assets/test-images/hello.png'))});

testRouter.use('/hellopng', async(__req, res) => {
    console.log('sending the hello png');
    const png = await helloPng();
    res.set('Content-Type', 'image/png');
    res.send(png);
});

testRouter.use('/hellosvg', async(__req, res) => {
    console.log('sending the hello svg');
    const svg = await helloSvg();
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
});

testRouter.use('/magick', (req, res) => {
    console.log(('using magick'));
    testMagick(req, res);
    console.log('passed off to magick');
})

testRouter.use('/svgFromText', (__req, res) => {
    console.log('sending an svg from text');
    svgFromText(res);
});

testRouter.get('/rail', (req, res) => {
    railText(res);
})

testRouter.get('/html', (req, res) => {
    hbsHtml(res);
});

testRouter.use('/hbs', (__req, res) => {
    console.log('hbs test');
    hbsSvg(res);
});

module.exports = testRouter;