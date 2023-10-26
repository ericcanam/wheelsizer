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

    defineEmits(['update:modelValue']);
</script>

<template>
    <div class="textfield">
        <input 
            ref = "inputElement"
            :name="inputname"
            :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            :style="'width: '+(length*12)+'pt;'"
            :type="type" :placeholder="placeholder"
            :step="step" :max="max" :min="min" />
        <div class="errorline" ref="errorLine"></div>
    </div>
</template>

<style scoped>
    input {
        padding: 6pt;
    }
    div.textfield{
        display:inline-block;
        vertical-align: middle;
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100% - 12pt);
    }
    button {
        margin-left: 2pt;
        margin-right: 2pt;
    }
</style>