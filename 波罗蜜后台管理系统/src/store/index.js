import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)


const actions={
    changePassword(context,value){
        context.commit('CHANGEPASSWORD',value)
    },
    deleteUser(context,value){
        if(value==='wjb'){
            alert('root用户不可被删除')
        }
        else{
            context.commit('DELETE',value)
        }
    },
    addUser(context,value){
        context.commit('ADD',value)
    },
    updateUserInfo(context,value){
        context.commit('UPDATE',value)
    }
}

const mutations={
    CHANGEPASSWORD(state,value){
        const user=(JSON.parse(window.sessionStorage.getItem('UserInfo')))['账号']
        for(let i=0;i<state.Userinfo.length;i++){
            if(state.Userinfo[i].username===user){
                state.Userinfo[i].password=value
                // console.log(state.Userinfo[i].password)
            }
        }
    },
    DELETE(state,value){
        for(let i=0;i<state.Userinfo.length;i++){
            if(state.Userinfo[i].username===value){
                state.Userinfo.splice(i,1)
            }
        }
    },
    ADD(state,value){
        state.Userinfo.push(value)
    },
    UPDATE(state,value){
        state.Userinfo[value.index]=value.Userinfo
        console.log('确认')
    }
}

const state={
    Userinfo:[
        {
            username:'wjb',
            password:'123',
            sex:'男'
        },
        {
            username:'hehe',
            password:'456',
            sex:'女'
        },
        {
            username:'四系乃',
            password:'4',
            sex:'女'
        },
        {
            username:'鸢一折纸',
            password:'1',
            sex:'女'
        },
        {
            username:'星宫六喰',
            password:'6',
            sex:'女'
        },
        {
            username:'时崎狂三',
            password:'3',
            sex:'女'
        },
    ],
    Courseinfo:[
        {
            
        },
    ]
}

const getters={
    searchedUser:(state)=>(value)=>{
        //value是个对象，存放着用户输入的序号和用户名
        if(value.sex=== '' && value.username===''){
            alert('请输入查询信息')
            return state.Userinfo
        }
        else if(value.sex==='' && value.username!==''){
            return state.Userinfo.filter((item)=>{
                return item.username===value.username
            })
        }
        else if(value.sex!=='' && value.username===''){
            return state.Userinfo.filter((item)=>{
                return item.sex===value.sex
            })
        }
        else{
            return state.Userinfo.filter((item)=>{
                return item.username===value.username && item.sex===value.sex
            })
        }
    }
}

const store=new Vuex.Store({
    actions,
    mutations,
    state,
    getters
})

export default store