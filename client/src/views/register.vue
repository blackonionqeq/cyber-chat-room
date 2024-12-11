<template>
	<div class="flex flex-col max-w-300">
		<h1>登录页</h1>
		<div class="flex flex-col">
			<NForm ref="formRef" :model="formValue" :rules label-placement="left" :label-width="80">
				<NFormItem label="用户名" path="username">
					<NInput v-model:value="formValue.username" placeholder="请输入用户名"></NInput>
				</NFormItem>
				<NFormItem label="密码" path="password">
					<NInput type="password" v-model:value="formValue.password" placeholder="请输入密码" show-password-on="mousedown"></NInput>
				</NFormItem>
				<NFormItem label="确认密码" path="passwordAgain">
					<NInput type="password" v-model:value="formValue.passwordAgain" placeholder="请输入确认密码" show-password-on="mousedown"></NInput>
				</NFormItem>
				<NFormItem label="昵称" path="nickname">
					<NInput v-model:value="formValue.nickname" placeholder="请输入昵称"></NInput>
				</NFormItem>
				<NFormItem label="邮箱地址" path="email">
					<NInput v-model:value="formValue.email" placeholder="请输入邮箱地址"></NInput>
				</NFormItem>
				<NFormItem>
					<NButton class="flex-1" @click="sendCaptcha" type="info">发送验证码</NButton>
				</NFormItem>
				<NFormItem label="验证码" path="captcha">
					<NInput v-model:value="formValue.captcha" placeholder="请输入验证码" @keydown="e => e.keyCode === 13 && handleRegister()"></NInput>
				</NFormItem>
			</NForm>
			<NButton class="flex-1 leading-loose" @click="handleRegister" type="primary">注册</NButton>
		</div>
	</div>
</template>

<script lang='ts' setup>
import api from '@/api';
import { message } from '@/composables/useDiscreteApi';
import { useTokenInstance } from '@/composables/useToken';
import { useUserInfoInstance } from '@/composables/useUserInfo';
import { Token } from '@/token';
import { NForm, NFormItem, NInput, NButton } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
// const route = useRoute()
const formRef = ref<FormInst|null>(null)
const formValue = ref({
	username: '',
	password: '',
	passwordAgain: '',
	nickname: '',
	email: '',
	captcha: '',
})
const rules: FormRules = {
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
	passwordAgain: {
		required: true,
		message: '确认密码不能为空',
		validator: (_, value) => {
			if (value !== formValue.value.password) return new Error('两次密码输入不一致')
			return true
		},
		trigger: 'blur'
	},
	email: {
		key: 'email',
		required: true,
		message: '邮箱地址不合法',
		type: 'email',
		trigger: 'input'
	},
	captcha: {
		required: true,
		message: '验证码不能为空',
		trigger: 'blur'
	},
}

async function handleRegister() {
	await formRef.value?.validate()
	const res = await api.post<any, Token>('/user/register', {
		...formValue.value,
	})
	console.log(res)
	message.success('注册成功')
	router.push('/login')
	// useTokenInstance.set(res)
	// localStorage.setItem('refreshToken', res.refreshToken)
	// useUserInfoInstance.update()
	// router.push('/')
}

// const isEmailValide = computed(() => {})
async function sendCaptcha() {
	if (!formValue.value.email) {
		message.error('请输入邮箱地址')
		return
	}
	formRef.value?.validate(async (err) => {
		if (!err) {
			const res = await api.get('/user/register-captcha', {
				params: {
					address: formValue.value.email,
				}
			})
			console.log(res)
			message.success('验证码发送成功')
		} else {
			// @ts-ignore
			message.error(err[0]?.[0]?.message)
		}
	}, rule => rule?.key === 'email')
}
</script>