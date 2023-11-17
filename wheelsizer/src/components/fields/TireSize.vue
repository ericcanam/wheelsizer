<script setup>
    import { ref } from 'vue';
    import MultiPartText from '../MultiPartText.vue';

    const props = defineProps({
        inprefix:{
            type: String,
            required: true
        },
        modelValue:{}
    });

    function getValues(){
        return field.value.getValues();
    }

    function setError(status, problemField){
        field.value.setError(status, problemField);
    }
    function unsetError(){
        field.value.unsetError();
    }

    var field = ref();
    var mv = ref();

    defineExpose({
        getValues,
        setError,
        unsetError
    });

    defineEmits(['update:modelValue']);
</script>

<template>
    <MultiPartText :inputdefs="[{name: inprefix+'_section', type:'number', step: 5, min: 95, max: 605, length:3, errName: 'Tire section width'},
                                {name: inprefix+'_ratio', type:'number', step: 5, min: 20, max: 95, length:3, errName: 'Tire sidewall ratio'},
                                {name: inprefix+'_diam', type:'number', step: 0.5, min: 5, max: 30, length:3, errName: 'Wheel diameter'}]" struct="_/_R_"
        v-model="mv"
        @input="$emit('update:modelValue', mv)"
        ref="field" />
       
</template>