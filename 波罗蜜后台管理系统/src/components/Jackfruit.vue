<template>
  <el-card>
    <el-row class="row1Style">
      <el-col :pull="4">
        <div class="grid-content bg-purple">
            <!-- 整个的头组件，按钮功能的实现 -->
        <el-form :inline="true"  class="demo-form-inline"
        size="small">
        <el-form-item label="产品名查询：">
            <el-input  placeholder="请输入产品名" v-model="searchedIndex.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchProduct">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="clearSearch">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus"  @click="showDialog">添加</el-button>
            <el-dialog
                title="添加产品"
                :visible.sync="dialogVisible"
                width="30%"
                :append-to-body="true">
                <!-- 内嵌表单组件 -->
                <el-form :model="addProductForm" 
                  status-icon 
                  ref="ruleForm"
                  label-width="100px"
                  class="demo-ruleForm">
                <el-form-item label="产品名" >
                  <el-input type="text" v-model.trim="addProductForm.name" autocomplete="off"></el-input>
                </el-form-item>

                <el-form-item label="种类" >
                  <el-select v-model="addProductForm.category_id" placeholder="请选择种类" clearable style="width: 100%">
                    <el-option v-for="cate in categories" :key="cate.ID" :label="cate.category_name" :value="cate.ID"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="新建种类" >
                  <el-input type="text" v-model.trim="newCategory" autocomplete="off" style="width: 55%"></el-input>
                  <el-button type="primary" size="small" @click="addCategory">添加</el-button>
                </el-form-item>

                <el-form-item label="库存">
                  <el-input type="text" v-model.trim="addProductForm.storage" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="单价" >
                  <el-input type="text" v-model.trim="addProductForm.price" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="特征" >
                  <el-input type="text" v-model.trim="addProductForm.feature" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="管理信息" >
                  <el-input type="text" v-model.trim="addProductForm.management_info" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="种植介绍" >
                  <el-input type="text" v-model.trim="addProductForm.plant_intro" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="图片" >
                  <input id="image2" type="file" @change="handleAddFileChange" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click.native="addProduct">确定</el-button>
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


    <!--表格部分-->
   <el-table
      :data="jackfruits"
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
        prop="name"
        label="波罗蜜名称">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].name}}</span>
          <el-input v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.name"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="category"
        label="种类">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{ scope.row.category ? scope.row.category.category_name : '未分类' }}</span>
          <el-select v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.category_id" placeholder="请选择种类" clearable size="small" style="width: 100%">
            <el-option v-for="cate in categories" :key="cate.ID" :label="cate.category_name" :value="cate.ID"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="image"
        label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.image" width="125" height="100"/>
          <!-- <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].image}}</span> -->
          <input v-show="jackfruits[scope.$index].isEdit" id="image1" type="file" @change="handleFileChange" />
        </template>
      </el-table-column>
       <el-table-column
        prop="storage"
        label="库存">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].storage}}</span>
          <el-input v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.storage"></el-input>
        </template>
      </el-table-column>
       <el-table-column
        prop="price"
        label="价格">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].price}}</span>
          <el-input v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.price"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="feature"
        label="特征">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].feature}}</span>
          <el-input v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.feature"></el-input>
        </template>
      </el-table-column>
      <el-table-column
        prop="management_info"
        label="管理信息">
        <template slot-scope="scope">
          <span v-show="!jackfruits[scope.$index].isEdit">{{jackfruits[scope.$index].management_info}}</span>
          <el-input v-show="jackfruits[scope.$index].isEdit" v-model="TmpObj.management_info"></el-input>
        </template>
      </el-table-column>
      <!-- ************************************************** -->
       <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini" @click="handleEdit(scope.$index)"
            v-show="!jackfruits[scope.$index].isEdit"
            :disabled="EditLock"
            icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" @click="SubmitUpdate(scope.$index)"
            v-show="jackfruits[scope.$index].isEdit">确认</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteJackfruit(scope.$index)"
            v-show="!jackfruits[scope.$index].isEdit"
            icon="el-icon-delete">删除</el-button>
            <el-button size="mini"
             v-show="jackfruits[scope.$index].isEdit"
             @click="CancelEdit(scope.$index)">取消编辑</el-button>
        </template>
     </el-table-column>
  </el-table>
  </el-card>
</template>

