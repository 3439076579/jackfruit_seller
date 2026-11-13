<template>
    <el-container style="position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;">
        <el-aside width="200px">
           <el-menu
                default-active="/Home/FirstWeb"
                class="el-menu-vertical-demo"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                style="height:100vh"
                :router="true">
            <el-menu-item index="/Home/FirstWeb">
                    <i class="el-icon-house"></i>
                    <span slot="title">首页</span>
            </el-menu-item>
            <el-menu-item index="/Home/Users">
                <i class="el-icon-user"></i>
                <span slot="title">会员管理</span>
            </el-menu-item>
            <el-menu-item index="/Home/Jackfruit" >
                <i class="el-icon-notebook-2"></i>
                <span slot="title">波罗蜜管理</span>
            </el-menu-item>
            <el-menu-item index="/Home/Token">
                <i class="el-icon-setting"></i>
                <span slot="title">订单管理</span>
            </el-menu-item>
          </el-menu>  
        </el-aside>
        <el-container>
            <el-header >
              菠萝蜜订购管理系统
            <el-dropdown type="primary" class="dropdownStyle">
              <span class="el-dropdown-link">
                <i class="el-icon-s-custom el-icon--left"></i>
                {{username}}<i
                class="el-icon-arrow-down el-icon--right;"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="showDialog">修改密码</el-dropdown-item>
                <!-- 修改密码的组件 -->
               <el-dialog
                title="修改密码"
                :visible.sync="dialogVisible"
                width="30%"
                :append-to-body="true">
                <!-- 内嵌表单组件 -->
                <el-form :model="ruleForm" 
                  status-icon 
                  ref="ruleForm"
                  label-width="100px"
                  class="demo-ruleForm"
                  :rules="changePasswordForm">
                <el-form-item label="密码" >
                  <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                  <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click.native="SubmitRequestChangePass">提交</el-button>
                  <el-button >重置</el-button>
                </el-form-item>
              </el-form>
              <!-- 到这里，表单组件结束 -->
              </el-dialog>
              <!-- ******************************************************************* -->
              <el-dropdown-item @click.native="showNotifyForm">发布公告</el-dropdown-item>
              <el-dialog
                title="发布公告"
                :visible.sync="NotifyFromVisible"
                width="30%"
                :append-to-body="true">
                <!-- 内嵌表单组件 -->
                <el-form :model="notifyForm" 
                  status-icon 
                  ref="notifyForm"
                  label-width="100px"
                  class="demo-ruleForm">
                <el-form-item label="公告内容" >
                  <el-input type="text" v-model="notifyForm.message" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click.native="SubmitNotify">提交</el-button>
                  <el-button @click.native="resetNotifyForm">重置</el-button>
                </el-form-item>
              </el-form>
              <!-- 到这里，表单组件结束 -->
              </el-dialog>
                <el-dropdown-item @click.native="exitHome">退出系统</el-dropdown-item>
                
              </el-dropdown-menu>
            </el-dropdown>
            </el-header>
            <el-main >
                <Breadcrumb/>
                <router-view></router-view>
            </el-main>
            <el-footer>
              底部
            </el-footer>
        </el-container>
    </el-container>
</template>

<script>
// 这这里实现几个功能，因为不多，就不拆分组件了
//1.修改密码
    import Breadcrumb from '../components/Breadcrumb.vue'
    export default {
        name:'Home',
        data(){
          return {
            dialogVisible: false,
            ruleForm: {
              pass: '',
              checkPass: '',
          },
          changePasswordForm:{
            pass:[{required:true}],
            checkPass:[{required:true}],
          },
          notifyForm:{
              message:'',
          },
          NotifyFromVisible:false,
        }
        },
        
        methods:{
          exitHome(){
            this.$confirm('确定要退出系统吗？','提示',{
              confirmButtonText:'确定',
              cancelButtonText:'取消',
              type:'info'
            }).then(()=>{
              this.$router.push('/Login')
               this.$message({
                type: 'success',
                message: '成功退出系统'
              });
            })
            window.sessionStorage.clear
          },
          resetNotifyForm(){
            this.notifyForm.message=''
          },
          showNotifyForm(){
              this.NotifyFromVisible=true
          },
          SubmitNotify(){
              const formData = new FormData();
              formData.append('message', this.notifyForm.message);
              this.$axios.post("http://localhost:8082/notify/add",formData).then((result) => {
                this.NotifyFromVisible=false
              })
          },
          showDialog(){
            this.dialogVisible=true
          },
          SubmitRequestChangePass(){
            if(this.ruleForm.pass===this.ruleForm.checkPass){
              this.$store.dispatch('changePassword',this.ruleForm.pass)
              alert('已成功修改密码')
              this.dialogVisible=false
            }
            else{
              this.$alert('输入密码不一致','错误',{type:'error'})
            }
            this.ruleForm.pass='',
            this.ruleForm.checkPass=''
          }
        },

        components:{
          Breadcrumb
        }
    }
</script>

<style>
    .el-header{
    background-color: #909399;
    color: #FFFFFF;
    text-align: center;
    line-height: 60px;
    font-size: 20px;
    font-family:Arial, Helvetica, sans-serif;
    font-size: larger;
    text-align: left;
  }
  .el-footer{
     background-color: #909399;
    color: #FFFFFF;
    text-align: center;
    line-height: 60px;
    font-size: 20px;
    font-family:Arial, Helvetica, sans-serif;
    font-size: larger;
    text-align: center;
  }
  
  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }
  
  .el-main {
    background-color:#7fb9db;
    color: #333;
    text-align: center;
    line-height: 50px;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
  /* .changeFont{
    font-family: Arial, Helvetica, sans-serif;
  } */
   .el-dropdown-link {
    cursor: pointer;
    color: #FFFFFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .dropdownStyle{
    left:1000px;
  }
</style>