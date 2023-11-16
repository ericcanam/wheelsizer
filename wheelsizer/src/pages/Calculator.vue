<script setup>
    import { ref } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import Scale from '../components/Scale.vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';

    import TireSize from '../components/fields/TireSize.vue';
    import WheelSize from '../components/fields/WheelSize.vue';

    import { niceNumber, fpm, tireHeight, getWheels, isLegalTire, getPokeDiff, getInsetDiff, getPctDiff, getTireArray, getTireHeightArray } from './calcs.js';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    function newStagger(){ return props.ad.nstagger=='Staggered' };
    function stagToSquare(){
        return oemStagger() && !newStagger();
    }

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
    // new tire sections
    var fnts = ref(props.ad.nf_section || ((stagToSquare() && props.ad.drivewheels=='Rear') ? props.ad.or_section : props.ad.of_section));
    var rnts = ref(props.ad.nr_section || (oemStagger() ? props.ad.or_section : props.ad.of_section));
    // new tire ratios
    var fntr = ref(props.ad.nf_ratio || ((stagToSquare() && props.ad.drivewheels=='Rear') ? props.ad.or_ratio : props.ad.of_ratio));
    var rntr = ref(props.ad.nr_ratio || (oemStagger() ? props.ad.or_ratio : props.ad.of_ratio));
    // old rear wheel specs
    const row = (oemStagger() ? props.ad.or_width : props.ad.of_width);
    const roo = (oemStagger() ? props.ad.or_offset : props.ad.of_offset);
    const rod = (oemStagger() ? props.ad.or_diameter : props.ad.of_diameter);
    // old front tire specs
    const foh = tireHeight(props.ad.of_diam, props.ad.of_ratio, props.ad.of_section);
    // old rear tire specs
    const roh = (oemStagger() ? tireHeight(props.ad.or_diam, props.ad.or_ratio, props.ad.or_section) : tireHeight(props.ad.of_diam, props.ad.of_ratio, props.ad.of_section));
    const ros = (oemStagger() ? props.ad.or_section : props.ad.of_section);
    const ror = (oemStagger() ? props.ad.or_ratio : props.ad.of_ratio);
    // legal tires & respective heights for OEM wheels
    var frontTireArray = getTireArray(props.ad.of_width, props.ad.of_diameter, foh);
        const fminHeight = frontTireArray[0].th;
        const fmaxHeight = frontTireArray[frontTireArray.length-1].th;
        const frontTireHeightArray = getTireHeightArray(frontTireArray);
    const rearTireArray = (oemStagger() ? getTireArray(props.ad.or_width, props.ad.or_diameter, roh) : frontTireArray);
        const rminHeight = rearTireArray[0].th;
        const rmaxHeight = rearTireArray[rearTireArray.length-1].th;
        const rearTireHeightArray = getTireHeightArray(rearTireArray);
    // target rear wheels as well when coming up with a list of tires: only if square now, staggered OEM
    if(stagToSquare()){
        frontTireArray = [... new Set([...frontTireArray, ...rearTireArray])];
    }
    var fthd = ref(props.ad.nf_tireheight || ((stagToSquare() && props.ad.drivewheels=='Rear') ? roh : foh));
    var rthd = ref(props.ad.nr_tireheight || roh);

    const fields = {
        // wheels only
        fww: ref(),
        fwo: ref(),
        rww: ref(),
        rwo: ref(),

        // tires only
        fts: ref(),
        rts: ref(),
        ftr: ref(),
        rtr: ref()
    };

    function fillFrontTire(height){
        for(let tire of frontTireArray){
            if(tire.th==height){
                fnts.value = tire.section;
                fntr.value = tire.ratio;
            }
        }
    }

    function fillRearTire(height){
        for(let tire of rearTireArray){
            if(tire.th==height){
                rnts.value = tire.section;
                rntr.value = tire.ratio;
            }
        }
    }

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
        
        <h3 v-if="newStagger()">Front</h3>
        <p>
            Width
            <TextBar type="number" :min=2.5 :max=22.5 :length=3
                inputname="nf_width" errName="Wheel width" :ref="fields.fww" placeholder="Width" :step=0.5 v-model="fnw" showControls />
            <TextBar type="number" :length=3
                inputname="nf_offset" errName="Offset" :ref="fields.fwo" placeholder="Offset" v-model="fno" showControls />
            Offset
        </p>
        <WarningBox v-if="!isLegalTire(fnw, props.ad.of_section, props.ad.of_ratio)">
            This {{ fnw }}&quot;-wide rim is beyond the limits of a tire sized {{ props.ad.of_section }}/{{ props.ad.of_ratio }}R{{ props.ad.of_diameter }},
            per ISO 4000-1.
        </WarningBox>

        <h3 v-if="newStagger()">Rear</h3>
        <p v-if="newStagger()">
            Width
            <TextBar type="number" :min=2.5 :max=22.5 :length=3
                inputname="nr_width" errName="Wheel width" :ref="fields.rww" placeholder="Width" :step=0.5 v-model="rnw" showControls />
            <TextBar type="number" :length=3
                inputname="nr_offset" errName="Offset" :ref="fields.rwo" placeholder="Offset" v-model="rno" showControls />
            Offset
        </p>
        <WarningBox v-if="newStagger() && !isLegalTire(rnw, ros, ror)">
            This {{ rnw }}&quot;-wide rim is beyond the limits of a tire sized {{ ros }}/{{ ror }}R{{ rod }},
            per ISO 4000-1.
        </WarningBox>

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

    <!-- Changing only the tires -->
    <div v-else-if="props.ad.nconfig=='Tires'">
        <h2>New Tires</h2>
        <!-- front --->
        <h3 v-if="newStagger()">Front</h3>
        <p>
            <TextBar inputname="nf_section" :ref="fields.fts" :length=3
                type="number" :min=5 :max=995 :step=5 showControls
                v-model="fnts" />
            /
            <TextBar inputname="nf_ratio" :ref="fields.ftr" :length=3
                type="number" :min=5 :max=995 :step=5 showControls
                v-model="fntr" />
            R
            {{ props.ad.of_diameter }}
        </p>
        <p>
            <b>Tire Height:</b> {{ niceNumber(tireHeight(props.ad.of_diameter, fntr, fnts)) }} mm
            <br v-if="stagToSquare()" />
            <span v-if="stagToSquare()">Front: </span>
            ({{ getPctDiff(foh, tireHeight(props.ad.of_diameter, fntr, fnts)) }})
            <span v-if="stagToSquare()"><br />
                Rear: ({{ getPctDiff(roh, tireHeight(props.ad.of_diameter, fntr, fnts)) }})
            </span>
        </p>
        <Scale inputname="nf_tireheight"
            :min="fminHeight"    minLabel="{{ fminHeight }} mm<br />({{ getPctDiff(foh, fminHeight) }})"
            :max="fmaxHeight"    maxLabel="{{ fmaxHeight }} mm<br />({{ getPctDiff(foh, fmaxHeight) }})"
            v-model="fthd"
            :discreteSnapPoints="frontTireHeightArray"
            showControls
            @update:modelValue="fillFrontTire($event)"
        />
        <WarningBox v-if="!isLegalTire(props.ad.of_width, fnts, fntr)">
            A tire of size {{ fnts }}/{{ fntr }}R{{ props.ad.of_diameter }} is beyond the limits of a {{ props.ad.of_width }}&quot;-wide rim,
            per ISO 4000-1.
        </WarningBox>
        <WarningBox v-if="stagToSquare() && !isLegalTire(props.ad.or_width, fnts, fntr)">
            A tire of size {{ fnts }}/{{ fntr }}R{{ props.ad.of_diameter }} is beyond the limits of a {{ props.ad.or_width }}&quot;-wide rim,
            per ISO 4000-1.
        </WarningBox>

        <!-- rear -->
        <div v-if="newStagger()">
            <h3>Rear</h3>
            <p>
                <TextBar inputname="nr_section" :ref="fields.rts" :length=3
                    type="number" :min=5 :max=995 :step=5 showControls
                    v-model="rnts" />
                /
                <TextBar inputname="nr_ratio" :ref="fields.rtr" :length=3
                    type="number" :min=5 :max=995 :step=5 showControls
                    v-model="rntr" />
                R
                {{ rod }}
            </p>
            <p><b>Tire Height:</b> {{ niceNumber(tireHeight(rod, rntr, rnts)) }} mm ({{ getPctDiff(roh, tireHeight(rod, rntr, rnts)) }})</p>
            <Scale inputname="nf_tireheight"
                :min="rminHeight"    minLabel="{{ rminHeight }} mm<br />({{ getPctDiff(roh, rminHeight) }})"
                :max="rmaxHeight"    maxLabel="{{ rmaxHeight }} mm<br />({{ getPctDiff(roh, rmaxHeight) }})"
                v-model="rthd"
                :discreteSnapPoints="rearTireHeightArray"
                showControls
                @update:modelValue="fillRearTire($event)"
            />
            <WarningBox v-if="!isLegalTire(row, rnts, rntr)">
                A tire of size {{ rnts }}/{{ rntr }}R{{ rod }} is beyond the limits of a {{ row }}&quot;-wide rim,
                per ISO 4000-1.
            </WarningBox>
        </div>
        <!--
        <InfoBox>
            Usually when changing tire sizes (but keeping your wheels) your goal is to get
            as close as you can to the original tire's diameter &amp; circumference. This ensures that
            your vehicle's speedometer reads as accurately as possible.
            <br /><br />If the original tire size is available for your climate and driving needs, you should
            always consider it.
        </InfoBox>-->
    </div>
</template>