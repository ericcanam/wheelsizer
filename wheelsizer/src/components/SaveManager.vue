<script setup>
    import { ref } from 'vue';
    
    import { UNSAVED_STRING, writeCar, getCarList, deleteCar, getAppData } from '../cookies.js';

    const props = defineProps({
        ad:{
            type: Object,
            required: true
        },
        step:{
            type: Number,
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
        if(ad.savename!=UNSAVED_STRING && ad.savename!=name){
            deleteCar(ad.savename);
        }
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
            <div tabindex="0" class="step" @click="toggleVisibility()">
                <div class="iconcircle square">
                    <img alt="Menu" src="/assets/gear.svg" />
                </div>
                <div class="steptitle">Menu</div>
            </div>
            <div class="menu"><!-- Drop down menu -->
                
                <!-- list of saved cars-->
                <table v-if="showList()" style="min-width: 100%;">
                    <tr>
                        <th :colspan="1 + trash">Load Vehicle</th>
                    </tr>
                    <tr v-for="(info, key, index) in cars">
                        <!-- Car title -->
                        <td class="button" @click="
                            $emit('update', getAppData(key, ad, info));
                            toggleVisibility();
                        ">
                            {{ key }}
                        </td>

                        <!-- button options -->
                        <td class="button" v-if="trash" @click="deleteCar(key);refresh();">
                            <img src="/assets/trash.svg">
                        </td>
                    </tr>
                </table>

                <!-- SAVE button -->
                <button class="go" v-if="step>2" @click="saveCar(
                    ad.cartitle,
                    ad
                );">
                    <template v-if="ad.savename==UNSAVED_STRING || ad.savename.trim()==ad.cartitle">
                        Save "{{ ad.cartitle }}"
                    </template>
                    <template v-else>
                        Overwrite "{{ ad.savename.trim() }}"
                    </template>
                </button>
                <button style="cursor: inherit;" v-else @click="step = 1;">Complete car details to save</button>
                
                <!-- CLEAR button -->
                <button v-if="ad.cartitle!==undefined" class="suggest" @click="
                    $emit('update', null);
                    toggleVisibility();
                ">Reset</button>

            </div>
        </div>
    </div>
    <div class="menusplash" v-if="open" @click="toggleVisibility()"><!-- background to blur the rest of the screen --></div>
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