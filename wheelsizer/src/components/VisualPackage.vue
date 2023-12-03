<script setup>

    const INCH = 25.4;
    import { tireHeight, getPokeDiff, getInsetDiff } from '../pages/calcs.js';

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
        },
        old:{
            type: Object,
            required: true
        },
        nolegend:{
            type: Boolean,
            default: false
        }
    });

    // calculate stuff for SVG
    const tireheightpx = 200;
    const drawingwidth = 160;
    const drawingheight = 220;
    const svgheight = drawingheight+2;
    const centerliney1 = (drawingheight-tireheightpx)/2 - 10;
    const centerliney2 = drawingheight-centerliney1;

    function mmToPx(n){
        return tireheightpx * n / Math.max(tireHeight(props.diameter, props.ratio, props.section), props.width*INCH*(drawingheight/drawingwidth));
    }
    function inToPx(n){
        return INCH * mmToPx(n);
    }

    // height of the wheel in pixels
    function wheelHeightPx(){  return inToPx(props.diameter); }
    // horizontal line length for wheel barrel drawing
    function wheelBarrelPx(){
        return Math.max(inToPx(props.width) - 41, 0);
    }
    // total rim width in pixels
    function wheelBarrelTotalPx(){
        return Math.max(inToPx(props.width), 41);
    }
    // where to start the drawing of the rim
    function wheelXPx(){
        return (drawingwidth-wheelBarrelTotalPx())/2;
    }
    function wheelYPx(){
        return (drawingheight-wheelHeightPx())/2;
    }
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

    const maxbarreldiag = 8;
    function wheelPath() {
        return "M "+wheelXPx()+" "+wheelYPx()+" \
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
l -"+Math.min(offsetOuterPx(), maxbarreldiag)+" "+Math.min(offsetOuterPx(), maxbarreldiag)+" \
h "+Math.min(-offsetOuterPx()+maxbarreldiag, 0)+"\
a 5 5 0 0 0 -1.4645 3.535 \
v "+(wheelHeightPx() - 2*(Math.min(offsetOuterPx(), maxbarreldiag) + 9.07))+" \
a 5 5 0 0 0 1.4645 3.535 \
h "+Math.max(offsetOuterPx()-maxbarreldiag, 0)+"\
l "+Math.min(offsetOuterPx(), maxbarreldiag)+" "+Math.min(offsetOuterPx(), maxbarreldiag)+" \
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
v -3 \
a 5 5 180 0 1 1.4645 -3.535 \
l 4 -4 \
a 5 5 180 0 1 3.535 -1.4645 \
h "+offsetInnerPx()+" \
a 5 5 0 0 0 3.535 -1.4645 \
l 3 -3 \
a 5 5 0 0 0 1.4645 -3.535 \
v -"+(wheelHeightPx() - (2*20.034))+" \
a 5 5 0 0 0 -1.4645 -3.535 \
l -3 -3 \
a 5 5 0 0 0 -3.535 -1.4645 \
h -"+offsetInnerPx()+" \
a 5 5 180 0 1 -3.535 -1.4645 \
l -4 -4 \
a 5 5 180 0 1 -1.4645 -3.535 \
z";
    }

    // where to START the drawing of the tire sections
    function tireXPx(){
        return wheelXPx() + 8.5642;
    }
    function topTireYPx(){
        return wheelYPx() + 2.981;
    }
    function lowTireYPx(){
        return wheelYPx() + wheelHeightPx() - 2.981;
    }
    // curve endpoint for the wheel-half of the sidewall's curvature (relative)
    function tireSectionXPx(){
        return (wheelBarrelTotalPx()-mmToPx(props.section)-4)/2;
    }
    function tireSectionYPx(){
        return (tireheightpx-wheelHeightPx())/4;
    }

    function tirePatchWidth(){
        return wheelBarrelTotalPx() - 32.1284 - 2*tireSectionXPx();
    }
    function tirePath() {
        return "M "+tireXPx()+" "+topTireYPx()+" \
a 3 3 0 0 1 -2.5 -3 \
c 0 -3 "+tireSectionXPx()+" -2 "+tireSectionXPx()+" -"+tireSectionYPx()+" \
a 30 30 0 0 1 "+(10)+" -"+tireSectionYPx()+"\
h "+tirePatchWidth()+"\
a 20 30 0 0 1 "+(10)+" "+tireSectionYPx()+"\
c 0 "+(tireSectionYPx()-2)+" "+(tireSectionXPx())+" "+(tireSectionYPx()-3)+" "+tireSectionXPx()+" "+tireSectionYPx()+" \
a 3 3 0 0 1 -2.5 3 \
M "+tireXPx()+" "+lowTireYPx()+" \
a 3 3 0 0 0 -2.5 3 \
c 0 3 "+tireSectionXPx()+" 2 "+tireSectionXPx()+" "+tireSectionYPx()+" \
a 30 30 0 0 0 "+(10)+" "+tireSectionYPx()+"\
h "+tirePatchWidth()+"\
a 20 30 0 0 0 "+(10)+" -"+tireSectionYPx()+"\
c 0 "+(-tireSectionYPx()+2)+" "+(tireSectionXPx())+" "+(-tireSectionYPx()+3)+" "+tireSectionXPx()+" -"+tireSectionYPx()+" \
a 3 3 0 0 0 -2.5 -3 \
";
    }

    // center line position
    function oldCenterXPx(){
        return drawingwidth/2 - mmToPx(props.old.offset - props.offset);
    }
    // old tire patch
    function oldTirePatchWidth(){
        return tirePatchWidth()*(props.old.section/props.section);
    }
    function oldTirePatchX1Px(){
        return oldCenterXPx() - oldTirePatchWidth()/2;
    }
    function oldTirePatchX2Px(){
        return oldCenterXPx() + oldTirePatchWidth()/2;
    }

    // poke (space +/- on OUTSIDE)
    function pokePath(){
        return "M "+((wheelBarrelTotalPx()+drawingwidth)/2-1.5)+" "+((wheelHeightPx()+drawingheight)/2-5.481)+" \
a 5 5 0 0 1 1.4645 3.535 \
v 2 \
a 2 2 0 0 1 -2 2 \
h "+(-mmToPx(getPokeDiff(props.width, props.offset, props.old.width, props.old.offset)))+" \
a 2 2 0 0 0 2 -2 \
v -2 \
a 5 5 0 0 1 -1.4645 -3.535 \
z \
M "+((wheelBarrelTotalPx()+drawingwidth)/2-1.5)+" "+((drawingheight-wheelHeightPx())/2+5.481)+" \
a 5 5 0 0 1 1.4645 -3.535 \
v -2 \
a 2 2 0 0 1 -2 -2 \
h "+(-mmToPx(getPokeDiff(props.width, props.offset, props.old.width, props.old.offset)))+" \
a 2 2 0 0 0 2 2 \
v 2 \
a 5 5 0 0 1 -1.4645 3.535 \
z";
    }
    // shade/outline for poke stuff
    function pokeStyle(){
        let p = getPokeDiff(props.width, props.offset, props.old.width, props.old.offset);
        if(p>0){
            return 'stroke:var(--color-accent5); fill:var(--color-accent5-shade);';
        }else if(p<0){
            return 'stroke:var(--color-accent2); fill:var(--color-accent2-shade);'; 
        }
        return 'stroke:none; fill:none;'
    }

    // inset (space +/- on INSIDE)
    function insetPath(){
        return "M "+((drawingwidth-wheelBarrelTotalPx())/2+1.5)+" "+((wheelHeightPx()+drawingheight)/2-5.481)+" \
a 5 5 0 0 1 -1.4645 3.535 \
v 2 \
a 2 2 0 0 1 2 2 \
h "+(mmToPx(getInsetDiff(props.width, props.offset, props.old.width, props.old.offset)))+" \
a 2 2 0 0 0 -2 -2 \
v -2 \
a 5 5 0 0 1 1.4645 -3.535 \
z \
M "+((drawingwidth-wheelBarrelTotalPx())/2+1.5)+" "+((drawingheight-wheelHeightPx())/2+5.481)+" \
a 5 5 0 0 1 -1.4645 -3.535 \
v -2 \
a 2 2 0 0 1 2 -2 \
h "+(mmToPx(getInsetDiff(props.width, props.offset, props.old.width, props.old.offset)))+" \
a 2 2 0 0 0 -2 2 \
v 2 \
a 5 5 0 0 1 1.4645 3.535 \
z";
    }
    // shade/outline for poke stuff
    function insetStyle(){
        let i = getInsetDiff(props.width, props.offset, props.old.width, props.old.offset);

        if(i>0){
            return 'stroke:var(--color-accent5); fill:var(--color-accent5-shade);';
        }else if(i<0){
            return 'stroke:var(--color-accent2); fill:var(--color-accent2-shade);'; 
        }
        return 'stroke:none; fill:none;'
    }

    // inner barrel space
    function barrelIntrusionPx(){
        return inToPx(props.diameter - props.old.diameter)/2;
    }
    function barrelIntrusionPath(){
        return "M "+((drawingwidth-wheelBarrelTotalPx())/2+1.5)+" "+((wheelHeightPx()+drawingheight)/2-6.481)+" \
l 4 -4 \
a 5 5 0 0 0 3.535 -1.4645 \
h "+offsetInnerPx()+" \
a 5 5 0 0 1 3.535 -1.4645 \
l 3 -3 \
a 5 5 0 0 1 1.4645 -3.535 \
v "+(-barrelIntrusionPx())+"\
a 5 5 0 0 1 -1.4645 3.535 \
l -3 3 \
a 5 5 0 0 1 -3.535 1.4645 \
h -"+offsetInnerPx()+" \
a 5 5 0 0 0 -3.535 1.4645 \
l -4 4 \
z \
M "+((drawingwidth-wheelBarrelTotalPx())/2+1.5)+" "+((drawingheight-wheelHeightPx())/2+6.481)+" \
l 4 4 \
a 5 5 0 0 0 3.535 1.4645 \
h "+offsetInnerPx()+" \
a 5 5 0 0 1 3.535 1.4645 \
l 3 3 \
a 5 5 0 0 1 1.4645 3.535 \
v "+(barrelIntrusionPx())+"\
a 5 5 0 0 1 -1.4645 -3.535 \
l -3 -3 \
a 5 5 0 0 1 -3.535 -1.4645 \
h -"+offsetInnerPx()+" \
a 5 5 0 0 0 -3.535 -1.4645 \
l -4 -4 \
z";
    }
    function barrelIntrusionStyle(){
        let b = props.old.diameter - props.diameter;
        if(b>0){
            return 'stroke:var(--color-accent5); fill:var(--color-accent5-shade);';
        }else if(b<0){
            return 'stroke:var(--color-accent2); fill:var(--color-accent2-shade);'; 
        }
        return 'stroke:none; fill:none;'
    }


    function brakeCaliperPath(){
        return "M "+(tireXPx()+offsetInnerPx()+5)+" "+(drawingheight/2)+" \
        v 18 l -6 6 h -10 v 17 h 4 v -17 h -10 l -6 -6 v -8 l -8 -1 v -18 l 4 -0.5 \
l -0.25 -2 l 0.25 2 l 4 -0.5 m 6 4 v 12 h 10 a 4 4 90 0 0 4 -4 v -4 a 4 4 90 0 0 -4 -4 h -10 m -6 -4 v -8 l 6 -6 h 10 v -17 h -4 v 17 h 10 l 6 6 v 18";
    }


    // legend stuff
    const legendwidth = 70;
    const yspace = 20;
    const lsquare = 10;
    const xspace = 5;
    const legend = [
        {label: "Space Taken",          stroke: "var(--color-accent5)", fill: "var(--color-accent5-shade)"},
        {label: "Space Freed",          stroke: "var(--color-accent2)", fill: "var(--color-accent2-shade)"},
        {label: "Old Tread Center",     stroke: "var(--color-accent4)"},
        {label: "New Tread Center",     stroke: "var(--color-accent1)"},
        {label: "Old Contact Patch",     stroke: "var(--color-tire-patch)"}
    ];
