
function assertNotEmpty(value, field){
    var isError = value.length<1;
    field.value.setError(isError);
    return !isError;
}

export { assertNotEmpty };