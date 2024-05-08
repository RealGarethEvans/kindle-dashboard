'use strict';

const SunCalc = require('suncalc');
require('dotenv').config();

async function sunriseTemplateData(){
    const times = SunCalc.getTimes(new Date(), process.env.LATITUDE, process.env.LONGITUDE);
    // console.log(times);
    const sunriseIconHeight = process.env.SECOND_ROW_HEIGHT*2/3;
    const sunriseIconWidth = sunriseIconHeight * 1.6;
    const sunriseIconX = parseInt(process.env.SECOND_ROW_LEFT);
    const sunsetIconX = parseInt(process.env.SECOND_ROW_LEFT) + process.env.SECOND_ROW_HEIGHT * 1.25;
    const sunriseIconY = parseInt(process.env.SECOND_ROW_TOP);

    const returnData = {
        SUN_FONT_SIZE: process.env.SECOND_ROW_HEIGHT/3,
        SUNRISE_ICON_X: sunriseIconX,
        SUNSET_ICON_X: sunsetIconX,
        SUN_ICON_Y: sunriseIconY,
        SUNRISE_ICON_HEIGHT: sunriseIconHeight,
        SUNRISE_ICON_WIDTH: sunriseIconWidth,
        SUNRISE_ICON_SCALE: sunriseIconHeight * 0.02,
        SUNRISE_X: sunriseIconX + sunriseIconWidth / 1.9,
        SUNSET_X: sunsetIconX + sunriseIconWidth / 1.9,
        SUNRISE_Y: sunriseIconY + sunriseIconHeight * 1.5,

        SUNRISE_TIME: times.sunrise.toLocaleTimeString('en-gb', {hour:'2-digit', minute: '2-digit'}),
        SUNSET_TIME: times.sunset.toLocaleTimeString('en-gb', {hour:'2-digit', minute: '2-digit'}),
    }
    // console.log(returnData);
    return returnData;
}

module.exports = {sunriseTemplateData};