<script setup>
    
    const props = defineProps({
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
        }
    });

    defineEmits(['valChange']);
</script>

<template>
    <div class="optionslider">
        <div class="optwrap" v-for="option in options">
            <input type="radio"
                    @change="$emit('valChange', $event.target.value)"
                    :id = "inputname+'_'+option"
                    :value="option"
                    :name="inputname"
                    :checked="defaultoption===option" />
            <label :for="inputname+'_'+option"><div class="opt">
                {{ option }}
            </div></label>
        </div>
    </div>
</template>

<style scoped>
    div.optionslider {
        display: inline-block;
        background-color: var(--color-accent4);
        color: var(--color-text);
        border-radius: 8pt;
    }
    div.optwrap {
        display: inline-block;
        margin: 4pt;
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
        display: none;
    }
</style>