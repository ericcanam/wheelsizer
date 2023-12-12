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
    <MultiPartText :inputdefs="[{name: inprefix+'_holes', type:'number', step: 1, min: 3, max: 10, placeholder: 'Holes', length:3, errName: 'Number of bolt holes'},
                                    {name: inprefix+'_pcd', type:'number', step: 0.1, min: 0, max: 275, placeholder: 'PCD', length:5, errName: 'Pitch circle diameter (millimeters)'}]"
        struct="_&times;_mm"
        :acprefix="acprefix"
        v-model="mv"
        :autofocus="autofocus"
        @input="$emit('update:modelValue', mv)"
        ref="field">
        <slot />
    </MultiPartText>
</template>