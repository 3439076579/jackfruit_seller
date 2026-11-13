<template>
<div>
    <el-row>
      <el-col :pull="4">
        <div class="grid-content bg-purple">
        <el-form :inline="true"  class="demo-form-inline"
        size="small">

        <el-form-item label="用户名查询：">
            <el-input  placeholder="请输入用户名" v-model="searchIndex.username"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchUser">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="clearSearch" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="showDialog" icon="el-icon-plus">添加</el-button>
          <!-- 添加一个用户的对话框 -->
           <el-dialog
                title="添加用户"
                :visible.sync="dialogVisible"
                width="30%"
                :append-to-body="true">
                <!-- 内嵌表单组件 -->
                <el-form :model="incrementUserForm" 
                  status-icon 
                  ref="ruleForm"
                  label-width="100px"
                  class="demo-ruleForm"
                  :rules="AddUserForm">
                <el-form-item label="账号" >
                  <el-input type="text" v-model.trim="incrementUserForm.username" autocomplete="off"></el-input>
                </el-form-item>

                <el-form-item label="密码">
                  <el-input type="password" v-model.trim="incrementUserForm.password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="手机号" >
                  <el-input type="text" v-model.trim="incrementUserForm.phone" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" >
                  <el-input type="text" v-model.trim="incrementUserForm.email" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click.native="addUser">确定</el-button>
                  <el-button @click="clearAddForm">重置</el-button>
                </el-form-item>
              </el-form>
              <!-- 到这里，表单组件结束 -->
              </el-dialog>
        </el-form-item>
      </el-form>
        </div>
      </el-col>
    </el-row>
   <el-table
      :data="UserSet"
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
        prop="username"
        label="账号">
        <template slot-scope="scope">
          <span v-show="!UserSet[scope.$index].isEdit">{{UserSet[scope.$index].username}}</span>
          <el-input v-show="UserSet[scope.$index].isEdit" v-model="TmpObj.username"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="password"
        label="密码">
        <template slot-scope="scope">
          <span v-show="!UserSet[scope.$index].isEdit">{{UserSet[scope.$index].password}}</span>
          <el-input v-show="UserSet[scope.$index].isEdit" v-model="TmpObj.password"></el-input>
        </template>
      </el-table-column>
       <el-table-column
        prop="phone"
        label="电话号码">
        <template slot-scope="scope">
          <span v-show="!UserSet[scope.$index].isEdit">{{UserSet[scope.$index].phone}}</span>
          <el-input v-show="UserSet[scope.$index].isEdit" v-model="TmpObj.phone"></el-input>
        </template>
      </el-table-column>
       <el-table-column
        prop="email"
        label="电子邮箱">
        <template slot-scope="scope">
          <span v-show="!UserSet[scope.$index].isEdit">{{UserSet[scope.$index].email}}</span>
          <el-input v-show="UserSet[scope.$index].isEdit" v-model="TmpObj.email"></el-input>
        </template>
      </el-table-column>
      <!-- ************************************************** -->
       <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini" @click="handleEdit(scope.$index)"
            v-show="!UserSet[scope.$index].isEdit"
            :disabled="EditLock"
            icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" @click="SubmitUpdate(scope.$index)"
            v-show="UserSet[scope.$index].isEdit">确认</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteUser(scope.$index)"
            v-show="!UserSet[scope.$index].isEdit"
            icon="el-icon-delete">删除</el-button>
            <el-button size="mini"
             v-show="UserSet[scope.$index].isEdit"
             @click="CancelEdit(scope.$index)">取消编辑</el-button>
        </template>
     </el-table-column>
  </el-table>
  </div> 
</template>

<script>
    export default {
        name:'Users',
        data(){
          return {
            UserSet:[],
            ServedUserSet:[],
            incrementUserForm:{
                username:'',
                password:'',
                phone:'',
                email:'',
            },
            dialogVisible:false,
            AddUserForm:{
                username:[{required:true,message:"请输入正确的账号",trigger:"change"}],
                password:[{required:true,message:"请输入正确的密码",trigger:"change"}]
              },
            searchIndex:{
              username:''
            },
            TmpObj:{
              username:'',
              password:'',
              phone:'',
              email:'',
            },
            EditLock:false,
          }
        },
        // computed:{
        //   changedData(){
        //     const arr=[]
        //     for(let i=0;i<this.UserSet.length;i++){
        //         const tmpobj=this.UserSet[i]
        //         arr.push(tmpobj)
        //     }
        //     return arr
        //   }
        // },
        methods:{
          indexMethod(index){
            return index+1;
          },
          deleteUser(index){
            if(confirm('确认要删除该用户吗？')){
              this.$axios.get("http://localhost:8082/user/delete?id="+(index+1)).then(res => {
              this.UserSet.splice(index,1)
              console.log(this.UserSet)
            })
            }
          },
          addUser(){
            const x={username:this.incrementUserForm.username,
            password:this.incrementUserForm.password,
            phone:this.incrementUserForm.phone,
            email:this.incrementUserForm.email,
            }
            this.$axios.post("http://localhost:8082/user/add?username="+this.incrementUserForm.username
            +"&password="+this.incrementUserForm.password+"&phone="+this.incrementUserForm.phone
            +"&email="+this.incrementUserForm.email).then(res => {
              this.UserSet.push(x)
              console.log(this.UserSet)
            })
            this.showDialog()
            this.clearAddForm()
          },
          showDialog(){
            this.dialogVisible=!this.dialogVisible
          },
          clearAddForm(){
            this.incrementUserForm.username='',
            this.incrementUserForm.password='',
            this.incrementUserForm.phone='',
            this.incrementUserForm.email=''
          },
          searchUser(){
            this.ServedUserSet=this.UserSet
            console.log(this.searchIndex.username)
            this.UserSet=this.UserSet.filter((item)=>{
                return item.username===this.searchIndex.username
            })
            
            if(this.UserSet.length===0){
              alert('查无此人')
              this.UserSet=this.ServedUserSet
            }
            this.changedData=this.UserSet
            this.searchIndex.username=''
          },
          clearSearch(){
            this.UserSet=this.ServedUserSet
            this.searchIndex.sex=''
            this.searchIndex.username=''
            this.changedData=this.UserSet
          },
          handleEdit(index){
            this.EditLock=true
            this.TmpObj=Object.assign({},this.UserSet[index])
            this.$set(this.UserSet[index],'isEdit',true)
          },
          CancelEdit(index){
            this.$set(this.UserSet[index],'isEdit',false)
            this.EditLock=false
          },
          SubmitUpdate(index){
            this.$axios.post("http://localhost:8082/user/update_id?id="+(index+1)+"&username="
            +this.TmpObj.username+"&password="+this.TmpObj.password+"&phone="+this.TmpObj.phone+
            "&email="+this.TmpObj.email)
            .then(res => {
              this.UserSet[index]=res.data.data
              console.log(this.UserSet)
            })
            this.$set(this.UserSet[index],'isEdit',false)
            this.EditLock=false
        },
        // mounted(){
        //   console.log(this.changedData)
        // }
        },
        mounted(){
          this.$axios.get("http://localhost:8082/user/user_list")
          .then((response) => {
            console.log(response)
            this.UserSet=response.data.data
            this.ServedUserSet=result.data.data
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