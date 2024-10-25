<template>
	<div class="flex flex-col">
		<div>寻找好友</div>
		<div class="flex-col flex flex-1">
			<div v-for="user of strangers" class="flex justify-between">
				<span>
					用户名：{{ user.username }}
				</span>
				<span>
					昵称：{{ user.nickname }}
				</span>
				<NButton @click="handleRequest(user)">申请成为好友</NButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import api from '@/api';
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
			<span>申请与{userInfo.username}成为好友</span>
			<NInput placeholder='申请理由' type='textarea' value={reason} onInput={(val: string) => reason.value=val}></NInput>
			<NButton class='w-full' type='primary' onClick={() => {
				sendRequest(userInfo.username, reason.value)
				modalCtl.destroy()
			}}>确定</NButton>
		</div>,
		onClose: () => modalCtl.destroy()
	})
}
async function sendRequest(username: string, reason: string) {
	console.log(username, reason)
	await api.post('/friendship/request', {username, reason})
	message.success('已发送申请')
}
</script>