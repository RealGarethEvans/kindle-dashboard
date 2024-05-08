'use strict';

const { XMLParser } = require('fast-xml-parser');
require('dotenv').config();

const soapUrl = process.env.NR_SOAP_URL;
const soapPrefix = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types" xmlns:ldb="http://thalesgroup.com/RTTI/2021-11-01/ldbsv/"><soapenv:Header><typ:AccessToken><typ:TokenValue>'
    + process.env.NR_TOKEN
    + '</typ:TokenValue></typ:AccessToken></soapenv:Header><soapenv:Body><ldb:GetDepartureBoardByCRSRequest><ldb:numRows>' + process.env.TRAINS_TO_REQUEST + '</ldb:numRows>';
const soapSuffix = '<ldb:timeWindow>1440</ldb:timeWindow></ldb:GetDepartureBoardByCRSRequest></soapenv:Body></soapenv:Envelope>';

const soapHttpHeaders = {
    // SOAPAction: "http://thalesgroup.com/RTTI/2015-05-14/ldbsv/GetArrBoardWithDetails",
    SOAPAction: "http://thalesgroup.com/RTTI/2012-01-13/ldbsv/GetDepartureBoardByCRS",
    // "Accept-Encoding": "gzip,deflate",
    'Content-Type': "text/xml;charset=UTF-8",
    // 'User-Agent': "Apache-HttpClient/4.5.5 (Java/16.0.1)",

};

async function railData(){
    // Combines the departure boards from two stations.
    // Assumes you're equidistant from each station and if a train goes through both,
    // shows you whichever one is later
    const firstStation = process.env.FIRST_STATION;
    const secondStation = process.env.SECOND_STATION;
    if(typeof(secondStation) == 'undefined'){ //then stop trying to be clever
        console.log('One station only:', process.env.FIRST_STATION);
        return await departureBoard(firstStation);
    } else {
        console.log('looking at', firstStation, 'and', secondStation);
        const trains = {};
        const boardPromises = await Promise.allSettled([departureBoard(firstStation), departureBoard(secondStation)]);
        boardPromises.forEach(promise => {
            if(promise.status = 'Fulfilled'){
                promise.value.forEach( train => {
                    if ( typeof (trains[train['trainId']]) == 'undefined'){ // then we haven't seen this train yet
                        trains[train['trainId']] = train;
                    } else {
                        if( Date.parse(train['expectedTime']) > Date.parse( trains[train['trainId']].expectedTime )){ // then this is the later departure, and the one we want
                            trains[train['trainId']] = train;
                        } else {
                            // Do nothing, because this is the earlier departure
                        }
                    }
                });
            } else {
                console.log('problem with departure board:', boardPromise);
            }
        });
        
        //now sort the trains by time
        const returnTrains = [];
        Object.keys(trains).forEach( train => {
            // console.log('returning this train:', trains[train]);
            returnTrains.push(trains[train]);
        });

        // return returnTrains;
        return returnTrains.sort( (a,b) => Date.parse(a.expectedTime) - Date.parse(b.expectedTime) ) ;
    }
}

async function departureBoard(station){
    const fetch = require('node-fetch');
    console.log('getting rail data from', soapUrl);
    const timeNow = new Date();
    // The feed from National Rail seems to be naughty and needs you to add your BST offset manually
    const timezoneOffset = -timeNow.getTimezoneOffset() * 60000;
    const boardTime = Date.parse(timeNow) + process.env.TRAIN_TIME_OFFSET*1000 + timezoneOffset;
    const dateString = new Date(boardTime).toISOString();
    console.log('requesting trains from', dateString);
    let requestXml = soapPrefix;
    requestXml += '<ldb:crs>' + station + '</ldb:crs>'
    requestXml += '<ldb:time>' + dateString + '</ldb:time>'
    requestXml += soapSuffix;
    // console.log ('request is', requestXml);
    const response = await fetch(soapUrl, {method: 'POST', body: requestXml, headers: soapHttpHeaders});
    const parser = new XMLParser();
    const data = parser.parse(await response.text())['soap:Envelope']['soap:Body']['GetDepartureBoardByCRSResponse']['GetBoardResult']['t13:trainServices']['t13:service'];
    // console.log('Got data for', station);
    // console.log(data);
    const returnData = [];
    data.forEach(line => {
        try {
            const destinations = line['t13:destination']['t6:location'];
            // If there are multiple destinations, the above will be an arrray of destination objects;
            // otherwise it's just a destination object;
            // console.log('these are the destinations for', line['t10:trainid'], destinations)
            let destination;
            // destinations.forEach( name => {
                //     destinationNames.push(destination['t5:locationName']);
                // });
            if( typeof(destinations[0]) == 'undefined' ){ // Maybe there's a neater way to do this...
                destination = destinations['t5:locationName'];
                if(typeof(destinations['t5:via']) == 'string'){
                    destination += ' ' + destinations['t5:via'];
                }
            } else {
                destination = "multiple";
                const destinationNames = [];
                destinations.forEach( dest => {
                    destinationNames.push(dest['t5:locationName']);
                });
                destination = destinationNames.join(' & ');
            }
            // console.log("So it's going to", destination);
            let expectedTime;
            if( line['t10:departureType'] == 'Forecast'){
                expectedTime = line['t10:etd']
            } else {
                expectedTime = line['t10:atd']
            }
            const train = {
                station: station,
                isCancelled: line['t10:isCancelled'],
                trainId: line['t10:trainid'],
                scheduledTime: line['t10:std'],
                expectedTime: expectedTime,
                destination: destination,
                // destination: destinationNames.join(' & '),
            };
            returnData.push(train);
            
        } catch (error) {
            console.log('Problem at', station);
            console.log(error);
        }
    });
    // return data;
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

module.exports = { railData, departureBoard };


