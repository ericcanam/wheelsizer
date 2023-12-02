<script setup>
    import { ref } from 'vue';
    import MultiPartText from '../MultiPartText.vue';

    const props = defineProps({
        inprefix:{
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
    <MultiPartText :inputdefs="[{name: inprefix+'_diameter', type:'number', step: 0.5, min: 5, max: 30, placeholder: 'Diameter', length:5, errName: 'Wheel diameter (inches)'},
                                    {name: inprefix+'_width', type:'number', step: 0.5, min: 2.5, max: 22.5, placeholder: 'Width', length:5, errName: 'Wheel width (inches)'}]"
        struct="_&times;_"
        :acprefix="acprefix"
        v-model="mv"
        :autofocus="autofocus"
        @input="$emit('update:modelValue', mv)"
        ref="field">
        <slot />
    </MultiPartText>
</template>