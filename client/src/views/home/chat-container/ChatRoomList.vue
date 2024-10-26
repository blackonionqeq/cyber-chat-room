<template>
	<ul class="flex flex-col overflow-y-auto overflow-x-hidden h-full">
		<div v-if="!chatRoomList" class="flex-1 w-full">加载中</div>
		<div v-else class="flex-1 w-full">
			<li v-for="item of chatRoomList" :key="item.id" class="leading-loose my-1" :class="{
				'bg-blue': currentRoomId === item.id
			}" @click="selectRoom(item)">
				{{ item.name }}
			</li>
		</div>
		<!-- <li></li> -->
	</ul>
</template>

<script lang="ts" setup>
import type { ChatRoomItem } from '../ChatContainer.vue';

defineProps({
	chatRoomList: {
		type: Array as () => ChatRoomItem[],
		required: true
	},
	currentRoomId: String
})

const emits = defineEmits<{
	selectRoomId: [roomId: string]
}>()

async function selectRoom(item:ChatRoomItem) {
	emits('selectRoomId', item.id)
}

</script>