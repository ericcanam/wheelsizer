<script setup>
    import { ref } from 'vue';
    import WarningBox from '../components/WarningBox.vue';
    import OptionToggle from '../components/OptionToggle.vue';
    
    var props = defineProps(['ad']);
    function oemStagger(){ return props.ad.staggered=='Yes' };
    
    const fields = {
        change: ref()
    };

    function validate(){
        // check that a square setup is possible if that is what's selected
        if(stagToSquare() && fields.change.value.getValue()!='Everything'){
            fields.change.value.setError("Wheels or tire must be changed on at least 1 axle.");
            return false;
        }
        return true;
    }

    var newstagger = ref(props.ad.nstagger || (oemStagger() ? 'Staggered' : 'Square'));
    var newconfig = ref(props.ad.nconfig || 'Tires');

    function stagToSquare(){
        return props.ad.staggered=='Yes' && newstagger.value=='Square' && props.ad.of_diameter!=props.ad.or_diameter;
    }

    defineExpose({
        validate,
        fields
    });
</script>

<template>

    <h2>New Setup</h2>
    <!--<p>Play around with the values here, and see the effects of these changes in real-time.</p>-->

    <!-- stagger/square option toggle -->
    <p>Will your new setup be different front to rear (staggered)? Or will all four wheels and tires be the same (square)?</p>
    <p>
        <OptionToggle inputname="nstagger" :options="['Square', 'Staggered']" v-model="newstagger" />
    </p>
    <p>What are you looking to change?</p>
    <p>
        <OptionToggle :ref="fields.change" inputname="nconfig" :options="['Wheels', 'Tires', 'Everything']" v-model="newconfig" />
    </p>

    <WarningBox v-if="stagToSquare()" title="Staggered &rarr; Square">
        Going from an OEM staggered setup to a square setup requires changing tires <i>and</i> wheels
        on at least one axle if the original rim diameters differed.
    </WarningBox>

</template>