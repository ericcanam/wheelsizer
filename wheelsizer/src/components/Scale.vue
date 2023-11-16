<script setup>
    const props = defineProps({
        modelValue:{
            required: true
        },
        inputname:{
            type: String,
            required: true
        },
        min:{
            type: Number,
            required: true
        },
        minLabel:{
            type: String,
            default: undefined
        },
        minColor:{
            type: String,
            default: 'var(--color-accent3)'
        },
        max:{
            type: Number,
            required: true
        },
        maxLabel:{
            type: String,
            default: undefined
        },
        maxColor:{
            type: String,
            default: 'var(--color-accent3)'
        },
        discreteSnapPoints:{
            type: Array,
            default: undefined
        },
        showControls:{
            type: Boolean,
            default: false
        }
    });

    // set labels if they are not defined
    var minLabelComputed = props.minLabel || props.min.toString();
    var maxLabelComputed = props.maxLabel || props.max.toString();

    var mv = props.modelValue;

    const defaultPercentage = 100*(mv-props.min)/(props.max-props.min);
    const gstring = "linear-gradient(to right, "+props.minColor+", var(--color-accent2) "+defaultPercentage+"%, "+props.maxColor+")";

    // send out updated value (and "round" it to nearest discrete point if applicable)
    function update(event){
        let target = event.target;
        let value = target.value;

        mv = value;
        if(!props.discreteSnapPoints){
            // no snap points, send it
            emits('update:modelValue', value);
        }else{
            // snap points, find closest one and send that
            let index = 0;
            while(index<props.discreteSnapPoints.length && props.discreteSnapPoints[index]<value){
                index++;
            }
            if(index == 0){
                // value is equal to min
                target.value = props.discreteSnapPoints[0];
                
            }else if(index==props.discreteSnapPoints.length){
                // value is equal to max
                target.value = props.discreteSnapPoints[props.discreteSnapPoints.length];
            }else{
                // value is somewhere between two points
                let upper = props.discreteSnapPoints[index];
                let lower = props.discreteSnapPoints[index-1];
                if(value >= (upper+lower)/2){
                    // higher
                    target.value = upper;
                }else{
                    // lower
                    target.value = lower;
                }
            }
            emits('update:modelValue', target.value);
        }
    }
    function stepDown(){}
    function stepUp(){}

    defineExpose({
        update
    });

    const emits = defineEmits(['update:modelValue']);
</script>

<template>
    <p>
        <div class="scalebox">
            <button v-if="showControls" tabindex="-1" type="button" class="nofocus" style="float: left;"
                @click="stepDown($event.target.value)"><img src="/assets/left_chevron.svg" /></button>
            <button v-if="showControls" tabindex="-1" type="button" class="nofocus" style="float: right;"
                @click="stepUp($event.target.value)"><img src="/assets/right_chevron.svg" /></button>
            
            <div class="slidercontainer"><input type="range" @input="update($event)"
                :name="inputname"
                step=0.1
                :min="min" :max="max" :value="modelValue" /></div>

        </div>
    </p>
</template>

<style>
    div.scalebox {
        width: 100%;
    }
    div.scalebox button {
        padding: 6pt;
	    background-color: transparent;
        cursor: pointer;
        display: block;
        overflow: hidden;
    }
    div.scalebox input {
        position: relative;
        top: 6pt;
        width: 100%;
        background: v-bind('gstring');
    }
    div.slidercontainer {
        height: 26pt;
        overflow-x: hidden;
    }

    input[type="range"] {
        -webkit-appearance: none;
        height: 12pt;
        padding: 0;
        border-radius: 6pt;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16pt;
        height: 16pt;
        border-radius: 9pt;
        background: var(--color-accent1);
        cursor: pointer;
        border: 2pt solid var(--color-text);
    }
    input[type="range"]:focus::-webkit-slider-thumb {
        background-color: var(--color-text);
    }

    input[type="range"]::-moz-range-thumb {
        width: 16pt;
        height: 16pt;
        border-radius: 9pt;
        background: var(--color-accent1);
        cursor: pointer;
        border: 2pt solid var(--color-text);
    }
    input[type="range"]:focus::-moz-range-thumb {
        background-color: var(--color-text);
    }
</style>