</script>

<template>
    <svg class="wtdrawing" :viewBox="'0 0 '+(drawingwidth+legendwidth*(!nolegend))+' '+svgheight" style="max-width:100%;max-height: 4.5in;">
        
        <!-- brake caliper -->
        <path :d="brakeCaliperPath()"
            style="stroke:var(--color-suspension);fill:var(--color-suspension-shade);"
        />

        <!-- tire sections -->
        <path :d="tirePath()" 
            style="stroke:var(--color-tire); stroke-width:4px;fill:none;/*fill:var(--color-tire);*/"
        />

        <!-- wheel rim -->
        <path :d="wheelPath()" 
            style="fill:var(--color-wheel);"
        />
        
        <!-- old (moving, comparator) center line -->
        <line :x1="oldCenterXPx()" :x2="oldCenterXPx()" :y1=centerliney1 :y2=centerliney2
            style="stroke:var(--color-accent4);"
        />
        <!-- new center line -->
        <line :x1="drawingwidth/2" :x2="drawingwidth/2" :y1=centerliney1 :y2=centerliney2
            style="stroke:var(--color-accent1);"
        />
        <line :x1="oldTirePatchX1Px()" :x2="oldTirePatchX2Px()" :y1=centerliney2 :y2=centerliney2
            style="stroke:var(--color-tire-patch);"
        />


        <!-- poke indicator -->
        <path class="zone" :d="pokePath()"
            :style="pokeStyle()"
        />

        <!-- inset indicator -->
        <path class="zone" :d="insetPath()"
            :style="insetStyle()"
        />

        <!-- barrel intrusion indicator -->
        <path class="zone" :d="barrelIntrusionPath()"
            :style="barrelIntrusionStyle()"
        />

        <!-- LEGEND -->
        <text :x="drawingwidth" y=10 style="font-weight:500;">Legend</text>
        <g v-for="(item, index) in legend">
            <rect v-if="item.fill"
                :x=drawingwidth :y="2.5+((index+1)*yspace)" :width=lsquare :height=lsquare
                :style="'stroke:'+item.stroke+';fill:'+item.fill+';'"
            />
            <line v-else
                :x1=drawingwidth :y1="2.5+((index+1)*yspace)+(lsquare/2)"
                :x2="drawingwidth+lsquare" :y2="2.5+((index+1)*yspace)+(lsquare/2)"
                :width=lsquare :height=lsquare
                :style="'stroke:'+item.stroke+';'"
            />
            <text :x="drawingwidth+lsquare+xspace" :y="10+((index+1)*yspace)">{{ item.label }}</text>
        </g>
    </svg>
</template>

<style>
    :root {
        --color-wheel: #8c8c8f;
        --color-tire: #0c0c0f;
        --color-suspension: #303540;
        --color-suspension-shade: rgba(48, 53, 64, 0.25);
        --color-tire-patch: #f5f5f5;
    }

    .wtdrawing text {
        fill: var(--color-text);
        font-size: 7px;
    }
    .wtdrawing path.zone, .wtdrawing line, .wtdrawing rect {
        stroke-linecap: round; 
        stroke-width: 1px;
        stroke-dasharray: 2px 2px;
        stroke-linejoin: bevel;
    }

    @media (prefers-color-scheme: light) {
        .wtdrawing text {
        fill: var(--color-tex-light);
        }

        :root {
            --color-tire-patch: #050505;
        }
    }
</style>