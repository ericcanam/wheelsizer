<script setup>
    import { ref } from 'vue';

    import TextBar from '../components/TextBar.vue';
    import OptionToggle from '../components/OptionToggle.vue';
    import SaveManager from '../components/SaveManager.vue';

    import { isEmpty } from './validator.js';
    
    import { getCarList } from '../cookies.js';

    defineProps(['ad']);

    const fields = {
        cartitle: ref()
    };

    function validate(){
        
        // car title
        return !isEmpty(fields.cartitle);
    }


    const save_manager = ref();
    var show_form_override = false;
    function showForm(){
        // show form if no saved cars, if save_manager hasn't loaded yet, OR if it's overridden
        return save_manager.value==undefined || save_manager.value.carCount()==0;
    }
    
    defineExpose({
        validate,
        showForm,
        fields
    });
</script>

<template><div class="row">
    <SaveManager :ad="ad" ref="save_manager">
        <!-- Save manager (IF there are saved cars) -->
        <h2>Choose a saved vehicle:</h2>
    </SaveManager>

    <template v-if="showForm()">
        <!-- Beginning of the calculator form -->
        <h2>Give your car a name:</h2>
        <TextBar inputname="cartitle" :ref="fields.cartitle" :length=20
            placeholder="Year Make Model" autofocus errName="Vehicle name" />
        <input type="hidden" name="savename" value="-UNSAVED-" />
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
    </template>
</div></template>
