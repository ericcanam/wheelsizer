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
        {comp: Info, title: "Car Info", svg: "nametag.svg"},
        {comp: OEM, title: "OEM Specs", svg: "wheel.svg"},
        {comp: Report, title: "New Specs", svg: "star.svg"},
		{comp: Save, title: "Save", svg: "Save.svg"}
    ];

	
	var appdata = ref({
	});

	const childComponentRef = ref();
	const submitRef = ref();
	const backRef = ref();

	function clearErrors(){
		// clears errors in all the child component's fields
		for(const field in childComponentRef.value.fields){
			if(childComponentRef.value.fields[field].value != undefined){
				childComponentRef.value.fields[field].value.unsetError();
			}
		}
	}

	function formnext(e){

		e.preventDefault();
		submitRef.value.blur();
		let form = e.target;
		let formdata = new FormData(form);
		let formobj = {};
		for(let [inputName, value] of formdata){
			formobj[inputName] = value;
		}
		//console.log(formobj);
		clearErrors();
		if(childComponentRef.value.validate()){
			for (let [inputName, value] of formdata) {
				appdata.value[inputName] = value;
			}
			//console.log( pages[cid.value].comp );
			cid.value++;
		}else{

		}
	}

	function formback(e){
		e.preventDefault();
		backRef.value.blur();
		
		clearErrors();

		if(cid.value>1){
			cid.value--;
		}
	}
</script>

<template>
	<header>
		<img alt="Wheelhub" class="logo" src="" />
    	<h1>Wheelhub</h1>
		<div class="row">
			<div v-for="(page, n) in pages" class="fall">
				<Step :title="page.title" :svg="page.svg" :status="gs(n+1, cid)" />
				<img v-if="n+1<pages.length" alt="&gt;" class="arrow" src="./assets/arrow.svg" />
			</div>
		</div>
	</header>
	<main>
		<form id="sform" @submit="formnext" novalidate>
			<div class="row">
					<KeepAlive>
						<component :is="pages[cid-1].comp" ref="childComponentRef" :ad="appdata" />
					</KeepAlive>
			</div>
			<div class="row">
				<button @click="formback" ref="backRef" :disabled="cid==1" type="button">Back</button><!--
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
