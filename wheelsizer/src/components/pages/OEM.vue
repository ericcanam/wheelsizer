<script setup>
    import OptionToggle from '../OptionToggle.vue';
    defineProps(['ad']);

    function validate(){
        return false;
    }

    defineExpose({
        validate
    })
</script>

<template>
    <h2>Is your setup staggered?</h2>
    <p>That is to say, are your front tires different from your rear tires?</p>
    <OptionToggle inputname="staggered" :options="['Yes', 'No']" defaultoption="No" />

    
</template>

<style scope>

</style>