<script setup>

    import { tireCircumf, tireHeight, niceNumber } from './calcs.js';
    import SpecTable from '../components/SpecTable.vue';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };

    // nothing to validate before moving on
    function validate(){
        return true;
    }

    defineExpose({
        validate
    });
</script>

<template><div class="row">
    <h2>{{ props.ad.cartitle }}</h2>
    <p>Here's some information about the car's OEM setup that may be useful to you.</p>
    <p>
        <SpecTable 
            :config="props.ad.nconfig"
            :newstagger="oemStagger()"
            singular
            :nw="{ 
                front:{ // front wheels
                    diameter: props.ad.of_diameter,
                    width:  props.ad.of_width,
                    offset: props.ad.of_offset
                },
                rear:{ // rear wheels
                    diameter: props.ad.or_diameter,
                    width:  props.ad.or_width,
                    offset: props.ad.or_offset
                }
            }"
            :nt="{
                front:{
                    section: props.ad.of_section,
                    ratio: props.ad.of_ratio
                },
                rear:{ // rear tires
                    section: props.ad.or_section,
                    ratio: props.ad.or_ratio
                }
            }"
        />
    </p>
    <div class="row">
        <!-- <button type="button" class="go double">Save "{{ props.ad.cartitle }}"<img class="right" src="/assets/download.svg" /></button> -->
    </div>

</div></template>