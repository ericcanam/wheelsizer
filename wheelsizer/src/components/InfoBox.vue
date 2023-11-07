<script setup>
    const props = defineProps({
        title:{
            type: String,
            required: true
        }
    });
</script>

<template>
    <div class="infobox">
        <div class="infoline">Note: {{ title }}</div>
        <div>
            <slot />
        </div>
    </div>
</template>