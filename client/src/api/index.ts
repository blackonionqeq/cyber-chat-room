import { useTokenInstance } from "@/composables/useToken";
import type { Token } from "@/token.d";
import axios, { AxiosRequestConfig } from "axios";
import { discreteApi } from "@/composables/useDiscreteApi";
// import type {AxiosRequestConfig} from 'axios'
const message = discreteApi.message
export type ResponseType<T = any> = {
	code: number
	data: T,
	message: string
}

export const api = axios.create({
	baseURL: import.meta.env.VITE_SERVER,
	timeout: 3000,
})
api.interceptors.request.use(req => {
	const accessToken = useTokenInstance.get().accessToken
	if (accessToken) {
		req.headers.Authorization = `Bearer ${accessToken}`
	}
	return req
})

type PendingTask = {
	config: AxiosRequestConfig
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	resolve: Function
}
const reqQueue: PendingTask[] = []
let isRefresh = false
// @ts-ignore
api.interceptors.response.use((res) => {
	return res.data
}, async err => {
	if (err.status === 401 && !err.config.url.includes('/user/refresh')) {
		if (isRefresh) {
			return new Promise(rs => reqQueue.push({
				config: err.config,
				resolve: rs,
			}))
		}
		isRefresh = true
		const {code} = await refreshToken()
		isRefresh = false
		if ([200,201].includes(code)) {
			if (reqQueue.length) {
				reqQueue.forEach(({config, resolve}) => {
					resolve(
						api(config)
					)
				})
			}
			return api(err.config)
		} else {
			message.error(err.response.data?.message ?? '系统繁忙，请稍后再试')
		}
	} else {
		message.error(err.response.data?.message ?? '系统繁忙，请稍后重试')
		throw new Error(`${err.status}:${err.message}`)
	}
})

async function refreshToken() {
	const refreshToken = useTokenInstance.get().refreshToken 
	?? localStorage.getItem('refreshToken')
	if (!refreshToken) throw new Error('401:找不到refreshToken，请重新登录')
	const data = await api.get<any, Token>(`/user/refresh/${refreshToken}`)
	if (data) {
		useTokenInstance.set(data)
		localStorage.setItem('refreshToken', data.refreshToken)
	}
	return {data, code:200}
}
export default api

// api.get()
// export const api2 = <T>(cfg: AxiosRequestConfig) => api.request<any, T>(cfg)
// export const get = <T>(url: string, cfg: AxiosRequestConfig) => api.get<any, T extends ResponseType<infer U> ? ResponseType<U> : T>(url, cfg)

// export const post = <T>(url: string, cfg: AxiosRequestConfig) => api.post<any, T extends ResponseType<infer U> ? ResponseType<U> : T>(url, cfg)