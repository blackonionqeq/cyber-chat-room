<template>
	<div class="flex flex-col flex-1">
		<h2>寻找好友</h2>
		<div class="flex-col flex flex-1" v-if="strangers?.length">
			<div v-for="user of strangers" class="flex justify-between items-center h-[64px] border-b-solid border-b-1 border-gray">
				<div class="flex items-center">
					<UserAvater :user-id="user.id"></UserAvater>
					<span class="ml-3">
						{{ user.username }}
					</span>
				</div>
				<!-- <span>
					昵称：{{ user.nickname }}
				</span> -->
				<NButton @click="handleRequest(user)" type="primary">申请成为好友</NButton>
			</div>
		</div>
		<div class="flex-1 leading-loose" v-else>
			暂无可以邀请成为好友的陌生人，可以自己多注册一个账号
		</div>
	</div>
</template>

<script setup lang="tsx">
import api from '@/api';
import UserAvater from '@/components/UserAvater.vue';
import { message, modal } from '@/composables/useDiscreteApi';
import { UserInfo } from '@/types/user';
import { NButton, NInput } from 'naive-ui';
import { onMounted, ref } from 'vue';



const strangers = ref<UserInfo[]|null>(null)
onMounted(async () => {
	const strangersIds = await api.get<any, string[]>('/friendship/strangers')
	strangers.value = await Promise.all(
		strangersIds.map(async userId => await api.get(`/user/${userId}`))
	)
})

async function handleRequest(userInfo: UserInfo) {
	const reason = ref('')
	const modalCtl = modal.create({
		preset: 'dialog',
		title: '好友申请',
		content: () => <div class='flex flex-col'>
			<span class='mb-2'>申请与{userInfo.username}成为好友</span>
			<NInput placeholder='申请理由' type='textarea' value={reason} onInput={(val: string) => reason.value=val}></NInput>
			<NButton class='w-full mt-3' type='info' onClick={() => {
				sendRequest(userInfo.username, reason.value)
				{/* 发送申请后，需要从陌生人列表中删除 */}
				const idx = strangers.value!.findIndex(i => i.id === userInfo.id)
				strangers.value!.splice(idx, 1)
				modalCtl.destroy()
			}}>确定</NButton>
		</div>,
		type: 'info',
		onClose: () => modalCtl.destroy()
	})
}
async function sendRequest(username: string, reason: string) {
	// console.log(username, reason)
	await api.post('/friendship/request', {username, reason})
	message.success('已发送申请')
}
</script>