<template>
  <div id="app">
      <router-view/>
  </div>
</template>


<script>
/* 以下任务需要实现后再往下做
1.在有本地存储的情况下，将初始页面重定向为/home
2.调整顶部字体大小
*/
  import router from './router'
  export default{
    name: 'App',
    router,
    // mounted(){
    //   console.log(this.$router)
    //   console.log(this.$route)
    // }
  }
</script>

