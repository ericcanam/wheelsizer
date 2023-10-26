<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        requireCheck:{
            type: Boolean,
            default: true
        }
    });
    
    var warnOn = ref(false);
    var warnBox = ref();

    var warnings = [];

    function warn(status){

    }

    function clearAll(){
        
    }

    function warnsAccepted(){
        return false;
    }

    defineExpose({
        clearAll,
        warn,
        warnsAccepted
    });
</script>

<template>
    <div class="warningbox" :style="'display:'+(warnOn ? 'default' : 'none')+';'">
        <div class="warningline" style="font-weight: bold;">Outstanding Warnings</div>
        <div>
            To ignore a warning, please check it and re-submit.
        </div>
        <div ref="warnBox">
            <!-- warnings go here -->
            
        </div>
    </div>
</template>

<style scoped>
    
</style>