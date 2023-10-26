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
    <MultiPartText :inputdefs="[{name: inprefix+'_diameter', type:'number', step: 0.5, min: 5, placeholder: 'Diameter', length:5, errName: 'Wheel diameter'},
                                    {name: inprefix+'_width', type:'number', step: 0.5, min: 1, placeholder: 'Width', length:5, errName: 'Wheel width'}]" struct="_&times;_"
        v-model="mv"
        @input="$emit('update:modelValue', mv)"
        ref="field" />
</template>