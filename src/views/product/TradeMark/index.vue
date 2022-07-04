<template>
  <div>
    <!-- 按钮 -->
    <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0px" @click="showDialog">添加</el-button>
    <!-- 表格组件
        data:表格组件将来需要展示的数据---数组类型
        border:给表格添加边框
        注意：elementui中的table组件展示的数据就是一列一列进行展示
        <el-table-column>表示一列
          column属性：
            label显示的标题
            width对应列的宽度--string
            align对齐方式
            prop对应列内容的字段名--string
    -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width" align="center"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width" align="center">
        <!-- 需要显示图片，这里使用到插槽,父组件table子组件column通信 -->
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width" align="center">
        <!-- 小tip：一开始以为这个slot没用给删掉了，所以报错row没定义，因为需要得知当前点击修改的是那一行
        所以需要跟父组件table进行通信 -->
        <template slot-scope="{ row }">
        <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)">修改</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 
      分页器
        当前页current-page，数据总条数total，每一页展示条数page-size,总页数page-count，
        连续页码数（页码按钮的数量）pager-count（默认7）  每页显示个数选择器的选项设置page-sizes
        layout 组件布局，子组件名用逗号分隔,加个->可以将右边的内容置于右端
        @size-change：pageSize 改变时会触发   @current-change：currentPage 改变时会触发
        小tip：textAlign一格式化会变成textalign，所以需要注意
     -->
    <el-pagination style="margin-top: 20px; textAlign: center" :current-page="page" :total="total" :page-size="limit"
      :pager-count="7" :page-sizes="[3, 5, 10]" layout="prev,pager,next,jumper,->,sizes,total"
      @current-change="getPageList" @size-change="handleSizeChange"></el-pagination>

    <!-- 
      对话框el-dialog
        :visible.sync 是否显示 Dialog，支持 .sync 修饰符（实现父子组件数据同步）
      -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <!-- el-form 表单元素
         model：表单数据对象，作用是把表单的数据收集到对象身上，将来表单验证也需要这个规则 
        Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，
        并将 Form-Item 的 prop 属性设置为需校验的字段名即可。
         -->
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 
            el-upload通过点击或者拖拽上传文件
            :on-success="handleAvatarSuccess"  文件上传成功时的钩子
            :before-upload="beforeAvatarUpload"上传文件之前的钩子，参数为上传的文件，
            action：设置图片上传的地址,这里记得加dev-api,上传图片是elementui插件发的请求，所以没有加baseurl
           -->
           <!-- 这里收集数据不可以使用v-model，因为不是表单元素 -->
          <el-upload class="avatar-uploader" action="/dev-api/admin/product/fileUpload"
            :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件, 且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  data() {
    // 自定义校验规则
    var validateTmName = (rule, value, callback) => {
      if(value.length<2 || value.length >10){
        callback(new Error('品牌名称长度在 2 到 10 个字符'))
      }else{
        callback();
      }
    };
    return {
      // 当前页数
      page: 1,
      // 当前页数展示数据条数
      limit: 3,
      // 总数据条数
      total: 0,
      // 列表展示的数据
      list: [],
      // 对话框显示与隐藏控制的属性
      dialogFormVisible: false,
      // 收集对话框中品牌的信息:对象身上的属性不能随意定义，要看接口文档中的定义
      tmForm:{
        tmName:'',
        logoUrl:'',
      },
      // 表单验证规则--object
      // required:必填项  message：提示信息  trigger：用户行为设置（事件的设置，常用blur和change）
      rules: {
        // 品牌名称的验证规则
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          // 自定义校验规则
           { validator: validateTmName, trigger: 'change' },
          // { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
        ],
        // 品牌logo的验证规则
        logoUrl: [
          { required: true, message: '请上传品牌logo'}
        ],
      }
    };
  },
  mounted() {
    // console.log(this.$API);
    // 获取列表数据方法
    this.getPageList();
  },
  methods: {
    async getPageList(pager = 1) {
      this.page = pager; //默认值是1，current-change回调参数是当前页，currentPage 改变时会触发
      const { page, limit } = this;
      // 获取品牌列表的接口
      let result = await this.$API.trademark.reqTradeMark(page, limit);
      // console.log(result);
      if (result.code == 200) {
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },
    // 当分页器每页展示数据条数pageSize改变时触发
    handleSizeChange(limit) {
      // console.log(limit);
      this.limit = limit;
      this.getPageList();
    },
    // 点击添加品牌的按钮
    showDialog() {
      // 显示对话框
      this.dialogFormVisible = true;
      // 清除数据
      this.tmForm = {tmName:'',logoUrl:''};
    },
    // 修改某个品牌
    updateTradeMark(row) {
      // row:当前选中的品牌信息(来自于服务器)，也就是点击修改按钮对应那一行
      // 显示对话框
      this.dialogFormVisible = true;
      // 将已有的品牌形象赋值给tmForm进行展示，即tmForm存储的就是服务器返回的品牌信息
      // 点击修改后，弹出的框应该包含原来信息，但又不能直接拷贝，
      // 因为这样不管后续是否点击确定，都会修改了页面展示的信息，因此使用浅拷贝。
      // 这个赋值操作，是一个浅拷贝，将list中对应的品牌信息对象拷贝一份给tmForm，而非直接克隆
      // 等同于 Object.assign({},row)
      this.tmForm = {...row};
      // 目前只有自己添加的才可以修改，其余的修改会报错
      // console.log(row);
    },
    // 图片上传成功
    handleAvatarSuccess(res, file) {
      // console.log(res,file);
      // res是上传成功后返回给前端的数据即response,状态码，图片路径，message
      // file是上传成功后返回给前端的数据，较完整的数据，也包含了res
      this.tmForm.logoUrl = res.data;//收集品牌图片数据（路径），将来需要带给服务器
    },
    // 图片上传之前调用的函数
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    // 添加或修改品牌的确定按钮
     addOrUpdateTradeMark(){
      // 当全部表单验证字段通过后再去书写业务逻辑
      this.$refs.ruleForm.validate(async(success) => {
        // 如果全部字段符合条件
        if (success) {
          this.dialogFormVisible = false;
          // 发请求
          let result = await this.$API.trademark.reqAddOrUpdateTradeMark(this.tmForm);
          // console.log(result);
          if (result.code == 200) {
            // 弹出信息:“添加品牌成功”||“修改品牌成功”,使用elementui的组件message
            this.$message({
              type: 'success',
              message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功',
            });
            // 添加或者修改成功后需要再次获取列表进行展示
            // 如果添加品牌，停留在第一页，修改是停留在当前页
            this.getPageList(this.tmForm.id ? this.page : 1);
            // 清除数据
            this.tmForm = { tmName: '', logoUrl: '' };
          }
        }else{
          console.log('error submit!!');
          return false;
        }
      });
     
    },
    // 删除品牌操作
    deleteTradeMark(row){
      // console.log(row);
      // 弹框
      this.$confirm(`确定删除${row.tmName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 当用户点击确定按钮的时候会触发
        let result = await this.$API.trademark.reqDeleteTradeMark(row.id);
        if (result.code == 200) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          // 再次获取品牌列表
           this.getPageList(this.list.length>=1?this.page:this.page-1);
        }else{}
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
  },
};
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>