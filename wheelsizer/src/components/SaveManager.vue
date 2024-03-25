<script setup>
    import { ref } from 'vue';
    
    import { UNSAVED_STRING, writeCar, getCarList, deleteCar, getAppData } from '../cookies.js';

    const props = defineProps({
        ad:{
            type: Object,
            required: true
        },
        // button options:
        trash:{ type: Boolean, default: true }
    });

    const container = ref();

    const cars = ref(getCarList());

    function carCount(){
        return Object.keys(cars.value).length;
    }

    function isUnsaved(){
        return (props.ad!=undefined ? props.ad.savename : UNSAVED_STRING) == UNSAVED_STRING;
    }

    function showList(){
        if(!(carCount() && isUnsaved())){
            return false;
        }
        return props.ad==undefined || props.ad.cartitle==undefined;
    }

    function saveCar(name, ad){
        writeCar(name, ad);
        refresh();
    }

    let open = ref(false);
    function toggleVisibility(){
        open.value = !open.value;

        if(open.value){
            container.value.classList.add("open");
        }else{
            container.value.classList.remove("open");
        }
    }


    defineExpose({
        carCount,
        saveCar
    });
    defineEmits(['update']);

    function refresh(){
        cars.value = getCarList();
    }
</script>

<template>
    <div class="menubutton fall" ref="container">
        <div class="menuflexbox">
            <div class="step" @click="toggleVisibility()">
                <div class="iconcircle square">
                    <img alt="Menu" src="/assets/save.svg" />
                </div>
                <div class="steptitle">Menu</div>
            </div>
            <div v-if="open" class="menu"><!-- Drop down menu -->
                <!-- list of saved cars-->
                <table v-if="showList()">
                    <tr>
                        <th :colspan="1 + trash">Load Vehicle</th>
                    </tr>
                    <tr v-for="(info, key, index) in cars">
                        <!-- Car title -->
                        <td class="button" @click="$emit('update', getAppData(key, ad, info));">
                            {{ key }}
                        </td>

                        <!-- button options -->
                        <td class="button" v-if="trash" @click="deleteCar(key);refresh();">
                            <img src="/assets/trash.svg">
                        </td>
                    </tr>
                </table>

                <!-- SAVE button -->
                <button class="go">Save</button>
            </div>
        </div>
    </div>
    
</template>

<style>
    td.button {
        cursor: pointer;
    }
    td.button img {
        height: calc(var(--font-size) * var(--line-height));
        vertical-align: middle;
    }
</style>