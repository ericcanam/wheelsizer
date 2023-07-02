<script setup>

    defineProps(['title', 'status', 'svg']);
</script>

<template>
    <div class="step">
        <div :class="status" class="iconcircle">
            <img :alt="title" class="logo" :src="'../assets/'+svg" />
        </div>
        <div class="steptitle" :style="status=='current' ? 'background-color:var(--color-accent1);' : ''">
            {{ title }}
        </div>
</div>
</template>

<style scoped>
    div.step {
        display: inline-block;
        width: 1in;
        vertical-align: middle;
    }
    div.iconcircle {
        width: 0.75in;
        height: 0.75in;
        border-radius: 0.375in;
        margin: auto;
        margin-bottom: 0.15in;
    }
    div.complete { background-color: var(--color-accent2); }
    div.current { background-color: var(--color-accent1); }
    div.upcoming { background-color: var(--color-accent3); }
    div.iconcircle img {
        width: 70%;
        height: 70%;
        margin: 15% 15%;
    }

    div.steptitle {
        border-radius: 6pt;
        padding: 2pt;
    }
</style>