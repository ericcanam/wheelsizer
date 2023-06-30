<script setup>
	import { ref } from 'vue';

    import Step from './components/Step.vue';

    // import pages:
    import Info from './components/pages/Info.vue';
    import OEM from './components/pages/OEM.vue';

	const cid = ref(1);

    function gs(id, cu){
        return (cu>id ? "complete" : (cu==id ? "current" : "upcoming"));
    }

    const pages = [
        {n: 1, comp: Info, title: "Car Info", svg: "car.svg"},
        {n: 2, comp: OEM, title: "OEM Specs", svg: "wheel.svg"},
        {n: 3, title: "New Specs", svg: "star.svg"}
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
		let formData = new FormData(form);
		let val = childComponentRef.value.validate();
		if(!val){ // false means no errors
			for (let [inputName, value] of formData) {
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
			<Step v-for="page in pages"
        		:title="page.title" :svg="page.svg" :status="gs(page.n, cid)" />
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
				--><button ref="submitRef" type="submit" class="suggest">Next</button>
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
