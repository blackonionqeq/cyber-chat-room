import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from "vue-router"

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: <div>
			<div>子路由</div>
			<RouterView></RouterView>
		</div>,
		children: [
			{
				path: '',
				redirect: 'home'
			},
			{
				path: 'home',
				component: () => import('../views/home.vue'),
				children: [
					{
						path: ':roomId',
						component: () => import('../views/home/ChatContainer.vue'),
						props: true
					},
					{
						path: 'contacts',
						component: () => import('../views/home/Contacts.vue'),
					},
				]
			},
			{
				path: 'register',
				component: () => import('../views/register.vue')
			},
			{
				path: 'login',
				component: () => import('../views/login.vue')
			},
		]
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})