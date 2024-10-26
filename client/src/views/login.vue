<template>
	<div class="flex flex-col max-w-300">
		<h1>登录页</h1>
		<div class="flex flex-col">
			<NForm ref="formRef" :model="formValue" :rules label-placement="left" :label-width="80">
				<NFormItem label="用户名" path="username">
					<NInput v-model:value="formValue.username" placeholder="请输入用户名"></NInput>
				</NFormItem>
				<NFormItem label="密码" path="password">
					<NInput v-model:value="formValue.password" placeholder="请输入密码" @keydown="e => e.keyCode === 13 && handleLogin()"></NInput>
				</NFormItem>
			</NForm>
			<NButton class="flex-1 leading-loose" @click="handleLogin" type="primary">登录</NButton>
		</div>
	</div>
</template>

<script lang='ts' setup>
import api from '@/api';
import { useTokenInstance } from '@/composables/useToken';
import { useUserInfoInstance } from '@/composables/useUserInfo';
import { Token } from '@/token';
import { NForm, NFormItem, NInput, NButton } from 'naive-ui';
import type { FormInst } from 'naive-ui';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInst|null>(null)
const formValue = ref({
	username: '',
	password: '',
})
const rules = {
	username: {
		required: true,
		message: '用户名不能为空',
		trigger: 'blur'
	},
	password: {
		required: true,
		message: '密码不能为空',
		trigger: 'blur'
	},
}

async function handleLogin() {
	await formRef.value?.validate()
	const res = await api.post<any, Token>('/user/login', {
		...formValue.value,
	})
	useTokenInstance.set(res)
	localStorage.setItem('refreshToken', res.refreshToken)
	useUserInfoInstance.update()
	if (route.query.redirect && typeof route.query.redirect === 'string') {
		router.push(route.query.redirect)
	} else {
		router.push('/')
	}
}
</script>