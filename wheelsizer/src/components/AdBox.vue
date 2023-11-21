<script setup>
    const props = defineProps({
        title:{
            type: String,
            default: ""
        }
    });
</script>

<template>
    <div class="adbox">
        <div>
            <slot />
        </div>
        <div class="adline">ADVERTISEMENT</div>
    </div>
</template>

<style>
    .adbox{
        padding: 2pt;
    }

    .adline {
        text-align: center;
        color: var(--color-accent3);
    }
</style>