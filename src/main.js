import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入 全局的样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
//网友提供：
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
//自己维护的
//axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截器添加token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
    //必须在最后 return config
  return config;
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
