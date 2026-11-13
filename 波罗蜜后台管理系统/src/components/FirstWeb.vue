<template>
<div>
  <!-- 上部内容 -->
<div>
<el-card class="cardStyle3">
  <div>
    <el-row >
      <el-col :span="4" v-for="(d, index) in dataArr" :key="index" :offset="index > 0 ? 2 : 0">
        <div>
        <el-card :body-style="{ padding: '14px' }" class="cardStyle4">
          <div style="padding:1px;">
            <el-button :icon="d.icon" circle :type="d.background"></el-button>
            <br/>
            <h2>{{d.amount}}</h2>
            <span class="NameStyle">{{d.dataName}}</span>
          </div>
        </el-card>
        </div>
      </el-col>
    </el-row>
    
  </div>
</el-card>
</div>
<!-- 图表 -->
<div>
<el-card class="cardStyle1">
  <div>
    <div id="chart1" style="width: 540px;height:300px;"></div>
  </div>
</el-card >
<el-card class="cardStyle2">
  <div>
    <div id="chart2" style="width:590px;height:300px">
    </div>
  </div>
</el-card>
</div>

</div>
</template>

<script>
export default {
  name:'FirstWeb',
  data(){
    return{
      dataArr:[
        {
          dataName:'总用户数',
          amount:Math.round(Math.random()*10000),
          icon:"el-icon-user",
          background:'primary'
        },
        {
          dataName:'菠萝蜜数量',
          amount:Math.round(Math.random()*10000),
          icon:"el-icon-s-data",
          background:'success'
        },
        {
          dataName:'在线用户',
          amount:Math.round(Math.random()*10000),
          icon:"el-icon-reading",
          background:'danger'
        },
        {
          dataName:'今日增加用户',
          amount:Math.round(Math.random()*10000),
          icon:"el-icon-date",
          background:'warning'
        },
    ]
    }
  },
  methods:{
	  myEcharts1(){
		  // 基于准备好的dom，初始化echarts实例
		  var myChart = this.$echarts.init(document.getElementById('chart1'));

		  // 指定图表的配置项和数据
		  var option = {
			  title: {
				  text: '菠萝蜜情况'
			  },
        legend:{
          data:['订单数'],
          x:'center',
          y:'top',
        },
			  tooltip: {},
			  xAxis: {
				  data: ["品种1","品种2","品种3","品种4","品种5","品种6"]
			  },
			  yAxis: {},
			  series: [{
				  name: '订单数',
				  type: 'bar',
				  data: [5, 20, 36, 10, 10, 20]
			  }]
		  };

		  // 使用刚指定的配置项和数据显示图表。
		  myChart.setOption(option);
		  },
      myEcharts2(){
        var myChart=this.$echarts.init(document.getElementById('chart2'));

        var option={
          title:{
            text:'用户增长情况'
          },
          legend:{
            data:['用户增长数'],
            x:'center',
            y:'top'
          },
          xAxis:{
            data:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
          },
          yAxis:{},
          series: [{
            name: '用户增长数',
            type: 'line',
            data: [5, 20, 36, 10, 10, 20,15,60]
          }]
        };
        myChart.setOption(option);
      }
  },
  mounted() {
  	this.myEcharts1();
    this.myEcharts2();
  }
}
</script>

<style>
  .cardStyle1{
    position: absolute;
    bottom:100px;
    height:300px;
    width: 540px;
    left:230px;
  }
  .cardStyle2{
    position: absolute;
    bottom:100px;
    height:300px;
    right:50px;
    width: 590px;
  }
  .cardStyle3{
    position: absolute;
    width:1210px;
    height:230px;
    top:100px;
    right:50px;
  }
  .cardStyle4{
    position: relative;
    top:0;
    bottom: 0;
    left: 40px;
    right: 0;
    margin: auto;
    height: 200px;
  }
  .NameStyle{
    position:absolute;
    margin-bottom: 100px;
    left:0;
    right:0;
    font-size:14px;
    top:130px;
  }

</style>