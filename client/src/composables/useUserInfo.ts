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
	let queue: Record<string, Array<(value: UserInfo) => void>> = Object.create(null)
	let isGetByIdWorking: Record<string, boolean> = Object.create(null)
	async function getById(uid: string) {
		if (!isGetByIdWorking[uid]) {
			isGetByIdWorking[uid] = true
		} else {
			if (!queue[uid]) queue[uid] = []
			return new Promise<UserInfo>((resolve) => {
				queue[uid]!.push(resolve)
			})
		}
		let res: UserInfo
		const idx = userInfoList.findIndex(i => i.id === uid)
		if (idx === -1) {
			const info = await api.get<any, UserInfo>(`/user/${uid}`)
			userInfoList.push(info)
			res = info

		} else {
			res = userInfoList[idx]
		}
		if (queue[uid]?.length) {
			queue[uid].forEach(resolve => resolve(res))
			queue[uid] = []
		}
		isGetByIdWorking[uid] = false
		return res
	}
	return {
		get, update, getById,
	}
}

export const useUserInfoInstance = useUserInfo()