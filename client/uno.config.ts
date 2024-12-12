import {defineConfig, presetIcons, presetUno} from 'unocss'
// 不用手动引入，uno会在使用到时自动寻找依赖
// import mdil from '@iconify-json/mdi-light'

export default defineConfig({
	presets: [
		presetIcons(),
		presetUno(),
	]
})