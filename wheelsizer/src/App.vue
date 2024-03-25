<script setup>
	import { ref, watch } from 'vue';
	import { UNSAVED_STRING } from './cookies.js';

    import Step from './components/Step.vue';

    // import pages:
    import Info from './pages/Info.vue';
    import OEM from './pages/OEM.vue';
	import DoorCard from './pages/DoorCard.vue';
	import New from './pages/New.vue';
	import Calculator from './pages/Calculator.vue';

	import SaveManager from './components/SaveManager.vue';

	// preload images
	import { preload } from './preload.js';
	preload(
		// chevrons
		'/assets/down_chevron.svg',
		'/assets/up_chevron.svg',
		'/assets/left_chevron.svg',
		'/assets/right_chevron.svg'
	);

	const cid = ref(1);

    function gs(id, cu){
		if(cu==id){
			return "current";
		}
        return (complete_steps.value>=id ? "complete" : "upcoming");
    }

    const pages = [
        {comp: Info, title: "Car Setup", svg: "car.svg"},
        {comp: OEM, title: "OEM Specs", svg: "notepad.svg"},
        {comp: DoorCard, title: "Doorcard", svg: "doorcard.svg"},
        {comp: Calculator, title: "Calculator", svg: "calculator.svg"}
    ];
	const complete_steps = ref(0);

	
	var appdata = ref({
		savename: UNSAVED_STRING
	});

	const childComponentRef = ref();
	const formRef = ref();
	const submitRef = ref();
	const backRef = ref();
	const ariaAlertRef = ref();

	function clearErrors(){
		ariaAlertRef.value.setAttribute("aria-label", "");
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
			complete_steps.value = Math.max(cid.value, complete_steps.value);
			cid.value++;
			window.scrollTo(0, 0);
		}else{
			ariaAlertRef.value.setAttribute("aria-label", "The next page could not be loaded due to errors in the form.");
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

	/* Jump to (1-indexed) page from argument. */
	function formjump(page){
		// Invalid page jump (too far forward based on progress) or same-page
		if(page==cid.value || page>complete_steps.value+1){
			return;
		}
		/* If this is a page that's already previously been completed,
		   then the form logic depends on this page, so VALIDATE it */
		if(cid.value <= complete_steps.value){
			clearErrors();
			if(!childComponentRef.value.validate()){
				return;
			}
		}

		saveform();
		window.scrollTo(0, 0);
		cid.value = page
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

	
    const save_manager = ref();
    function showSaveManagerText(){
        // show form if no saved cars, if save_manager hasn't loaded yet, OR if it's overridden
        return save_manager.value==undefined || save_manager.value.showList();
    }
	function updateAppData(ad){
		appdata.value = ad;
		complete_steps.value = 3;
		cid.value = 4;
	}


	const appv = APP_VERSION;
	const builddate = BUILD_DATE;
</script>

<template>
	<header>
		<div v-if="cid==1" class="row">
			<a href="/"><img alt="Wheelhub" class="logo" src="/assets/logo_t1.svg" /></a>
		</div>
		<div class="row topnav">
			<div v-for="(page, n) in pages" class="fall">
				<Step :title="page.title" :svg="page.svg"
					:status="gs(n+1, cid)"
					:style="complete_steps>=n ? 'cursor:pointer;': ''"
					@click="formjump(n+1)"
				/>
				<img v-if="n+1<pages.length" alt="&gt;" class="svgarrow h_arrow topnavarrow" src="/assets/arrow_right.svg" />
			</div>
			<SaveManager :ad="appdata" ref="save_manager" @update="updateAppData" />
			<!--<div class="steptitle current overarch">{{ pages[cid-1].title }}</div>-->
		</div>
	</header>
	<main>
		<form id="sform" @submit="formnext" novalidate ref="formRef">
			<span ref="ariaAlertRef" role="alert"></span>
			
			<!-- App "Page" rendered here: -->
			<component :is="pages[cid-1].comp" ref="childComponentRef" :ad="appdata" />

			<!-- "Save car" button -->
			<div class="row" v-if="cid==3">
				<button @click="save_manager.saveCar(
					appdata.cartitle,
					appdata
				);" type="button" class="go double">Save "{{ appdata.cartitle }}"<img class="right" src="/assets/download.svg" /></button>
			</div>

			<div class="row">
				<button @click="formback" ref="backRef" v-if="cid>1" type="button" class="single">
					<!--<img class="left" src="/assets/left_chevron.svg" />--><span>Back</span>
				</button><!--
				--><button ref="submitRef" type="submit" v-if="cid<pages.length" class="suggest single">
					<span>Next</span><!--<img class="right" src="/assets/right_chevron.svg" />--></button>
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