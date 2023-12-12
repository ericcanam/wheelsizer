<script setup>
    import { ref } from 'vue';

    import TextBar from './components/TextBar.vue';
    import OptionToggle from './components/OptionToggle.vue';

    import BoltPattern from './components/fields/BoltPattern.vue';
    import TireSize from './components/fields/TireSize.vue';
    import WheelSize from './components/fields/WheelSize.vue';

    import { getCode, readCode } from './codes.js';

    const QUERY = new URLSearchParams(window.location.search).get('c');
    const QUERY_SETUP = readCode(QUERY);

    const osetup = ref("Both");
    const ostaggered = ref("No");
    const of_tire = ref({ "of_section": "", "of_ratio": "", "of_diam": "" });
    const of_wheel = ref({ "of_diameter": "", "of_width": "" });
    const of_bp = ref({ "pcd": "", "holes": "" });
    const of_cb = ref('');
    const of_offset = ref('');

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
		<form id="sform" @submit="formnext" novalidate ref="formRef">
			<span ref="ariaAlertRef" role="alert"></span>
			
            <div class="row"><div class="sidebyside">
                <h2>Generate a Link</h2>
                <p>
                    Enter the details of your setup to generate a link that'll allow people to check its fitment quickly.
                </p>

                <h2>Setup</h2>
                <p>
                    <!-- Wheels / Tires / Both -->
                    <OptionToggle inputname="o_setup" :options="['Wheels', 'Tires', 'Both']" v-model="osetup" autofocus>
                        What should the link check?
                    </OptionToggle>
                </p>
                <p>
                    <!-- Staggered? -->
                    <OptionToggle inputname="o_staggered" :options="['Yes', 'No']" v-model="ostaggered">
                        Is your setup staggered? In other words, are your wheels or tires different from front to back?
                    </OptionToggle>
                </p>

                <!-- Wheels -->
                <template v-if="osetup!='Tires'">
                    <h2>Wheels</h2>
                    <!-- Bolt Pattern -->
                    <p>
                        <BoltPattern inprefix="of" acprefix="" v-model="of_bp">
                            <span class="inputlabel">Bolt Pattern:</span>
                        </BoltPattern>
                    </p>
                    <!-- wheel Size -->
                    <p>
                        <WheelSize inprefix="of" acprefix="" v-model="of_wheel">
                            <span class="inputlabel">Wheel Size:</span>
                        </WheelSize>
                    </p>

                    <!-- Centre Bore -->
                    <p>
                        <TextBar type="number" acprefix="" :length=6 inputname="of_bore" errName="Wheel centre bore (millimeters)" placeholder="Centre Bore" v-model="of_cb">
                            <span class="inputlabel">Centre Bore:</span>
                        </TextBar>
                    </p>
                    <!-- Wheel Offset -->
                    <p>
                        <TextBar type="number" acprefix="" :length=6 inputname="of_offset" errName="Wheel offset (millimeters)" placeholder="Offset" v-model="of_offset">
                            <span class="inputlabel">Offset:</span>
                        </TextBar>
                    </p>
                </template>

                <!-- Tires -->
                <template v-if="osetup!='Wheels'">
                    <h2>Tires</h2>
                    <!-- Tire Size -->
                    <p>
                        <TireSize inprefix="of" acprefix="" v-model="of_tire">
                            <span class="inputlabel">Tire Size:</span>
                        </TireSize>
                    </p>
                </template>
            </div><div class="sidebyside">
                <h1>{{ getCode({
                    // tire stuff
                    'tires': (osetup=='Wheels' ? null : {
                        'section': of_tire.of_section,
                        'ratio': of_tire.of_ratio,
                        'diameter': of_tire.of_diam
                    }),
                    // wheel setuff
                    'wheels': (osetup=='Tires' ? null : {
                        'width': of_wheel.of_width,
                        'offset': of_offset,
                        'diameter': of_wheel.of_diameter,
                        'pcd': of_bp.of_pcd ,
                        'holes': of_bp.of_holes,
                        'bore': of_cb
                    })
                }) }}</h1>
                <h1>{{ QUERY_SETUP }}</h1>
            </div>
            </div>
		</form>
	</main>
    <footer>
        <div class="row">
            {{ appv }} &mdash; Copyright {{ builddate }} Wheelhub
            <br />
            <a href="/">Homepage</a>
            &mdash;
            <a href="/about.html#contact">Contact</a>
        </div>
    </footer>
</template>