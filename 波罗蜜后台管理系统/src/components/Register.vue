<template>
  <div class="register">
      <el-row type="flex" justify="center" align="middle">
        <el-form :model="user" status-icon label-width="80px" ref="rules" class="registerContainer">
          <h3 style="display: flex; justify-content: center">注册</h3>
          <hr>
          <el-form-item label="账号" prop="username">
            <el-input type="text" autocomplete="off" placeholder="请输入账号" v-model="user.username"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input type="password" autocomplete="off" placeholder="请输入密码" v-model="user.password"></el-input>
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" autocomplete="off" placeholder="请再次输入密码" v-model="user.confirmPassword"></el-input>
          </el-form-item>

          <el-form-item label-width="80px">
            <el-button type="primary" style="width: 100%; margin-top: 5px" @click="register">注册</el-button>
          </el-form-item>
          <el-form-item label-width="80px">
            <span class="login-link" @click="goToLogin">返回登录</span>
          </el-form-item>
        </el-form>
      </el-row>
  </div>
</template>

<script>

  export default {
    name:'Register',
    data() {
      return {
        user:{
          username:"",
          password:"",
          confirmPassword:"",
        }
      };
    },
    methods: {
      register() {
        if (this.user.username === "" || this.user.password === "") {
          this.$message({
            type:'warning',
            message:"账号或密码不能为空"
          })
          return
        }
        if (this.user.password !== this.user.confirmPassword) {
          this.$message({
            type:'warning',
            message:"两次输入的密码不一致"
          })
          return
        }
        this.$axios.post('http://localhost:8082/user/register?username='+this.user.username+'&password='+this.user.password, {
        })
        .then(response => {
          if (response.data.status_code == -1){
              this.$message({
                type:'warning',
                message: response.data.message
              })
              this.user.password=""
              this.user.confirmPassword=""
              return
          }else{
            this.$message({
              type:'success',
              message:"注册成功，请登录"
            })
            this.user.username=""
            this.user.password=""
            this.user.confirmPassword=""
            this.$router.push('/Login');
          }
          console.log(response)
        })
      },
      goToLogin() {
        this.$router.push('/Login');
      }
    }
  };
</script>

<style scoped>
.register{
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
.registerContainer{
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
.login-link {
  color: blue;
  cursor: pointer;
  float: right;
}

</style>