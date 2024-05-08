require('dotenv').config();
const {Moon} = require('lunarphase-js');

async function moonPhaseData() {
    moonRadius = process.env.SECOND_ROW_HEIGHT/2; // TODO: calculate this from the row height
    moonXCoord = parseInt(process.env.SECOND_ROW_LEFT) + process.env.SECOND_ROW_HEIGHT*4.5;
    moonYCoord = parseInt(process.env.SECOND_ROW_TOP) + moonRadius;
    moonTop = moonYCoord - moonRadius;
    moonBottom = moonYCoord + moonRadius;
    
    // This is all copied from an older program, without trying very hard to understand it...
    const phase = Moon.lunarAgePercent();
    // console.log('phase is', phase);
    const isWaining = phase < 0.5 ? 0 : 1; // affects whether we light up the left or right edge of the pattern
    let phaseSweep; // No idea what this is. Have a look at where it's used in the template if you want to understand it
    if ((phase > 0.25 && phase < 0.5) || (phase > 0.75)){
        phaseSweep = 1;
    } else {
        phaseSweep = 0;
    }
    // console.log('sweep is', phaseSweep);
    // We draw an ellipse over the moon to indicate the phase,
    // and this is its minor radius
    const phaseAngle = phase * 2 * Math.PI;
    // console.log('angle is', phaseAngle);
    const phaseRadius = Math.abs(moonRadius * Math.cos(phaseAngle));
    // console.log('radius is', phaseRadius);
    const returnData = {
        MOON_INVISIBLE_COLOUR: process.env.MOON_INVISIBLE_COLOUR,
        MOON_X_COORD: moonXCoord,
        MOON_Y_COORD: moonYCoord,
        MOON_TOP: moonTop,
        MOON_RADIUS: moonRadius,
        IS_WANING: isWaining,
        MOON_BOTTOM: moonBottom,
        PHASE_RADIUS: phaseRadius,
        PHASE_SWEEP: phaseSweep,
    }
    return returnData;
}

module.exports = {moonPhaseData};