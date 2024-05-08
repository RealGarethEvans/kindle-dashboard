'use strict';

const path = require('path');
require('dotenv').config();

const { Weather } = require('../../views/weather-view');
const { sunriseTemplateData } = require('../../views/sunrise-api');
const { moonPhaseData } = require('../../views/moon-phase');
const { railTemplateData } = require('../../views/rail-view');
const { statusBar } = require('../../views/status');
const { emailTemplateData } = require('../../views/email');

const config = {
    WIDTH: parseInt(process.env.WIDTH),
    HEIGHT: parseInt(process.env.HEIGHT),
};

async function buildDashboardSvg(req, res, callback){
    // If you set renderDirectly to true, you'll get the svg rendedred to the browser,
    // otherwise we'll send the text of it to the next function
    console.log('building the dashboard data');
    let data = {
        HEIGHT: process.env.HEIGHT,
        WIDTH: process.env.WIDTH,
    };
    const weather = new Weather();
    Promise.allSettled([
        weather.tomorrowWeatherTemplateData(),
        sunriseTemplateData(),
        moonPhaseData(),
        weather.todayWeatherTemplateData(),
        railTemplateData(),
        statusBar(req),
        emailTemplateData(),
    ]).then(promises => {
        // console.log('Here are the promises:', promises);
        promises.forEach(item => {
            const value = item.value;
            try {
                Object.keys(value).forEach(key => {
                    data[key] = value[key];
                });
                
            } catch (error) {
                console.log('problem with promise:');
                console.log(item);
            }
        } );
        callback(req, res, data);
    });
}

async function dashboardSvg(req, res){
    console.log('sending the dashboard as an svg');
    buildDashboardSvg(req, res, (__req, res, data) => {res.render('dashboard-template.hbs', data)});
}

async function dashboardPng(req, res){
    console.log('sending the dashboards as a png');
    buildDashboardSvg(req, res, (req, res, output) => {pngOutput(req, res, output)});
}

async function dashboardText(req, res, next){
    console.log('sending the dashboard as svg text');
    buildDashboardSvg(req, res, data => {
        res.render('dashboard-template.hbs', data, (err, html) =>{
            console.log('Here we are then');
            console.log(err);
            console.log(html);
            res.send(html)
        })
    });
}

async function pngOutput(req, res, svg) {
    const gm = require('gm').subClass({imageMagick: true});
    // console.log('query is:', req.query);
    let rotateAngle; // If your url query includes 'no-rotate' then yoyu can show it off on your phone
    if(typeof(req.query['no-rotate']) == 'string'){
        rotateAngle = 0;
    } else {
        rotateAngle = 90;
    }
    // const gm = require('gm');
    console.log('converting to png:');
    res.render('dashboard-template.hbs', svg, (err, svg) => {
        let buffer = Buffer.from(svg);
        res.set('Content-Type', 'image/png');
        gm(buffer, 'svg.svg')
            .rotate('red', rotateAngle)
            .colorspace('gray')
            .bitdepth(8)
            .alpha('Off')
            .out("png:color-type=0")
            .stream('png', (err, stdout, stderr) => {
                if(err) console.log('error was', err);
                stdout.pipe(res);
            });
    });
}

module.exports = { dashboardSvg, dashboardText, dashboardPng };
