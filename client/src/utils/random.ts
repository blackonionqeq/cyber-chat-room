
export function randomStr(length = 6) {
	return Math.random().toString().slice(2, 2 + length)
}