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
    <MultiPartText :inputdefs="[{name: inprefix+'_tread', type:'number', step: 5, min: 5, length:3, errName: 'Tire tread width'},
                                {name: inprefix+'_ratio', type:'number', step: 5, min: 5, length:3, errName: 'Tire sidewall ratio'},
                                {name: inprefix+'_diam', type:'number', step: 0.5, min: 5, length:3, errName: 'Wheel diameter'}]" struct="_/_R_"
        v-model="mv"
        @input="$emit('update:modelValue', mv)"
        ref="field" />
       
</template>