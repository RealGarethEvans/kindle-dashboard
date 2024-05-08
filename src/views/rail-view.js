'use strict';

const { XMLParser } = require('fast-xml-parser');
const Moment = require('moment');
require('dotenv').config();

const { railData, departureBoard } = require('../apis/national-rail');

async function railText(__req, res){
    const station = process.env.FIRST_STATION;
    const data = await departureBoard(station);
    // res.set('Content-Type', 'text/xml');
    res.send(data);
}

async function railTemplateData(){
    console.log('Rail data requested');
    const firstStation = process.env.FIRST_STATION;
    const secondStation = process.env.SECOND_STATION;
    const left = parseInt(process.env.TRAIN_LEFT);
    const right = parseInt(process.env.TRAIN_RIGHT);
    const top = parseInt(process.env.TEXT_TOP) + parseInt(process.env.TITLE_FONT_SIZE);
    const fontSize = parseInt(process.env.TRAIN_FONT_SIZE);

    const data = await (await railData()).slice(0, process.env.TRAINS_TO_SHOW);
    // console.log('raw-ish data:', data);
    const returnData = {
        TRAIN_FONT_SIZE: fontSize,
        TITLE_FONT_SIZE: process.env.TITLE_FONT_SIZE,
        TRAIN_TITLE_X: left + (right - left) / 2,
        TRAIN_TITLE_Y: process.env.TEXT_TOP,
    }
    // Show the station codes if there's more than one; otherwise just show a title
    if(typeof(secondStation) == 'undefined'){
        returnData.TRAINS_TITLE = 'Trains';
        // returnData.TITLE_FONT_SIZE = process.env.TITLE_FONT_SIZE;

    } else {
        returnData.FIRST_STATION_X = left + 2.7 * fontSize;
        returnData.SECOND_STATION_X = right - 2.7 * fontSize;
        returnData.STATION_1 = process.env.FIRST_STATION;
        returnData.STATION_2 = process.env.SECOND_STATION;
        // returnData.TITLE_FONT_SIZE = process.env.TITLE_FONT_SIZE;
    }
    let index = 0;
    let trains = [];
    data.forEach(line => {
        // console.log('Displaying this train:', line);
        let fontWeight;
        if(typeof(secondStation) == 'undefined'){ // if there's only one station then we embolden every other line to make it easier to read
            if(index % 2 == 0){
                fontWeight = 'bold';
            } else {
                fontWeight = 'normal';
            }
        } else {
            if (line.station == firstStation){
                fontWeight = 'bold';
            } else {
                fontWeight = 'normal';
            }
        }
        const yCoord = top  + (1.1 * fontSize * index);
        let due;
        if(line.isCancelled){
            due = 'CANC';
        } else {
            due = Moment(line.expectedTime).format('HH:mm');
        }
        const train = {
            FONT_WEIGHT: fontWeight,
            SCHED_X_COORD: left,
            Y_COORD: yCoord,
            SCHEDULED: Moment(line.scheduledTime).format('HH:mm'),
            DEST_X_COORD: left + 2.7 * fontSize,
            DESTINATION: abbreviateStation( line.destination ),
            BOX_X_COORD: right - 2.75 * fontSize,
            BOX_Y_COORD: yCoord - 0.7 * fontSize,
            BOX_WIDTH: 3.5 * fontSize,
            BOX_HEIGHT: 1.1 * fontSize,
            DUE_X_COORD: right,
            DUE: due,
        }
        trains.push(train);
        index++;
    });
    returnData.trains = trains;
    // console.log('Train template data:');
    // console.log(returnData);
    return returnData;
}


function abbreviateStation(station){
    /* Abbreviates certain station names to save space */
    // console.log('Abbreviating', station);
    return station
        .replace('Junction', 'Jn')
        .replace('Islington', 'I')
        .replace('Corner', 'Cnr')
        .replace('London Blackfriars', 'Blackfriars')
        .replace('West Hampstead Thameslink', 'W Hampstead TL')
        .replace('South', 'S')
        .replace(' via ', ' v. ')
        ;
}

module.exports = { railText, railTemplateData };