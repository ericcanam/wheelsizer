<script setup>
    const props = defineProps({
        title:{
            type: String,
            default: ""
        }
    });
</script>

<template>
    <div class="errorbox">
        <component :is="props.title=='' ? 'span' : 'div'" class="errorline"><!--<img src="/assets/error.svg" />-->Note: {{ title }}</component>
        <component :is="props.title=='' ? 'span' : 'div'">
            <slot />
        </component>
    </div>
</template>