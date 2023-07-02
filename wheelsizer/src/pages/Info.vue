<script setup>
    import { ref } from 'vue';

    import TextBar from '../components/TextBar.vue';

    import { assertNotEmpty } from './validator.js';

    defineProps(['ad']);

    const fields = {
        cartitle: ref()
    };

    function validate(d){
        return assertNotEmpty(d.cartitle, fields.cartitle);
    }

    defineExpose({
        validate
    })
</script>

<template>
    <h2>Give your car a name:</h2>
    <TextBar inputname="cartitle" :ref="fields.cartitle" :length=20
        placeholder="The Shitbox" />
</template>

<style scope>

</style>