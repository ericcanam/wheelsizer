<script setup>
    import { ref } from 'vue';
    import OptionToggle from '../components/OptionToggle.vue';
    defineProps(['ad']);

    function validate(formdata){
        

        return true;
    }

    const staggered = ref(false);

    defineExpose({
        validate
    });
</script>

<template>

    <h2>Tell us about the OEM or current specs.</h2>
    <!--<p>You can also tell us about what's currently on your car.
        It may make it easier to visualize comparisons.</p>-->

    <!-- Stagger -->
    <p>Are your wheels staggered? In other words, are your wheels or tires different from front to back?</p>
    <OptionToggle inputname="staggered" :options="['Yes', 'No']" defaultoption="No"
        @val-change="(val) => staggered = (val=='Yes')" />
    

    <!-- Wheel size -->
    <p>What size are the OEM wheels, in inches?</p>
    <span class="inputlabel" v-if="staggered">Front:</span>
    <input class="small" type="text" name="fdiameter" placeholder="Diameter" /> &times; <input class="small" type="text" name="fwidth" placeholder="Width" />
    <p v-if="staggered">
        <span class="inputlabel">Rear:</span>
        <input class="small" type="text" name="rdiameter" placeholder="Diameter" /> &times; <input class="small" type="text" name="rwidth" placeholder="Width" />
    </p>
    
    <!-- Offset -->
    <p>What's the offset of your wheels, in millimeters?</p>
    <span class="inputlabel" v-if="staggered">Front:</span>
    <input type="text" name="foffset" placeholder="Offset" />
    <p v-if="staggered">
        <span class="inputlabel">Rear:</span>
        <input type="text" name="woffset" placeholder="Offset" />
    </p>
</template>

<style scope>

</style>