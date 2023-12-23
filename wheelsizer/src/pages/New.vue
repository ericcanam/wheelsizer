<script setup>
    import { ref } from 'vue';
    import WarningBox from '../components/WarningBox.vue';
    import InfoBox from '../components/InfoBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    
    const fields = {
        change: ref()
    };

    function validate(){
        // check that a square setup is possible if that is what's selected
        if(stagToSquare() && fields.change.value.getValue()!='Everything'){
            fields.change.value.setError("Both wheels and tires must be changed on at least 1 axle.");
            return false;
        }
        return true;
    }

    var newstagger = ref(props.ad.nstagger || (oemStagger() ? 'Staggered' : 'Square'));
    var newconfig = ref(props.ad.nconfig || 'Tires');

    function stagToSquare(){
        return props.ad.staggered=='Yes' && newstagger.value=='Square' && props.ad.of_diameter!=props.ad.or_diameter;
    }

    // returns true if either the OEM or new setup are staggered, AND if the car is AWD/4WD
    function stagAWD(){
        return (newstagger.value=='Staggered' || props.ad.staggered=='Yes') && props.ad.drivewheels=='All';
    }

    defineExpose({
        validate,
        fields
    });
</script>

<template><div class="row">

    <h2>New Setup</h2>
    <!-- stagger/square option toggle -->
    <p>
        <OptionToggle inputname="nstagger" :options="['Square', 'Staggered']" v-model="newstagger" autofocus>
            Will your new setup be different front to rear (staggered)? Or will all four wheels and tires be the same (square)?
        </OptionToggle>
    </p>
    
    <p>
        <OptionToggle :ref="fields.change" inputname="nconfig" :options="['Wheels', 'Tires', 'Everything']" v-model="newconfig">
            What are you looking to change?
        </OptionToggle>
    </p>

    <WarningBox v-if="stagToSquare()">
        Going from an OEM staggered setup to a square setup requires changing tires <i>and</i> wheels
        on at least one axle if the original rim diameters differed.
    </WarningBox>

    <WarningBox v-if="stagAWD()">
        All-wheel-drive (AWD) and four-wheel-drive (4WD) vehicles may be sensitive to
        changes in tire size when there are differences between the front and rear tires.
        Consult a mechanic familiar with your vehicle before committing to a change.
    </WarningBox>

    <InfoBox>
        Changing your wheels and tires for on-road or off-road use can sometimes cause problems,
        and may not be legal in all jurisdictions. Consult a mechanic if you're unsure.
    </InfoBox>

</div></template>