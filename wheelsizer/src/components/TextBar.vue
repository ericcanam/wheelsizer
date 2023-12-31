<script setup>
    import { ref, watch } from 'vue';

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
    
    if(props.autofocus){
        watch(inputElement, () => {
            inputElement.value.focus();
        });
    }
</script>

<template>
    <div class="textfieldcontainer">
        <slot />
        <div class="textfield">
            <button v-if="type=='number' && showControls" tabindex="-1" type="button" class="nofocus"
                @click="change(nstep)"><img :alt="'+'+nstep" src="/assets/up_chevron.svg" /></button><div class="inputbox">
                <input 
                    ref = "inputElement"
                    :name="inputname"
                    :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"
                    :type="type" :placeholder="placeholder"
                    :step="step" :max="max" :min="min"
                    :aria-label="props.acprefix+' '+props.errName"
                    :aria-describedby="'errorline_'+inputname"
                    :style="'width: '+(length*20)+'px;'"
                    autocomplete="off" />
            </div><button v-if="type=='number' && showControls" tabindex="-1" type="button" class="nofocus"
                @click="change(-nstep)"><img :alt="'-'+nstep" src="/assets/down_chevron.svg" /></button>
        </div>
        <div class="errorline" ref="errorLine" :id="'errorline_'+inputname" role="alert"></div>
    </div>
</template>

<style>
    div.textfieldcontainer {
        display: inline-block;
        margin-left: auto;
        margin-right: auto;
        max-width: 100%;
    }
    div.textfield button {
        padding: 6pt;
        margin: 0pt;
	    background-color: transparent;
        cursor: pointer;
    }
    div.textfield input {
        margin-left: 4pt;
        margin-right: 4pt;
        max-width: calc(100% - 20pt);
    }
    div.textfield{
        display:inline-block;
        vertical-align: middle;
        max-width: 100%;
    }
</style>