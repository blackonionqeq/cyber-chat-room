
export function useToken() {
	let accessToken: string
	let refreshToken: string
	function get() {
		return {
			accessToken,
			refreshToken
		}
	}
	function set({ accessToken: a, refreshToken: r }: { accessToken?: string, refreshToken?: string }) {
		if (a) accessToken = a
		if (r) refreshToken = r
	}
	return {
		get, set
	}
}

export const useTokenInstance = useToken()