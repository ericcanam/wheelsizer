<script setup>
    import { ref } from 'vue';
    import TextBar from '../components/TextBar.vue';
    import MultiPartText from '../components/MultiPartText.vue';
    import { allNumeric, isNumeric } from './validator';
    var props = defineProps(['ad']);

    // wheel diameter field references (so it can be pre-populated and not typed TWICE)
    const fwd = "";
    const rwd = "";
    
    //var staggered = ref(props.ad.staggered=="Yes");
    function staggered(){return props.ad.staggered=="Yes";}


    const fields = {
        fws: ref(),
        rws: ref(),
        foff: ref(),
        roff: ref(),
        fts: ref(),
        rts: ref()
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
        let fwm = true;
        if(fwsCheck && ftsCheck &&
                fields.fws.value.getValues().fdiameter.value != fields.fts.value.getValues().fdiam.value){

            fields.fws.value.setError("", "fdiameter");
            fields.fts.value.setError("The tire dimension should match the specified wheel diameter.", "fdiam");
            fwm = false;
        }
        let rwm = true;
        if(staggered() && rwsCheck && rtsCheck &&
                fields.rws.value.getValues().rdiameter.value != fields.rts.value.getValues().rdiam.value){

            fields.rws.value.setError("", "rdiameter");
            fields.rts.value.setError("The tire dimension should match the specified wheel diameter.", "rdiam");
            rwm = false;
        }

        return fwsCheck && rwsCheck && foffCheck && roffCheck && fwm && rwm;
    }

    defineExpose({
        validate,
        fields
    });
</script>

<template>

    <h2>Tell us about the OEM or current wheels.</h2>
    
    <!-- Wheel size -->
    <p>What size are the OEM wheels, in inches?</p>
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <MultiPartText :inputdefs="[{name: 'fdiameter', type:'number', placeholder: 'Diameter', length:6, errName: 'Wheel diameter'},
                                {name: 'fwidth', type:'number', placeholder: 'Width', length:6, errName: 'Wheel width'}]" struct="_&times;_"
        :ref="fields.fws" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <MultiPartText :inputdefs="[{name: 'rdiameter', type:'number', placeholder: 'Diameter', length:6, errName: 'Wheel diameter'},
                                    {name: 'rwidth', type:'number', placeholder: 'Width', length:6, errName: 'Wheel width'}]" struct="_&times;_"
        :ref="fields.rws" />
    </p>
    
    <!-- Offset -->
    <p>What's the offset of your wheels, in millimeters?</p>
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <TextBar type="number" :length=6 inputname="foffset" :ref="fields.foff" placeholder="Offset" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <TextBar type="number" :length=6 inputname="roffset" :ref="fields.roff" placeholder="Offset" />
    </p>

    <h2>Tell us about the OEM or current tires.</h2>
    <p>These numbers are specified in ISO Metric format, and can be found on your tire sidewall or on a sticker in the driver's side door frame.</p>
    <span class="inputlabel" v-if="staggered()">Front:</span>
    <MultiPartText :inputdefs="[{name: 'ftread', type:'number', length:3, errName: 'Tire tread width'},
                                {name: 'fratio', type:'number', length:3, errName: 'Tire sidewall ratio'},
                                {name: 'fdiam', type:'number', length:3, errName: 'Wheel diameter'}]" struct="_/_R_"
        :ref="fields.fts" />
    <p v-if="staggered()">
        <span class="inputlabel">Rear:</span>
        <MultiPartText :inputdefs="[{name: 'rtread', type:'number', length:3, errName: 'Tire tread width'},
                                    {name: 'rratio', type:'number', length:3, errName: 'Tire sidewall ratio'},
                                    {name: 'rdiam', type:'number', length:3, errName: 'Wheel diameter'}]" struct="_/_R_"
        :ref="fields.rts" />
    </p>

</template>
