<template>
<div>
    <el-row>
      <el-col :pull="4">
        <div class="grid-content bg-purple">
        <el-form :inline="true"  class="demo-form-inline"
        size="small">

        <el-form-item label="订单查询">
            <el-input  placeholder="请输入订单号" v-model="searchIndex.id"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchOrder">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="clearSearch" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
        <el-form-item>
    
        </el-form-item>
      </el-form>
        </div>
      </el-col>
    </el-row>
   <el-table
      :data="OrderSet"
      stripe
      style="width: 100% "
      size="medium"
      height="600px"
      border
      max-height="500px"
     >
      <el-table-column
      label="序号"
      type="index"
      :index="indexMethod"
      width="200">
      </el-table-column>
     
      <el-table-column
        prop="jackfruit.name"
        label="商品名称">
        <template slot-scope="scope">
          <span >{{OrderSet[scope.$index].jackfruit.name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="jackfruit.image"
        label="图片">
        <template slot-scope="scope">
          <img :src="OrderSet[scope.$index].jackfruit.image" width="80" height="80"/>
        </template>
      </el-table-column>
       <el-table-column
        prop="quantity"
        label="数量">
        <template slot-scope="scope">
          <span >{{OrderSet[scope.$index].quantity}}</span>
        </template>
      </el-table-column>
       <el-table-column
        prop="jackfruit.price"
        label="单价">
        <template slot-scope="scope">
          <span >{{OrderSet[scope.$index].jackfruit.price}}</span>
        </template>
      </el-table-column>
       <el-table-column
        prop="total"
        label="小计">
        <template slot-scope="scope">
          <span>{{OrderSet[scope.$index].total}}</span>
        </template>
      </el-table-column>
      <!-- ************************************************** -->
  </el-table>
  </div> 
</template>

<script>
    export default {
        name:'Token',
        data(){
          return {
            OrderSet:[],
            ServedOrderSet:[],
            dialogVisible:false,
            searchIndex:{
              id:''
            },
          }
        },
        methods:{
          indexMethod(index){
            return index+1;
          },
          searchOrder(){
            this.ServedOrderSet=this.OrderSet
            this.OrderSet=this.OrderSet.filter((item)=>{
                return item.ID==this.searchIndex.id
            })
            
            if(this.OrderSet.length===0){
              alert('查无此人')
              this.OrderSet=this.ServedOrderSet
            }
            this.searchIndex.id=''
          },
          clearSearch(){
            this.OrderSet=this.ServedOrderSet
            this.searchIndex.id=''
          },
        // mounted(){
        //   console.log(this.changedData)
        // }
        },
        mounted(){
          this.$axios.get("http://localhost:8082/order/order_list")
          .then((response) => {
            this.OrderSet=response.data.data
            this.ServedOrderSet=this.OrderSet
            console.log(response)
          })
        }
}
</script>

<style>
  .el-table__header tr,
  .el-table__header th {
    padding: 0;
    height: 40px;
}
  .el-table__body tr,
  .el-table__body td {
    padding: 0;
    height: 40px;
}
</style>