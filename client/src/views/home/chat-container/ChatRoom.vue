<template>
	<div>这里是ChatRoom</div>
	<div>房间号：{{ roomId }}</div>
	<div class="flex flex-col h-full">
		<div class="flex-1 flex flex-col">
			<span>聊天记录</span>
			<div class="flex-1 flex flex-col relative">
				<div class="flex-1 w-full" v-if="!chatContentList.length">
					暂无聊天
				</div>
				<NScrollbar class="absolute inset-0 overflow-y-auto overflow-x-hidden" v-else ref="scrollWrapper" @scroll="debouncedScroll">
					<div v-for="item of chatContentList" class="flex items-start mt-2" :class="item.userId === userInfo.id ? 'justify-start mr-2 flex-row-reverse' : 'justify-start'" @contextmenu="e => {curItem = item; showMenu(e)}" :key="item.id">
						<!-- <template v-if="item.type === ChatContentType.TEXT"> -->
							<UserAvater :user-id="item.userId"></UserAvater>
							<div class="bg-gray-4 px-3 py-1 rounded-lg mx-2 max-w-[70%]">{{ item.content }}</div>
						<!-- </template> -->
					</div>

					<div class="absolute right-2 bottom-2 text-indigo px-4 py-2 bg-gray-6 rounded-10 cursor-pointer" v-show="showScroll2Bottom" @click="scroll">↓↓{{ unreadCount }}</div>
				</NScrollbar>
			</div>
		</div>
		<div class="h-60 flex flex-col">
			<NPopover trigger="click" scrollable class="w-100 max-h-50">
				<template #trigger>
					<div class="cursor-pointer">表情</div>
				</template>
				<div class="flex flex-wrap">
					<div v-for="emoji of emojiList" :key="emoji">
						<span class="size-5 cursor-pointer flex justify-center items-center" @click="addEmoji(emoji)">
							{{ emoji }}
						</span>
					</div>
				</div>
			</NPopover>
			<NInput type="textarea" placeholder="输入聊天内容后可按Enter键发送" v-model:value="inputValue" @keydown="e => e.keyCode === 13 && (e.preventDefault(), sendMessage(inputValue))"></NInput>
			<NButton class="w-20" @click="sendMessage(inputValue)" type="primary">发送</NButton>
		</div>
		<NDropdown :show="showContextMenu" :x="x" :y="y" :on-clickoutside="clickMenuOutside" @select="selectMenu" trigger="manual" :options="menuOptions"></NDropdown>
	</div>
</template>

<script lang="ts" setup>
import api from '@/api';
import { message } from '@/composables/useDiscreteApi';
import { useUserInfoInstance } from '@/composables/useUserInfo';
import { UserInfo } from '@/types/user';
import { randomStr } from '@/utils/random';
import localforage from 'localforage';
import { NInput, NButton, NScrollbar, NPopover, NDropdown } from 'naive-ui';
import { io, Socket } from 'socket.io-client';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import {debounce} from 'throttle-debounce'
import { emojiList } from '@/utils/emoji-list';
import UserAvater from '@/components/UserAvater.vue';
import { ChatContentItem, ChatContentType } from '@/types/chat.d';


// localforage.setDriver(localforage.INDEXEDDB)
// localforage.getDriver()
// const driver = await useLocalForageInstance.getDriver()
const driver = localforage

const inputValue = ref('')

let userInfo: UserInfo

const props = defineProps({
	roomId: {
		type: String,
		required: true
	}
})

const chatContentList = ref<ChatContentItem[]>([])

let socket: Socket | null = null

const roomIdCachedKey = computed(() => `room_${props.roomId}_last_update`, {})
// 主缓存key
const roomContentCachedKey = computed(() => `room_${props.roomId}_main`)
// 临时缓存，用于记录聊天时追加的内容
const roomContentCachedKeyTemp = computed(() => `room_${props.roomId}_temp`)

