const WHEELTIRE_SEP = ":";

const MIN_WHEEL_WIDTH = 2.5;
const MIN_WHEEL_DIAMETER = 5;
const MIN_TIRE_SECTION = 95;

/*
From input, generate a code to tack onto a URL
*/
function getCode(properties_f, properties_r=null){
    return compileCode(properties_f);
}

/*
Generate the code from a single axle
*/
function compileCode(properties){
    let code = "";
    // wheel stuff
    if(properties.wheels != null){
        // wheel bolt holes
        let whcode = parseInt(properties.wheels.holes)-3;
        code += whcode;

        // wheel bolt PCD
        let pdcode = to2AN(properties.wheels.pcd);
        code += pdcode;

        // wheel diameter
        let wdcode = parseFloat(properties.wheels.diameter)-MIN_WHEEL_DIAMETER;
        code += toANhalf(wdcode);

        // wheel width
        let wwcode = parseFloat(properties.wheels.width)-MIN_WHEEL_WIDTH;
        code += toANhalf(wwcode);

        // offset
        let wocode = to2ANsigned(properties.wheels.offset);
        code += wocode;

        // centre bore
        let cbcode = to2AN(properties.wheels.bore);
        code += cbcode;
    }

    // wheel/tire seperator
    code += WHEELTIRE_SEP;

    // tire stuff
    if(properties.tires != null){
        // tire section
        let tscode = (parseInt(properties.tires.section) - MIN_TIRE_SECTION) / 10;
        code += toAN(tscode);

        // tire sidewall
        let swcode = (parseInt(properties.tires.ratio)-5)/5;
        code += toAN(swcode);

        // wheel diameter
        if(properties.wheels === null){
            // don't code this twice
            let wdcode = parseFloat(properties.tires.diameter) - MIN_WHEEL_DIAMETER;
            code += toANhalf(wdcode);
        }
    }
    return code;
}

/*
Returns two characters each between A-Z, a-z, or 0-9 when given a float with precision 0.1, between [0, 384.4)
*/
function to2AN(n){
    let nm = parseFloat(n)*10;
    let nr = nm % 62; // remainder
    let nn = (nm-nr) / 62; // leading digit
    return toAN(nn)+toAN(nr);
}

/*
Returns two characters each between A-Z, a-z, or 0-9 when given a float with precision 0.1, between (-192.2, 192.2]
*/
function to2ANsigned(n){
    return to2AN(parseFloat(n)+192.1);
}

/*
Returns a character between A-Z, a-z, or 0-9 when given an integer between [0, 62).
*/
function toAN(code){
    return String.fromCharCode((
        (n) => {
            if(n>51) return code-4;
            if(n>25) return code+71;
            return code+65;
        }
    )(parseInt(code)));
}

/*
Returns a character between A-Z, if a number is an integer, or a-z, otherwise (assumed ending in .5).
*/
function toANhalf(code){
    code = parseFloat(code);
    return String.fromCharCode(65 + Math.trunc(code) + (code%1>0 ? 32 : 0));
}




/*
From a code, generate vehicle properties
*/
function readCode(code){
    const splitcodes = code.split(":");
    return {
        'wheels': readWheelCode(splitcodes[0]),
        'tires': readTireCode(splitcodes[1])
    }
}

function readWheelCode(code){
    return null;
}

function readTireCode(code){
    return null;
}


export { getCode, readCode };