<script setup>
    import { ref } from 'vue';
    
    const props = defineProps({
        modelValue:{},
        inputname:{
            type: String,
            required: true
        },
        options:{
            type:Array,
            required: true
        },
        disabled:{
            type:Boolean,
            default:false
        },
        defaultoption:{
            type:String,
            default:null
        },
        linesep:{
            type:Boolean,
            default:false
        }
    });

    const errorLine = ref();
    const inputElement = ref();

    function focusBox(){ inputElement.value.classList.add('hasfocus'); }
    function unfocusBox(event){
        //if(!inputElement.value.contains(event.relatedTarget)){
            inputElement.value.classList.remove('hasfocus');
        //}
    }

    function setError(status){
        inputElement.value.classList.add("errorlight");
        if(errorLine.value.innerHTML != ""){
            errorLine.value.innerHTML += "<br />";
        }
        errorLine.value.innerHTML += status;
    }
    function unsetError(){
        inputElement.value.classList.remove("errorlight");
        errorLine.value.innerHTML = "";
    }

    defineExpose({
        setError,
        unsetError
    });

    const emit = defineEmits(['update:modelValue']);
    emit('update:modelValue', props.defaultoption);
</script>

<template>
    <div class="optionscontainer">
        <div ref="inputElement" class="optionslider">
            <div :class="'optwrap' + (linesep ? ' lineopt' : '')" v-for="(option, index) in options">
                <input type="radio"
                    @focus = "focusBox"
                    @blur  = "unfocusBox"
                    @input="$emit('update:modelValue', $event.target.value)"
                    :id = "inputname+'_'+option"
                    :value="option"
                    :name="inputname"
                    :checked="defaultoption===option" />
                <label :for="inputname+'_'+option"><div class="opt">
                    {{ option }}
                </div></label>
            </div>
        </div>
        <div class="errorline" ref="errorLine"></div>
    </div>
</template>

<style scoped>
    div.optionscontainer {
        display: inline-block;
    }
    div.optionslider {
        background-color: var(--color-backshade);
        color: var(--color-text);
        border-radius: 8pt;
    }
    div.optwrap {
        display: inline-block;
        margin: 4pt;
    }
    div.lineopt {
        display: block;
    }
    label {
        cursor: pointer;
    }
    div.opt {
        border-radius: 4pt;
        padding: 4pt;
        padding-left: 12pt;
        padding-right:12pt;
    }
    input:checked + label div.opt {
        background-color: var(--color-accent1);
    }
    input {
        position: absolute;
        opacity: 0;
    }
</style>