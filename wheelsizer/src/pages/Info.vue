<script setup>
    import { ref } from 'vue';

    import TextBar from '../components/TextBar.vue';
    import OptionToggle from '../components/OptionToggle.vue';

    import { isEmpty } from './validator.js';

    defineProps(['ad']);

    const fields = {
        cartitle: ref()
    };

    function validate(){
        
        // car title
        return !isEmpty(fields.cartitle);
    }
    
    defineExpose({
        validate,
        fields
    });
</script>

<template><div class="row body">
    <!-- Beginning of the calculator form -->
    <h2>What do you drive?</h2>
    <TextBar inputname="cartitle" :ref="fields.cartitle" :length=20
        placeholder="Year Make Model" autofocus errName="Vehicle name" />
    <h2>Let's talk shop:</h2>

    <!-- Stagger -->
    <p>
        <OptionToggle inputname="staggered" :options="['Yes', 'No']" defaultoption="No">
            Is your setup staggered? In other words, are your wheels or tires different from front to back?
        </OptionToggle>
    </p>

    <!-- Drive Wheel -->
    <p>
        <OptionToggle inputname="drivewheels" :options="['Front', 'Rear', 'All']" defaultoption="Front">
            Which are the driven wheels?
        </OptionToggle>
    </p>
</div></template>
