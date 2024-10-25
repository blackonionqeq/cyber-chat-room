import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import 'virtual:uno.css'
import { router } from './routes'
import 'normalize.css'

const app = 
createApp(App)
	.use(router)

app.config.errorHandler = (err, vm, info) => {
	// @ts-ignore
	if (err.message.includes('401')) {
		vm?.$router.push({ path: '/login', query: {
			redirect: vm.$route.fullPath
		}})
	}
}

// window.onerror = (_,_,_,_,err) => {
// 	if (err?.message.includes('401')) {
// 		app._instance.
// 	}
// }

app
	.mount('#app')