<script>
export default {
    name:'Jackfruit',
    data(){
      return{
        jackfruits:[],
        categories:[],
        newCategory:'',
        TmpObj:{
          name:'',
          image:null,
          storage:'',
          price:'',
          feature:'',
          management_info:'',
          category_id:'',
        },
        addProductForm:{
          name:'',
          image:null,
          storage:'',
          price:'',
          feature:'',
          management_info:'',
          plant_intro:'',
          category_id:'',
        },
        servedJackfruits:[],
        searchedIndex:{name:''},
        EditLock:false,
        dialogVisible:false,
      }
    },
    methods:{
      indexMethod(index){
        return index+1;
      },
      handleEdit(index){
        this.EditLock=true
        this.TmpObj=Object.assign({},this.jackfruits[index])
        this.TmpObj.category_id=this.TmpObj.category_id||''
        this.$set(this.jackfruits[index],'isEdit',true)
      },
      SubmitUpdate(index){
        const formData = new FormData();
        formData.append('name', this.TmpObj.name);
        formData.append('storage', this.TmpObj.storage);
        formData.append('price', this.TmpObj.price);
        formData.append('image', this.TmpObj.image);
        formData.append('management_info',this.TmpObj.management_info)
        formData.append('feature',this.TmpObj.feature)
        formData.append('category_id',this.TmpObj.category_id)
        this.$axios.post("http://localhost:8082/jackfruit/update",formData)
            .then(res => {
              this.$set(this.jackfruits,index,res.data.data)
              console.log(this.UserSet)
            })
            this.$set(this.jackfruits[index],'isEdit',false)
            this.EditLock=false
      },
      CancelEdit(index){
        this.$set(this.jackfruits[index],'isEdit',false)
        this.EditLock=false
      },
      handleFileChange(){
        let ImageFile=document.querySelector("#image1")
        const file = ImageFile.files[0];
        console.log(ImageFile.files)
        this.TmpObj.image = file;
      },
      handleAddFileChange(){
         let ImageFile=document.querySelector("#image2")
        const file = ImageFile.files[0];
        this.addProductForm.image = file;
      },
      addProduct(){
        const formData = new FormData();
        formData.append('name', this.addProductForm.name);
        formData.append('storage', this.addProductForm.storage);
        formData.append('price', this.addProductForm.price);
        formData.append('image', this.addProductForm.image);
        formData.append('management_info',this.addProductForm.management_info)
        formData.append('feature',this.addProductForm.feature)
        formData.append('plant_intro',this.addProductForm.plant_intro)
        formData.append('category_id',this.addProductForm.category_id)
        this.$axios.post("http://localhost:8082/jackfruit/add",formData)
            .then(res => {
              this.jackfruits[index]=res.data.data
            })
            this.showDialog()
      },
      addCategory(){
        if(this.newCategory===''){
          this.$message({type:'warning',message:'请输入分类名称'})
          return
        }
        const formData = new FormData();
        formData.append('category_name', this.newCategory);
        this.$axios.post("http://localhost:8082/jackfruit/category/add",formData)
            .then(res => {
              if(res.data.status_code===-1){
                this.$message({type:'warning',message:res.data.message})
                return
              }
              this.$message({type:'success',message:'分类添加成功'})
              this.newCategory=''
              this.$axios.get("http://localhost:8082/jackfruit/categories").then((result)=>{
                this.categories=result.data.data
              })
            })
      },
      deleteJackfruit(index){
         if(confirm('确认要下架该产品吗？')){
              this.$axios.get("http://localhost:8082/jackfruit/delete?id="+(index+1)).then(res => {
              this.jackfruits.splice(index,1)
              // console.log(this.UserSet)
            })
            }
      },
      showDialog(){
        this.dialogVisible=!this.dialogVisible
      },
      clearAddForm(){
        this.addProductForm.name='',
        this.addProductForm.storage='',
        this.addProductForm.price='',
        this.addProductForm.feature=''
        this.addProductForm.management_info=''
        this.addProductForm.plant_intro=''
        this.addProductForm.category_id=''
        this.addProductForm.image=null
      },
      searchProduct(){
         this.servedJackfruits=this.jackfruits
            this.jackfruits=this.jackfruits.filter((item)=>{
                return item.name===this.searchedIndex.name
            })
            
            if(this.jackfruits.length===0){
              alert('查无此人')
              this.jackfruits=this.servedJackfruits
            }
            this.searchIndex.name=''
      },
      clearSearch(){
         this.jackfruits=this.servedJackfruits
          this.searchedIndex.name=''
      }    
    },
    mounted(){
      this.$axios.get("http://localhost:8082/jackfruit/list").then((result) => {
        console.log(result)
        this.jackfruits=result.data.data
        this.servedJackfruits=result.data.data
        console.log(this.jackfruits)
      })
      this.$axios.get("http://localhost:8082/jackfruit/categories").then((result) => {
        this.categories=result.data.data
      })
    },
}
</script>

