<script setup>
    import { ref } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import MultiPartText from '../components/MultiPartText.vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';

    import TireSize from '../components/fields/TireSize.vue';
    import WheelSize from '../components/fields/WheelSize.vue';

    import { niceNumber, fpm, areq, getWheels, getPokeDiff, getInsetDiff } from './calcs.js';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    function newStagger(){ return props.ad.nstagger=='Staggered' };


    /*
        Calculator model variables
    */
    // extremity limits for wheel size based on OEM wheels
    var fwes = getWheels(props.ad.of_section, props.ad.of_ratio);
    var rwes = oemStagger() ? getWheels(props.ad.or_section, props.ad.or_ratio) : [fwes[0], fwes[1]];
    // new wheel widths
    var fnw = ref(props.ad.nf_width || props.ad.of_width);
    var rnw = ref(props.ad.nr_width || (oemStagger() ? props.ad.or_width : props.ad.of_width));
    // new wheel offsets
    var fno = ref(props.ad.nf_offset || props.ad.of_offset);
    var rno = ref(props.ad.nr_offset || (oemStagger() ? props.ad.or_offset : props.ad.of_offset));
    // old rear wheel specs
    var row = props.ad.or_width || props.ad.of_width;
    var roo = props.ad.or_offset || props.ad.of_offset;

    const fields = {
        fww: ref(),
        fwo: ref(),
        rww: ref(),
        rwo: ref()
    };

    // nothing to validate before moving on
    function validate(){
        return true;
    }

    defineExpose({
        validate
    });
</script>

<template>
    <!-- Changing only the wheels -->
    <div v-if="props.ad.nconfig=='Wheels'">
        <h2>New Wheels</h2>
        <!--<InfoBox title="Keeping your tires">
            According to <a target="_blank" href="https://www.iso.org/standard/78726.html">ISO 4000-1</a>,
            based on your tire size, your rim width should be between {{ fwes[0] }}" and {{ fwes[1] }}"<span v-if="oemStagger() && !areq(fwes, rwes)">
            for the front, and {{ rwes[0] }}" and {{ rwes[1] }}" for the rear</span><span v-else-if="oemStagger()"> for both front and rear</span>.
        </InfoBox>-->
        
        <h3 v-if="newStagger()">New Widths</h3>
        <p>
            <span class="inputlabel" v-if="!newStagger()">New width:</span>
            <span class="inputlabel" v-else>Front:</span>
            <TextBar type="number" length=6 inputname="nf_width" errName="Wheel width" :ref="fields.fww" placeholder="Width" step=0.5 v-model="fnw" />
        </p>
        <p v-if="newStagger()">
            <span class="inputlabel">Rear:</span>
            <TextBar type="number" length=6 inputname="nr_width" errName="Wheel width" :ref="fields.rww" placeholder="Width" step=0.5 v-model="rnw" />
        </p>

        <h3 v-if="newStagger()">New Offsets</h3>
        <p>
            <span class="inputlabel" v-if="!newStagger()">New offset:</span>
            <span class="inputlabel" v-else>Front:</span>
            <TextBar type="number" length=6 inputname="nf_offset" errName="Wheel offset" :ref="fields.fwo" placeholder="Offset" v-model="fno" />
        </p>
        <p v-if="newStagger()">
            <span class="inputlabel">Rear:</span>
            <TextBar type="number" length=6 inputname="nr_offset" errName="Wheel offset" :ref="fields.rwo" placeholder="Offset" v-model="rno" />
        </p>
        <h2>Changes</h2>
        <table>
            <tr>
                <th>Property</th><th>{{ newStagger() ? 'Front' : 'Value' }}</th><th v-if="newStagger()">Rear</th>
            </tr>
            <tr>
                <td>Wheel Poke</td><td>{{ fpm(getPokeDiff(fnw, fno, props.ad.of_width, props.ad.of_offset)) }} mm</td>
                <td v-if="newStagger()">{{ fpm(getPokeDiff(rnw, rno, row, roo)) }} mm</td>
            </tr>
            <tr>
                <td>Wheel Inset</td><td>{{ fpm(getInsetDiff(fnw, fno, props.ad.of_width, props.ad.of_offset)) }} mm</td>
                <td v-if="newStagger()">{{ fpm(getInsetDiff(rnw, rno, row, roo)) }} mm</td>
            </tr>
            <tr>
                <td>Tire Center</td><td>{{ fpm(props.ad.of_offset - fno) }} mm</td>
                <td v-if="newStagger()">{{ fpm(roo - rno) }} mm</td>
            </tr>
        </table>
    </div>

    
    <div v-else-if="props.ad.nconfig=='Tires'">
        <h2>New Tires</h2>
        <InfoBox title="Keeping your wheels">
            
        </InfoBox>
        <svg viewBox="0 0 160 160" style="width:4in;">
            <!-- bottom dim bar (width) -->
            <path d="M 20 145 L 20 155 L 90 155 L 90 145"
            style="
                fill:transparent;
                stroke: var(--color-text);
                stroke-linecap: square;
                stroke-width: 1px;" />
            <text x="55" y="149" style="fill: var(--color-text); font-size: 7px;"
                                        dominant-baseline="middle" text-anchor="middle">OEM</text>

            <!-- side dim bar (height/diameter) -->
            <path d="M 15 5 L 5 5 L 5 140 L 15 140"
            style="
                fill:transparent;
                stroke: var(--color-text);
                stroke-linecap: square;
                stroke-width: 1px;" />
            <text x="12" y="72.5" style="fill: var(--color-text); writing-mode: tb; font-size: 7px;"
                                        dominant-baseline="middle" text-anchor="middle">OEM</text>
            
            <!-- tire -->
            <path d="M 30 20 V 125 C 30 128 32 130 35 130 H 75 C 78 130 80 128 80 125 V 20 C 80 17 78 15 75 15 H 35 C 32 15 30 17 30 20"
            style="
                fill: var(--color-backshade);
                stroke: var(--color-text);
                stroke-linecap: square;
                stroke-width: 1px;" />
        </svg>
    </div>
</template>