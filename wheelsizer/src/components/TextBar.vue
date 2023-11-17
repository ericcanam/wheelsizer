<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        modelValue:{},
        inputname:{
            type: String,
            required: true
        },
        length:{
            type: Number,
            required: true
        },
        placeholder:{
            type:String,
            default:''
        },
        type:{
            type:String,
            default:"text"
        },
        step:{
            default: 'any'
        },
        min:{
            default: ''
        },
        max:{
            default: ''
        },
        showControls:{
            type: Boolean,
            default: false
        },
        errName:{
            type: String,
            default: 'This field'
        }
    });

    const inputElement = ref();
    const errorLine = ref();

    function getValue(){
        return {value: inputElement.value.value, validity: inputElement.value.validity, min: props.min, max: props.max, step: props.step, errName: props.errName};
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

    defineExpose({
        getValue,
        setError,
        unsetError
    });

    const nstep = (props.step=='any' ? 1 : props.step);
    const nmin = (props.min=='' ? -Infinity : props.min);
    const nmax = (props.max=='' ? Infinity : props.max)
    function change(n){
        let cv = Math.round((parseFloat(inputElement.value.value) || 0)/nstep)*nstep;
        inputElement.value.value = Math.min(Math.max(cv+n, nmin), nmax);
        emits('update:modelValue', inputElement.value.value);
    }

    const emits = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="textfield">
        <button v-if="type=='number' && showControls" tabindex="-1" type="button" class="nofocus"
            @click="change(nstep)"><img :alt="'+'+nstep" src="/assets/up_chevron.svg" /></button><div class="inputbox">
            <input 
                ref = "inputElement"
                :name="inputname"
                :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"
                :style="'width: '+(length*12)+'pt;'"
                :type="type" :placeholder="placeholder"
                :step="step" :max="max" :min="min" />
        </div><button v-if="type=='number' && showControls" tabindex="-1" type="button" class="nofocus"
            @click="change(-nstep)"><img :alt="'-'+nstep" src="/assets/down_chevron.svg" /></button>
        <div class="errorline" ref="errorLine"></div>
    </div>
</template>

<style>
    div.textfield button {
        padding: 6pt;
        margin: 0pt;
	    background-color: transparent;
        cursor: pointer;
    }
    div.textfield input {
        margin-left: 4pt;
        margin-right: 4pt;
    }
    div.textfield{
        display:inline-block;
        vertical-align: middle;
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100% - 12pt);
    }
</style>