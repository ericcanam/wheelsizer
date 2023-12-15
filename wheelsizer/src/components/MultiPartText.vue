<script setup>
    import { ref, watch } from 'vue';

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
        },
        acprefix:{
            type: String,
            default: ''
        },
        autofocus: {
            type: Boolean,
            default: false
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
            errorLine: ref(),
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
        // set error text
        let errorLine = Object.assign({}, inputlist[problemField].errorLine.value)[0];
        if(errorLine.innerHTML != ""){
            errorLine.innerHTML += "<br />";
        }
        errorLine.innerHTML += status;
    }
    function unsetError(){
        inputElement.value.classList.remove("errorlight");
        for(const field in inputlist){
            // remove red error highlight
            let inputfield = Object.assign({}, inputlist[field].refer.value)[0];
            inputfield.classList.remove("errorlight");

            // unset text
            let errorLine = Object.assign({}, inputlist[field].errorLine.value)[0];
            errorLine.innerHTML = "";
        }
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

    if(props.autofocus){
        watch(inputlist[props.inputdefs[0].name].refer, () => {
            Object.assign({}, inputlist[props.inputdefs[0].name].refer.value)[0].focus();
        });
    }
    
</script>

<template>
    <div class="multitextcontainer">
        <slot /><!-- slot for LABEL -->
        <div ref="inputElement" class="multitextfield" style="display:inherit;">
            <span v-for="(inp, name, index) in inputlist">
                {{ inp.prepend }}
                <input :ref="inp.refer"
                @input="$emit('update:modelValue', getEmits());"
                :name="name" :type="inp.type" :placeholder="inp.placeholder" :style="'width: '+(inp.length*12)+'pt;'" :step="inp.step" :min="inp.min" :max="inp.max"
                :aria-label="props.acprefix+' '+inp.errName"
                :aria-labelledby="'errorline_'+name"
                autocomplete="off"
                :value="modelValue ? modelValue[name] : ''"
                 />
                {{ inp.appendix }}
            </span>
        </div>
        <div v-for="(inp, name, index) in inputlist" class="errorline" :id="'errorline_'+name" :ref="inp.errorLine" role="alert"></div>
    </div>
</template>

<style>
    div.multitextcontainer input {
        padding: 4pt;
    }
    div.multitextcontainer {
        display:inline-block;
        vertical-align: middle;
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100% - 12pt);
    }

    @media (prefers-color-scheme: light) {
        div.multitextfield {
            color: var(--color-text-light);
        }
    }
</style>