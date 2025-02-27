<script setup>
    import { ref, watch } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import Scale from '../components/Scale.vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';

    import SpecTable from '../components/SpecTable.vue';
    import VisualPackage from '../components/VisualPackage.vue';

    import { niceNumber, fpm,
        getPythagLength, getPythagAngle,
        tireHeight,
        isLegalTire, getPctDiff, getNewPctDiff, getTireArray, getTireHeightArray } from './calcs.js';
    
    var props = defineProps(['ad']);
    const newconfig = ref('Everything');
    const newstagger = ref(props.ad.nstagger || (oemStagger() ? 'Staggered' : 'Square'))
    function oemStagger(){ return props.ad.staggered=='Yes' };
    function newStagger(){ return newstagger.value=='Staggered' };
    function stagToSquare(){ return oemStagger() && !newStagger(); }
    function anyStagger(){ return oemStagger() || newStagger(); }

    /*
        Calculator model variables
    */
    // new wheel widths
    var fnw = ref((newconfig.value!='Tires' ? props.ad.nf_width : undefined) || props.ad.of_width);
    var rnw = ref((newconfig.value!='Tires' ? props.ad.nr_width : undefined) || (oemStagger() ? props.ad.or_width : props.ad.of_width));
    // new wheel offsets
    var fno = ref((newconfig.value!='Tires' ? props.ad.nf_offset : undefined) || props.ad.of_offset);
    var rno = ref((newconfig.value!='Tires' ? props.ad.nr_offset : undefined) || (oemStagger() ? props.ad.or_offset : props.ad.of_offset));
    // new tire sections
    var fnts = ref((newconfig.value!='Wheels' ? props.ad.nf_section : undefined) || (props.ad.of_section));
    var rnts = ref((newconfig.value!='Wheels' ? props.ad.nr_section : undefined) || (oemStagger() ? props.ad.or_section : props.ad.of_section));
    // new tire ratios
    var fntr = ref((newconfig.value!='Wheels' ? props.ad.nf_ratio : undefined) || (props.ad.of_ratio));
    var rntr = ref((newconfig.value!='Wheels' ? props.ad.nr_ratio : undefined) || (oemStagger() ? props.ad.or_ratio : props.ad.of_ratio));
    // new wheel diameters
    var fnwd = ref((newconfig.value=='Everything' ? props.ad.nf_diameter : undefined) || props.ad.of_diameter);
    var rnwd = ref((newconfig.value=='Everything' ? props.ad.nr_diameter : undefined) || (oemStagger() ? props.ad.or_diameter : props.ad.of_diameter));
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
    var frontTireArray, fminHeight, fmaxHeight,
        rearTireArray,  rminHeight, rmaxHeight;
    const frontTireHeightArray = ref([]);
    const rearTireHeightArray = ref([]);
    var fthd = ref(props.ad.nf_tireheight || (foh));
    var rthd = ref(props.ad.nr_tireheight || roh);
    function defineTireArrays(){
        frontTireArray = getTireArray(fnw.value, fnwd.value, foh);
            fminHeight = (frontTireArray.length ? frontTireArray[0].th : foh-1);
            fmaxHeight = (frontTireArray.length ? frontTireArray[frontTireArray.length-1].th : foh+1);
            frontTireHeightArray.value = getTireHeightArray(frontTireArray);
        rearTireArray = (anyStagger() ? getTireArray(rnw.value, rnwd.value, roh) : frontTireArray);
            rminHeight = (rearTireArray.length ? rearTireArray[0].th : roh-1);
            rmaxHeight = (rearTireArray.length ? rearTireArray[rearTireArray.length-1].th : roh+1);
            rearTireHeightArray.value = getTireHeightArray(rearTireArray);
        // target rear wheels as well when coming up with a list of tires: only if square now, staggered OEM
        if(stagToSquare() && newconfig.value=='Tires'){
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
    <div class="body">

        <!-- Tool Panel -->
        <div class="toolgrid">
            <!-- Settings Pane -->
            <div class="tower landmark gridtriple">
                <h3>Calculator Setup</h3>

                <div>
                    <!-- OEM Details -->
                    <div>
                        <!-- Vehicle Details -->
                        <h2>{{ ad.cartitle }}</h2>
                        <p>
                            {{ ad.of_diameter }}&quot; &times; {{ ad.of_width }}&quot; ET{{ ad.of_offset }}
                            <template v-if="oemStagger()">
                                (F) &mdash; {{ ad.or_diameter }}&quot; &times; {{ ad.or_width }}&quot; ET{{ ad.or_offset }} (R)
                            </template>

                            <br />

                            {{ ad.of_section }}/{{ ad.of_ratio }}R{{ ad.of_diam }}
                            <template v-if="oemStagger()">
                                (F) &mdash; {{ ad.or_section }}/{{ ad.or_ratio }}R{{ ad.or_diam }} (R)
                            </template>

                            <br />

                            {{ ad.drivewheels }}-wheel drive
                        </p>
                    </div>
                    
                    <!-- Settings Controls -->
                    <div>
                        <!-- Stagger toggle -->
                        <p>
                            <OptionToggle inputname="nstagger" :options="['Square', 'Staggered']" v-model="newstagger">
                                New Setup:
                            </OptionToggle>
                        </p>
                    </div>
                </div>
            </div>

            <div class="tower gridtriple">
                <h3 v-if="newStagger()">Front{{ newconfig!='Everything' ? ' '+newconfig : '' }}</h3>
                <div>
                    <div class="sidebyside">
                        <!-- front tires -->
                        <div v-if="newconfig!='Wheels'">
                            <template v-if="newconfig=='Everything' || !newStagger()">
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
                                <span v-if="newconfig=='Tires'">{{ props.ad.of_diameter }}</span>
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
                                v-model="fthd" :neutral="foh"
                                :discreteSnapPoints="frontTireHeightArray"
                                showControls
                                @update:modelValue="fillFrontTire($event)"
                            /><input v-else type="hidden" name="nf_tireheight" v-model="fthd" />
                            <WarningBox v-if="newconfig!='Everything' && !isLegalTire(fnw, fnts, fntr)">
                                A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ fnw }}&quot;-wide rim,
                                per ISO 4000-1.
                            </WarningBox>
                            <WarningBox v-if="stagToSquare() && newconfig=='Tires' && !isLegalTire(rnw , fnts, fntr)">
                                A tire of size {{ fnts }}/{{ fntr }}R{{ fnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
                                per ISO 4000-1.
                            </WarningBox>
                        </div>
                        <!-- front wheels -->
                        <div v-if="newconfig!='Tires'">
                            <template v-if="newconfig=='Everything' || !newStagger()">
                                <h3 v-if="newStagger()">New Wheels</h3>
                                <h2 v-else>New Wheels</h2>
                            </template>
                            <p>
                                Width
                                <TextBar type="number" :min=2.5 :max=22.5 :length=3 showControls
                                    inputname="nf_width" :ref="fields.fww" placeholder="Width" :step=0.5 v-model="fnw"
                                    acprefix="New"
                                    :errName="(newStagger() ? 'front ' : '')+'Wheel width (inches)'" />
                                <TextBar type="number" :length=3 showControls
                                    inputname="nf_offset" :ref="fields.fwo" placeholder="Offset" v-model="fno"
                                    acprefix="New"
                                    :errName="(newStagger() ? 'front ' : '')+'Wheel offset (millimeters)'" />
                                Offset
                            </p>
                            <WarningBox v-if="!isLegalTire(fnw, fnts, fntr)">
                                This {{ fnw }}&quot;-wide rim is beyond the limits of a tire sized {{ fnts }}/{{ fntr }}R{{ fnwd }},
                                per ISO 4000-1.
                            </WarningBox>
                            <WarningBox v-if="stagToSquare() && newconfig=='Wheels' && !isLegalTire(fnw, rnts, rntr)">
                                This {{ fnw }}&quot;-wide rim is beyond the limits of a tire sized {{ rnts }}/{{ rntr }}R{{ rnwd }},
                                per ISO 4000-1.
                            </WarningBox>
                        </div>
                    </div>

                    <div class="sidebyside">
                        <h3 v-if="stagToSquare()">Front</h3>
                        <!-- front diagram -->
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
                    <div v-if="stagToSquare()" class="sidebyside">
                        <h3>Rear</h3>
                        <!-- rear diagram (for stag2square) -->
                        <VisualPackage nolegend
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
            </div>

            <div class="tower gridtriple" v-if="newStagger()">
                <h3>Rear{{ newconfig!='Everything' ? ' '+newconfig : '' }}</h3>
                <div>
                    <div class="sidebyside">
                        <!-- rear tires -->
                        <div v-if="newconfig!='Wheels'">
                            <h3 v-if="newconfig=='Everything'">New Tires</h3>
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
                                <span v-if="newconfig=='Tires'">{{ rod }}</span>
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
                                v-model="rthd" :neutral="roh"
                                :discreteSnapPoints="rearTireHeightArray"
                                showControls
                                @update:modelValue="fillRearTire($event)"
                            /><input v-else type="hidden" name="nr_tireheight" v-model="rthd" />
                            <WarningBox v-if="newconfig!='Everything' && !isLegalTire(rnw, rnts, rntr)">
                                A tire of size {{ rnts }}/{{ rntr }}R{{ rnwd }} is beyond the limits of a {{ rnw }}&quot;-wide rim,
                                per ISO 4000-1.
                            </WarningBox>
                        </div>
                        <!-- rear wheels -->
                        <div v-if="newconfig!='Tires'">
                            <h3 v-if="newconfig=='Everything'">New Wheels</h3>
                            <p>
                                Width
                                <TextBar type="number" :min=2.5 :max=22.5 :length=3 showControls
                                    inputname="nr_width" :ref="fields.rww" placeholder="Width" :step=0.5 v-model="rnw"
                                    acprefix="New"
                                    errName="Rear wheel width (inches)" />
                                <TextBar type="number" :length=3 showControls
                                    inputname="nr_offset" :ref="fields.rwo" placeholder="Offset" v-model="rno"
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
            </div>
        
            <div class="tower gridtriple">
                <SpecTable style="width:100%;"
                    :config="newconfig"
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
            </div>
        </div>
    </div>
</template>
<style>
    div.toolgrid {
        display: inline-grid;
        grid-template-columns: repeat(6, min(calc(12in/6 - 12pt), calc(100vw/6 - 6pt)));
        vertical-align: top;
    }
    
    div.toolgrid .tower.gridtriple { grid-column-end: span 6; }
    div.toolgrid .tower.griddouble { grid-column-end: span 3; }
    div.toolgrid .tower.gridsingle { grid-column-end: span 2; }

    div.toolgrid div.sidebyside {
        width: max-content;
        vertical-align: middle;
        max-width: max(50%, 5in);
    }

    /* Mobile */
    @media screen and (max-width: 10in){
        div.toolgrid {
            grid-template-columns: repeat(6, calc(100vw/6 - 3pt));
        }

        div.toolgrid .tower.griddouble {
            grid-column-end: span 6;
        }
        div.toolgrid .tower.gridsingle {
            grid-column-end: span 3;
        }
    }
</style>