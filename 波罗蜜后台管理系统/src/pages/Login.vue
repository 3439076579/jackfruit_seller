<template>
  <div class="login">
      <el-row type="flex" justify="center" align="middle">
        <el-form :model="user"  status-icon label-width="80px" ref="rules" class="loginContainer">
          <h3 style="display: flex; justify-content: center">登录</h3>
          <hr>
          <el-form-item label="账号" prop="username" >
            <el-input type="text" autocomplete="off" placeholder="请输入账号" v-model="user.username"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input type="password" autocomplete="off" placeholder="请输入密码" v-model="user.password"></el-input>
          </el-form-item>

          <el-form-item label-width="80px">
            <el-button type="primary" style="width: 100%; margin-top: 5px" @click="login">登录</el-button>
          </el-form-item>
          <el-form-item label-width="80px">
            <span class="register-link" @click="goToRegister">注册</span>
          </el-form-item>
        </el-form>
      </el-row>
  </div>
</template>
  
<script>

  export default {
    name:'Login',
    data() {
      return {
        user:{
          username:"",
          password:"",
        },
        rules:{
          username:[
            {required:true,message:"请输入密码",trigger:'blur'},
          ]
        }
      };
    },
    methods: {
      login() {
        // 调用登录接口进行登录验证
        // 示例代码，实际需要使用axios等库进行网络请求
        this.$axios.post('http://localhost:8082/user/login?username='+this.user.username+'&password='+this.user.password, {
        })
        .then(response => {
          if (response.data.status_code==-1){
              this.$message({
                type:'warning',
                message:"账号或密码有误"
              })
              this.user.username=""
              this.user.password=""
              return
          }else{
            localStorage.setItem('username',this.user.username)
             this.user.username=""
             this.user.password=""
             this.$router.push('/Home');
          }
          console.log(response)
        })
      },
      goToRegister() {
        // 跳转到注册界面
        this.$router.push('/register');
      }
    }
  };
</script>

<style scoped>
.login{
  position: fixed;
  top:0;
  left:0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  background-image: url("../assets/background.jpg");
  background-repeat: no-repeat ;
}
.loginContainer{
  text-align: left;
  margin: auto;
  margin-top: 180px;
  width: 350px;
  padding: 15px 35px 15px 35px;
  background: aliceblue;
  border: 2px solid blueviolet;
}

h3 {
  color: #0babeab8;
  font-size: 24px;
}
.register-link {
  color: blue;
  cursor: pointer;
  float: right;
}

</style>
  