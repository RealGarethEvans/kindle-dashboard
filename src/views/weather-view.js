'use strict';

const path = require('path');
require('dotenv').config();

const { getNearestSite, weatherData } = require('../apis/weather-api');

/* This is where we'll cache weather data so we're not refreshing it every minute */
var tomorrowForecast = {};
var tomorrowForecastTime;
var todayForecast = {};
var todayForecastTime;

const nearest = getNearestSite(process.env.LATITUDE, process.env.LONGITUDE);
console.log(`Nearest weather site is ${nearest.id} ${nearest.name}`);

class Weather {
    constructor(){
        console.log('constructing weather');
    }

    async todayWeatherTemplateData(){
        let returnData = {};
        if(todayForecastTime && (new Date() - todayForecastTime)/1000 < process.env.TODAY_MAX_AGE){
            console.log("Got a recent hourly forcast");
            returnData = todayForecast;
        } else {
            console.log("no recent hourly forecast, so I'll refresh it");
            const columnWidth = parseInt(process.env.WEATHER_SECTION_WIDTH) / process.env.WEATHER_COLUMN_COUNT;
            const data = await weatherData("3hourly", nearest.id);
            // console.log(data);
            const columnData = [];
            let index = 0;
            data.forEach(forecast => {
                const columnLeft = index * columnWidth;
                const columnCentre = columnLeft + columnWidth/2;
                const forecastTime = forecast.Time.toString().padStart(4, 0);
                const top = parseInt(process.env.TEXT_TOP);
                const windYCoord = top + parseInt(process.env.WEATHER_WIND_Y_OFFSET);
                const windRadius = parseInt(process.env.WEATHER_WIND_RADIUS);
                const nudge = 8;
                const [arrowX, arrowY] = this.get_arrow_point(columnCentre + nudge, windYCoord, windRadius*0.63, 'N');
                let column = {
                    TITLE_FONT_SIZE: process.env.TITLE_FONT_SIZE,
                    TIME_Y_COORD: top,
                    COLUMN_LEFT: columnLeft,
                    COLUMN_CENTRE: columnCentre,
                    COLUMN_CENTRE_NUDGED: columnCentre + nudge,
                    TIME: forecastTime,
                    TYPE_Y_COORD: top + parseInt(process.env.WEATHER_ICON_Y_OFFSET),
                    TYPE_WIDTH: columnWidth,
                    WEATHER_TYPE: forecast['Weather Type'],
                    TEMP_Y_COORD: top + parseInt(process.env.WEATHER_TEMP_Y_OFFSET),
                    FEELS_LIKE_Y_COORD: top + parseInt(process.env.WEATHER_FEELS_LIKE_Y_OFFSET),
                    TEMPERATURE_1: forecast['Temperature'],
                    TEMPERATURE_2: forecast['Feels Like Temperature'],
                    WIND_Y_COORD: windYCoord,
                    WIND_RADIUS: windRadius,
                    ARROW_X_COORD: arrowX,
                    ARROW_Y_COORD: arrowY,
                    ARROW_STROKE_WIDTH: windRadius * 0.52,
                    WIND_SPEED_SIZE: windRadius * 1.1,
                    WIND_SPEED_Y_COORD: windYCoord + windRadius * .35,
                    WIND_SPEED: forecast['Wind Speed'],
                }
        
                columnData.push(column);
                index++;
            });
            returnData = {
                weather_columns: columnData,
            }
            // console.log(returnData);
            todayForecast = returnData;
            todayForecastTime = new Date();
        }
        return returnData;
    }
    
    async tomorrowWeatherTemplateData(){
        const columnLeft = parseInt(process.env.SECOND_ROW_LEFT) + process.env.SECOND_ROW_HEIGHT * 5.3;
        const textYCoord = parseInt(process.env.SECOND_ROW_TOP) + process.env.SECOND_ROW_HEIGHT *2.5/3;
        const typeYOffset = 13;
        const typeXOffset = process.env.SECOND_ROW_HEIGHT * 1.7;
        const typeScale = process.env.SECOND_ROW_HEIGHT / 80;
        let returnData = {}
        if((new Date() - tomorrowForecastTime)/1000 < process.env.TOMORROW_MAX_AGE){
            console.log("got a recent daily forecast, so I'll use that");
            returnData = tomorrowForecast;
        } else {
            console.log("no recent daily forecast, so I'm refreshing it");
            const data = (await weatherData("daily", nearest.id))[0];
            const day = new Date(Date.parse(data.date)).toLocaleString('en-gb', {weekday: 'short'});
            returnData = {
                TOMORROW_TITLE_FONT_SIZE: (2/3) * process.env.SECOND_ROW_HEIGHT,
                TOMORROW_TEMP_FONT_SIZE: process.env.SECOND_ROW_HEIGHT/2,
                TOMORROW_COLUMN_LEFT: columnLeft,
                TOMORROW_TIME_X_COORD: columnLeft + process.env.SECOND_ROW_HEIGHT * 1.7,
                TOMORROW_TIME_Y_COORD: textYCoord,
                TOMORROW_TYPE_X_COORD: columnLeft + typeXOffset,
                TOMORROW_TYPE_Y_COORD: parseInt(process.env.SECOND_ROW_TOP) + typeYOffset,
                TOMORROW_TEMP_X_COORD: columnLeft + process.env.SECOND_ROW_HEIGHT * 3,
                TOMORROW_TEMP_Y_COORD: textYCoord,
                TOMORROW_TYPE_WIDTH: process.env.TOMORROW_TYPE_WIDTH,
                TOMORROW_TYPE_SCALE: typeScale,
        
                TOMORROW_TIME: day,
                TOMORROW_WEATHER_TYPE: data['Weather Type'],
                TOMORROW_TEMPERATURE: data['Day Maximum Temperature'],
            };
            tomorrowForecast = returnData;
            tomorrowForecastTime = new Date();

        }
        return returnData;
    }
    
    get_arrow_point(centreX, centreY, radius, direction){
        let angle=0;
        switch (direction) {
            case 'W':
                angle=0;
                break;
            case 'WNW':
                angle=Math.PI/8;
                break;
            case 'NW':
                angle=Math.PI/4;
                break;
            case 'NNW':
                $angle=Math.PI*3/4;
                break;
            case 'N':
                angle=Math.PI/2;
                break;
            case 'NNE':
                angle=Math.PI*5/8;
                break;
            case 'NE':
                angle=Math.PI*3/4;
                break;
            case 'ENE':
                angle=Math.PI*7/8;
                break;
            case 'E':
                angle=Math.PI;
                break;
            case 'ESE':
                angle=Math.PI*9/8;
                break;
            case 'SE':
                angle=Math.PI*5/4;
                break;
            case 'SSE':
                angle=Math.PI*11/8;
                break;
            case 'S':
                angle=Math.PI*3/2;
                break;
            case 'SSW':
                angle=Math.PI*13/8;
                break;
            case 'SW':
                angle=Math.PI*7/4;
                break;
            case 'WSW':
                angle=Math.PI*15/8;
                break;
        
            default:
                // If it's gone wrong, hide the arrow in the middle of the circle
                return[centreX, centreY];
                break;
        }
        // console.log('direction:', direction, 'angle:', angle);
        const xCoord = centreX + radius * Math.cos(angle);
        const yCoord = centreY + radius * Math.sin(angle);
        return [xCoord, yCoord];
    }
}

module.exports = { Weather }