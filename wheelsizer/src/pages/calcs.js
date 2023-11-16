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

// gets minimum/maximum allowable rim width for the specified tire (ISO-4000-1)
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
// gets max/min specified section per ISO 4000-1
function maxminsect(ratio){
    if(ratio<=20){
        return [385, 605];
    }else if(ratio<=25){
        return [305, 485];
    }else if(ratio<=30){
        return [185, 395];
    }else if(ratio<=40){
        return [165, 395];
    }else if(ratio<=45){
        return [155, 365];
    }else if(ratio<=55){
        return [125, 345];
    }else if(ratio<=65){
        return [105, 345];
    }else if(ratio<=70){
        return [95, 285];
    }else /*if(ratio<=95)*/{
        return [95, 315];
    }
}

// returns TRUE if tire can fit on rim, FALSE otherwise
function isLegalTire(rim_width, section, ratio){
    let w = getWheels(section, ratio);
    return rim_width>=w[0] && rim_width<=w[1];
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

// get the sidewall that'll give the closest height to OEM given the OEM height, section and rim diameter
function getClosestSidewall(oem_height, new_section, new_rim){
    let sidewall_target = (oem_height - new_rim*INCH) / 2;
    return Math.round(sidewall_target/new_section*20)*5;
}

// get the +/- difference for a new tire
function getPctDiff(oemHeight, newHeight){
    return fpm((newHeight-oemHeight) / oemHeight * 100)+"%";
}

// returns legal sections and sidewall ratios
function getTireArray(width, diameter, target_height){
    width = parseFloat(width);

    // calc section range
    let lwr = Math.floor(((Math.min(width/0.65, width-0.5)*INCH/0.92)-5)/10)*10+5;
    let upr = Math.ceil((((width+0.5)*INCH/0.7)+5)/10)*10-5;

    let csw_arr = [];
    for(let section=lwr; section<upr+1; section+=10){
        // get closest sidewall to OEM height for each POTENTIALLY valid section width
        let csw = getClosestSidewall(target_height, section, diameter);
        // now work upwards (taller)
        let sidewall = csw;
        while(isLegalTire(width, section, sidewall) && sidewall<=95){
            let th = tireHeight(diameter, sidewall, section);
            csw_arr.push({th: Math.round(th*10)/10, section: section, ratio: sidewall});
            sidewall += 5;
        }
        // finally, work downwards
        sidewall = csw-5;
        while(isLegalTire(width, section, sidewall) && sidewall>=20){
            let th = tireHeight(diameter, sidewall, section);
            csw_arr.push({th: Math.round(th*10)/10, section: section, ratio: sidewall});
            sidewall -= 5;
        }
    }
    csw_arr.sort((a, b) => a.th - b.th);
    return csw_arr;
}
function getTireHeightArray(tireArray){
    let arr = [];
    for(var tire of tireArray){
        arr.push(tire.th);
    }
    return arr;
}

export { niceNumber, fpm, // formatting
    
    // tire stuff
    tireCircumf, tireHeight, isLegalTire,
    getClosestSidewall, getPctDiff, getTireArray, getTireHeightArray,
    
    // wheel stuff
    getWheels, getPokeDiff, getInsetDiff
};