import { readCode } from './codes.js';

/*
Saves a car to cookies
*/
function saveCar(name, code){
    // set expiration date (~2 years)
    const d = new Date();
    d.setTime(d.getTime() + (730 * 24*60*60*1000));
    let expiry = "expires=" + d.toUTCString();

    let path = "path=/";

    document.cookie = name+"="+code+";" +
        expiry + ";" + path + ";SameSite=Strict;";

    console.log(document.cookie);
}

function deleteCar(name){
    saveCar(name, "");
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
        car_list[kva[0]] = readCode(kva[1]);
    }
    return car_list;
}

function writeCarToAppData(name, ad){

}

export { saveCar, deleteCar, getCarList, writeCarToAppData };