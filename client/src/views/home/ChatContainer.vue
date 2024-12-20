<template>
	<div class="flex h-full ">
		<div class="w-50 flex bg-[#F5FBFE]">
			<div v-if="!chatRoomList" class="flex-1 h-dvh flex items-center justify-center">加载中</div>
			<ChatRoomList v-else :chat-room-list="chatRoomList" :current-room-id="roomId" :latest-chats="latestChats" @select-room-id="selectRoomById"></ChatRoomList>
		</div>

		<section class="flex-1 flex flex-col">
			<div v-if="!roomId" class="flex-1 w-full h-dvh items-center justify-center flex items-center justify-center">请选择一个聊天室</div>
			<ChatRoom v-else :room-id="roomId" :room-name="roomName" :key="roomId" @read-all="handleReadAll(roomId)" @new-message="handleNewMessage"></ChatRoom>
		</section>
	</div>
</template>

<script lang="ts" setup>
import api from '@/api';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatRoomList from './chat-container/ChatRoomList.vue';
import ChatRoom from './chat-container/ChatRoom.vue';
import { useRouter } from 'vue-router';
import localforage from 'localforage';
import type { ChatContentItem } from '@/types/chat.d';

const props = defineProps({
	roomId: String
})

export type ChatRoomItem = {
	id: string;
	userId?: string;
	name: string;
	groupChat: boolean;
	createTime: Date;
	updateTime: Date;
}
const chatRoomList = ref<(ChatRoomItem&{unread:number})[]|null>(null)
onMounted(async () => {
	const list = await api.get<any, ChatRoomItem[]>('/chatroom/list')
	chatRoomList.value = list.map(i => ({ ...i, unread: 0}))
	console.log(list)
})

let timers: ReturnType<typeof setInterval>[] = []
let dateTimes: string[] = []
const latestChats = ref<ChatContentItem[]>([])
watch(() => chatRoomList.value, async (newList, oldList) => {
	// console.log(newList, oldList)
	if (timers.length) {
		// @ts-ignore
		timers.forEach(i => window.clearInterval(i))
	}
	if (newList) {
		if (dateTimes.length === 0) {
			dateTimes = await Promise.all(
				newList.map(async (item) => {
					return (await localforage.getItem(`room_${item.id}_last_update`)) || ''
				})
			)
			// 拉取最新消息显示
			Promise.all(
				newList.map(async (room) => await api.get<any, ChatContentItem>(`/chat-content/latest/${room.id}`))
			).then(list => {
				latestChats.value = list
			})
		}
		timers = newList.map((item, idx) => setInterval(async () => {
			const dateTime = dateTimes[idx]
			const count = await api.get<any, number>('/chat-content/count-after-date-time', {
				params: { roomId: item.id, dateTime }
			})
			if (count !==  chatRoomList.value![idx].unread) {
				const room = chatRoomList.value![idx]
				room.unread = count
				// 有变更时同时拉取最新消息以显示
				api.get<any, ChatContentItem>(`/chat-content/latest/${room.id}`).then(chat => {
					latestChats.value[idx] = chat
				})
			}
		}, 5000 * 1))
	}
})

onUnmounted(() => {
	if (timers.length) timers.forEach(clearInterval)
})

const router = useRouter()
function selectRoomById(roomId: string) {
	if (roomId !== props.roomId) router.push(`/home/room/${roomId}`)
}
const roomName = computed(() => {
	if (!chatRoomList.value?.length || !props.roomId) return ''
	return chatRoomList.value.find(i => i.id === props.roomId)?.name
})

function handleReadAll(roomId: string) {
	const idx = chatRoomList.value!.findIndex(i => i.id === roomId)
	if (idx !== -1) {
		const item = chatRoomList.value![idx]
		// @ts-ignore
		localforage.getItem(`room_${item.id}_last_update`).then((newDate: string) => {
			if (newDate) {
				dateTimes[idx] = newDate
				item.unread = 0
			}
		})
	}
}

function handleNewMessage(msg: ChatContentItem) {
	// @ts-ignore
	const idx = chatRoomList.value!.findIndex(i => i.id === msg.roomId)
	if (idx !== -1) {
		latestChats.value[idx] = msg
		console.log(idx)
	}
}
</script>