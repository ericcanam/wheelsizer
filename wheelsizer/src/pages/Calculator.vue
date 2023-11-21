<script setup>
    import { ref, watch } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import Scale from '../components/Scale.vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';

    import { niceNumber, fpm,
        getPythagLength, getPythagAngle,
        tireHeight, tireCircumf,
        getWheels, isLegalTire, getPokeDiff, getInsetDiff, getPctDiff, getTireArray, getTireHeightArray } from './calcs.js';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    function newStagger(){ return props.ad.nstagger=='Staggered' };
    function stagToSquare(){ return oemStagger() && !newStagger(); }
    function anyStagger(){ return oemStagger() || newStagger(); }
    function advancedVars(){ return props.ad.AdvancedOptions=='on'; }

    /*
        Calculator model variables
    */
    // extremity limits for wheel size based on OEM wheels
    var fwes = getWheels(props.ad.of_section, props.ad.of_ratio);
    var rwes = oemStagger() ? getWheels(props.ad.or_section, props.ad.or_ratio) : [fwes[0], fwes[1]];
    // new wheel widths
    var fnw = ref((props.ad.nconfig!='Tires' ? props.ad.nf_width : undefined) || props.ad.of_width);
    var rnw = ref((props.ad.nconfig!='Tires' ? props.ad.nr_width : undefined) || (oemStagger() ? props.ad.or_width : props.ad.of_width));
    // new wheel offsets
    var fno = ref((props.ad.nconfig!='Tires' ? props.ad.nf_offset : undefined) || props.ad.of_offset);
    var rno = ref((props.ad.nconfig!='Tires' ? props.ad.nr_offset : undefined) || (oemStagger() ? props.ad.or_offset : props.ad.of_offset));
    // new tire sections
    var fnts = ref((props.ad.nconfig!='Wheels' ? props.ad.nf_section : undefined) || (props.ad.of_section));
    var rnts = ref((props.ad.nconfig!='Wheels' ? props.ad.nr_section : undefined) || (oemStagger() ? props.ad.or_section : props.ad.of_section));
    // new tire ratios
    var fntr = ref((props.ad.nconfig!='Wheels' ? props.ad.nf_ratio : undefined) || (props.ad.of_ratio));
    var rntr = ref((props.ad.nconfig!='Wheels' ? props.ad.nr_ratio : undefined) || (oemStagger() ? props.ad.or_ratio : props.ad.of_ratio));
    // new wheel diameters
    var fnwd = ref((props.ad.nconfig=='Everything' ? props.ad.nf_diameter : undefined) || props.ad.of_diameter);
    var rnwd = ref((props.ad.nconfig=='Everything' ? props.ad.rf_diameter : undefined) || (oemStagger() ? props.ad.or_diameter : props.ad.of_diameter));
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
    var frontTireArray, fminHeight, fmaxHeight, frontTireHeightArray,
        rearTireArray,  rminHeight, rmaxHeight, rearTireHeightArray;
    var fthd = ref(props.ad.nf_tireheight || (foh));
    var rthd = ref(props.ad.nr_tireheight || roh);
    function defineTireArrays(){
        frontTireArray = getTireArray(fnw.value, fnwd.value, foh);
            fminHeight = (frontTireArray.length ? frontTireArray[0].th : foh-1);
            fmaxHeight = (frontTireArray.length ? frontTireArray[frontTireArray.length-1].th : foh+1);
            frontTireHeightArray = getTireHeightArray(frontTireArray);
        rearTireArray = (anyStagger() ? getTireArray(rnw.value, rnwd.value, roh) : frontTireArray);
            rminHeight = (rearTireArray.length ? rearTireArray[0].th : roh-1);
            rmaxHeight = (rearTireArray.length ? rearTireArray[rearTireArray.length-1].th : roh+1);
            rearTireHeightArray = getTireHeightArray(rearTireArray);
        // target rear wheels as well when coming up with a list of tires: only if square now, staggered OEM
        if(stagToSquare() && props.ad.nconfig=='Tires'){
            frontTireArray = [... new Set([...frontTireArray, ...rearTireArray])];
        }
        
        updateHeight(fnwd.value, fnts.value, fntr.value, fthd);
        updateHeight(rnwd.value, rnts.value, rntr.value, rthd);
    }
    defineTireArrays();

    var hypotenuse, hypAngle;
    // advanced stuff included
    if(advancedVars()){
        
        // wheelbase
        if(props.ad.o_wheelbase){
            // this is the distance between the wheel centers (front to rear projected side)
            hypotenuse = getPythagLength(props.ad.o_wheelbase, ((roh - foh)/2));
            hypAngle = getPythagAngle(((roh - foh)/2), hypotenuse);
        }

    }
    

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
        rtr: ref(),

        // diameter (wheels AND tires)
        fwd: ref(),
        rwd: ref()
    };

    
    // from slider to tire
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
    // from tire to slider
    function updateHeight(diameter, section, ratio, tire_height_var){
        tire_height_var.value = tireHeight(diameter, ratio, section);
    }
    watch(fnts, (new_section) => {updateHeight(fnwd.value, new_section, fntr.value, fthd)}); // fronts
    watch(fntr, (new_ratio)   => {updateHeight(fnwd.value, fnts.value, new_ratio,   fthd)});
    watch(fnwd, (new_diam)    => {defineTireArrays(); updateHeight(new_diam, fnts.value, fntr.value, fthd)});
    watch(rnts, (new_section) => {updateHeight(rnwd.value, new_section, rntr.value, rthd)}); // rears
    watch(rntr, (new_ratio)   => {updateHeight(rnwd.value, rnts.value, new_ratio,   rthd)});
    watch(rnwd, (new_diam)    => {defineTireArrays(); updateHeight(new_diam, rnts.value, rntr.value, rthd)});


    // nothing to validate before moving on
    function validate(){
        return true;
    }

    defineExpose({
        validate
    });
