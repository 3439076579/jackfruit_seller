<template>
	<div id="PerCenter">
		<el-container>
			<el-header style="height: 35px;">
				<ul>
					<li>
						<div class="userImg">
							<el-avatar icon="el-icon-s-custom"></el-avatar>
							<!-- 把用户名传递过来 -->
							欢迎{{ $route.params.name }}
						</div>
					</li>
					<li @click='changePage("Index")'>商城首页</li>
					<li @click='changePage("PerCenter")'>个人中心</li>
					<li @click='changePage("Token")'>订单管理</li>
					<li @click='changePage("exit")'>退出登录</li>
				</ul>
			</el-header>
			<el-main>
				<div>
					<div>
						<img src="../../public/imgs/1.jpg">
						<div id="active_hover" @click="hover_click">
							<img src="../../public/imgs/camera.png">
						</div>
					</div>
					<div class="baseInfo">
						<div>
							<h3>基本信息</h3>
						</div>
						<div>
							<ul>
								<li>
									<P>用户ID:&nbsp;<span>{{ruleForm.id}}</span></P>
								</li>
								<li>
									<P>用户昵称:&nbsp;<span>{{ruleForm.name}}</span></P>
								</li>
							
								<li>
									<P>用户邮箱:&nbsp;<span>{{ruleForm.email}}</span></P>
								</li>
								<li>
									<P>用户手机:&nbsp;<span>{{ruleForm.phone}}</span></P>
								</li>
								<li>
									<p>
										<el-button type="primary" class="edit" @click="EditInfo">编辑</el-button>
									</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</el-main>
		</el-container>
		<el-dialog title="请上传图片" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
			<el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/" multiple>
				<i class="el-icon-upload"></i>
				<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
				<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
			</el-upload>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="个人信息编辑区域" :visible.sync="editFlag" width="30%" :before-close="handleClose">
			<el-form :model="newInfo" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
				<el-form-item label="用户昵称:" prop="name">
					<el-input v-model="newInfo.name"></el-input>
				</el-form-item>
				
				<el-form-item label="个人邮箱:" prop="email">
					<el-input v-model="newInfo.email"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input type="textarea" v-model="newInfo.phone"></el-input>
				</el-form-item>
				<el-form-item class="last_footer">
					<el-button type="primary" @click="submitForm" class="edit">提交</el-button>
					<el-button @click="resetForm('ruleForm')" class="edit">重置</el-button>
					<el-button type="primary" @click="editFlag=false" class="edit">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				dialogVisible: false,
				editFlag: false,
				ruleForm: {
					id:'',	//用户ID
					name: '',	//用户昵称
					phone:'',
					email:'',
				},
				newInfo:{
					name: '',	//用户昵称
					phone:'',
					email:'',
				},
				activeIndex: '1',
				rules: {
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
					email: [{
						required: true,
						message: '请填写邮箱',
						trigger: 'blur'
					}],
					phone: [{
						required: true,
						message: '请填写手机号码',
						trigger: 'blur'
					}],
				},
				value: [],
	
			};
		},
		methods: {
			getTime(date) {
				this.ruleForm.date1 = date;
				console.log(this.ruleForm.date1); //这个数据就可以直接拿过去传给后台用
			},
			changePage(path) {
				var pathNow = this.$route.path;
				var pathSplit = pathNow.split("/");
				var nameNow = pathSplit[pathSplit.length - 1];
				if (path == "Index") {
					console.log(pathSplit);
					console.log(nameNow);
					console.log('/Index/' + nameNow);
					this.$router.push('/Index/' + nameNow);
				}else if (path == "Token"){
					this.$router.push('/Token/' + nameNow);
				}else if (path == "PerCenter"){
					console.log('/PerCenter/' + nameNow)
					this.$router.push('/PerCenter/' + nameNow);
				}else if (path == "exit"){
					console.log('/PerCenter/' + nameNow)
					this.$router.push('/login');
				}
			},

			//头像遮罩层点击事件
			//点击上传头像
			hover_click() {
				this.dialogVisible = true;
			},
			//关闭对话框
			handleClose(done) {
				this.$confirm('确认关闭？')
					.then(_ => {
						done();
					})
					.catch(_ => {});
			},

			//修改个人信息
			EditInfo() {
				this.editFlag = true;
				console.log(this.$route.params.name);
			},
			//提交需要修改的数据
			submitForm(formName) {
				this.$axios.post('http://localhost:8082/user/update_id?id='+this.ruleForm.id+'&username='+this.newInfo.name
        +'&phone='+this.newInfo.phone+'&email='+this.newInfo.email, {
        }).then(response => {
				 this.$message({
                type:'info',
                message:"修改信息成功",
              })
				this.resetForm
				this.editFlag=false
			})},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			handleChange(value) {
				console.log(value);
			},
		},
		mounted(){
			var pathNow = this.$route.path;
			var pathSplit = pathNow.split("/");
			var nameNow = pathSplit[pathSplit.length - 1];
			console.log(nameNow)
			this.ruleForm.name=nameNow
			this.$axios.get("http://localhost:8082/user/user?username="+this.ruleForm.name).then(response => {
				if (response.data.status_code==-1){
					this.$message({
						type:'error',
						message:response.data.message,
					})
					return
				}else{
					console.log(response)
					this.ruleForm.id=response.data.data.ID
					this.ruleForm.phone=response.data.data.phone
					this.ruleForm.email=response.data.data.email
				}
				console.log(response)
				})
		}
	}
