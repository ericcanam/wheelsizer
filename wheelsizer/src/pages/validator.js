/*
For fields that are optional, but must be correctly formatted if they are specified
*/
function optional(field, func){
    return isEmpty(field, false) || func(field);
}
function allOptional(field, func){
    return allEmpty(field, false) || func(field);
}

/*
For multi-field text inputs
*/
function allEmpty(field, setError = true){
    let vals = field.value.getValues();
    let empty = true;
    for(const formval in vals){
        let nvy = vals[formval];
        if(nvy.validity.badInput || nvy.value.trim().length>0){
            empty = false;
        }
    }
    if(empty && setError){
        // TODO: implement this
    }
    return empty;
}
/*
For single-field text inputs
*/
function isEmpty(field, setError = true){
    let val = field.value.getValue();
    const err = !val.validity.badInput && val.value.trim().length<1;
    if(err && setError){
        field.value.setError(val.errName+' should not be empty.');
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
        }else if(validity.stepMismatch){
            field.value.setError(vals[formval].errName+" should be a multiple of "+vals[formval].step+".", formval);
            err = true;
            continue;
        }else if(validity.rangeOverflow){
            field.value.setError(vals[formval].errName+" should be no more than "+vals[formval].max+".", formval);
            err = true;
            continue;
        }else if(validity.rangeUnderflow){
            field.value.setError(vals[formval].errName+" should be no less than "+vals[formval].min+".", formval);
            err = true;
            continue;
        }
        if(nv==""){
            field.value.setError("", formval);
            err = true;
            continue;
        }
    }
    return !err;
}

/*
For single-field text inputs
*/
function isNumeric(field){
    let val = field.value.getValue();
    let nv = val.value;
    let validity = val.validity;
    if(validity.badInput){
        field.value.setError(val.errName+" should be a decimal number.");
        return false;
    }else if(validity.stepMismatch){
        field.value.setError(val.errName+" should be a multiple of "+val.step+".");
        return false;
    }else if(validity.rangeOverflow){
        field.value.setError(val.errName+" should be no more than "+val.max+".");
        return false;
    }else if(validity.rangeUnderflow){
        field.value.setError(val.errName+" should be no less than "+val.min+".");
        return false;
    }
    if(nv==""){
        field.value.setError("");
        return false;
    }
    return true;
}


export { optional, allOptional, isEmpty, allNumeric, isNumeric };