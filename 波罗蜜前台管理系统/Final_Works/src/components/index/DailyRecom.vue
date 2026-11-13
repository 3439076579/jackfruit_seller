<template>
	<div>
	<div id="DailyRecom">
		<div v-for="(item,index) in jackfruits" :key="index" :value="item">
			<img :src=item.image>
			<p>
				{{item.name}}
				价格:{{item.price}}
				库存:{{item.storage}}
			</p>

			<p>
				<el-button type="text" class="button" icon="el-icon-star-off" @click="detailInfo(item)">详细信息</el-button>
				<el-button type="text" class="button" icon="el-icon-goods" @click="buyJackfruit(item)">购买</el-button>
			</p>
		</div>
	</div>

		<el-dialog
		title="详细信息"
		:visible.sync="DetaildialogVisible"
		width="50%"
		height="100%"
		>
		<p>Name: {{ selectedJackfruit.name }}</p>
				<hr/>
				<p>Storage: {{ selectedJackfruit.storage }}</p>
				<hr/>
				<p>Price: {{ selectedJackfruit.price }}</p>
						<hr/>
				<p>Managment_Info:{{selectedJackfruit.management_info}}</p>
						<hr/>
				<p>Plant_Introduction:{{selectedJackfruit.plant_intro}}</p>
						<hr/>
				<p>Feature:{{selectedJackfruit.feature}}</p>
						<hr/>
				<img :src="selectedJackfruit.image" width="300" height="200">
		</el-dialog>

		<el-dialog title="订单信息" :visible.sync="TokenVisible" :before-close="handleClose">
		<el-form :model="token" :rules="rules">
			<el-form-item label="收货地址" :label-width="formLabelWidth" prop="address">
			<el-input  v-model="token.address" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="购买数量" :label-width="formLabelWidth" prop="quantity">
			<el-input  v-model.number="token.quantity" autocomplete="off"></el-input>
			</el-form-item>
			<p>品种:{{token.willBuyJackfruit.name}}</p>
			<p>价格:{{Price}}</p>
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button @click="cancel">取 消</el-button>
			<el-button type="primary" @click="innerVisible = true">确 定</el-button>
		</div>
		<el-dialog
		width="30%"
		title="确认订单"
		:visible.sync="innerVisible"
		append-to-body>
		<span>是否确认购买</span>
		<div slot="footer" class="dialog-footer">
			<el-button @click="innerVisible=false">取 消</el-button>
			<el-button type="primary" @click="createToken">确 定</el-button>
		</div>
		</el-dialog>
		</el-dialog>
		 
		</div>
</template>

<script>

export default{
	data(){
		return{
			jackfruits:[],
			DetaildialogVisible:false,
			selectedJackfruit:Object,
			TokenVisible:false,
			token:{
				willBuyJackfruit:Object,
				address:'',
				quantity:'',
			},
			formLabelWidth: '120px',
			innerVisible:false,
			rules:{
				address:[{
					required:true,
					message:"请输入地址",
					trigger:'blur',
				},

				],
				quantity: [{
					required: true,
					message: '请填写购买个数',
					trigger: 'blur'
				},
				{
					type:'number',
					message:'购买数量必须为数字值',
				}
				],
			}
		};
	},
	 computed: {
		Price() {
		// 计算数值的总和
		if (this.token.quantity==''){
			return 0
		}
		return parseInt(this.token.quantity,10)*this.token.willBuyJackfruit.price
		},
	},
	methods:{
		detailInfo(item){
			this.DetaildialogVisible=true
			this.selectedJackfruit=item
		},
		buyJackfruit(item){
			this.TokenVisible=true;
			this.token.willBuyJackfruit=item;
		},
		createToken(){
			const formData = new FormData();
			formData.append('user_id', localStorage.getItem("id"));
			formData.append('jackfruit_id', this.token.willBuyJackfruit.ID);
			formData.append('address', this.token.address);
			formData.append('quantity', this.token.quantity);
			formData.append('total',this.Price);
			this.$axios.post("http://localhost:8082/order/create",formData)
			.then(res => {
				if (res.data.status_code==-1){
					this.$message({
						type:'error',
						message:res.data.message
					})
					this.innerVisible=false
				}else{
					this.token.willBuyJackfruit.storage=res.data.data.jackfruit.storage
					this.innerVisible=false
					this.TokenVisible = false
					this.token.willBuyJackfruit=Object
					this.token.address=''
					this.token.quantity=''
				}
				console.log(res)
			})
			.catch(err => {
				console.error(err); 
			})
		},
		cancel(){
			this.TokenVisible = false
			this.token.willBuyJackfruit=Object
			this.token.address=''
			this.token.quantity=''
		},
		handleClose(){
			this.TokenVisible = false
			this.token.willBuyJackfruit=Object
			this.token.address=''
			this.token.quantity=''
		}
		// handleClose(){
		// 	this.$confirm('确认关闭？')
        //   .then(_ => {
        //     done();
        //   })
        //   .catch(_ => {});
	},
	mounted(){
		this.$axios.get("http://localhost:8082/jackfruit/list")
		.then(res => {
			if (res.data.statud_code==-1){
				this.$message({
						type:'error',
						message:"获取商品信息失败",
			})}
			else{
				console.log(res.data)
				this.jackfruits=res.data.data
			}
			console.log(this.jackfruits)
		})
		.catch(err => {
			console.error(err); 
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

	#DailyRecom>div {
		float: left;
		width: 200px;
		height: 270px;
		margin: 10px 10px 13px 12px;
		padding: 8px;
		border: 1px solid #919191;
		transition: all 0.5s;
	}

	#DailyRecom>div:hover {
		border: 2px solid #ff0000;
		transform: translate(0, -10px);
	}

	#DailyRecom>div>img {
		width: 180px;
		height: 165px;
	}

	#DailyRecom>div>p {
		width: 180px;
		font-size: 15px;
		text-align: justify;
		/* text-indent: 2rem; */
	}

	#DailyRecom>div>p:nth-of-type(1) {
		overflow: hidden;
		width: 180px;
		height: 60px;
		margin-top: 5px;
	}

	#DailyRecom>div>p:nth-of-type(2) {
		position: absolute;
		margin-top: 2px;
		text-align: center;
	}
	.el-button:hover{
		color: #1cce66;
	}
</style>
