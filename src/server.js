'use strict';

const express = require('express');
const path = require('path');
const hbs = require('hbs');

const dashboardRouter = require('./routes/dashboard/dashboard.router');
const staticTestRouter = require('./routes/static-test/static-test.router');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'templates'));
hbs.registerPartials(path.join(__dirname, 'templates', 'partials'), (error)=>{
    if (error == undefined){
        console.log("partials registered");
    } else {
        console.log("problem registering partials: ");
        console.log(typeof( error));
    }
});

const PORT = 3000;

app.use((req, res, next) => {
    // logging, with a timer
    const start = Date.now();
    next();
    console.log(`${req.method} ${req.baseUrl}${req.url} from ${req.socket.remoteAddress} took ${Date.now() - start} miliseconds`);
    // console.log(req.socket.remoteAddress);
});

app.use('/', dashboardRouter);

app.use('/test', staticTestRouter);


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
