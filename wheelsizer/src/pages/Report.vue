<script setup>
    import { ref } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import MultiPartText from '../components/MultiPartText.vue';
    import WarningBox from '../components/WarningBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';

    import TireSize from '../components/fields/TireSize.vue';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    // returns circumference of tire in millimeters
    function tireCircumf(axle='F'){
        return tireHeight(axle)*Math.PI;
    }
    // returns height of the TIRE in millimeters
    function tireHeight(axle='F'){
        if(axle=='F'){
            return (props.ad.of_diam*25.4)+((props.ad.of_ratio/50)*props.ad.of_tread);
        }
        return (props.ad.or_diam*25.4)+((props.ad.or_ratio/50)*props.ad.or_tread);
    }
    // returns ratio of height of the WHEEL to height of the TIRE
    function wtRatios(){
        let tireHeights = tireHeight();
        let wheelHeights = [props.ad.of_diameter*25.4/tireHeights[0]];
        if(oemStagger()){
            wheelHeights.push(props.ad.or_diameter*25.4)/tireHeights[1];
        }
        return wheelHeights;
    }

    const fields = {
        fws: ref(),
        rws: ref(),
        foff: ref(),
        roff: ref(),
        fts: ref(),
        rts: ref()
    };

    function niceNumber(n){
        return parseFloat(n.toFixed(2)).toLocaleString('en-US');
        
    }

    // nothing to validate before moving on
    function validate(){
        return true;
    }

    var newstagger = ref((oemStagger() ? 'Staggered' : 'Square'));
    function newStagger() { return newstagger.value=='Staggered'; }

    defineExpose({
        validate
    });

    let fuck=ref();
</script>

<template>
    <h2>{{ props.ad.cartitle }}</h2>
    <p>Here's some information about the car's OEM setup that may be useful to you.</p>
    <table>
        <tr>
            <th>Field</th><th>{{ oemStagger() ? 'Front' : 'Value' }}</th><th v-if="oemStagger()">Rear</th>
        </tr>
        <tr>
            <td>Tire Size</td><td>{{ props.ad.of_tread + '/' + props.ad.of_ratio + 'R' + props.ad.of_diam }}</td>
            <td v-if="oemStagger()">{{ props.ad.or_tread + '/' + props.ad.or_ratio + 'R' + props.ad.or_diam }}</td>
        </tr>
        <tr>
            <td>Wheel Size</td><td>{{ props.ad.of_diameter + '" &times; ' + props.ad.of_width +'"' }}</td>
            <td v-if="oemStagger()">{{ props.ad.or_diameter + '" &times; ' + props.ad.or_width +'"' }}</td>
        </tr>
        <tr>
            <td>Tire Height</td><td>{{ niceNumber(tireHeight('F')) + ' mm' }}</td>
            <td v-if="oemStagger()">{{ niceNumber(tireHeight('R')) + ' mm' }}</td>
        </tr>
        <tr>
            <td>Tire Circumference</td><td>{{ niceNumber(tireCircumf('F')) + ' mm' }}</td>
            <td v-if="oemStagger()">{{ niceNumber(tireCircumf('R')) + ' mm' }}</td>
        </tr>
    </table>

    <h2>New Setup</h2>
    <p>Play around with the values here, and see the effects of these changes in real-time.</p>


    <!-- stagger/square option toggle -->
    <OptionToggle inputname="nstagger" :options="['Square', 'Staggered']" defaultoption="Square" v-model="newstagger" />


</template>

<style scope>
    :root{
        --wheel-color: #8d8d8d;
    }
</style>