<template>
	<div class="chat" ref="currentMessage">
		<div class="profile">
		<img v-if="chat.isAi" src="@/assets/bot.svg" alt=":(" />
		<img v-else-if="chat.value.trim() !== ''" src="@/assets/user.svg" alt="USER" />
		<img v-else src="@/assets/terminal.svg" alt="Trying to read your terminal..." />   
		</div>
		<div class="message">
			<pre>{{ chat.value }}</pre>
		</div>
	</div>
</template>

<script setup>
	import { nextTick, onMounted, ref, watch } from "vue";
	defineProps({
		chat: {
			type: Object || null,
		},
	});
	const currentMessage=ref(null);
	onMounted(async()=> {
		await nextTick();
		const div=currentMessage.value;
		div.scrollIntoView({ behavior: "smooth" });
	});
</script>

<style lang="scss" scoped>
	
</style>