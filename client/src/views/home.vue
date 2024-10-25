<template>
	<section class="flex">
		<nav class="flex flex-col">
			<RouterLink to="/home">
				<NButton>聊天</NButton>
			</RouterLink>
			<RouterLink to="/home/contacts">
				<NButton>联系人</NButton>
			</RouterLink>
			<RouterLink to="/home/favorite">
				<NButton>收藏</NButton>
			</RouterLink>
		</nav>
		<div class="flex-1">
			<RouterView></RouterView>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui';


</script>