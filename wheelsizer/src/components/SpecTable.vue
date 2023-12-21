<script setup>
    import { niceNumber, fpm,
        getPythagLength, getPythagAngle,
        tireHeight, tireCircumf,
        getWheels, isLegalTire,
        getPokeDiff, getInsetDiff, getNewPctDiff } from '../pages/calcs.js';

    const props = defineProps({
        config:         {type: String,      default: 'Both'},
        singular:        {type: Boolean,     default: false},
        newstagger:     {type: Boolean,     default: false},
        oemstagger:     {type: Boolean,     default: false},
        advanced:       {type: Object,      default: null},
        ow:             {type: Object,      required: false},
        ot:             {type: Object,      required: false},
        nw:             {type: Object,      required: false},
        nt:             {type: Object,      required: false}
    });

    function anyStagger(){ return props.oemstagger || props.newstagger; }
    function stagToSquare(){ return props.oemstagger && !props.newstagger; }

    // calculated properties
    function foh() {return props.singular ? null : tireHeight(props.ow.front.diameter, props.ot.front.ratio, props.ot.front.section);}
    function roh() {return props.singular ? null : tireHeight(props.ow.rear.diameter, props.ot.rear.ratio, props.ot.rear.section);}
    function fthd() {return tireHeight(props.nw.front.diameter, props.nt.front.ratio, props.nt.front.section);}
    function rthd() {return tireHeight(props.nw.rear.diameter, props.nt.rear.ratio, props.nt.rear.section);}

    var hypotenuse, hypAngle;
    // advanced stuff included
    if(props.advanced){
        // wheelbase
        if(props.advanced.wheelbase && !props.singular){
            // this is the distance between the wheel centers (front to rear projected side)
            hypotenuse = getPythagLength(props.advanced.wheelbase, ((roh() - foh())/2));
            hypAngle = getPythagAngle(((roh() - foh())/2), hypotenuse);
        }

    }
</script>

<template>
    <table>
        <tr>
            <th>Property</th><th>{{ anyStagger() ? 'Front' : 'Value' }}</th><th v-if="anyStagger()">Rear</th>
        </tr>
        <!-- Tire size -->
        <tr>
            <td>Tire Size</td><td :colspan="1+(stagToSquare())">{{ nt.front.section + '/' + nt.front.ratio + 'R' + nw.front.diameter }}</td>
            <td v-if="newstagger">{{ nt.rear.section + '/' + nt.rear.ratio + 'R' + nw.rear.diameter }}</td>
        </tr>
        <!-- Wheel size -->
        <tr>
            <td>Wheel Size</td><td :colspan="1+(stagToSquare())">{{ nw.front.diameter + '" &times; ' + nw.front.width +'", ET' + nw.front.offset }}</td>
            <td v-if="newstagger">{{ nw.rear.diameter + '" &times; ' + nw.rear.width +'", ET' + nw.rear.offset }}</td>
        </tr>
        <!-- tire-related stuff -->
        <template v-if="config!='Wheels'">
            <!-- Tire height -->
            <tr>
                <td>Tire Height</td><td :colspan="1+(stagToSquare())">{{
                    singular || stagToSquare() ? 
                    niceNumber(tireHeight(nw.front.diameter, nt.front.ratio, nt.front.section))+' mm' : 
                    getNewPctDiff(foh(), tireHeight(nw.front.diameter, nt.front.ratio, nt.front.section))
                }}</td>
                <td v-if="newstagger">{{
                    singular ? 
                    niceNumber(tireHeight(nw.rear.diameter, nt.rear.ratio, nt.rear.section))+' mm' : 
                    getNewPctDiff(roh(), tireHeight(nw.rear.diameter, nt.rear.ratio, nt.rear.section))
                }}</td>
            </tr>
            <!-- Tire circumference -->
            <tr>
                <td>Tire Circumference</td><td :colspan="1+(stagToSquare())">{{ niceNumber(tireCircumf(nw.front.diameter, nt.front.ratio, nt.front.section)) + ' mm' }}</td>
                <td v-if="newstagger">{{ niceNumber(tireCircumf(nw.rear.diameter, nt.rear.ratio, nt.rear.section)) + ' mm' }}</td>
            </tr>
            <!-- Sidewall height (as a distance rather than ratio) -->
            <tr>
                <td>Sidewall Height</td><td :colspan="1+(stagToSquare())">{{ niceNumber(nt.front.ratio*nt.front.section/100) }} mm</td>
                <td v-if="newstagger">{{ niceNumber(nt.rear.ratio*nt.rear.section/100) }} mm</td>
            </tr>
            <!-- Ride height -->
            <tr v-if="!singular">
                <td>Ride Height Diff</td><td :colspan="1+(!anyStagger())">{{ fpm((fthd()-foh())/2) + ' mm' }}</td>
                <td v-if="anyStagger()">{{ fpm(((newstagger ? rthd() : fthd())-roh())/2) + ' mm' }}</td>
            </tr>
        </template>
        <!-- wheel-related stuff -->
        <template v-if="config!='Tires' && !singular">
            <!-- Tire Center -->
            <tr>
                <td>Tire Center</td><td>{{ fpm(ow.front.offset - nw.front.offset) }} mm</td>
                <td v-if="newstagger">{{ fpm(ow.rear.offset-nw.rear.offset) }} mm</td>
                <td v-else-if="oemstagger">{{ fpm(ow.rear.offset-nw.front.offset) }} mm</td>
            </tr>
            <!-- Wheel poke -->
            <tr>
                <td>Wheel Poke</td><td>{{ fpm(getPokeDiff(nw.front.width, nw.front.offset, ow.front.width, ow.front.offset)) }} mm</td>
                <td v-if="newstagger">{{ fpm(getPokeDiff(nw.rear.width, nw.rear.offset, ow.rear.width, ow.rear.offset)) }} mm</td>
                <td v-else-if="oemstagger">{{ fpm(getPokeDiff(nw.front.width, nw.front.offset, ow.rear.width, ow.rear.offset)) }} mm</td>
            </tr>
            <!-- Wheel inset -->
            <tr>
                <td>Wheel Inset</td><td>{{ fpm(getInsetDiff(nw.front.width, nw.front.offset, ow.front.width, ow.front.offset)) }} mm</td>
                <td v-if="newstagger">{{ fpm(getInsetDiff(nw.rear.width, nw.rear.offset, ow.rear.width, ow.rear.offset)) }} mm</td>
                <td v-else-if="oemstagger">{{ fpm(getInsetDiff(nw.front.width, nw.front.offset, ow.rear.width, ow.rear.offset)) }} mm</td>
            </tr>
        </template>
        <!-- advanced stuff -->
        <template v-if="advanced">
            <template v-if="anyStagger() && advanced.wheelbase && config!='Wheels'">
                <!-- wheelbase -->
                <tr>
                    <td>New Wheelbase</td>
                    <td colspan="2">{{ niceNumber(getPythagLength(((newstagger ? rthd() : fthd()) - fthd())/2, hypotenuse,true)) }} mm</td>
                </tr>
                <!-- body pitch -->
                <tr>
                    <td>Pitch {{ rthd()>fthd() ? '(forward)' : (fthd()>rthd() ? '(rearward)' : '') }}</td>
                    <td colspan="2">{{ niceNumber(getPythagAngle(((newstagger ? rthd() : fthd()) - fthd())/2, hypotenuse)-hypAngle) }} &deg;</td>
                </tr>
            </template>
        </template>
    </table>
</template>