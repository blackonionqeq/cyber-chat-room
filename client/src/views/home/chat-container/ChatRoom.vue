<template>
	<div>这里是ChatRoom</div>
	<div>房间号：{{ roomId }}</div>
	<div class="flex flex-col h-full">
		<div class="flex-1 flex flex-col">
			<span>聊天记录</span>
			<div class="flex-1 flex flex-col relative">
				<div class="flex-1 w-full" v-if="!chatContentList || !chatContentList.length">
					暂无聊天
				</div>
				<NScrollbar class="absolute inset-0 overflow-y-auto overflow-x-hidden" v-else ref="scrollWrapper">
					<div v-for="chatContent of chatContentList" class="flex" :class="chatContent.userId === userInfo.id ? 'justify-end mr-2' : 'justify-start'">
						<template v-if="chatContent.type === ChatContentType.TEXT">
							<div >{{ chatContent.content }}</div>
						</template>
					</div>
				</NScrollbar>
			</div>
		</div>
		<div class="h-50 flex">
			<NInput type="textarea" placeholder="输入聊天内容后可按Enter键发送" v-model:value="inputValue" @keydown="e => e.keyCode === 13 && (e.preventDefault(), sendMessage(inputValue))"></NInput>
			<NButton class="w-20" @click="sendMessage(inputValue)" type="primary">发送</NButton>
		</div>
	</div>
</template>

<script lang="ts" setup>
import api from '@/api';
import { message } from '@/composables/useDiscreteApi';
import { useUserInfoInstance } from '@/composables/useUserInfo';
import { UserInfo } from '@/types/user';
import { randomStr } from '@/utils/random';
import { NInput, NButton, NScrollbar } from 'naive-ui';
import { io, Socket } from 'socket.io-client';
import { nextTick, onUnmounted, ref, watch } from 'vue';


const inputValue = ref('')

let userInfo: UserInfo

const props = defineProps({
	roomId: {
		type: String,
		required: true
	}
})

enum ChatContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  OTHER = 'OTHER',
}

type ChatContentItem = {
	id:      String
	// roomId:  String
	userId:  String
	content: String
	type:    ChatContentType
	// createTime: string
	updateTime: string
}
const chatContentList = ref<null|ChatContentItem[]>(null)

let socket: Socket | null = null

async function handleReceiveMessage(data: {
	userId: string,
	message: {
		type: ChatContentType,
		content: string
	},
	dateTime: string,
	updateTime: string,
}) {
	if (!chatContentList.value) {
		chatContentList.value = []
	}
	const shouldScroll = checkIsAtBottom()
	chatContentList.value.push({
		userId: data.userId,
		content: data.message.content,
		id: randomStr(),
		type: ChatContentType.TEXT,
		updateTime: data.updateTime,
	})
	if (shouldScroll) {
		await nextTick()
		scroll()
	}
}

watch(() => props.roomId, async (newRoomId, oldRoomId) => {
	if (!userInfo) {
		userInfo = await useUserInfoInstance.get(true)
	}
	if (oldRoomId) {
		// 断开房间ws链接
		if (socket !== null) {
			socket.disconnect()
		}
	}
	if (newRoomId) {
		// 连接房间ws
		socket = io(import.meta.env.VITE_SERVER)
		socket.on('connect', async () => {
			socket!.emit('join', { userId: userInfo.id, roomId: newRoomId })
			socket!.on('message', handleReceiveMessage)
		})
		// 获取聊天记录
		getChatContentList()
	}
}, { immediate: true })

onUnmounted(() => {
	if (socket) socket = null
})

async function sendMessage(value: string) {
	if (!value) message.warning('请输入内容再发送')
	if (socket) {
		socket.emit('send', {
			userId: userInfo.id,
			roomId: props.roomId,
			message: {
				type: ChatContentType.TEXT,
				content: value,
			}
		})
		inputValue.value = ''
	}
	// await api.post('/')
}

async function getChatContentList() {
	const res = await api.get<any, ChatContentItem[]>(`/chat-content/list/${props.roomId}`)
	// res.forEach(item => handleReceiveMessage(item))
	chatContentList.value = [...res]
}

const scrollWrapper = ref<InstanceType<typeof NScrollbar>>()
function checkIsAtBottom() {
	if (!scrollWrapper.value) return false
	const containerRef = scrollWrapper.value.scrollbarInstRef?.containerRef
	if (!containerRef) return false
	if (Math.abs(containerRef.clientHeight + containerRef.scrollTop - containerRef.scrollHeight) < 5) return true
	return false
}
function scroll() {
	if (scrollWrapper.value) {
		const containerRef = scrollWrapper.value.scrollbarInstRef?.containerRef
		if (!containerRef) return
		const bottomDelta = containerRef.scrollHeight - containerRef.clientHeight
		scrollWrapper.value.scrollTo({
			top: bottomDelta + 1,
			behavior: 'smooth'
		})
	}
}
</script>