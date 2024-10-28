<template>
	<div class="flex flex-col">
		<div v-for="fav of favoriteList" class="flex-1 justify-between">
			{{ fav.snapshotContent }}
			<span>{{ fav.updateTime }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import api from '@/api';
import { onMounted, ref } from 'vue';

enum ChatContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  OTHER = 'OTHER',
}
type FavoriteItem = {
	id: string
	snapshotContent: string
	snapshotType: ChatContentType
	updateTime: string
}

const favoriteList = ref<FavoriteItem[]>()

onMounted(async () => {
	favoriteList.value = await api.get<any, FavoriteItem[]>('/favorite/list')
})
</script>