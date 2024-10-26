<template>
	<div class="flex h-full">
		<div class="w-50 flex">
			<div v-if="!chatRoomList" class="flex-1 h-dvh flex items-center justify-center">加载中</div>
			<ChatRoomList v-else :chat-room-list="chatRoomList" :current-room-id="roomId" @select-room-id="selectRoomById"></ChatRoomList>
		</div>

		<section class="flex-1 flex flex-col">
			<div v-if="!roomId" class="flex-1 w-full h-dvh items-center justify-center">请选择一个聊天室</div>
			<ChatRoom v-else :room-id="roomId"></ChatRoom>
		</section>
	</div>
</template>

<script lang="ts" setup>
import api from '@/api';
import { onMounted, ref } from 'vue';
import ChatRoomList from './chat-container/ChatRoomList.vue';
import ChatRoom from './chat-container/ChatRoom.vue';
import { useRouter } from 'vue-router';

const props = defineProps({
	roomId: String
})

export type ChatRoomItem = {
	id: string;
	name: string;
	groupChat: boolean;
	createTime: Date;
	updateTime: Date;
}
const chatRoomList = ref<ChatRoomItem[]|null>(null)
onMounted(async () => {
	const list = await api.get<any, ChatRoomItem[]>('/chatroom/list')
	chatRoomList.value = list
	console.log(list)
})

const router = useRouter()
function selectRoomById(roomId: string) {
	if (roomId !== props.roomId) router.push(`/home/${roomId}`)
}
</script>