import api from '@/api'
import type {UserInfo} from '@/types/user.d'

export function useUserInfo() {
	let userInfo: UserInfo
	async function get(force = false) {
		if (force) {
			if (!userInfo) return await update()
			return userInfo
		}
		return userInfo
	}
	async function update() {
		const info = await api.get<any, null|UserInfo>('/user/')
		if (info) {
			userInfo = info
		}
		return userInfo
	}
	return {
		get, update
	}
}

export const useUserInfoInstance = useUserInfo()