<template>
	<div v-if="userInfo?.avater">
		<NAvatar round :src="userInfo.avater" :size="size"></NAvatar>
	</div>
	<div v-else>
		<NAvatar round class="flex justify-center items-center bg-blue" :size="size">
			{{ userInfo?.username.slice(-2) ?? '' }}
		</NAvatar>
	</div>
</template>

<script lang="ts" setup>
import { useUserInfoInstance } from '@/composables/useUserInfo';
import { UserInfo } from '@/types/user';
import { NAvatar } from 'naive-ui';
import { ref, watch } from 'vue';

const props = defineProps({
	userId: {
		type: String,
		required: true,
	},
	/** number | 'small' | 'medium' | 'large' */
	size: {
		type: [Number, String as () => 'small' | 'medium' | 'large'],
	}
})

const userInfo = ref<UserInfo>()
const stopWatch = watch(() => props.userId, async userId => {
	if (userId) {
		userInfo.value = await useUserInfoInstance.getById(userId)
		stopWatch()
	}
}, { immediate: true })

// let a: InstanceType<typeof NAvatar>
// a.size


</script>