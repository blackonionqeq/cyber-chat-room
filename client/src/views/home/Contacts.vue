<template>
	<div class="w-50 flex flex-col">
		<div>
			<NButton @click="viewType = 'find-friend'">添加好友</NButton>
			<NBadge :value="invitationsCount">
				<NButton @click="showInvitations">好友邀请</NButton>
			</NBadge>
		</div>
		<div v-for="friend of contacts" :key="friend.id" class="flex justify-around">
			<span>用户名：{{ friend.username }}</span>
			<span>昵称：{{ friend.nickname }}</span>
			<NButton @click="getChatRoomId(friend.id)">聊天</NButton>
		</div>
	</div>
	<div class="flex-1 h-full w-full flex">
		<template v-if="viewType === 'find-friend'">
			<FindFriend></FindFriend>
		</template>
	</div>
</template>

<script lang="tsx" setup>
import api from '@/api';
import { UserInfo } from '@/types/user';
import { NButton, NBadge } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import FindFriend from './contacts/FindFriend.vue';
import { message, modal } from '@/composables/useDiscreteApi';

const router = useRouter()
type ViewType = null | 'find-friend' | 'friend-info'
const viewType = ref<ViewType>(null)


const contacts = ref<UserInfo[]|null>(null)
async function refreshContacts() {
	const data = await api.get<any, string[]>('/friendship/friendship')
	contacts.value = await Promise.all(
		data.map(async userId => await api.get<any, UserInfo>(`/user/${userId}`))
	)
}
onMounted(refreshContacts)

async function getChatRoomId(friendUserId: string) {
	const chatRoomId = await api.get<any, string>(`/chatroom/new-private-chat/${friendUserId}`)
	if (typeof chatRoomId === 'string') {
		router.push(`/home/${chatRoomId}`)
	}
}

type InvitationItem = {
	username: string
	reason: string
	id: number
}
enum InvitationResponseType {
  REJECTED = 'reject', // 已拒绝
  APPROVED = 'agree', // 已通过
}
const invitations = ref<InvitationItem[]|null>(null)
const invitationsCount = computed(() => invitations.value?.length)
onMounted(async () => {
	const res = await api.get<any, InvitationItem[]>('/friendship/invitations')
	if (res.length) invitations.value = res
})

async function showInvitations() {
	const modalCtl = modal.create({
		preset: 'dialog',
		title: '邀请列表',
		content: () => <div class='flex flex-col max-h-150 w-100 overflow-y-auto overflow-x-hidden'>
			{
				invitations.value!.map(i => <div key={i.username} class='flex flex-col m-2'>
						<span>申请人：{i.username}</span>
						<span>申请理由：{i.reason}</span>
						<div class='w-full flex'>
							<NButton class='flex-1' type='primary' onClick={() => response(i,InvitationResponseType.APPROVED)}>通过</NButton>
							<NButton class='flex-1' type='error' onClick={() => response(i,InvitationResponseType.REJECTED)}>拒绝</NButton>
						</div>
					</div>)
			},
		</div>,
		onClose: () => modalCtl.destroy()
	})
}

// const emit = defineEmits<{
// 	addFriend: [],
// }>()

async function response(invitation: InvitationItem, type: InvitationResponseType) {
	await api.patch(`/friendship/${type}/${invitation.id}`)
	message.success('操作成功')
	if (type === 'agree') {
		// emit('addFriend')
		refreshContacts()
	}
	const idx = invitations.value!.findIndex(i => invitation.id === i.id)
	invitations.value?.splice(idx, 1)
}

</script>