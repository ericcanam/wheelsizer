const COOKIE_PROPERTY_SEP = "|";
const COOKIE_PROPERTY_ASSIGNMENT = ":";

const UNSAVED_STRING = "";

/*
Saves a car to cookies
*/
function writeCar(name, ad = null){
    // set expiration date (~2 years)
    const d = new Date();
    d.setTime(d.getTime() + (730 * 24*60*60*1000));
    let expiry = ad==null ? "Max-Age=0" : "expires=" + d.toUTCString();

    let path = "path=/";

    let cookie_string = ad==null ? "" : appDataToCookieString(ad);
    
    document.cookie = name.trim()+"="+cookie_string+";" +
        expiry + ";" + path + ";SameSite=Strict;";

}

function deleteCar(name){
    writeCar(name);
}

function getCarList(){
    // get key/value pairs (Car Name=CarCode;....)
    let kvps = document.cookie.split(";")
    let car_list = {};

    for(let kvp of kvps){
        let kva = kvp.split("=");
        // skip empty/deleted cookies
        if(!kva[1] || !kva[1].length){
            continue;
        }
        // convert from code to object
        let kvo = decompileCar(kva[1]);
        if(kvo.cartitle){
            // only a cookie relevant to us
            car_list[kva[0]] = kvo;
        }
    }
    return car_list;
}

const front_axle_prefix = "of_";
const rear_axle_prefix = "or_";
const axle_field_names = [
    "width",
    "diameter",
    "offset",
    "diam",
    "section",
    "ratio"
];
const staggered = "staggered";
const other_vars = [
    staggered,
    "cartitle",
    "drivewheels"
];
const optional_axle_vars = [
    "holes",
    "pcd",
    "cb"
];
const optional_vars = [
    "o_wheelbase"
];
function appDataToCookieString(ad){
    let properties = [...axle_field_names];
    // write front axle properties
    for(let i=0; i<properties.length; i++){
        properties[i] = front_axle_prefix+properties[i];
    }

    if(ad[staggered] == 'Yes'){
        // add rear axle properties as well (if staggered)
        let j = properties.length;
        properties.push(...axle_field_names);
        for(let i=j; i<properties.length; i++){
            properties[i] = rear_axle_prefix+properties[i];
        }
    }

    properties.push(...other_vars);

    // optional non-axle-specific variables:
    for(let o=0; o<optional_vars.length; o++){
        // check if this property is set
        if(ad[optional_vars[o]]){
            properties.push(optional_vars[o]);
        }
    }

    // optinal axle-specific variables:
    for(let o=0; o<optional_axle_vars.length; o++){
        // check if this property is set
        if(ad[front_axle_prefix+optional_axle_vars[o]]){
            // front
            properties.push(front_axle_prefix+optional_axle_vars[o]);
        }
        if(ad[rear_axle_prefix+optional_axle_vars[o]]){
            // rear
            properties.push(rear_axle_prefix+optional_axle_vars[o]);
        }
    }

    for(let p=0; p<properties.length; p++){
        // get property values
        properties[p] += COOKIE_PROPERTY_ASSIGNMENT + ad[properties[p]];
    }
    
    return properties.join(COOKIE_PROPERTY_SEP);
}

function decompileCar(property_strings){
    let properties = {};
    let kvps = property_strings.split(COOKIE_PROPERTY_SEP);
    for(let kvp of kvps){
        kvp = kvp.split(COOKIE_PROPERTY_ASSIGNMENT);
        properties[kvp[0]] = kvp[1];
    }

    return properties;
}

function getAppData(name, ad, car_list=null){
    if(car_list==null){
        car_list = decompileCar(name);
    }

    return {...ad.value, ...car_list, ...{savename: name}};
}

export { UNSAVED_STRING, writeCar, deleteCar, getCarList, getAppData };