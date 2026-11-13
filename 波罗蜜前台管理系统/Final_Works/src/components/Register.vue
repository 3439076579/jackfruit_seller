<template>
	<div id="Register">
		<h2>欢迎新用户注册</h2>
		<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
			<el-form-item label="用户昵称:" prop="username">
				<el-input v-model="ruleForm.username"></el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="确认密码" prop="checkPass">
				<el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item class="last_footer">
				<el-button type="primary" @click="submitForm('ruleForm')" class="edit">提交</el-button>
				<el-button @click="resetForm('ruleForm')" class="edit">重置</el-button>
				<el-button type="primary" @click="cancel()" class="edit">取消</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	export default {
		data() {
			var validatePass = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请输入密码'));
				} else {
					if (this.ruleForm.checkPass !== '') {
						this.$refs.ruleForm.validateField('checkPass');
					}
					callback();
				}
			};
			var validatePass2 = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('请再次输入密码'));
				} else if (value !== this.ruleForm.pass) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			};
			return {
				ruleForm: {
					username: '', //用户昵称
					password: '', //密码
					checkPass: '', //确认密码
				},
				activeIndex: '1',
				rules: {
					pass: [{
						trigger: 'blur'
					}],
					checkPass: [{
						trigger: 'blur'
					}],
					name: [{
							required: true,
							message: '请输入昵称',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '长度在 3 到 10 个字符',
							trigger: 'blur'
						}
					],
				},
				value: [],
			};
		},
		methods: {
			getTime(date) {
				this.ruleForm.date1 = date;
				console.log(this.ruleForm.date1); //这个数据就可以直接拿过去传给后台用
			},
			submitForm(formName) {
				this.$axios.post('http://localhost:8082/user/register?username='+this.ruleForm.username+'&password='+this.ruleForm.password)
				.then(res => {
					if (res.data.status_code==-1){
						this.$message({
						type:'error',
						message:"账号或密码有误"
					})
					}else{
						let path='/Index/'+this.ruleForm.username
						this.$router.push(path);
					}
					this.resetForm('ruleForm')
				})
				.catch(err => {
					console.error(err); 
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			handleChange(value) {
				console.log(value);
			},
			cancel() {
				this.$router.push('/login');
			},
		}
	}
</script>

<style scoped="scoped">
	* {
		box-sizing: border-box;
		margin: 0px;
		padding: 0px;
	}

	html,
	body {
		width: 100%;
		height: 100%;
	}

	#Register {
		width: 600px;
		margin: 50px auto;
		padding: 20px;
		background-color: #ffd7c7;
	}

	.demo-ruleForm {
		font-size: 20px;
		text-align: left;
	}

	.el-form-item {
		font-size: 20px;
		margin: 15px;
	}

	.el-form-item__label {
		font-size: 20px !important;
	}

	.el-button {
		width: 50px;
		height: 25px;
	}

	.last_footer {
		text-align: center;
		padding-right: 40px;
	}
</style>
