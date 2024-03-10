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

    const cars = ref(getCarList());

    function carCount(){
        return Object.keys(cars.value).length;
    }

    function showList(){
        let unsaved = (props.ad!=undefined ? props.ad.cartitle : UNSAVED_STRING) == UNSAVED_STRING;
        console.log(unsaved);
        return carCount() && unsaved;
    }

    function saveCar(name, ad){
        writeCar(name, ad);
        refresh();
    }


    defineExpose({
        carCount,
        showList,
        saveCar
    });
    defineEmits(['update']);

    function refresh(){
        cars.value = getCarList();
    }
</script>

<template><div class="row">
    <table v-if="showList()">
        <tr>
            <th>Vehicle</th>
            <th>Tires</th>
            <th>Wheels</th>
            <th v-if="trash"></th>
        </tr>
        <tr v-for="(info, key, index) in cars">
            <!-- Car title -->
            <td class="button" @click="$emit('update', getAppData(key, ad, info));">
                {{ key }}
            </td>
            <!-- Tire Size -->
            <td class="button" @click="$emit('update', getAppData(key, ad, info));">
                {{ info.of_section }}/{{ info.of_ratio }}R{{ info.of_diam }}
            </td>
            <!-- Wheel size -->
            <td class="button" @click="$emit('update', getAppData(key, ad, info));">
                {{ info.of_diameter }}&times;{{ info.of_width }} ET{{ info.of_offset }}
            </td>

            <!-- button options -->
            <td class="button" v-if="trash" @click="deleteCar(key);refresh();">
                <img src="/assets/trash.svg">
            </td>
        </tr>
    </table>
</div></template>

<style>
    td.button {
        cursor: pointer;
    }
    td.button img {
        height: calc(var(--font-size) * var(--line-height));
        vertical-align: middle;
    }
</style>