<script setup>
	import { ref, watch } from 'vue';

    import Step from './components/Step.vue';

    // import pages:
    import Info from './pages/Info.vue';
    import OEM from './pages/OEM.vue';
	import DoorCard from './pages/DoorCard.vue';
	import New from './pages/New.vue';
	import Calculator from './pages/Calculator.vue';

	const cid = ref(1);

    function gs(id, cu){
        return (cu>id ? "complete" : (cu==id ? "current" : "upcoming"));
    }

    const pages = [
        {comp: Info, title: "Car Setup", svg: "car.svg"},
        {comp: OEM, title: "OEM Specs", svg: "notepad.svg"},
        {comp: DoorCard, title: "Doorcard", svg: "doorcard.svg"},
        {comp: New, title: "New Setup", svg: "wrench.svg"},
        {comp: Calculator, title: "Calculator", svg: "calculator.svg"}
    ];

	
	var appdata = ref({
	});

	const childComponentRef = ref();
	const formRef = ref();
	const submitRef = ref();
	const backRef = ref();

	function clearErrors(){
		// clears errors in all the child component's fields
		for(const field in childComponentRef.value.fields){
			if(childComponentRef.value.fields[field].value != undefined){
				childComponentRef.value.fields[field].value.unsetError();
			}
		}
		// clears errors in optional fields too (if they exist)
		if(childComponentRef.value.optionalFields){
			for(const field in childComponentRef.value.optionalFields){
				if(childComponentRef.value.optionalFields[field].value != undefined){
					childComponentRef.value.optionalFields[field].value.unsetError();
				}
			}
		}
	}

	function formnext(e){
		e.preventDefault();
		
		clearErrors();

		if(childComponentRef.value.validate()){
			saveform();
			cid.value++;
			window.scrollTo(0, 0);
		}
	}

	function formback(e){
		e.preventDefault();

		saveform();
		
		clearErrors();

		if(cid.value>1){
			cid.value--;
			window.scrollTo(0, 0);
		}
	}

	function saveform(){
		let form = formRef.value;
		let formdata = new FormData(form);
		for (let [inputName, value] of formdata) {
			appdata.value[inputName] = value;
		}
	}

	function fill(){
		let form = formRef.value;
		for(let index in appdata.value){
			let field = form.elements.namedItem(index);
			if (field){
				if(field.type=="checkbox"){
					field.checked = appdata.value[index]!==undefined;
				}
				field.value = appdata.value[index];
			}
		}
	}

	watch(childComponentRef, (nccr) => {
		fill();
	});

	const appv = APP_VERSION;
	const builddate = BUILD_DATE;
</script>

<template>
	<header>
		<div v-if="cid==1" class="row">
			<a href="/"><img alt="Wheelhub" class="logo" src="/assets/logo_t1.svg" /></a>
		</div>
		<div class="row">
			<div v-for="(page, n) in pages" class="fall">
				<Step :title="page.title" :svg="page.svg" :status="gs(n+1, cid)" />
				<img v-if="n+1<pages.length" alt="&gt;" class="h_arrow topnavarrow" src="/assets/arrow_right.svg" />
			</div>
			<!--<div class="steptitle current overarch">{{ pages[cid-1].title }}</div>-->
		</div>
	</header>
	<main>
		<!--<div class="row">
			<AdBox />
		</div>-->
		<form id="sform" @submit="formnext" novalidate ref="formRef">
			<div class="row">
				<component :is="pages[cid-1].comp" ref="childComponentRef" :ad="appdata" />
			</div>
			<div class="row">
				<button @click="formback" ref="backRef" v-if="cid>1" type="button" class="single"><img class="left" src="/assets/left_chevron.svg" /><span>Back</span></button><!--
				--><button ref="submitRef" type="submit" v-if="cid<pages.length" class="suggest single"><span>Next</span><img class="right" src="/assets/right_chevron.svg" /></button>
			</div>
			<div class="row">
				{{ appv }} &mdash; Copyright {{ builddate }} Wheelhub
				<br />
				<a href="/">Homepage</a>
				&mdash;
				<a href="/about.html#contact">Contact</a>
			</div>
		</form>
	</main>
</template>