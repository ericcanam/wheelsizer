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

    var nstep = (props.step=='any' ? 1 : parseInt(props.step));
    function change(n){
        let cv = parseFloat(inputElement.value.value) || 0;
        inputElement.value.value = cv+n}

    defineEmits(['update:modelValue']);
</script>

<template>
    <div class="textfield">
        <div class="inputbox">
            <input v-if="type=='number' && showControls" tabindex="-1" type="button" value="-" @click="change(-nstep)" /><!--
            --><input 
                ref = "inputElement"
                :name="inputname"
                :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"
                :style="'width: '+(length*12)+'pt;'"
                :type="type" :placeholder="placeholder"
                :step="step" :max="max" :min="min" /><!--
            --><input v-if="type=='number' && showControls" tabindex="-1" type="button" value="+" @click="change(nstep)" />
        </div>
        <div class="errorline" ref="errorLine"></div>
    </div>
</template>

<style>
    div.inputbox input {
        padding: 6pt;
	    background-color: transparent;
    }
    div.inputbox{
        background-color: var(--color-backshade);
        border-radius: 8pt;
    }
    div.textfield{
        display:inline-block;
        vertical-align: middle;
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100% - 12pt);
    }
</style>