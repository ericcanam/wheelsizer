const WHEELTIRE_SEP = ":";

const MIN_WHEEL_WIDTH = 2.5;
const MIN_WHEEL_DIAMETER = 5;
const MIN_HOLES = 3;
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
        let whcode = parseInt(properties.wheels.holes)-MIN_HOLES;
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

    // tire stuff
    if(properties.tires != null){
        // wheel/tire seperator
        code += WHEELTIRE_SEP;

        // tire section
        let tscode = (parseInt(properties.tires.section) - MIN_TIRE_SECTION) / 10;
        code += toAN(tscode);

        // tire sidewall
        let swcode = parseInt(properties.tires.ratio)/5;
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
function from2AN(code){
    return (fromAN(code.charAt(0))*62 + fromAN(code.charAt(1)))/10;
}

/*
Returns two characters each between A-Z, a-z, or 0-9 when given a float with precision 0.1, between (-192.2, 192.2]
*/
function to2ANsigned(n){
    return to2AN((10*(parseFloat(n))+1921)/10);
}
function from2ANsigned(code){
    return (Math.round((from2AN(code)*10))-1921)/10;
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
function fromAN(code){
    code = code.charCodeAt(0);
    if(code>96) return code-71;
    if(code>64) return code-65;
    return code+4;
}

/*
Returns a character between A-Z, if a number is an integer, or a-z, otherwise (assumed ending in .5).
*/
function toANhalf(n){
    n = parseFloat(n);
    return String.fromCharCode(65 + Math.trunc(n) + (n%1>0 ? 32 : 0));
}
function fromANhalf(n){
    if(n>96) return n-96.5;
    return n-65;
}




/*
From a code, generate vehicle properties
*/
function readCode(code){
    const splitcodes = code.split(":");
    // wheel is not omitted, and diameter coding character has been left out of the tire
    if(splitcodes[0] && splitcodes[1]){
        splitcodes[1] = splitcodes[1].substr(0,2)+splitcodes[0][3];
    }
    var setup = {
        'wheels': readWheelCode(splitcodes[0]),
        'tires':  readTireCode(splitcodes[1])
    };
    return setup;
}

function readWheelCode(code){
    if(!code) return null;
    return {
        'width': fromANhalf(code.charCodeAt(4))+MIN_WHEEL_WIDTH,
        'offset': from2ANsigned(code.substr(5,2)),
        'diameter': fromANhalf(code.charCodeAt(3))+MIN_WHEEL_DIAMETER,
        'pcd': from2AN(code.substr(1,2)),
        'holes': parseInt(code.charAt(0))+MIN_HOLES,
        'bore': from2AN(code.substr(7,2))
    };
}

function readTireCode(code){
    if(!code) return null;
    return {
        'section': fromAN(code.charAt(0))*10+MIN_TIRE_SECTION,
        'ratio': fromAN(code.charAt(1))*5,
        'diameter': fromANhalf(code.charCodeAt(2))+MIN_WHEEL_DIAMETER
    };
}


export { getCode, readCode };