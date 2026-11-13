import Vue from 'vue';
import  VueRouter  from "vue-router";
Vue.use(VueRouter)

const router= new VueRouter({
    routes:[
        {
            path:'/',
            redirect:'Login',
            meta:{
                title:'登陆界面'
            }
        },
        {
            //为登录界面配置路由守卫
            path:'/Login',
            name:'Login',
            component:()=>import('../pages/Login.vue'),
            meta:{
                title:'登陆界面'
            }
        },
        {
            path:'/Home',
            name:'Home',
            component:()=>import('../pages/Home.vue'),
            meta:{
                title:'首页'
            },
            // 限制用户只能由登录界面到Home页面
            // beforeEnter:(to,from,next)=>{
            //     if(from.path==='/Login'){
            //         next()
            //     }
            // },
            redirect:'/Home/FirstWeb',
            children:[
                {
                    path:'Users',
                    name:'Users',
                    component:()=>import('../components/Users.vue'),
                    meta:{
                        title:'会员管理'
                    }
                },
                {
                    path:'FirstWeb',
                    name:'FirstWeb',
                    component:()=>import('../components/FirstWeb.vue'),
                    meta:{
                        title:'首页'
                    }
                },
                {
                    path:'Token',
                    name:'Token',
                    component:()=>import('../components/Token.vue'),
                    meta:{
                        title:'订单管理'
                    }
                },
                {
                    path:'Jackfruit',
                    name:'Jackfruit',
                    component:()=>import('../components/Jackfruit.vue'),
                    meta:{
                        title:'波罗蜜管理'
                    }
                },
            ]
        }
    ]
})

router.beforeEach((to,from,next) =>{
    window.document.title=to.meta.title
    // console.log(to.fullPath)
    // console.log(to.path)
    // console.log('*****************')
    //1.fullPath和path
    /*这是对于$route中的fullPath和path属性的总结
    // 对于有参数的路径而言，fullPath和path才会有明显的差距
    //对于一个有参数的路径例如:/Login/?id=wjb && password=123456而言
    //其fullpath为/Login/?id=wjb && password=123456
    //其path为/Login
    //2.matched
    在route中还有一个重要的属性叫做matched,这是一个数组
    这个数组所存取的东西是整条路径上的路由记录包括子路由
    举例:对于/Home/User这个路由来说，其macthed数组里存放着：1./Home的路由记录 2./Home/User的路由记录
    相当于递归去搜索这个路由信息
    //3.name
    //4.meta元数据信息
    //5.query和prama参数
    */
    next()
})
export default router