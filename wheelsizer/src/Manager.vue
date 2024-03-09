<script setup>
    import { ref } from 'vue';

    import TextBar from './components/TextBar.vue';
    import OptionToggle from './components/OptionToggle.vue';

    import { allNumeric, isNumeric } from './pages/validator.js';

    import BoltPattern from './components/fields/BoltPattern.vue';
    import TireSize from './components/fields/TireSize.vue';
    import WheelSize from './components/fields/WheelSize.vue';

    import InfoBox from './components/InfoBox.vue';
    import Checklist from './components/Checklist.vue';

    import { getCode, readCode } from './codes.js';
    import { drawCanvas, clearCanvas } from './qrcode.js';

    import QrcodeVue from 'qrcode.vue';
    
    import SpecTable from './components/SpecTable.vue';
    import VisualPackage from './components/VisualPackage.vue';
    
    // preload images
	import { preload } from './preload.js';
	preload(
		// chevrons
		'/assets/circle-checkmark.svg',
		'/assets/circle-warning.svg',
		'/assets/circle-error.svg'
	);

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
			
            <div class="row">

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