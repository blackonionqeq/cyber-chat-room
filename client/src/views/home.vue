<template>
	<section class="flex flex-1 h-full">
		<nav class="flex flex-col">
			<RouterLink to="/home/room"  active-class="bg-blue-4">
				<!-- <NButton>聊天</NButton> -->
				
				<div class="size-8 flex justify-center items-center cursor-pointer">
					<div class="i-mdi-light:comment size-6"></div>
				</div>
			</RouterLink>
			<RouterLink to="/home/contacts" active-class="bg-blue-4">
				<div class="size-8 flex justify-center items-center cursor-pointer">
					<div class="i-mdi-light:account size-6"></div>
				</div>
			</RouterLink>
			<RouterLink to="/home/favorites" active-class="bg-blue-4">
				<!-- <NButton>收藏</NButton> -->
				<div class="size-8 flex justify-center items-center cursor-pointer">
					<div class="i-mdi-light:heart size-6"></div>
				</div>
			</RouterLink>
		</nav>
		<div class="flex-1">
			<RouterView></RouterView>
		</div>
	</section>
</template>

<script lang="ts" setup>
// import { NButton } from 'naive-ui';


</script>