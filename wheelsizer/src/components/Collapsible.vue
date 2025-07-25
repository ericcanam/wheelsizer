<script setup>
	import { ref, watch } from 'vue';

    const props = defineProps({
        prompt:{
            type: String,
            default: ""
        },
        displayDefault:{
            type: Boolean,
            default: false
        }
    });

    const inpname = props.prompt.replace(/[^a-z0-9A-Z]/, "");
    var toggled = ref(props.displayDefault? 'on' : 'off');

    function toggle(){
        toggled.value = inputfield.value.value=='on' ? 'off' : 'on';
    }

    function isToggled(){
        return toggled.value=='on';
    }

    var inputfield = ref();
    watch(inputfield, (target) => {
        toggled.value = target.value;
    });

    defineExpose({
        isToggled
    });
</script>

<template>
    <p>
        <input type="hidden" :name=inpname ref="inputfield" v-model="toggled" />
        <h2><button @click="toggle" type="button" :aria-label="'Click to expand '+prompt"><span>{{ 
            prompt
        }}<!--<div class="headingsub">Click to {{
            isToggled() ? 'Collapse' : 'Expand'
        }}</div>--></span><img class="right" :src="'./assets/'+(isToggled() ? 'up' : 'down')+'_chevron.svg'" /></button></h2>
    </p>
    <p :class="'collapsible' + (isToggled() ? ' expanded' : '')">
        <div style="overflow: hidden;">
            <slot />
        </div>
    </p>
</template>

<style>
    h2 button {
        font-family: inherit;
        font-weight: inherit;
        background-color: transparent;
    }
    h2 button img {
        height: 12pt;
    }

    /* https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/ */
    .collapsible {
        display: grid;
        grid-template-rows: 0fr;
        visibility: collapse;
        transition: grid-template-rows 0.5s ease-out, visibility 0s linear 0.5s;
    }
    .collapsible.expanded {
        grid-template-rows: 1fr;
        visibility: initial;
        transition: grid-template-rows 0.5s ease-out, visibility 0s linear;
    }
    
</style>