</script>

<style scoped>
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	#PerCenter {
		position: absolute;
		display: flex;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* background-color: #FF0000; */
		background-image: url(../../public/imgs/2.jpg);
		background-repeat: no-repeat;
		background-size: 100% 100%;
	}

	.el-header {
		background-color: #cccccc;
		color: #333;
		text-align: center;
		height: 5%;
		line-height: 25px;
	}

	.el-main {
		background-color: rgba(255, 255, 255, 0.5);
		color: #000000;
		text-align: center;
		height: 100%;
		width: 100%;
	}

	.el-container {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}

	.el-header>ul {
		position: absolute;
		right: 5px;
	}

	.el-header>ul>li {
		float: left;
		list-style: none;
		margin: 5px;
		user-select: none;
	}

	.el-header>ul>li:not(:first-child):hover {
		color: red;
		text-decoration: underline;
	}

	.el-avatar {
		position: absolute;
		left: -30px;
		top: 2px;
		width: 33px;
		height: 30px;
		color: #42B983;
		/* border: 1px solid #0000FF; */
	}

	.el-avatar--icon {
		font-size: 35px;
	}

	.el-main>div {
		/* display: flex; */
		width: 60%;
		height: 100%;
		min-width: 800px;
		margin: 0 auto;
		background-color: rgba(255, 255, 255, .6);
	}

	.el-main>div>div:nth-child(1) {
		display: block;
		position: relative;
		width: 150px;
		height: 150px;
		margin: 0 auto;
		border: 1px solid #FF0000;
		border-radius: 50%;
		background-color: #ffff00;
	}

	.el-main>div>div:nth-child(1)>img {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.el-main>div>div:nth-child(1)>div {
		display: none;
		position: absolute;
		width: 149px;
		height: 149px;
		left: 0px;
		top: 0px;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, .5);
	}

	.el-main>div>div:nth-child(1)>div>img {
		position: relative;
		width: 50%;
		height: 50%;
		left: 25%;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
	}

	.el-main>div>div:nth-child(1):hover #active_hover {
		display: block;
	}

	.el-main>div>div:nth-child(2) {
		width: 100%;
		height: 100%;
		/* border: 2px solid #0000FF; */
	}

	.baseInfo>div:nth-child(1) {
		height: 35px;
		border-bottom: 2px solid #bababa;
	}

	.baseInfo>div:nth-child(2) {
		text-align: left;
		padding: 10px 300px;
	}

	.baseInfo>div:nth-child(2)>ul {
		/* background-color: #0000FF; */
	}

	.baseInfo>div:nth-child(2)>ul>li {
		text-align: left;
		line-height: 50px;
		list-style: none;
	}

	.edit {
		/* position: absolute; */
		width: 50px;
		height: 20px;
		/* margin: 0px 120px; */
		font-size: 20px;
	}
	.demo-ruleForm{
		text-align: left;
	}
	.el-form-item{
		margin: 15px 5px;
	}
	.last_footer{
		padding-left: 50px;
	}
</style>
