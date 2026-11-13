import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'


import Login from './components/Login.vue'
import Index from './components/Index.vue'
import PerCenter from './components/PerCenter.vue'
import DailyRecom from './components/index/DailyRecom.vue'
import Register from './components/Register.vue'
import Token from './components/Token.vue'


Vue.use(Router)
Vue.use(ElementUI);


 
const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: Login,
		},
		{
			// '/Index/:name'中的name是需要传递的参数username
			path: '/Index/:name',
			name: 'Index',
			component: Index,
			children:[
				{
					path:'DailyRecom',
					name:'DailyRecom',
					component:DailyRecom
				}
			]
		},
		{
			path: '/PerCenter/:name',
			name: 'PerCenter',
			component: PerCenter,
		},
		{
			path: '/Register',
			name: 'Register',
			component: Register,
		},
		{
			path: '/Token/:name',
			name: 'Token',
			component: Token,
		},
		{ //路由重定向
			path: '*',
			name: 'any', // 名字在“命名路由”中使用，但是不介绍
			redirect: '/login'
		},
	]
})
const VueRouterPush = Router.prototype.push
Router.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
export default router
