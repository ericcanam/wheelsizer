<script setup>
    const props = defineProps({
        title:{
            type: String,
            default: ""
        }
    });
</script>

<template>
    <div class="infobox">
        <component :is="props.title=='' ? 'span' : 'div'" class="infoline"><!--<img src="/assets/info.svg" />-->Note: {{ title }}</component>
        <component :is="props.title=='' ? 'span' : 'div'">
            <slot />
        </component>
    </div>
</template>