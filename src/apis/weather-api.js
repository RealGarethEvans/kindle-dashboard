'use strict';

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();


const config = {
    CLIENT_ID: process.env.METOFFICE_CLIENT_ID,
    CLIENT_SECRET: process.env.METOFFICE_CLIENT_SECRET,
    METOFFICE_API_KEY: process.env.METOFFICE_API_KEY,
}

const baseUrl = 'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/';

function getNearestSite(latitude, longitude){
    /* Find our nearest location */
    /* I've downloaded a file from http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist?res=daily&key=<api-key> */
    const sites = JSON.parse( fs.readFileSync(( path.join( process.cwd(), 'assets', 'data', 'weather-sites.json' ))));
    let nearest = {};
    let nearestDistance = Number.MAX_VALUE;
    sites.Locations.Location.forEach(site => {
        // Find the distance between this site and our location. Thanks Pythagoras!
        const longitudeDistance = Math.abs(longitude - site.longitude);
        const latitudeDistance = Math.abs(latitude - site.latitude);
        const distance = Math.sqrt(longitudeDistance**2 + latitudeDistance**2);
        if(distance < nearestDistance){
            nearestDistance = distance;
            nearest = site;
        }
    });
    return nearest;
}

async function weatherData(frequency="3hourly", locationId){
    /* Gives an array of forecasts. frequency can be '3hourly' or 'daily'
    * The first item in the array will be the first item that's in the future
    * The weather type will be text, rather than the number that we download from the api
    * The Daily option will ignore night */
    const url = baseUrl + locationId + '?res=' + frequency +'&key=' + config.METOFFICE_API_KEY;
    console.log(`Getting data from ${url}`);
    const settings = { method: "Get" };
    const types = JSON.parse( fs.readFileSync(( path.join( process.cwd(), 'assets', 'data', 'weather-types.json' ))));
    let forecasts = [];
    await fetch(url, settings)
        .then(metResponse => metResponse.json())
        .then(json => {
            const headings = json.SiteRep.Wx.Param;
            let forecastLabels = {};
            headings.forEach(heading => {
                forecastLabels[heading.name] = heading.$;
            });
            const entries = json.SiteRep.DV.Location.Period; 
            entries.forEach(element => {
                if(Date.parse(element.value) > Date.now() || frequency == '3hourly' ){
                    element.Rep.forEach( entry => {
                        if(forecasts.length >= process.env.WEATHER_COLUMN_COUNT){// then we've finished
                            return;
                        }
                        if(entry.$ != 'Night'){ // If it's daily then we throw away the nighttime forecast
                            const timeNow = new Date().getUTCHours() * 60;
                            // console.log ('current hour is', timeNow);
                            const forecast = {date: element.value};
                            // We set the forecast type manually because dealing with the dollar symbol is hard
                            if( entry.$ == 'Day' ){
                                // console.log('daily');
                                forecast.ForecastType = 'Day';
                            } else { // then this is a 3-hourly forecast
                                // console.log('3hourly');
                                forecast.Time = (entry.$)/0.6;
                            }
                            if(entry.$ == 'Day' || entry.$ > timeNow || Date.parse(element.value) > Date.now()){
                                // console.log('time is', forecastTime);
                                Object.keys(entry).forEach( key =>{
                                    // console.log('key is', key);
                                    // console.log('name is', forecastLabels[key]);
                                    forecast[forecastLabels[key]] = entry[key];
                                });
                                // Replace the weather type code with an actual description
                                forecast['Weather Type'] = types[forecast['Weather Type']];
                                // console.log('forecast is', forecast);
                                forecasts.push(forecast);
                            }
                        }
                    });

                }
            });
        })
        .catch(error => {
            console.log(`Something went wrong: ${error}`);
            return {};
        });
    // console.log(forecasts);
    return forecasts;

}
    
module.exports = { getNearestSite, weatherData };