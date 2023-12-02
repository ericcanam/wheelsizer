<script setup>
    import { ref, watch } from 'vue';
    
    const props = defineProps({
        modelValue:{},
        inputname:{
            type: String,
            required: true
        },
        options:{
            type:Array,
            required: true
        },
        disabled:{
            type:Boolean,
            default:false
        },
        defaultoption:{
            type:String,
            default:null
        },
        linesep:{
            type:Boolean,
            default:false
        },
        autofocus:{
            type: Boolean,
            default: false
        }
    });

    const errorLine = ref();
    const inputElement = ref();

    var radiorefs = {};
    for(let option of props.options){
        radiorefs[option] = ref();
    }

    function focusBox(){ inputElement.value.classList.add('hasfocus'); }
    function unfocusBox(event){
        //if(!inputElement.value.contains(event.relatedTarget)){
            inputElement.value.classList.remove('hasfocus');
        //}
    }

    function setError(status){
        inputElement.value.classList.add("errorlight");
        if(errorLine.value.innerHTML != ""){
            errorLine.value.innerHTML += "<br />";
        }
        errorLine.value.innerHTML += status;
    }
    function unsetError(){
        inputElement.value.classList.remove("errorlight");
        errorLine.value.innerHTML = "";
    }

    function getValue(){
        return selected.value;
    }

    defineExpose({
        setError,
        unsetError,
        getValue
    });

    const emit = defineEmits(['update:modelValue']);
    const selected = ref(props.defaultoption===null ? props.modelValue : props.defaultoption);
    if(props.defaultoption===undefined){
        emit('update:modelValue', props.defaultoption);
    }/*else{
        console.log(props.modelValue);
        emit('update:modelValue', props.modelValue);
    }*/

    if(props.autofocus){
        watch(radiorefs[props.modelValue || props.defaultOption], () => {
            Object.assign({}, radiorefs[props.modelValue || props.defaultoption].value)[0].focus();
        });
    }
</script>

<template>
    <div class="optionscontainer"><fieldset>
        <legend><slot /></legend>
        <div ref="inputElement" class="optionslider">
            <div :class="'optwrap' + (linesep ? ' lineopt' : '')" v-for="option in options">
                <input type="radio"
                    @focus = "focusBox"
                    @blur  = "unfocusBox"
                    @input="$emit('update:modelValue', $event.target.value)"
                    :id = "inputname+'_'+option"
                    :value="option"
                    :name="inputname"
                    v-model="selected"
                    :ref="radiorefs[option]"
                    :checked="option==defaultoption || option==modelValue" />
                <label :for="inputname+'_'+option"><div class="opt">
                    {{ option }}
                </div></label>
            </div>
        </div>
        <legend><div class="errorline" ref="errorLine" :id="'errorline_'+inputname"></div></legend>
    </fieldset></div>
</template>

<style>
    div.optionslider {
        display: inline-block;
        padding: 4pt;
        background-color: var(--color-backshade);
        border-radius: 8pt;
    }
    div.optwrap {
        display: inline-block;
    }
    div.lineopt {
        display: block;
    }
    label {
        cursor: pointer;
    }
    div.opt {
        border-radius: 4pt;
        padding: 4pt;
        padding-left: 12pt;
        padding-right:12pt;
    }
    input:checked + label div.opt {
        background-color: var(--color-accent1);
        color: var(--color-text);
	    outline: 2pt solid transparent;
    }
    fieldset {
        padding: 0;
        border: none;
    }
    legend {
        display: block;
        max-width: 100%;
        margin: auto;
        padding-bottom: 6pt;
    }
</style>