async function handleReceiveMessage(data: {
	id: string
	userId: string,
	message: {
		type: ChatContentType,
		content: string
	},
	dateTime: string,
	updateTime: string,
	createTime: string,
	roomId: string,
}) {
	// @ts-ignore
	if (data.type === 'join') return
	if (!chatContentList.value) {
		chatContentList.value = []
	}
	const shouldScroll = checkIsAtBottom()
	const newContent = {
		userId: data.userId,
		content: (data.message.content),
		id: data.id ?? randomStr(),
		type: ChatContentType.TEXT,
		updateTime: data.updateTime,
		createTime: data.createTime,
		roomId: data.roomId,
	}
	chatContentList.value.push(newContent)
	driver.setItem(roomIdCachedKey.value, data.updateTime)
	driver.getItem(roomContentCachedKeyTemp.value).then((data:any) => {
		nextTick().then(() => {
			if (!data) data = []
			data.push(newContent)
			driver.setItem(roomContentCachedKeyTemp.value, data)
		})
	})
	if (shouldScroll) {
		await nextTick()
		scroll()
	} else {
		showScroll2Bottom.value = true
		unreadCount.value++
	}
	emit('newMessage', newContent)
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
		await nextTick()
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
	const date = await driver.getItem(roomIdCachedKey.value) as string|undefined
	if (!date) {
		const res = await api.get<any, ChatContentItem[]>(`/chat-content/list/${props.roomId}`)
		chatContentList.value = [...res]
		if (res.length) {
			driver.setItem(roomIdCachedKey.value, res.at(-1)?.updateTime)
			nextTick().then(() => {
				driver.setItem(roomContentCachedKey.value, res)
			})
		}
	} else {
		const res = await api.get<any, ChatContentItem[]>(`/chat-content/list-after-date-time`, {
			params: { dateTime: date, roomId: props.roomId }
		})
		if (!chatContentList.value) {
			chatContentList.value = []
		}
		const mainCache = await driver.getItem(roomContentCachedKey.value) as any[] ?? []
		const tempCeche = await driver.getItem(roomContentCachedKeyTemp.value)as any[] ?? []
		const cache = mainCache.concat(tempCeche).concat(res)
		chatContentList.value = cache
		driver.setItem(roomContentCachedKey.value, cache)
		driver.setItem(roomIdCachedKey.value, cache.at(-1)?.updateTime)
		driver.removeItem(roomContentCachedKeyTemp.value)
	}
	await nextTick()
	// 进入房间，默认会跳到最新消息（行为同qq微信）
	scroll()
}

const scrollWrapper = ref<InstanceType<typeof NScrollbar>>()
function checkIsAtBottom() {
	if (!scrollWrapper.value) return false
	const containerRef = scrollWrapper.value.scrollbarInstRef?.containerRef
	if (!containerRef) return false
	if (Math.abs(containerRef.clientHeight + containerRef.scrollTop - containerRef.scrollHeight) < 5) return true
	return false
}

const emit = defineEmits<{
	readAll: [roomId: string]
	newMessage: [msg: ChatContentItem]
}>()
function scroll() {
	if (scrollWrapper.value) {
		const containerRef = scrollWrapper.value.scrollbarInstRef?.containerRef
		if (!containerRef) return
		const bottomDelta = containerRef.scrollHeight - containerRef.clientHeight
		scrollWrapper.value.scrollTo({
			top: bottomDelta + 1,
			behavior: 'smooth'
		})
		onScroll2Bottom()
	}
}
function onScroll2Bottom() {
	
	showScroll2Bottom.value = false
	unreadCount.value = 0

	emit('readAll', props.roomId)
}

// 显示未读和支持滚动到底部的控件
const showScroll2Bottom = ref(false)
const unreadCount = ref(0)

function handleScroll(e: Event) {
	const container = e.target as HTMLDivElement
	const delta = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight)
	if (delta < 5) onScroll2Bottom()
}
const debouncedScroll = debounce(100, handleScroll, )

function addEmoji(emoji: string) {
	inputValue.value += emoji
}


// 右键相关
const showContextMenu = ref(false)
const x = ref(0)
const y = ref(0)
const curItem = ref<ChatContentItem>()
function showMenu(e: MouseEvent) {
	e.preventDefault()
	showContextMenu.value = false
	nextTick(() => {
		x.value = e.clientX
		y.value = e.clientY
		showContextMenu.value = true
	})
}
function clickMenuOutside() {
	showContextMenu.value = false
}
const menuOptions = [
	{ key: 'favorite', label: '收藏' }
]
async function selectMenu(key: string) {
	if (key === menuOptions[0].key) {
		// 调接口添加到收藏
		await api.post(`/favorite/add/${curItem.value!.id}`)
		message.success('收藏成功')
	}
}
</script>