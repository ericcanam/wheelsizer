<script setup>
	import { ref } from 'vue';

    import Step from './components/Step.vue';

    // import pages:
    import Info from './pages/Info.vue';
    import OEM from './pages/OEM.vue';
	import Report from './pages/Report.vue';
	import Save from './pages/Save.vue';

	const cid = ref(1);

    function gs(id, cu){
        return (cu>id ? "complete" : (cu==id ? "current" : "upcoming"));
    }

    const pages = [
        {comp: Info, title: "Car Info", svg: "car.svg"},
        {comp: OEM, title: "OEM Specs", svg: "wheel.svg"},
        {comp: Report, title: "New Specs", svg: "star.svg"},
		{comp: Save, title: "Save", svg: "Save.svg"}
    ];

	
	var appdata = {
	};

	const childComponentRef = ref();
	const submitRef = ref();
	const backRef = ref();

	function formnext(e){

		
		e.preventDefault();
		submitRef.value.blur();
		let form = e.target;
		let formdata = new FormData(form);
		let formobj = {};
		for(let [inputName, value] of formdata){
			formobj[inputName] = value;
		}
		if(childComponentRef.value.validate(formobj)){
			for (let [inputName, value] of formdata) {
				appdata[inputName] = value;
			}
			cid.value++;
		}else{

		}
	}

	function formback(e){
		e.preventDefault();
		backRef.value.blur();

		if(cid.value>1){
			cid.value--;
		}
	}
</script>

<template>
	<header>
		<img alt="Wheel Sizer" class="logo" src="./assets/logo.svg" />
    	<h1>Wheel Sizer</h1>
		<div class="row">
			<div v-for="(page, n) in pages" class="fall">
				<Step :title="page.title" :svg="page.svg" :status="gs(n+1, cid)" />
				<img v-if="n+1<pages.length" alt="&gt;" class="arrow" src="./assets/arrow.svg" />
			</div>
		</div>
	</header>
	<main>
		<form id="sform" @submit="formnext">
			<div class="row">
					<KeepAlive>
						<component :is="pages[cid-1].comp" ref="childComponentRef" :ad="appdata" />
					</KeepAlive>
			</div>
			<div class="row">
				<button @click="formback" ref="backRef" :disabled="cid==1">Back</button><!--
				--><button ref="submitRef" type="submit" :disabled="cid==pages.length" class="suggest">Next</button>
			</div>
		</form>
	</main>
</template>



<style scoped>
	
	div.row {
		margin-top: 2rem;
		display: block;
	}

</style>
