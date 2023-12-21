<script setup>
    import { ref, watch } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import Scale from '../components/Scale.vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';

    import SpecTable from '../components/SpecTable.vue';
    import VisualPackage from '../components/VisualPackage.vue';

    import { niceNumber, fpm,
        getPythagLength, getPythagAngle,
        tireHeight,
        isLegalTire, getPctDiff, getNewPctDiff, getTireArray, getTireHeightArray } from './calcs.js';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    function newStagger(){ return props.ad.nstagger=='Staggered' };
    function stagToSquare(){ return oemStagger() && !newStagger(); }
    function anyStagger(){ return oemStagger() || newStagger(); }

    /*
        Calculator model variables
    */
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
    watch(fnwd, (new_diam)    => {defineTireArrays(); updateHeight(new_diam, fnts.value, fntr.value, fthd)}); // wheels
    watch(fnw,  (new_width)   => {defineTireArrays(); updateHeight(fnwd.value, fnts.value, fntr.value, fthd)});
    watch(rnts, (new_section) => {updateHeight(rnwd.value, new_section, rntr.value, rthd)}); // rears
    watch(rntr, (new_ratio)   => {updateHeight(rnwd.value, rnts.value, new_ratio,   rthd)});
    watch(rnwd, (new_diam)    => {defineTireArrays(); updateHeight(new_diam, rnts.value, rntr.value, rthd)}); // wheels
    watch(rnw,  (new_width)   => {defineTireArrays(); updateHeight(rnwd.value, rnts.value, rntr.value, rthd)});


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

    <!-- input modules -->
    <!-- FRONT -->
    <div :class="newStagger() ? 'tower' : ''">
        <h3 v-if="newStagger()">Front{{ props.ad.nconfig!='Everything' ? ' '+props.ad.nconfig : '' }}</h3>
        <div :class="stagToSquare() ? '' :'sidebyside'">
            <!-- front tires -->
            <div v-if="props.ad.nconfig!='Wheels'">
                <template v-if="props.ad.nconfig=='Everything' || !newStagger()">
                    <h3 v-if="newStagger()">New Tires</h3>
                    <h2 v-else>New Tires</h2>
                </template>
                <p>
                    <TextBar inputname="nf_section" :ref="fields.fts" :length=3
                        type="number" :min=5 :max=605 :step=5 showControls
                        acprefix="New"
                        :errName="(newStagger() ? 'front ' : '')+'tire section'"
                        v-model="fnts" />
                    /
                    <TextBar inputname="nf_ratio" :ref="fields.ftr" :length=3
                        type="number" :min=5 :max=95 :step=5 showControls
                        acprefix="New"
                        :errName="(newStagger() ? 'front ' : '')+'tire sidewall ratio'"
                        v-model="fntr" />
                    R
                    <span v-if="props.ad.nconfig=='Tires'">{{ props.ad.of_diameter }}</span>
                    <TextBar v-else inputname="nf_diameter" :ref="fields.fwd" :length=3
                        type="number" :min=5 :max=30 :step=1 showControls
                        acprefix="New"
                        :errName="(newStagger() ? 'front ' : '')+'wheel diameter'"
                        v-model="fnwd" />

                </p>
                <p>
                    <b>Tire Height:</b>
                    <br v-if="stagToSquare()" />
                    <span v-if="stagToSquare()">
                        {{ niceNumber(tireHeight(fnwd, fntr, fnts)) }} mm
                        Front: ({{ getPctDiff(foh, tireHeight(fnwd, fntr, fnts))}}) <br />
                        Rear: ({{ getPctDiff(roh, tireHeight(fnwd , fntr, fnts)) }})
                    </span>
                    <span v-else>&nbsp;{{ getNewPctDiff(foh, tireHeight(fnwd, fntr, fnts)) }}</span>
                </p>
                <Scale inputname="nf_tireheight" v-if="frontTireHeightArray.length>1"
                    :min="fminHeight"    :minLabel="fminHeight+'mm\n('+getPctDiff(foh, fminHeight)+')'"
                    :max="fmaxHeight"    :maxLabel="fmaxHeight+'mm\n('+getPctDiff(foh, fmaxHeight)+')'"
                    v-model="fthd"
                    :discreteSnapPoints="frontTireHeightArray"
                    showControls
                    @update:modelValue="fillFrontTire($event)"
                /><input v-else type="hidden" name="nf_tireheight" v-model="fthd" />
                <WarningBox v-if="props.ad.nconfig!='Everything' && !isLegalTire(fnw, fnts, fntr)">
                    A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ fnw }}&quot;-wide rim,
                    per ISO 4000-1.
                </WarningBox>
                <WarningBox v-if="stagToSquare() && props.ad.nconfig=='Tires' && !isLegalTire(rnw , fnts, fntr)">
                    A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
                    per ISO 4000-1.
                </WarningBox>
            </div>
            <!-- front wheels -->
            <div v-if="props.ad.nconfig!='Tires'">
                <template v-if="props.ad.nconfig=='Everything' || !newStagger()">
                    <h3 v-if="newStagger()">New Wheels</h3>
                    <h2 v-else>New Wheels</h2>
                </template>
                <p>
                    Width
                    <TextBar type="number" :min=2.5 :max=22.5 :length=3
                        inputname="nf_width" :ref="fields.fww" placeholder="Width" :step=0.5 v-model="fnw" showControls
                        acprefix="New"
                        :errName="(newStagger() ? 'front ' : '')+'Wheel width (inches)'" />
                    <TextBar type="number" :length=3
                        inputname="nf_offset" :ref="fields.fwo" placeholder="Offset" v-model="fno" showControls
                        acprefix="New"
                        :errName="(newStagger() ? 'front ' : '')+'Wheel offset (millimeters)'" />
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
            </div>
        </div>

        <!-- front diagram -->
        <div class="sidebyside">
            <VisualPackage
                :diameter="fnwd" :width="fnw" :offset="fno"
                :section="fnts" :ratio="fntr"
                :old="{diameter: props.ad.of_diameter,
                    width:       props.ad.of_width,
                    offset:      props.ad.of_offset,
                    section:     props.ad.of_section,
                    ratio:       props.ad.of_ratio}"
            />
        </div>
        <!-- rear diagram (for stag2square) -->
        <div class="sidebyside">
            <VisualPackage v-if="stagToSquare()" nolegend
                :diameter="fnwd" :width="fnw" :offset="fno"
                :section="fnts" :ratio="fntr"
                :old="{diameter: props.ad.or_diameter,
                    width:       props.ad.or_width,
                    offset:      props.ad.or_offset,
                    section:     props.ad.or_section,
                    ratio:       props.ad.or_ratio}"
            />
        </div>
    </div>
    <!-- REAR -->
    <div class="tower" v-if="newStagger()">
        <h3>Rear{{ props.ad.nconfig!='Everything' ? ' '+props.ad.nconfig : '' }}</h3>
        <div class="sidebyside">
            <!-- rear tires -->
            <div v-if="props.ad.nconfig!='Wheels'">
                <h3 v-if="props.ad.nconfig=='Everything'">New Tires</h3>
                <p>
                    <TextBar inputname="nr_section" :ref="fields.rts" :length=3
                        type="number" :min=5 :max=605 :step=5 showControls
                        acprefix="New"
                        :errName="'Rear tire section'"
                        v-model="rnts" />
                    /
                    <TextBar inputname="nr_ratio" :ref="fields.rtr" :length=3
                        type="number" :min=5 :max=95 :step=5 showControls
                        acprefix="New"
                        :errName="'Rear tire sidewall ratio'"
                        v-model="rntr" />
                    R
                    <span v-if="props.ad.nconfig=='Tires'">{{ rod }}</span>
                    <TextBar v-else inputname="nr_diameter" :ref="fields.rwd" :length=3
                        type="number" :min=5 :max=30 :step=1 showControls
                        acprefix="New"
                        :errName="'Rear wheel diameter'"
                        v-model="rnwd" />
                </p>
                <p><b>Tire Height:</b> {{ getNewPctDiff(roh, tireHeight(rnwd, rntr, rnts)) }}</p>
                <Scale inputname="nr_tireheight" v-if="rearTireHeightArray.length>1"
                    :min="rminHeight"    :minLabel="rminHeight+'mm<br />('+getPctDiff(roh, rminHeight)+')'"
                    :max="rmaxHeight"    :maxLabel="rmaxHeight+'mm<br />('+getPctDiff(roh, rmaxHeight)+')'"
                    v-model="rthd"
                    :discreteSnapPoints="rearTireHeightArray"
                    showControls
                    @update:modelValue="fillRearTire($event)"
                /><input v-else type="hidden" name="nr_tireheight" v-model="rthd" />
                <WarningBox v-if="props.ad.nconfig!='Everything' && !isLegalTire(rnw, rnts, rntr)">
                    A tire of size {{ rnts }}/{{ rntr }}R{{ rnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
                    per ISO 4000-1.
                </WarningBox>
            </div>
            <!-- rear wheels -->
            <div v-if="props.ad.nconfig!='Tires'">
                <h3 v-if="props.ad.nconfig=='Everything'">New Wheels</h3>
                <p>
                    Width
                    <TextBar type="number" :min=2.5 :max=22.5 :length=3
                        inputname="nr_width" :ref="fields.rww" placeholder="Width" :step=0.5 v-model="rnw" showControls
                        acprefix="New"
                        errName="Rear wheel width (inches)" />
                    <TextBar type="number" :length=3
                        inputname="nr_offset" :ref="fields.rwo" placeholder="Offset" v-model="rno" showControls
                        acprefix="New"
                        errName="Rear wheel offset (millimeters)" />
                    Offset
                </p>
                <WarningBox v-if="anyStagger() && !isLegalTire(rnw, rnts, rntr)">
                    This {{ rnw }}&quot;-wide rim is beyond the limits of a tire sized {{ rnts }}/{{ rntr }}R{{ rnwd }},
                    per ISO 4000-1.
                </WarningBox>
            </div>
        </div>

        <!-- rear diagram -->
        <div class="sidebyside">
            <VisualPackage
                :diameter="rnwd" :width="rnw" :offset="rno"
                :section="rnts" :ratio="rntr"
                :old="oemStagger() ?
                    {diameter:   props.ad.or_diameter,
                    width:       props.ad.or_width,
                    offset:      props.ad.or_offset,
                    section:     props.ad.or_section,
                    ratio:       props.ad.or_ratio}
                    :
                    {diameter:   props.ad.of_diameter,
                    width:       props.ad.of_width,
                    offset:      props.ad.of_offset,
                    section:     props.ad.of_section,
                    ratio:       props.ad.of_ratio}"
            />
        </div>
    </div>

    <h2>Change Table</h2>
    <SpecTable 
        :config="props.ad.nconfig"
        :newstagger="newStagger()"
        :oemstagger="oemStagger()"
        :ow="{ 
            front:{ // front wheels
                diameter: props.ad.of_diameter,
                width:  props.ad.of_width,
                offset: props.ad.of_offset
            },
            rear:{ // rear wheels
                diameter: rod,
                width:  row,
                offset: roo
            }
        }"
        :ot="{
            front:{
                section: props.ad.of_section,
                ratio: props.ad.of_ratio
            },
            rear:{ // rear tires
                section: ros,
                ratio: ror
            }
        }"
        :nw="{ 
            front:{ // front wheels
                diameter: fnwd,
                width:  fnw,
                offset: fno
            },
            rear:{ // rear wheels
                diameter: rnwd,
                width:  rnw,
                offset: rno
            }
        }"
        :nt="{
            front:{
                section: fnts,
                ratio: fntr
            },
            rear:{ // rear tires
                section: rnts,
                ratio: rntr
            }
        }"
        :advanced="{
            wheelbase: props.ad.o_wheelbase
        }"
    />
</template>