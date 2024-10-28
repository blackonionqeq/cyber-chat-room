import api from '@/api'
import type {UserInfo} from '@/types/user.d'

export function useUserInfo() {
	let userInfo: UserInfo
	const userInfoList: UserInfo[] = []
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
	async function getById(uid: string) {
		const idx = userInfoList.findIndex(i => i.id === uid)
		if (idx === -1) {
			const info = await api.get<any, UserInfo>(`/user/${uid}`)
			userInfoList.push(info)
			return info
		} else {
			return userInfoList[idx]
		}
	}
	return {
		get, update, getById,
	}
}

export const useUserInfoInstance = useUserInfo()