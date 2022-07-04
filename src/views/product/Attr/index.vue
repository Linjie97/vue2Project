<template>
  <div>
    <el-card style="margin:20px 0px">
      <!-- 三级联动 -->
      <CategorySelect @getCategoryId="getCategoryId" :show="!isShowTable"></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button type="primary" icon="el-icon-plus" style="margin:10px 0px" :disabled="!category3Id" @click="addAttr">
          添加属性</el-button>
        <!-- 表格：展示平台属性 -->
        <el-table style="width:100%" border :data="attrList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150" align="center"></el-table-column>
          <el-table-column label="属性值列表" align="center">
            <template slot-scope="{row}">
              <el-tag type="success" v-for="(attrValue) in row.attrValueList" :key="attrValue.id"
                style="margin:0px 20px">{{ attrValue.valueName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="{row}">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateAttr(row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性|修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrInfo.attrName"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" :disabled="!attrInfo.attrName">添加属性值
        </el-button>
        <el-button>取消</el-button>
        <el-table style="width:100%;margin:20px 0px" border :data="attrInfo.attrValueList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width" align="center">
            <template slot-scope="{row,$index}">
              <!-- 这里input为编辑模式，span是查看模式，两者不能同时出现,来回切换 -->
              <el-input v-model="row.valueName" placeholder="请输入属性值名称" size="mini" v-if="row.flag" @blur="toLook(row)"
                @keyup.native.enter="toLook(row)" :ref="$index"></el-input>
              <span v-else @click="toEdit(row,$index)" style="display:block">{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width" align="center">
            <template slot-scope="{row,$index}">
              <!-- 气泡确认框:注意此模板用的是旧版本elementui，对应确认回调是onconfirm -->
              <el-popconfirm :title="`确定删除${row.valueName}?`" @onConfirm="deleteAttrValue($index)">
                <el-button type="danger" icon="el-icon-delete" size="mini" slot="reference"></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="addOrUpdateAttr" :disabled="attrInfo.attrValueList.length<1">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';//按需引入lodash中的深拷贝
export default {
  name: 'Attr',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      attrList: [],//接收平台属性字段
      // 控制table表格显示与隐藏
      isShowTable: true,
      // 收集新增属性|修改属性使用的
      attrInfo: {
        "attrName": "",//属性名
        "attrValueList": [],//属性名的属性值列表,其中属性以对象形式存在
        "categoryId": 0,  //category3Id,同在data中无法收集3Id，因为对象是无序的，这时候拿不到，在添加属性按钮的回调中拿到
        "categoryLevel": 3,//几级id
      }
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
        // 发请求获取品牌属性
        this.getAttrList();
      };
    },
    // 获取平台属性
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(category1Id, category2Id, category3Id);
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    // 添加属性值回调
    addAttrValue() {
      // 向属性值的数组中添加元素
      this.attrInfo.attrValueList.push({
        //添加属性时，相应属性的id，需要由服务器给，目前未向服务器发请求是没有滴,即是undefined
        // 而对于修改某个属性时可以在已有的属性值基础上新增属性值，此时属性的id时存在的
        attrId: this.attrInfo.id,
        ValueName: '',
        flag: true,//给每一个属性值添加一个标记，用于切换查看模式与编辑模式，而且这里是通过push，是响应式数据
      });
      // 实现聚焦
      this.$nextTick(()=>{
        this.$refs[this.attrInfo.attrValueList.length-1].focus();
      })
    },
    // 添加属性按钮的回调
    addAttr() {
      // 切换table的显示与隐藏
      this.isShowTable = false;
      // 清除数据
      this.attrInfo = {
        "attrName": "",//属性名
        "attrValueList": [],//属性名的属性值列表,其中属性以对象形式存在
        "categoryId": this.category3Id,  //category3Id
        "categoryLevel": 3,//几级id
      }
    },
    // 修改某一个属性
    updateAttr(row) {
      this.isShowTable = false;
      // 将选中的row的属性赋值给attrInfo
      //因为这里是对象中嵌套数组，数组中还有对象，需要深拷贝才可以解决问题，可以用lodash中的深拷贝
      this.attrInfo = cloneDeep(row);
      // 在修改某一个属性的时候，将相应的属性值元素加上flag这个标记
      this.attrInfo.attrValueList.forEach(item=>{
        // $set向响应式对象中添加一个属性,以确保这个新的属性也是响应式的
        // (对象，新添加的响应式属性名，属性值)
        this.$set(item,'flag',false);
      })
    },
    // 失去焦点的事件  切换为查看模式，展示span
    toLook(row) {
      // 如果属性值为空，需要提醒用户输入一个属性值
      if (row.valueName.trim() == '') {
        this.$message('属性值不能为空');
        return;
      }
      // 新增的属性值不能跟之前重复
      let isRepeat = this.attrInfo.attrValueList.some(item => {
        // 需要将row从数组里面判断时去掉,row就是新增的那项属性值
        if (row !== item) {
          return row.valueName == item.valueName;
        }
      });
      if (isRepeat) {
        this.$message('属性值不能重复');
        return;
      }
      // 当前的编辑模式变为查看模式
      row.flag = false;
    },
    // 点击span的回调，变为编辑模式
    toEdit(row,index){
      row.flag = true;
      // 获取input节点，实现自动聚焦
      // 一点击span的时候切换为编辑模式，但是此时dom还没有渲染完成，拿不到input
      this.$nextTick(()=>{
        // 获取相应的input表单元素实现聚焦
        this.$refs[index].focus();
      })
    },
    // 气泡确认框确定按钮的回调
    deleteAttrValue(index){
      // 当前操作无需发请求，可以在保存的时候统一请求即可
      this.attrInfo.attrValueList.splice(index,1);
    },
    // 保存按钮的回调，进行添加属性或者修改属性的操作
    async addOrUpdateAttr(){
      // 整理参数：表格内容不能为空,且提交给服务器的数据中不应该出现flag字段
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item=>{
        // 过滤掉属性值为空
        if(item.valueName!=''){
          // 删除flag属性
          delete item.flag;
          return true;
        }
      });
      try {
        // 发请求，这里很多数据不能保存会报错
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo);
        this.isShowTable=true;//保存后跳到展示列表页面
        this.$message({type:'success',message:'保存成功'});
        // 再次获取属性列表
        this.getAttrList();
      } catch (error) {
        console.log(error.message);
        this.$message({message:'保存失败'});
      }
    }
  }
}
</script>

<style>
</style>