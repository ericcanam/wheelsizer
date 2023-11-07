<script setup>

    defineProps(['title', 'status', 'svg']);
</script>

<template>
    <div class="step">
        <div :class="status" class="iconcircle">
            <img :alt="title" class="logo" :src="'../assets/'+svg" />
        </div>
        <div :class="'steptitle' + (status=='current' ? ' current' : '')">
            {{ title }}
        </div>
</div>
</template>

<style>
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
    div.steptitle.overarch{
        display: none;
    }

    @media screen and (max-width: 10in){
        /* modify nav/progress indicator */
        div.step {
            width: 15vw;
        }
        div.iconcircle {
            width: 12vw;
            height: 12vw;
            border-radius: 6vw;
            /*border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;*/
            margin: auto;
            margin-bottom: 0;
        }
        div.steptitle{
            display: none;
        }
        div.steptitle.overarch{
            display: block;
        }
    }
</style>