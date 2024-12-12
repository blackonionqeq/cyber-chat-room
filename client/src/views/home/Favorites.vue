<template>
	<NScrollbar class="flex flex-col flex-1  overflow-x-hidden">
		<!-- @vue-ignore -->
		<div v-for="fav of favoriteList" class="justify-between flex items-center mt-4 mx-4 group" @contextmenu="e => handleContextMenu(e, fav)">
			<div class="flex items-start">
				<UserAvater :user-id="fav.fromUserId"></UserAvater>
				<template v-if="fav.snapshotType === ChatContentType.TEXT">
					<div class="bg-gray-4 px-3 py-1 rounded-lg mx-2 max-w-[70%]">{{ fav.snapshotContent }}</div>
				</template>
				<template v-else-if="fav.snapshotType === ChatContentType.IMAGE">
					
					<div class="bg-gray-4 px-3 py-2 rounded-lg mx-2 max-w-[70%]">
						<img :src="base + fav.snapshotContent" class="object-scale-down w-full h-full" />
					</div>
				</template>
			</div>
			<span class="self-end flex-shrink-0 text-gray text-[14px]">{{ format(fav.updateTime) }}</span>
		</div>
	</NScrollbar>
	<ContextMenu :options="menuOptions" @select-menu="selectMenu" ref="ctxMenu"></ContextMenu>
</template>

<script lang="ts" setup>
import api from '@/api';
import ContextMenu from '@/components/ContextMenu.vue';
import UserAvater from '@/components/UserAvater.vue';
import { message } from '@/composables/useDiscreteApi';
import { ChatContentType } from '@/types/chat.d';
import dayjs from 'dayjs';
import { NScrollbar } from 'naive-ui/es';
import { onMounted, ref } from 'vue';

const ctxMenu = ref<InstanceType<typeof ContextMenu>>()


type FavoriteItem = {
	id: string
	snapshotContent: string
	snapshotType: ChatContentType
	updateTime: string
	fromUserId: string
}

function format(date: string) {
	return dayjs(date).format('YYYY-DD-MM HH:mm')
}

const favoriteList = ref<FavoriteItem[]>()

onMounted(async () => {
	favoriteList.value = await api.get<any, FavoriteItem[]>('/favorite/list')
})

const base = import.meta.env.VITE_SERVER

const menuOptions = [
	{ key: 'infavorite', label: '取消收藏' }
]
let curItem = ref<null|FavoriteItem>(null)
function handleContextMenu(e: MouseEvent, fav:FavoriteItem) {
	curItem.value = fav
	ctxMenu.value?.showMenu(e)
}
async function selectMenu(key: string) {
	console.log(key)
	if (curItem.value) {
		await api.delete(`/favorite/${curItem.value.id}`)
		message.success('取消收藏成功')
		const idx = favoriteList.value?.findIndex(i => i.id === curItem.value?.id)
		if (typeof idx === 'number' && idx >= 0) {
			favoriteList.value!.splice(idx, 1)
		}
	}
}
</script>