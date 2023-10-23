
/*
For single-field text inputs
*/
function isEmpty(field){
    const err = field.value.getValue().value.trim().length<1;
    if(err){
        field.value.setError("");
    }
    return err;
}

/*
For multi-field text inputs
*/
function allNumeric(field){
    // check that all sub-fields are numeric and non-empty
    let vals = field.value.getValues();
    let err = false;
    for(const formval in vals){
        let nv = vals[formval].value;
        let validity = vals[formval].validity;
        if(validity.badInput){
            field.value.setError(vals[formval].errName+" should be a decimal number.", formval);
            err = true;
            continue;
        }
        if(nv==""){
            field.value.setError("", formval);
            err = true;
            continue;
        }
        if(nv<=0){
            field.value.setError(vals[formval].errName+" should be greater than zero.", formval);
            err = true;
            continue;
        }
    }
    return !err;
}

function isNumeric(field){
    let val = field.value.getValue();
    let nv = val.value;
    let validity = val.validity;
    if(validity.badInput){
        field.value.setError("This field should be a decimal number.");
        return false;
    }
    if(nv==""){
        field.value.setError("");
        return false;
    }
    if(nv<=0){
        field.value.setError("This should be greater than zero.");
        return false;
    }
    return true;
}


export { isEmpty, allNumeric, isNumeric };