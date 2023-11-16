<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        modelValue:{},
        inputdefs:{
            type: Array,
            required: true
        },
        struct:{ /*
                For example, ISO tire size: _/_R_
            */
            type: String,
            required: true
        }
    });
    
    var c = 0;
    var inputlist = {};
    var nus;

    // set uplist of fields from given format
    for(var inpn = 0; inpn<props.inputdefs.length; inpn++) {
        let inpo = props.inputdefs[inpn];
        // search for next underscore
        nus = props.struct.indexOf("_", c);

        // extract string
        inputlist[inpo.name]={
            refer: ref(),
            type: inpo.type,
            placeholder: ('placeholder' in inpo ? inpo.placeholder : ''),
            errName: inpo.errName,
            length: ('length' in inpo ? inpo.length : 8),
            step: ('step' in inpo ? inpo.step : 'any'),
            min: ('min' in inpo ? inpo.min : ''),
            max: ('max' in inpo ? inpo.max : ''),
            prepend: props.struct.substring(c, nus),
            appendix: (inpn<props.inputdefs.length-1 ? '' : props.struct.substring(nus+1))
        };
        c = nus+1;
    }

    const inputElement = ref();
    const errorLine = ref();

    function getValues(){
        let vals = {};
        for(const field in inputlist){
            let inputfield = Object.assign({}, inputlist[field].refer.value)[0];
            vals[field] = {value: inputfield.value, validity: inputfield.validity,
                step: inputfield.step, min: inputfield.min, max: inputfield.max,
                errName: inputlist[field].errName};
        }
        return vals;
    }

    function setError(status, problemField){
        if(problemField===undefined){
            inputElement.value.classList.add("errorlight");
        }else{
            let inputfield = Object.assign({}, inputlist[problemField].refer.value)[0];
            inputfield.classList.add("errorlight");
        }
        if(errorLine.value.innerHTML != ""){
            errorLine.value.innerHTML += "<br />";
        }
        errorLine.value.innerHTML += status;
    }
    function unsetError(){
        inputElement.value.classList.remove("errorlight");
        for(const field in inputlist){
            let inputfield = Object.assign({}, inputlist[field].refer.value)[0];
            inputfield.classList.remove("errorlight");
        }
        errorLine.value.innerHTML = "";
    }

    defineExpose({
        getValues,
        setError,
        unsetError
    });

    let locked = ref(false);

    defineEmits(['update:modelValue']);
    function getEmits(){
        let vals = {};
        for(const field in inputlist){
            vals[field] = Object.assign({}, inputlist[field].refer.value)[0].value;
        }
        return vals;
    }
</script>

<template>
    <div class="multitextcontainer">
        <div ref="inputElement" class="multitextfield" style="display:inherit;">
            <span v-for="(inp, name) in inputlist">
                {{ inp.prepend }}
                <input :ref="inp.refer"
                @input="$emit('update:modelValue', getEmits());"
                :name="name" :type="inp.type" :placeholder="inp.placeholder" :style="'width: '+(inp.length*12)+'pt;'" :step="inp.step" :min="inp.min" :max="inp.max"
                 />
                {{ inp.appendix }}
            </span>
        </div>
        <div class="errorline" ref="errorLine"></div>
    </div>
</template>

<style scoped>
    input {
        padding: 4pt;
    }
    div.multitextcontainer {
        display:inline-block;
        vertical-align: middle;
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100% - 12pt);
    }
</style>