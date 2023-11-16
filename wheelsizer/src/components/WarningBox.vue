<script setup>
    const props = defineProps({
        title:{
            type: String,
            default: ''
        }
    });
</script>

<template>
    <div class="warningbox">
        <component :is="props.title=='' ? 'span' : 'div'" class="warningline"><!--<img src="/assets/info.svg" />-->Warning: {{ title }}</component>
        <component :is="props.title=='' ? 'span' : 'div'">
            <slot />
        </component>
    </div>
</template>