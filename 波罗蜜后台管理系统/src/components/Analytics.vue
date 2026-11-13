<template>
  <el-card>
    <el-row>
      <el-col :span="8">
        <div class="cardTitle"><i class="el-icon-trophy"></i> 销量排行 TOP10</div>
        <el-table :data="salesRanking" stripe size="small" border>
          <el-table-column label="排名" type="index" :index="i=>i+1" width="60"></el-table-column>
          <el-table-column prop="product_name" label="产品名"></el-table-column>
          <el-table-column prop="total_sales" label="总销量" width="90"></el-table-column>
          <el-table-column prop="total_revenue" label="总销售额" width="110"></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="8" :offset="1">
        <div class="cardTitle"><i class="el-icon-pie-chart"></i> 分类销售额</div>
        <el-table :data="categoryRevenue" stripe size="small" border>
          <el-table-column prop="category_name" label="分类"></el-table-column>
          <el-table-column prop="order_count" label="订单数" width="90"></el-table-column>
          <el-table-column prop="total_revenue" label="总销售额" width="110"></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="6" :offset="1">
        <div class="cardTitle"><i class="el-icon-star-on"></i> 高分商品</div>
        <el-form :inline="true" size="small">
          <el-form-item label="最低评分">
            <el-select v-model="minRating" style="width: 90px" @change="loadHighRating">
              <el-option :value="5" label="5"></el-option>
              <el-option :value="4" label="4"></el-option>
              <el-option :value="3" label="3"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-table :data="highRating" stripe size="small" border>
          <el-table-column prop="product_name" label="产品名"></el-table-column>
          <el-table-column prop="avg_rating" label="均分" width="70"></el-table-column>
          <el-table-column prop="review_count" label="评价数" width="80"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
    name:'Analytics',
    data(){
      return{
        salesRanking:[],
        categoryRevenue:[],
        highRating:[],
        minRating:4,
      }
    },
    methods:{
      loadHighRating(){
        this.$axios.get("http://localhost:8082/analytics/high_rating?min_rating="+this.minRating).then((result) => {
          this.highRating=result.data.data||[]
        })
      }
    },
    mounted(){
      this.$axios.get("http://localhost:8082/analytics/sales_ranking").then((result) => {
        this.salesRanking=result.data.data||[]
      })
      this.$axios.get("http://localhost:8082/analytics/category_revenue").then((result) => {
        this.categoryRevenue=result.data.data||[]
      })
      this.loadHighRating()
    },
}
</script>

<style scoped>
.cardTitle{
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 15px;
}
</style>
