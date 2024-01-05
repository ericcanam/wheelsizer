<script setup>
    import { ref } from 'vue';

    import TextBar from '../components/TextBar.vue';
    import InfoBox from '../components/InfoBox.vue';

    import TireSize from '../components/fields/TireSize.vue';
    import WheelSize from '../components/fields/WheelSize.vue';

    import Collapsible from '../components/Collapsible.vue';

    import { optional, allNumeric, isNumeric } from './validator.js';

    var props = defineProps(['ad']);
    
    //var staggered = ref(props.ad.staggered=="Yes");
    function staggered(){return props.ad.staggered=="Yes";}
    function spare(){return props.ad.spare=="Yes";}

    var advancedOptions = ref();

    const fields = {
        fws: ref(),
        rws: ref(),
        foff: ref(),
        roff: ref(),
        fts: ref(),
        rts: ref()
    }
    const optionalFields = {
        // advanced options
        owb: ref()
    };

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

        let owb = true;
        if(advancedOptions.value.isToggled()){
        // wheelbase
            owb = optional(optionalFields.owb, isNumeric);
        }

        return fwsCheck && rwsCheck && foffCheck && roffCheck && ftsCheck && rtsCheck && fwm && rwm
            // optional stuff
            && owb;
    }

    defineExpose({
        validate,
        fields,
        optionalFields
    });
</script>

<template><div class="row">

    <h2>Tell us about the OEM wheels.</h2>
    
    <!-- Wheel size -->
    <p>What size are the OEM wheels, in inches?</p>
    <WheelSize inprefix="of" :acprefix="'OEM' +(staggered() ? 'Front' : '')" :ref="fields.fws" autofocus>
        <span class="inputlabel" v-if="staggered()">Front:</span>
    </WheelSize>
    <p v-if="staggered()">
        <WheelSize inprefix="or" acprefix="OEM Rear" :ref="fields.rws">
            <span class="inputlabel">Rear:</span>
        </WheelSize>
    </p>
    
    <!-- Offset -->
    <p>What's the offset of the OEM wheels, in millimeters?</p>
    <TextBar type="number" :acprefix="'OEM' +(staggered() ? 'Front' : '')" :length=6 inputname="of_offset" errName="Wheel offset (millimeters)" :ref="fields.foff" placeholder="Offset">
        <span class="inputlabel" v-if="staggered()">Front:</span>
    </TextBar>
    <p v-if="staggered()">
        <TextBar type="number" acprefix="OEM Rear" :length=6 inputname="or_offset" errName="Wheel offset (millimeters)" :ref="fields.roff" placeholder="Offset">
            <span class="inputlabel">Rear:</span>
        </TextBar>
    </p>

    <InfoBox>Wheel size and offset can usually be found stamped on the spokes of your wheels.</InfoBox>

    <!-- Tire size -->
    <h2>Tell us about the OEM tires.</h2>
    <p>These numbers are specified in ISO Metric format, and can be found on your tire sidewall or on a sticker in the driver's side door frame.</p>
    
    <TireSize inprefix="of" :acprefix="'OEM' +(staggered() ? 'Front' : '')" :ref="fields.fts">
        <span class="inputlabel" v-if="staggered()">Front:</span>
    </TireSize>
    <p v-if="staggered()">
        <TireSize inprefix="or" acprefix="OEM Rear" :ref="fields.rts">
            <span class="inputlabel">Rear:</span>
        </TireSize>
    </p>

    <!-- Advanced Options -->
    <Collapsible prompt="Advanced Options" ref="advancedOptions">
        <p>These values are optional, but may offer additional insight into potential setup changes.</p>

        <!-- Wheelbase -->
        <p>What is your car's wheelbase in millimeters?</p>
        <p><TextBar type="number" :length=6 inputname="o_wheelbase" errName="Vehicle Wheelbase" :ref="optionalFields.owb" placeholder="Wheelbase" /></p>
    </Collapsible>
</div></template>
