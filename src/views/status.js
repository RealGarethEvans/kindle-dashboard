const Moment = require('moment');
require('dotenv').config();

async function statusBar(req){
    let status = Moment().format('HH:mm');
    if(req.query.batt){
        status += ' ' + req.query.batt + '%';
    }
    if(req.query.uptime){
        status += ' up ' + req.query.uptime;
    }

    return {
        STATUS: status,
        STATUS_X: process.env.STATUS_X,
        STATUS_Y: process.env.STATUS_Y,
    };
}

module.exports = {statusBar};