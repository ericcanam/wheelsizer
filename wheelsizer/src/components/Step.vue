<script setup>

    defineProps(['title', 'status', 'svg']);
</script>

<template>
    <div class="step">
        <div :class="status" class="iconcircle">
            <img :alt="title" :src="'./assets/'+svg" />
        </div>
        <div :class="'steptitle' + (status=='current' ? ' current' : '')">
            {{ title }}
        </div>
    </div>
</template>
