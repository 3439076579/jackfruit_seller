// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import App from './App';

import Vue from 'vue';

import  VueRouter  from "vue-router";
//引入ElementUI的全部样式
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css'

import Vuex from 'vuex'
import store from './store/index.js'

import * as echarts from 'echarts'
import axios from 'axios'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(ElementUI)

Vue.prototype.$echarts=echarts
Vue.prototype.$axios=axios;
/* eslint-disable no-new */
new Vue({
  render:h=>h(App),
  store,
}).$mount('#app')


Vue.use(VueRouter)