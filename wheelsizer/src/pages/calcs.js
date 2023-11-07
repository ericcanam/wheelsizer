const INCH = 25.4;

// rounds to 2 decimal places and adds delimiting commas for 1,000...
function niceNumber(n){
    return parseFloat(n.toFixed(2)).toLocaleString('en-US');
}

// formats number with niceNumber and adds + or - to the front
function fpm(n){
    let nn = niceNumber(n);
    return (nn>0 ? '+' : '')+nn;
}

// compares two arrays for equality
function areq(ar1, ar2){
    return ar1.length === ar2.length &&
    ar1.every((element, index) => element === ar2[index]);
}




// returns circumference of tire in millimeters
function tireCircumf(wdiam, ratio, section){
    return tireHeight(wdiam, ratio, section)*Math.PI;
}
// returns height of the TIRE in millimeters
function tireHeight(wdiam, ratio, section){
    return (wdiam*INCH)+((ratio/50)*section);
}

// for calculating the standard measuring rim (ISO 4000-1)
function k2(ratio){
    if(ratio>=75){
        return 0.7;
    }else if(ratio>=60){
        return 0.75;
    }else if(ratio>=50){
        return 0.8;
    }else if(ratio>=45){
        return 0.85;
    }else if(ratio>=30){
        return 0.9;
    }else /*if(ratio>=20)*/{
        return 0.92;
    }
}

// for calculating allowable rim extremities for tires with sidewall ratio 30 and lower
function measuringRim(section, ratio){
    return Math.round(k2(ratio) * section * 2)/2;
}

// gets minimum/maximum allowable rim width for the specified tire
function getWheels(section, ratio){
    if(ratio<=30){
        let mr = measuringRim(section, ratio);
        return [mr-0.5, mr+0.5];
    }
    let coeff;
    if(ratio<=40){
        coeff = [0.85, 1];
    }else if(ratio<=45){
        coeff = [0.8, 0.95];
    }else if(ratio<=65){
        coeff = [0.7, 0.9];
    }else /*if(ratio<=95)*/{
        coeff = [0.65, 0.85];
    }
    coeff[0] = Math.round(2*coeff[0]*section/INCH)/2;
    coeff[1] = Math.round(2*coeff[1]*section/INCH)/2;
    return coeff;
}

// calculates portion of wheel OUTWARDS from mount face
function getRimPoke(width, offset){
    return width*INCH/2 - offset;
}
// calculates portion of wheel INWARDS from mount face
function getRimInset(width, offset){
    return getRimPoke(width, -offset);
}
// calculate poke difference between new and old setup (positive value means MORE outward)
function getPokeDiff(new_width, new_offset, old_width, old_offset){
    return getRimPoke(new_width, new_offset) - getRimPoke(old_width, old_offset);
}
// calculate inset difference between new and old setup (positive value means MORE inwards)
function getInsetDiff(new_width, new_offset, old_width, old_offset){
    return getRimInset(new_width, new_offset) - getRimInset(old_width, old_offset);
}




function getTires(width, diameter){

}

export { niceNumber, fpm, areq, tireCircumf, tireHeight, getWheels, getPokeDiff, getInsetDiff };