<script setup>
    import { ref } from 'vue';

    const props = defineProps({
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
        }
    });

    const inputElement = ref();
    const errorLine = ref();

    function getValue(){
        return {value: inputElement.value.value, validity: inputElement.value.validity};
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
</script>

<template>
    <div class="textfield">
        <input 
            ref = "inputElement"
            :name="inputname"
            :style="'width: '+(length*12)+'pt;'"
            :type="type" :placeholder="placeholder"
            step="any" />
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