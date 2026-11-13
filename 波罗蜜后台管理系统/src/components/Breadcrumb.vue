<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="`breadcrumb`+item.path" :to="{path:item.path}">
            {{item.meta.title}}
        </el-breadcrumb-item>
    </el-breadcrumb>
  </div> 
</template>

<script>
export default {
    computed:{
        breadcrumbList(){
            console.log(this.$route)
            return this.$route.matched
        }  
    }
}
</script>

<style>

</style>