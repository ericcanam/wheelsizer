<script setup>
    import { ref } from 'vue';

    import TextBar from './components/TextBar.vue';
    import OptionToggle from './components/OptionToggle.vue';

    import { allNumeric, isNumeric } from './pages/validator.js';
    import { niceNumber, getWheels, tireHeight, getPctDiff, getPctDiffUnform } from './pages/calcs.js';

    import BoltPattern from './components/fields/BoltPattern.vue';
    import TireSize from './components/fields/TireSize.vue';
    import WheelSize from './components/fields/WheelSize.vue';

    import InfoBox from './components/InfoBox.vue';
    import Checklist from './components/Checklist.vue';

    import { getCode, readCode } from './codes.js';

    const QUERY = new URLSearchParams(window.location.search).get('c');
    const CREATE_MODE = !QUERY;
    const QUERY_SETUP = !CREATE_MODE ? readCode(QUERY) : { 'wheels': null, 'tires': null };

    const fields = {
        of_bp: ref(),
        of_wheel: ref(),
        of_cb: ref(),
        of_offset: ref(),
        of_tire: ref()
    }

    const osetup = ref(CREATE_MODE ? "Wheels" : "Both");
    const ostaggered = ref("No");
    const of_tire = ref({ "of_section": "", "of_ratio": "", "of_diam": "" });
    const of_wheel = ref({ "of_diameter": "", "of_width": "" });
    const of_bp = ref({ "pcd": "", "holes": "" });
    const of_cb = ref('');
    const of_offset = ref('');

    // set default input values to the aftermarket set (from query)
    /*if(!CREATE_MODE){
        ostaggered.value = "No";
        if(QUERY_SETUP.tires){
            of_tire.value = { "of_section": QUERY_SETUP.tires.section,
                              "of_ratio": QUERY_SETUP.tires.ratio,
                              "of_diam": QUERY_SETUP.tires.diameter };
        }
        if(QUERY_SETUP.wheels){
            of_wheel.value = { "of_diameter": QUERY_SETUP.wheels.diameter, 
                               "of_width": QUERY_SETUP.wheels.width };
            of_bp.value = { "of_pcd": QUERY_SETUP.wheels.pcd,
                            "of_holes": QUERY_SETUP.wheels.holes };
            of_cb.value = QUERY_SETUP.wheels.bore;
            of_offset.value = QUERY_SETUP.wheels.offset;
        }
    }*/

    const urlcontainer = ref();
    const checklistcontainer = ref();
    const qrcanvas = ref();

    function formsubmit(e){
        e.preventDefault();
        let formdata = {};
        new FormData(e.target).forEach((value, field) => formdata[field] = value);

        const oldfront = {
            // tire stuff
            'tires': (osetup.value=='Wheels' ? null : {
                'section': formdata.of_section,
                'ratio': formdata.of_ratio,
                'diameter': formdata.of_diam
            }),
            // wheel setuff
            'wheels': (osetup.value=='Tires' ? null : {
                'width': formdata.of_width,
                'offset': formdata.of_offset,
                'diameter': formdata.of_diameter,
                'pcd': formdata.of_pcd ,
                'holes': formdata.of_holes,
                'bore': formdata.of_bore
            })
        };

        // check for errors in form submission
        if(!validate()){
            return;
        }

        if(CREATE_MODE){
            // create URL for setup
            urlcontainer.value.innerHTML = "URL Will Appear Here";
            urlcontainer.value.setAttribute("href", "");
            let url = "https://wheelhub.io/check?c="+getCode(oldfront);

            urlcontainer.value.innerHTML = url;
            urlcontainer.value.setAttribute("href", url);

            drawCanvas(url);
        }
        else{
            // clear table
            checklistcontainer.value.clearRows();

            // check user's OEM specs against setup from the URL

            // wheels
            if(QUERY_SETUP.wheels){
                // check bolt pattern
                checklistcontainer.value.addRow(
                    "Bolt Pattern ("+QUERY_SETUP.wheels.holes+"&times;"+QUERY_SETUP.wheels.pcd+")",
                    [], (bpEqual(oldfront, QUERY_SETUP) ? [] : [
                        "The bolt pattern does not match your vehicle's."
                ]));

                // check centre bore
                checklistcontainer.value.addRow("Centre Bore ("+QUERY_SETUP.wheels.bore+" mm)",
                    // centre bore too small, warn and advise hubcentric rings
                    (oldfront.wheels.bore < QUERY_SETUP.wheels.bore ?
                        ["Your vehicle's centre bore is smaller than on these wheels. Some vehicles may require hub-centric rings."] : []),
                    // centre bore is too big, error
                    (oldfront.wheels.bore > QUERY_SETUP.wheels.bore ?
                        ["Your vehicle's centre bore is too large to mount these wheels."] : [])
                );
                
                // check wheel diameter
                checklistcontainer.value.addRow("Wheel Diameter ("+QUERY_SETUP.wheels.diameter+"&quot;)",
                    // brake interference
                    (oldfront.wheels.diameter > QUERY_SETUP.wheels.diameter ?
                        ["Smaller diameter wheels may interfere with your vehicle's brakes."] : []),
                    // need tires as well
                    (!QUERY_SETUP.tires && oldfront.wheels.diameter!=QUERY_SETUP.wheels.diameter ?
                        ["This setup will require new tires as well."] : [])
                );
                
                // check offset
                let offset_diff = Math.abs(oldfront.wheels.offset-QUERY_SETUP.wheels.offset);
                let offset_direction = oldfront.wheels.offset<QUERY_SETUP.wheels.offset ? "in" : "out";
                checklistcontainer.value.addRow("Wheel Offset ("+QUERY_SETUP.wheels.offset+" mm)",
                    // not exact offset match
                    (offset_diff ?
                        ["The offset moves the contact patch centres "+offset_diff+" mm further "+offset_direction+"."] : [])
                );
            }

            // tires
            if(QUERY_SETUP.tires){
                // check wheel diameter
                if(!QUERY_SETUP.wheels){ // only do diameter if wheels aren't present, otherwise this will have already been checked.
                    checklistcontainer.value.addRow("Wheel Diameter ("+QUERY_SETUP.tires.diameter+"&quot;)",
                        // brake interference
                        (oldfront.tires.diameter > QUERY_SETUP.tires.diameter ?
                            ["Smaller diameter wheels may interfere with your vehicle's brakes."] : []),
                        // need wheels as well
                        (!QUERY_SETUP.wheels && oldfront.tires.diameter!=QUERY_SETUP.tires.diameter ?
                            ["This setup will require new wheels as well."] : [])
                    );
                }

                
                // check tire height
                let old_height = tireHeight(oldfront.tires.diameter, oldfront.tires.ratio, oldfront.tires.section);
                let new_height = tireHeight(QUERY_SETUP.tires.diameter, QUERY_SETUP.tires.ratio, QUERY_SETUP.tires.section);
                let pct_diff_form = getPctDiff(old_height, new_height);
                let pct_diff = getPctDiffUnform(old_height, new_height);
                let diff_direction = (pct_diff>0 ? "taller" : "shorter");
                let tire_message = "These tires are "+pct_diff_form+" "+diff_direction+" than your vehicle's.";
                checklistcontainer.value.addRow("Tire Height ("+pct_diff_form+")",
                    // tire height different
                    (Math.abs(pct_diff)>2 ?
                        [tire_message] : []),
                    [],
                    (Math.abs(pct_diff)<=2 ?
                        [tire_message] : []),
                );

                                
                // check tire section
                let section_diff = niceNumber(Math.abs(QUERY_SETUP.tires.section-oldfront.tires.section));
                let section_wider = QUERY_SETUP.tires.section>oldfront.tires.section;
                checklistcontainer.value.addRow("Tire Section ("+QUERY_SETUP.tires.section+" mm)",
                    // tire section different
                    (section_diff ?
                        // wider or narrower
                        ["These tires are "+section_diff+" mm "+(section_wider ? "wider" : "narrower")+" than your vehicle's. "+
                         (section_wider ?
                            "This may cause rubbing." : // wider
                            "This may lead to a narrower contact patch." // narrower
                        )] : []) // the same
                );
            }
        }
    }

    function validate(){
        clearErrors();

        // wheel stuff
        let wheelstuff = true;
        if(!CREATE_MODE || osetup.value!="Tires"){
            // front wheel
            let fwscheck = allNumeric(fields.of_wheel);

            // check these only if wheel properties (other than size) are required (wheel in query)
            let fbpcheck=true,fcbcheck=true,foffcheck=true;
            if(CREATE_MODE || QUERY_SETUP.wheels){
                // bolt pattern
                fbpcheck = allNumeric(fields.of_bp);
                // front centre bore
                fcbcheck = isNumeric(fields.of_cb);
                // front offset
                foffcheck = isNumeric(fields.of_offset);
            }

            wheelstuff =    fbpcheck &&
                            fwscheck &&
                            fcbcheck &&
                            foffcheck;
        }

        // tire stuff
        let tirestuff = true;
        if(!CREATE_MODE || osetup.value!="Wheels"){
            // front tire size
            let ftscheck = allNumeric(fields.of_tire);

            tirestuff = ftscheck;
        }

        // both stuff
        let bothstuff = wheelstuff && tirestuff;
        if(bothstuff && (!CREATE_MODE || osetup.value=="Both")){
            // tire sizes match
            let ftsmatch = fields.of_tire.value.getValues()["of_diam"].value == fields.of_wheel.value.getValues()["of_diameter"].value;
            if(!ftsmatch){
                fields.of_wheel.value.setError("", "of_diameter");
                fields.of_tire.value.setError("The tire dimension should match the specified wheel diameter.", "of_diam");
            }

            bothstuff = ftsmatch;
        }

        return wheelstuff && tirestuff && bothstuff;
    }

    // clear errors in the form field
    function clearErrors(){
		//ariaAlertRef.value.setAttribute("aria-label", "");
		// clears errors in all the child component's fields
		for(const field in fields){
			if(fields[field].value != undefined){
				fields[field].value.unsetError();
			}
		}
	}

    // draw the QR code
    function drawCanvas(url){
        var c = qrcanvas.value;
        var ctx = c.getContext("2d");

        const w = c.width;
        const h = c.height;

        
    }
    // clear the QR code
    function clearCanvas(){
        var c = qrcanvas.value;
        var ctx = c.getContext("2d");

        ctx.clearRect(0, 0, c.width, c.height);
    }


    // compare two bolt patterns
    function bpEqual(wheel1, wheel2){
        return wheel1.wheels.holes==wheel2.wheels.holes &&
               wheel1.wheels.pcd==wheel2.wheels.pcd;
    }

	const appv = APP_VERSION;
	const builddate = BUILD_DATE;
