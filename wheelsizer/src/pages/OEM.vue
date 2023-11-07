<script setup>
    import { ref } from 'vue';

    import TextBar from '../components/TextBar.vue';

    import TireSize from '../components/fields/TireSize.vue';
    import WheelSize from '../components/fields/WheelSize.vue';

    import { allNumeric, isNumeric } from './validator.js';

    var props = defineProps(['ad']);

    // wheel diameter field references (so it can be pre-populated and not typed TWICE)
    const fwd = "";
    const rwd = "";
    
    //var staggered = ref(props.ad.staggered=="Yes");
    function staggered(){return props.ad.staggered=="Yes";}
    function spare(){return props.ad.spare=="Yes";}


    const fields = {
        fws: ref(),
        rws: ref(),
        foff: ref(),
        roff: ref(),
        fts: ref(),
        rts: ref()
    };

    const warnbox = ref();

    function validate(){
        // wheel size
        let fwsCheck = allNumeric(fields.fws);
        let rwsCheck = (staggered() ? allNumeric(fields.rws) : true);

        // offset
        let foffCheck = isNumeric(fields.foff);
        let roffCheck = (staggered() ? isNumeric(fields.roff) : true)

        // tire size
        let ftsCheck = allNumeric(fields.fts);
        let rtsCheck = (staggered() ? allNumeric(fields.rts) : true);

        // tire/wheel diameter match
        let fwm = true; // front
        if(fwsCheck && ftsCheck &&
                fields.fws.value.getValues().of_diameter.value != fields.fts.value.getValues().of_diam.value){

            fields.fws.value.setError("", "of_diameter");
            fields.fts.value.setError("The tire dimension should match the specified wheel diameter.", "of_diam");
            fwm = false;
        }
        let rwm = true; // rear
        if(staggered() && rwsCheck && rtsCheck &&
                fields.rws.value.getValues().or_diameter.value != fields.rts.value.getValues().or_diam.value){

            fields.rws.value.setError("", "or_diameter");
            fields.rts.value.setError("The tire dimension should match the specified wheel diameter.", "or_diam");
            rwm = false;
        }

        return fwsCheck && rwsCheck && foffCheck && roffCheck && ftsCheck && rtsCheck && fwm && rwm;
    }

    function warn(status){
        warnbox.value.warn(status);
    }

    defineExpose({
        validate,
        fields
    });
</script>

<template>

    <h2>Tell us about the OEM wheels.</h2>
    
    <!-- Wheel size -->
    <p>What size are the OEM wheels, in inches?</p>
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <WheelSize inprefix="of" :ref="fields.fws" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <WheelSize inprefix="or" :ref="fields.rws" />
    </p>
    
    <!-- Offset -->
    <p>What's the offset of the OEM wheels, in millimeters?</p>
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <TextBar type="number" length=6 inputname="of_offset" errName="Wheel offset" :ref="fields.foff" placeholder="Offset" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <TextBar type="number" length=6 inputname="or_offset" errName="Wheel offset" :ref="fields.roff" placeholder="Offset" />
    </p>

    <p>Wheel size and offset can usually be found stamped on the spokes of your wheels.</p>

    <h2>Tell us about the OEM tires.</h2>
    <p>These numbers are specified in ISO Metric format, and can be found on your tire sidewall or on a sticker in the driver's side door frame.</p>
    
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <TireSize inprefix="of" :ref="fields.fts" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <TireSize inprefix="or" :ref="fields.rts" />
    </p>
</template>
