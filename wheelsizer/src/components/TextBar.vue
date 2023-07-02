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
        disabled:{
            type:Boolean,
            default:false
        },
        placeholder:{
            type:String,
            default:null
        }
    });

    const inputElement = ref();

    function value(){
        return inputElement.value;
    }

    function setError(status){
        if(status){
            inputElement.value.classList.add("errorlight");
        }else{
            inputElement.value.classList.remove("errorlight");
        }
    }

    defineEmits(['valChange']);

    defineExpose({
        value,
        setError
    });
</script>

<template>
    <div class="textfield">
        <input @change="$emit('valChange', $event.target.value)"
            ref = "inputElement"
            :name="inputname"
            :style="'width: '+(length*12)+'pt;'"
            type="text" :placeholder="placeholder" />
    </div>
</template>

<style scoped>
    
</style>