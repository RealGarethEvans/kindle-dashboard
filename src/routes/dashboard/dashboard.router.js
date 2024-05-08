'use strict';

const path = require('path');
const express = require('express');

const { dashboardSvg, dashboardText, dashboardPng } = require('./dashboard.controller');
const { railText } = require('../../views/rail-view');

const dashboardRouter = express.Router();

dashboardRouter.use( (req, res, next) => { console.log(); next()} ); // Just adding a blank line to make the logs clearer

dashboardRouter.get('/dashboard-svg', dashboardSvg);
dashboardRouter.get('/svg', dashboardSvg);
dashboardRouter.get('/dashboard-text', dashboardText);
dashboardRouter.get('/dashboard-png', dashboardPng);
dashboardRouter.get('/', dashboardPng);
dashboardRouter.get('/railtext', railText);

module.exports = dashboardRouter;
