<script setup>
    import { ref } from 'vue';
    
    import { getCarList, deleteCar } from '../cookies.js';

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

    defineExpose({
        carCount
    });

    function refresh(){
        cars.value = getCarList();
    }
</script>

<template>
    <slot v-if="carCount()" />

    <table v-if="carCount()">
        <tr>
            <th colspan="2">Vehicle</th>
            <th>Tires</th>
            <th>Wheels</th>
            <th v-if="trash"></th>
        </tr>
        <tr v-for="(info, key, index) in cars">
            <td>{{ index+1 }}</td>
            <td>{{ key }}</td>
            <td>{{ info.tires.section }}/{{ info.tires.ratio }}R{{ info.tires.diameter }}</td>
            <td>{{ info.wheels.diameter }}&times;{{ info.wheels.width }} ET{{ info.wheels.offset }}</td>

            <!-- button options -->
            <td class="button" v-if="trash" @click="deleteCar(key);refresh();">
                <img src="/assets/trash.svg">
            </td>
        </tr>
    </table>
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