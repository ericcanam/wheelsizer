<script setup>
    defineProps(['ad']);

    function validate(){
        return false;
    }

    defineExpose({
        validate
    })
</script>

<template>
    <h2>Give your car a name:</h2>
    <input name="cartitle"
        type="text" placeholder="The Shitbox" />
</template>

<style scope>

</style>