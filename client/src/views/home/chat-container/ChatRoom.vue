<template>
	<div>这里是ChatRoom</div>
	<div>房间号：{{ roomId }}</div>
</template>

<script lang="ts" setup>

defineProps({
	roomId: {
		type: String,
		required: true
	}
})
</script>