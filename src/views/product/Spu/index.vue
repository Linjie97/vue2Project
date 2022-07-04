<template>
  <div>
    <el-card style="margin:20px 0px">
      <!-- 三级联动:全局组件 -->
      <CategorySelect @getCategoryId="getCategoryId" :show="scene != 0"></CategorySelect>
    </el-card>
    <el-card>
      <!--这里是有三部分进行切换的：显示spu列表页面，添加|修改spu，添加sku  -->
      <div v-show="scene == 0">
        <!-- 显示SPU列表的结构 -->
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table style="width:100%;margin:20px 0px" border :data="records">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width" align="center"></el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width" align="center"></el-table-column>
          <el-table-column prop="prop" label="操作" width="width" align="center">
            <template slot-scope="{row}">
              <hint-button type="success" icon="el-icon-plus" size="mini" title="添加sku" @click="addSku(row)">
              </hint-button>
              <hint-button type="warning" icon="el-icon-edit" size="mini" title="修改spu" @click="updateSpu(row)">
              </hint-button>
              <hint-button type="info" icon="el-icon-info" size="mini" title="查看当前spu全部sku列表" @click="lookSkuList(row)"></hint-button>
              <!-- 这里使用自己封装的hint-button和直接用el-button效果是一样的，都可以显示提示信息title，maybe就是教一个封装的思想 -->
              <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="deleteSpu(row)">
                <hint-button type="danger" icon="el-icon-delete" size="mini" title="删除spu" slot="reference">
                </hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!--分页器-->
        <el-pagination :current-page="page" :page-size="limit" :page-sizes="[3, 5, 10]"
          layout="prev, pager, next,->,sizes,total" :total="total" style="text-align:center"
          @current-change="getSpuList" @size-change="handleSizeChange">
        </el-pagination>
      </div>
      <SpuForm v-show="scene == 1" @changeScene="changeScene" ref="spu"></SpuForm>
      <SkuForm v-show="scene == 2" @changeScenes="changeScenes" ref="sku"></SkuForm>
    </el-card>

    <el-dialog :title="`${spu.spuName}的sku列表`" :visible.sync="dialogTableVisible" :before-close="close">
      <el-table :data="skuList" style="width:100%" border v-loading="loading">
      <el-table-column prop="skuName" label="名称" width="width"></el-table-column>
      <el-table-column prop="price" label="价格" width="width"></el-table-column>
      <el-table-column prop="weight" label="重量" width="width"></el-table-column>
      <el-table-column label="默认图片" width="width">
         <template slot-scope="{row}">
          <img :src="row.skuDefaultImg" style="width:100px;height:100px">
         </template>
      </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
// 引入子组件
import SpuForm from './SpuForm';
import SkuForm from './SkuForm';
export default {
  name: 'Spu',
  components: { SpuForm, SkuForm },
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      // 控制三级联动的可操作性
      show: true,
      page: 1,//当前页
      limit: 3,//每页展示的数据条数
      total: 0,//总条数
      records: [],//spu列表的数据
      scene: 0,//0代表展示SPU列表数据，1代表添加SPU|修改SPU，2代表添加SKU
      // 控制当前spu全部sku列表对话框的显示与否
      dialogTableVisible:false,
      spu:[],//存储某一个spu的数据
      skuList:[],//存储sku列表的数据
      loading:true,
    }
  },
  methods: {
    // 三级联动自定义事件的回调
    getCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = '';
        this.category3Id = '';
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = '';
      } else {
        this.category3Id = categoryId;
        // 发请求获取SPU列表数据
        this.getSpuList();
      };
    },
    // 获取SPU列表数据的方法
    async getSpuList(pager = 1) {
      this.page = pager;
      const { page, limit, category3Id } = this;
      let result = await this.$API.spu.reqSpuList(page, limit, category3Id);
      if (result.code == 200) {
        this.total = result.data.total;
        this.records = result.data.records;
      }
    },
    // // 点击分页器的某一页的回调,直接在标签中绑定getSpuList()
    // handleCurrentChange(page){
    //   this.page = page;
    //   this.getSpuList();
    // }

    // 分页器每一页展示数据的条数发生变化的回调,其实这个也可以跟上面一样直接用getSpuList()
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSpuList();
    },
    // 点击添加SPU按钮的回调
    addSpu() {
      this.scene = 1;
      // 通知子组件SpuForm发请求--两个
      this.$refs.spu.addSpuData(this.category3Id);
    },
    // 修改某个spu按钮的回调
    updateSpu(row) {
      this.scene = 1;
      // 获取子组件SpuForm
      // 在父组件中可以通过$refs获取子组件
      this.$refs.spu.initSpuData(row);
    },
    // SpuForm的自定义事件回调
    changeScene({ scene, flag }) {
      // flag这个形参为了区分保存按钮时添加还是修改
      this.scene = scene;
      // 子组件通知父组件切换场景，需要再次获取spu列表的数据
      if (flag == '修改') {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
    },
    // 删除spu的回调
    async deleteSpu(row) { 
      let result = await this.$API.spu.reqDeleteSpu(row.id);
      if(result.code==200){
        this.$message({type:'success',message:'删除成功'});
        this.getSpuList(this.records.length>1?this.page:this.page-1);
      }
    },
    // 添加sku按钮的回调
    addSku(row){
      // 切换场景为2
      this.scene = 2;
      // 父组件调用子组件的方法，让子组件发请求--三个请求
      this.$refs.sku.getData(this.category1Id,this.category2Id,row);
    },
    // SkuForm的自定义事件回调
    changeScenes(scene){
      this.scene = scene;
    },
    // 查看当前spu全部sku列表按钮的回调
    async lookSkuList(spu){
      // 点击按钮时对话框可见
      this.dialogTableVisible = true;
      // 保存spu信息
      this.spu = spu;
      // 获取sku列表的数据进行展示
      let result = await this.$API.spu.reqSkuList(spu.id);
      if(result.code==200){
        this.skuList = result.data;
        // loading效果隐藏
        this.loading = false;
      }
    },
    // 关闭对话框的回调
    close(done){
      // 清空对话框数据，loading切换为true
      this.loading = true;
      this.skuList = [];
      // 关闭对话框
      done();
    }
  }
}
</script>

<style>
</style>