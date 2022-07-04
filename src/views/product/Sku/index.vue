<template>
  <div>
    <!-- 表格 -->
    <el-table style="width:100%" border :data="records">
      <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
      <el-table-column label="名称" prop="skuName" width="" align="center"></el-table-column>
      <el-table-column label="描述" prop="skuDesc" width="" align="center"></el-table-column>
      <el-table-column label="默认图片" width="110">
        <template slot-scope="{row}">
          <img :src="row.skuDefaultImg" style="width:80px;height:80px">
        </template>
      </el-table-column>
      <el-table-column label="重量" prop="weight" width="80" align="center"></el-table-column>
      <el-table-column label="价格" prop="price" width="80" align="center"></el-table-column>
      <el-table-column label="操作" prop="" width="" align="center">
        <template slot-scope="{row}">
          <el-button type="success" icon="el-icon-sort-down" size="mini" v-if="row.isSale == 0" @click="cancel(row)">
          </el-button>
          <el-button type="success" icon="el-icon-sort-up" size="mini" v-else @click="sale(row)"></el-button>
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit"></el-button>
          <el-button type="info" icon="el-icon-info" size="mini" @click="getSkuInfo(row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器  -->
    <el-pagination style="margin-top: 20px; textAlign: center" :current-page="page" :total="total" :page-size="limit"
      :page-sizes="[3, 5, 10]" layout="prev,pager,next,jumper,->,sizes,total" @current-change="getSkuList"
      @size-change="handleSizeChange">
    </el-pagination>
    <!-- 抽屉效果 :direction="direction"默认从右到左 -->
    <el-drawer :visible.sync="show" :show-close="false" size="50%">
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{skuInfo.price}}(元)</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <el-tag type="success" v-for="(attr,index) in skuInfo.skuAttrValueList" :key="attr.id"
            style="margin-right:10px">{{attr.attrId}}-{{attr.valueId}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel height="150px">
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" style="width:150px;height:150px;display: block;margin:auto;" >
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'Sku',
  data() {
    return {
      page: 1,//当前页
      limit: 10,//每页展示的数据条数
      records: [],//存储SKU列表的数据
      total: 0,//存储分页器一共展示多少数据
      skuInfo:{},//存储sku详情页信息
      show:false,//抽屉效果是否可见
    }
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    //获取sku列表数据的方法
    async getSkuList(pages = 1) {
      this.page = pages;
      const { page, limit } = this;
      let result = await this.$API.sku.reqSkuList(page, limit);
      if (result.code == 200) {
        this.total = result.data.total;
        this.records = result.data.records;
      }
    },
    handleSizeChange(limit) {
      // 修改参数
      this.limit = limit;
      this.getSkuList();
    },
    // 上架
    async sale(row) {
      let result = await this.$API.sku.reqSale(row.id);
      if (result.code == 200) {
        row.isSale = 0;
        this.$message({ type: 'success', message: '上架成功' });
      }
    },
    // 下架
    async cancel(row) {
      let result = await this.$API.sku.reqCancel(row.id);
      if (result.code == 200) {
        row.isSale = 1;
        this.$message({ type: 'success', message: '下架成功' });
      }
    },
    // 编辑按钮的回调
    edit(){
      this.$message({message:'正在开发中'})
    },
    // 详情按钮的回调
     async getSkuInfo(sku){
      // 展示抽屉
      this.show = true;
       let result = await this.$API.sku.reqSkuById(sku.id);
       if(result.code==200){
        this.skuInfo = result.data;
       }
    },
  },
}
</script>


<style scoped>
.el-row .el-col-5{
  font-size: 18px;
  text-align: right;
}
.el-col{
  margin: 10px 10px;
}

/* 深度选择器，使得父组件加scoped也可以影响到子组件的样式 */
>>>.el-carousel button{
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
}
</style>

<style>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
}

</style>