
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


export { isEmpty, allNumeric, isNumeric };