</script>

<template>
	<header>
		<div class="row">
			<a href="/"><img alt="Wheelhub" class="logo" src="/assets/logo_t1.svg" /></a>
		</div>
	</header>
	<main>
		<!--<div class="row">
			<AdBox />
		</div>-->
		<form id="sform" @submit="formsubmit" novalidate ref="formRef">
			<span ref="ariaAlertRef" role="alert"></span>
			
            <div class="row"><div class="sidebyside">
                <template v-if="CREATE_MODE">
                    <h2>Generate a Link</h2>
                    <p>
                        Enter the details of your setup to generate a link that'll allow people to check its fitment quickly.
                    </p>
                </template>

                <h3>Setup</h3>
                <p v-if="!CREATE_MODE">
                    Enter the details of your vehicle's original wheels &amp; tires to compare to this set.
                </p>
                <p v-else>
                    <!-- Wheels / Tires / Both -->
                    <OptionToggle inputname="o_setup" :options="['Wheels', 'Tires', 'Both']" v-model="osetup" autofocus>
                        What should the link check?
                    </OptionToggle>
                </p>
                <p>
                    <!-- Staggered?
                    <OptionToggle inputname="o_staggered" :options="['Yes', 'No']" v-model="ostaggered">
                        Is your setup staggered? In other words, are your wheels or tires different from front to back?
                    </OptionToggle> -->
                </p>

                <!-- Wheels -->
                <template v-if="!CREATE_MODE || osetup!='Tires'">
                    <h3>Wheels</h3>
                    <!-- Bolt Pattern -->
                    <p>
                        <BoltPattern inprefix="of" acprefix="" v-model="of_bp" :ref="fields.of_bp"
                                v-if="CREATE_MODE || QUERY_SETUP.wheels">
                            <span class="inputlabel">Bolt Pattern:</span>
                        </BoltPattern>
                    </p>
                    <!-- wheel Size -->
                    <p>
                        <WheelSize inprefix="of" acprefix="" v-model="of_wheel" :ref="fields.of_wheel">
                            <span class="inputlabel">Wheel Size:</span>
                        </WheelSize>
                    </p>

                    <!-- Centre Bore -->
                    <p>
                        <TextBar type="number" acprefix="" :length=6 inputname="of_bore" errName="Wheel centre bore (millimeters)" step="0.1"
                                placeholder="Centre Bore" v-model="of_cb" :ref="fields.of_cb"
                                v-if="CREATE_MODE || QUERY_SETUP.wheels">
                            <span class="inputlabel">Centre Bore:</span>
                        </TextBar>
                    </p>
                    <!-- Wheel Offset -->
                    <p>
                        <TextBar type="number" acprefix="" :length=6 inputname="of_offset" errName="Wheel offset (millimeters)" step="0.1"
                                placeholder="Offset" v-model="of_offset" :ref="fields.of_offset"
                                v-if="CREATE_MODE || QUERY_SETUP.wheels">
                            <span class="inputlabel">Offset:</span>
                        </TextBar>
                    </p>
                </template>

                <!-- Tires -->
                <template v-if="!CREATE_MODE && QUERY_SETUP.tires || osetup!='Wheels'">
                    <h3>Tires</h3>
                    <!-- Tire Size -->
                    <p>
                        <TireSize inprefix="of" acprefix="" v-model="of_tire" :ref="fields.of_tire">
                            <span class="inputlabel">Tire Size:</span>
                        </TireSize>
                    </p>
                </template>

                <div class="row">
                    <button type="submit" class="suggest single">{{ CREATE_MODE ? 'Generate Link' : 'Check Fitment' }}</button>
                </div>
            </div>
            <div class="sidebyside" v-if="CREATE_MODE">
                <!-- Generated URL -->
                <h2>Your Link:</h2>
                <p>
                    <div class="highlight" style="text-align: left; width: max-content; margin: auto;">
                        <button style="margin-left: 0;" type="button" class="suggest">Copy</button>
                        <a ref="urlcontainer" target="_blank" style="color: inherit; margin-right: 8pt;">URL Will Appear Here</a>
                    </div>
                </p>

                <!-- QR Code -->
                <h2>QR Code:</h2>
                <p>
                    <canvas id="link_qr" width="1000" height="1300" style="width: 70%;" ref="qrcanvas" />
                </p>
            </div>
            <div class="sidebyside" v-else>

                <h2>Fitment Guide
                    <div class="headingsub">
                        <!-- Specs you're checking against -->
                        <span v-if="QUERY_SETUP.wheels">
                            {{ QUERY_SETUP.wheels.diameter }}&times;{{ QUERY_SETUP.wheels.width }} ET{{ QUERY_SETUP.wheels.offset }}
                        </span><span v-if="QUERY_SETUP.wheels && QUERY_SETUP.tires">,&nbsp;</span><span v-if="QUERY_SETUP.tires">
                            {{ QUERY_SETUP.tires.section }}/{{ QUERY_SETUP.tires.ratio }}R{{ QUERY_SETUP.tires.diameter }}
                        </span>
                    </div>
                </h2>

                <!-- Checklist -->
                <Checklist ref="checklistcontainer" />

                <InfoBox>
                    This tool is only meant for reference, and cannot guarantee that a given wheel or tire
                    will fit or be a safe choice for your vehicle.
                </InfoBox>
            </div></div>
            <div class="row" v-if="!CREATE_MODE"><div class="sidebyside">
                <h2>Visual Reference</h2>
                <p>
                    
                </p>
            </div><div class="sidebyside">
                
            </div></div>
		</form>
	</main>
    <footer>
        <div class="row">
            {{ appv }} &mdash; Copyright {{ builddate }} Wheelhub
            <br />
            <a href="/">Homepage</a>
            &mdash;
            <a href="/about#contact">Contact</a>
        </div>
    </footer>
</template>