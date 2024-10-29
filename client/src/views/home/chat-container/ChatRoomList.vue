<template>
	<ul class="flex flex-col overflow-y-auto overflow-x-hidden h-full w-full">
		<div v-if="!chatRoomList" class="flex-1 w-full">加载中</div>
		<div v-else class="flex-1 w-full">
			<li v-for="(item, idx) of chatRoomList" :key="item.id" class="leading-loose p-2" :class="
				currentRoomId === item.id ? 'bg-blue-2' : 'cursor-pointer'
			" @click="selectRoom(item)">
				<NBadge :value="item.unread === 0 ? undefined : item.unread" class="w-full">
					<!-- {{ item.name }} -->
					<div v-if="!item.groupChat" class="flex justify-between w-[85%]">
						<UserAvater :user-id="item.userId!" size="large"></UserAvater>
						<div class="flex-col flex ml-2 w-full" v-if="!item.groupChat">
							{{ item.name }}
							<span class="truncate">{{ latestChats[idx]?.content }}</span>
						</div>
						<div>{{ getTime(latestChats[idx]?.updateTime) }}</div>
					</div>
				</NBadge>
			</li>
		</div>
		<!-- <li></li> -->
	</ul>
</template>

<script lang="ts" setup>
import { NBadge } from 'naive-ui';
import type { ChatRoomItem } from '../ChatContainer.vue';
import UserAvater from '@/components/UserAvater.vue';
import { ChatContentItem } from '@/types/chat';
import dayjs from 'dayjs';
import { largerSize } from 'naive-ui/es/_utils';

defineProps({
	chatRoomList: {
		type: Array as () => (ChatRoomItem&{unread:number})[],
		required: true
	},
	latestChats: {
		type: Array as () => ChatContentItem[],
		required: true,
	},
	currentRoomId: String
})

const emits = defineEmits<{
	selectRoomId: [roomId: string]
}>()

async function selectRoom(item:ChatRoomItem) {
	emits('selectRoomId', item.id)
}

function format(type: 'time' | 'date', date: string) {
	if (type) {
		return dayjs(date).format('HH:mm')
	}
	return dayjs(date).format('YYYY/DD/MM')
}
function getTime(date: string) {
	if (!date) return ''
	// 如果这个时间距离当前在一天内，就显示时分
	const messageDate = new Date(date)
	const delta = new Date().valueOf() - messageDate.valueOf()
	if (delta < 1000 * 60 * 24) {
		return format('time', date)
	}
	// 否则显示年月日
	return format('date', date)
}

</script>