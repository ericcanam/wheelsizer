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
    
    document.cookie = name+"="+cookie_string+";" +
        expiry + ";" + path + ";SameSite=Strict;";

    console.log(document.cookie);
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
        if(!kva[1].length){
            continue;
        }
        // convert from code to object
        car_list[kva[0]] = decompileCar(kva[1]);
    }
    return car_list;
}

const front_axle_prefix = "of_";
const rear_axle_prefix = "or_";
const axle_field_names = [
    "width",
    "diameter",
    "offset",
    "holes",
    "pcd",
    "cb",
    "diam",
    "section",
    "ratio"
];
const staggered = "staggered";
const other_vars = [
    "cartitle",
    "drivewheels"
];
const optional_vars = [
    "wheelbase"
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