</script>

<template>
    <!-- FOR DEBUG<br />
    FRONT: {{ fnts }}/{{ fntr }}R{{ fnwd }}, {{ fnwd }}&times;{{ fnw }} ET{{ fno }}<br />
    REAR: {{ rnts }}/{{ rntr }}R{{ rnwd }}, {{ rnwd }}&times;{{ rnw }} ET{{ rno }}-->
    
    <!-- Changing only the tires -->
    <div v-if="props.ad.nconfig!='Wheels'">
        <h2>New Tires</h2>
        <!-- front --->
        <h3 v-if="newStagger()">Front</h3>
        <p>
            <TextBar inputname="nf_section" :ref="fields.fts" :length=3
                type="number" :min=5 :max=605 :step=5 showControls
                v-model="fnts" />
            /
            <TextBar inputname="nf_ratio" :ref="fields.ftr" :length=3
                type="number" :min=5 :max=95 :step=5 showControls
                v-model="fntr" />
            R
            <span v-if="props.ad.nconfig=='Tires'">{{ props.ad.of_diameter }}</span>
            <TextBar v-else inputname="nf_diameter" :ref="fields.fwd" :length=3
                type="number" :min=5 :max=30 :step=.5 showControls
                v-model="fnwd" />

        </p>
        <p>
            <b>Tire Height:</b> {{ niceNumber(tireHeight(fnwd, fntr, fnts)) }} mm
            <br v-if="stagToSquare()" />
            <span v-if="stagToSquare()">Front: </span>
            ({{ getPctDiff(foh, tireHeight(fnwd, fntr, fnts)) }})
            <span v-if="stagToSquare()"><br />
                Rear: ({{ getPctDiff(roh, tireHeight(fnwd , fntr, fnts)) }})
            </span>
        </p>
        <Scale inputname="nf_tireheight" v-if="frontTireHeightArray.length>1"
            :min="fminHeight"    :minLabel="fminHeight+'mm\n('+getPctDiff(foh, fminHeight)+')'"
            :max="fmaxHeight"    :maxLabel="fmaxHeight+'mm\n('+getPctDiff(foh, fmaxHeight)+')'"
            v-model="fthd"
            :discreteSnapPoints="frontTireHeightArray"
            showControls
            @update:modelValue="fillFrontTire($event)"
        /><input v-else type="hidden" name="nf_tireheight" v-model="fthd" />
        <WarningBox v-if="!isLegalTire(fnw, fnts, fntr)">
            A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ fnw }}&quot;-wide rim,
            per ISO 4000-1.
        </WarningBox>
        <WarningBox v-if="stagToSquare() && props.ad.nconfig=='Tires' && !isLegalTire(rnw , fnts, fntr)">
            A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
            per ISO 4000-1.
        </WarningBox>

        <!-- rear -->
        <div v-if="newStagger()">
            <h3>Rear</h3>
            <p>
                <TextBar inputname="nr_section" :ref="fields.rts" :length=3
                    type="number" :min=5 :max=605 :step=5 showControls
                    v-model="rnts" />
                /
                <TextBar inputname="nr_ratio" :ref="fields.rtr" :length=3
                    type="number" :min=5 :max=95 :step=5 showControls
                    v-model="rntr" />
                R
                <span v-if="props.ad.nconfig=='Tires'">{{ rod }}</span>
                <TextBar v-else inputname="nr_diameter" :ref="fields.rwd" :length=3
                    type="number" :min=5 :max=30 :step=.5 showControls
                    v-model="rnwd" />
            </p>
            <p><b>Tire Height:</b> {{ niceNumber(tireHeight(rnwd, rntr, rnts)) }} mm ({{ getPctDiff(roh, tireHeight(rnwd, rntr, rnts)) }})</p>
            <Scale inputname="nr_tireheight" v-if="rearTireHeightArray.length>1"
                :min="rminHeight"    :minLabel="rminHeight+'mm<br />('+getPctDiff(roh, rminHeight)+')'"
                :max="rmaxHeight"    :maxLabel="rmaxHeight+'mm<br />('+getPctDiff(roh, rmaxHeight)+')'"
                v-model="rthd"
                :discreteSnapPoints="rearTireHeightArray"
                showControls
                @update:modelValue="fillRearTire($event)"
            /><input v-else type="hidden" name="nr_tireheight" v-model="rthd" />
            <WarningBox v-if="!isLegalTire(rnw, rnts, rntr)">
                A tire of size {{ rnts }}/{{ rntr }}R{{ rnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
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


    <!-- Changing only the wheels -->
    <div v-if="props.ad.nconfig!='Tires'">
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
        <WarningBox v-if="!isLegalTire(fnw, fnts, fntr)">
            This {{ fnw }}&quot;-wide rim is beyond the limits of a tire sized {{ fnts }}/{{ fntr }}R{{ fnwd }},
            per ISO 4000-1.
        </WarningBox>
        <WarningBox v-if="stagToSquare() && props.ad.nconfig=='Wheels' && !isLegalTire(fnw, rnts, rntr)">
            This {{ fnw }}&quot;-wide rim is beyond the limits of a tire sized {{ rnts }}/{{ rntr }}R{{ rnwd }},
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
            <WarningBox v-if="anyStagger() && !isLegalTire(rnw, rnts, rntr)">
                This {{ rnw }}&quot;-wide rim is beyond the limits of a tire sized {{ rnts }}/{{ rntr }}R{{ rnwd }},
                per ISO 4000-1.
            </WarningBox>
        </p>

    </div>

    <h2>Changes</h2>
    <table>
        <tr>
            <th>Property</th><th>{{ anyStagger() ? 'Front' : 'Value' }}</th><th v-if="anyStagger()">Rear</th>
        </tr>
        <!-- Tire size -->
        <tr>
            <td>Tire Size</td><td :colspan="1+(stagToSquare())">{{ fnts + '/' + fntr + 'R' + fnwd }}</td>
            <td v-if="newStagger()">{{ rnts + '/' + rntr + 'R' + rnwd }}</td>
        </tr>
        <!-- Wheel size -->
        <tr>
            <td>Wheel Size</td><td :colspan="1+(stagToSquare())">{{ fnwd + '" &times; ' + fnw +'", ET' + fno }}</td>
            <td v-if="newStagger()">{{ rnwd + '" &times; ' + rnw +'", ET' + rno }}</td>
        </tr>
        <template v-if="props.ad.nconfig!='Wheels'">
        <!-- Tire height -->
            <tr>
                <td>Tire Height</td><td :colspan="1+(stagToSquare())">{{ niceNumber(fthd) + ' mm' }}</td>
                <td v-if="newStagger()">{{ niceNumber(rthd) + ' mm' }}</td>
            </tr>
            <!-- Tire circumference -->
            <tr>
                <td>Tire Circumference</td><td :colspan="1+(stagToSquare())">{{ niceNumber(tireCircumf(fnwd, fntr, fnts)) + ' mm' }}</td>
                <td v-if="newStagger()">{{ niceNumber(tireCircumf(rnwd, rntr, rnts)) + ' mm' }}</td>
            </tr>
        </template>
        <!-- wheel-related stuff -->
        <template v-if="props.ad.nconfig!='Tires'">
            <!-- Tire Center -->
            <tr>
                <td>Tire Center</td><td>{{ fpm(props.ad.of_offset - fno) }} mm</td>
                <td v-if="newStagger()">{{ fpm(roo-rno) }} mm</td>
                <td v-else-if="oemStagger()">{{ fpm(props.ad.or_offset-fno) }} mm</td>
            </tr>
            <!-- Wheel poke -->
            <tr>
                <td>Wheel Poke</td><td>{{ fpm(getPokeDiff(fnw, fno, props.ad.of_width, props.ad.of_offset)) }} mm</td>
                <td v-if="newStagger()">{{ fpm(getPokeDiff(rnw, rno, row, roo)) }} mm</td>
                <td v-else-if="oemStagger()">{{ fpm(getPokeDiff(fnw, fno, row, roo)) }} mm</td>
            </tr>
            <!-- Wheel inset -->
            <tr>
                <td>Wheel Inset</td><td>{{ fpm(getInsetDiff(fnw, fno, props.ad.of_width, props.ad.of_offset)) }} mm</td>
                <td v-if="newStagger()">{{ fpm(getInsetDiff(rnw, rno, row, roo)) }} mm</td>
                <td v-else-if="oemStagger()">{{ fpm(getInsetDiff(fnw, fno, row, roo)) }} mm</td>
            </tr>
        </template>
        <!-- advanced stuff -->
        <template v-if="advancedVars()">
            <template v-if="anyStagger() && props.ad.o_wheelbase && props.ad.nconfig!='Wheels'">
                <!-- wheelbase -->
                <tr>
                    <td>New Wheelbase</td>
                    <td colspan="2">{{ niceNumber(getPythagLength(((newStagger() ? rthd : fthd) - fthd)/2, hypotenuse,true)) }} mm</td>
                </tr>
                <!-- body pitch -->
                <tr>
                    <td>Pitch {{ rthd>fthd ? '(forward)' : (fthd>rthd ? '(rearward)' : '') }}</td>
                    <td colspan="2">{{ niceNumber(getPythagAngle(((newStagger() ? rthd : fthd) - fthd)/2, hypotenuse)-hypAngle) }} &deg;</td>
                </tr>
            </template>
        </template>
    </table>
</template>