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
        <h2><button @click="toggle" type="button"><span>{{ 
            prompt
        }}</span><img class="right" :src="'/assets/'+(isToggled() ? 'up' : 'down')+'_chevron.svg'" /></button></h2>
    </p>
    <p>
        <div :style="'display: '+(isToggled() ? 'default' : 'none')+';'">
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
</style>