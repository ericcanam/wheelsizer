<script setup>

    const INCH = 25.4;
    import { tireHeight } from '../pages/calcs.js';

    const props = defineProps({
        diameter:{
            required: true
        },
        width:{
            required: true
        },
        offset:{
            required: true
        },
        section:{
            required: true
        },
        ratio:{
            required: true
        }
    });

    // calculate stuff for SVG
    const tireheightpx = 200;
    const svgwidth = 160;
    const svgheight = 240;

    // height of the wheel in pixels
    function wheelHeightPx(){  return tireheightpx * props.diameter*INCH / tireHeight(props.diameter, props.ratio, props.section); }
    // horizontal line length for wheel barrel drawing
    function wheelBarrelPx(){
        return Math.max(wheelHeightPx() * props.width/props.diameter - 41, 0);
    }
    function wheelXPx(){
        return (svgwidth-wheelBarrelTotalPx())/2;
    }
    function wheelYPx(){
        return (svgheight-wheelHeightPx())/2;
    }
    // total rim width in pixels
    function wheelBarrelTotalPx(){
        return Math.max(wheelHeightPx() * props.width/props.diameter, 41);
    }

    const spokewidth = 8;
    // 
    function offsetInnerPx(){
        if(props.offset<0){
            return Math.max(wheelBarrelTotalPx()*((0.5) + 1/props.width * (props.offset/INCH)) - 17, 0);
        }
        return Math.min(wheelBarrelTotalPx()*((0.5) + 1/props.width * (props.offset/INCH)) - 17, wheelBarrelTotalPx()-24);
    }

    function offsetOuterPx(){
        if(props.offset>0){
            return Math.max(wheelBarrelTotalPx()*((0.5) - 1/props.width * (props.offset/INCH)) - 7, 0);
        }
        return Math.min(wheelBarrelTotalPx()*((0.5) - 1/props.width * (props.offset/INCH)) - 7, wheelBarrelTotalPx()-24)
    }

    function wheelPath(){return "M "+wheelXPx()+" "+wheelYPx()+" \
a 2 2 0 0 1 4 0 \
a 5 5 0 0 0 4.5642 4.981 \
l 5 0.4358 \
h "+wheelBarrelPx()+" \
a 2 2 0 0 1 2 2 \
a 2 2 0 0 0 2 2 \
h 6 \
a 2 2 0 0 0 2 -2 \
a 2 2 0 0 1 2 -2 \
h 0 \
l 5 -0.4358 \
a 5 5 0 0 0 4.4358 -4.981 \
a 2 2 0 0 1 4 0 \
v 2 \
a 5 5 0 0 1 -1.4645 3.535 \
l -"+Math.min(offsetOuterPx(), 12)+" "+Math.min(offsetOuterPx(), 12)+" \
h "+Math.min(-offsetOuterPx()+12, 0)+"\
a 5 5 0 0 0 -1.4645 3.535 \
v "+(wheelHeightPx() - 2*(Math.min(offsetOuterPx(), 12) + 9.07))+" \
a 5 5 0 0 0 1.4645 3.535 \
h "+Math.max(offsetOuterPx()-12, 0)+"\
l "+Math.min(offsetOuterPx(), 12)+" "+Math.min(offsetOuterPx(), 12)+" \
a 5 5 0 0 1 1.4645 3.535 \
v 2 \
a 2 2 180 0 1 -4 0 \
a 5 5 180 0 0 -4.5642 -4.981 \
l -5 -0.4358 \
h 0 \
a 2 2 180 0 1 -2 -2 \
a 2 2 180 0 0 -2 -2 \
h -6 \
a 2 2 180 0 0 -2 2 \
a 2 2 180 0 1 -2 2 \
h -"+wheelBarrelPx()+" \
l -5 0.4358 \
a 5 5 180 0 0 -4.4358 4.981 \
a 2 2 180 0 1 -4 0 \
v -2 \
a 5 5 180 0 1 1.4645 -3.535 \
l 4 -4 \
a 5 5 180 0 1 3.535 -1.4645 \
h "+offsetInnerPx()+" \
a 5 5 0 0 0 3.535 -1.4645 \
l 3 -3 \
a 5 5 0 0 0 1.4645 -3.535 \
v -"+(wheelHeightPx() - (2*19.034))+" \
a 5 5 0 0 0 -1.4645 -3.535 \
l -3 -3 \
a 5 5 0 0 0 -3.535 -1.4645 \
h -"+offsetInnerPx()+" \
a 5 5 180 0 1 -3.535 -1.4645 \
l -4 -4 \
a 5 5 180 0 1 -1.4645 -3.535 \
z";}
</script>

<template>
    <svg :viewBox="'0 0 '+svgwidth+' '+svgheight" style="width: 4in;">
        <path :d="wheelPath()" 
        style="fill:#FFFFFF;" />
    </svg>
</template>