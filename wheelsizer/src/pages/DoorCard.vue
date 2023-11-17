<script setup>

    import { tireCircumf, tireHeight, niceNumber } from './calcs.js';
    
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

<template>
    <h2>{{ props.ad.cartitle }}</h2>
    <p>Here's some information about the car's OEM setup that may be useful to you.</p>
    <p>
        <table>
            <tr>
                <th>Property</th><th>{{ oemStagger() ? 'Front' : 'Value' }}</th><th v-if="oemStagger()">Rear</th>
            </tr>
            <tr>
                <td>Tire Size</td><td>{{ props.ad.of_section + '/' + props.ad.of_ratio + 'R' + props.ad.of_diam }}</td>
                <td v-if="oemStagger()">{{ props.ad.or_section + '/' + props.ad.or_ratio + 'R' + props.ad.or_diam }}</td>
            </tr>
            <tr>
                <td>Wheel Size</td><td>{{ props.ad.of_diameter + '" &times; ' + props.ad.of_width +'", ET' + props.ad.of_offset }}</td>
                <td v-if="oemStagger()">{{ props.ad.or_diameter + '" &times; ' + props.ad.or_width +'", ET' + props.ad.or_offset }}</td>
            </tr>
            <tr>
                <td>Tire Height</td><td>{{ niceNumber(tireHeight(props.ad.of_diam, props.ad.of_ratio, props.ad.of_section)) + ' mm' }}</td>
                <td v-if="oemStagger()">{{ niceNumber(tireHeight(props.ad.or_diam, props.ad.or_ratio, props.ad.or_section)) + ' mm' }}</td>
            </tr>
            <tr>
                <td>Tire Circumference</td><td>{{ niceNumber(tireCircumf(props.ad.of_diam, props.ad.of_ratio, props.ad.of_section)) + ' mm' }}</td>
                <td v-if="oemStagger()">{{ niceNumber(tireCircumf(props.ad.or_diam, props.ad.or_ratio, props.ad.or_section)) + ' mm' }}</td>
            </tr>
        </table>
    </p>
    <div class="row">
        <!-- <button type="button" class="go double">Save "{{ props.ad.cartitle }}"<img class="right" src="/assets/download.svg" /></button> -->
    </div>

</template>