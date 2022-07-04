<!-- 放平台属性管理和sku管理中共用的三级联动 -->
<template>
    <div>
        <!-- inline代表行内表单，代表一行可以放多个表单元素 -->
        <el-form :inline="true" class="demo-form-inline" :model="cForm">
            <el-form-item label="一级分类">
                <el-select placeholder="请选择" v-model="cForm.category1Id" @change="handler1" :disabled="show">
                    <!-- 这里select的v-model绑定value值，可以获取到对应选中的分类id -->
                    <el-option :label="c1.name" :value="c1.id" v-for="c1 in list1" :key="c1.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="二级分类">
                <el-select placeholder="请选择" v-model="cForm.category2Id" @change="handler2" :disabled="show">
                    <el-option :label="c2.name" :value="c2.id" v-for="c2 in list2" :key="c2.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="三级分类">
                <el-select placeholder="请选择" v-model="cForm.category3Id" @change="handler3" :disabled="show">
                    <el-option :label="c3.name" :value="c3.id" v-for="c3 in list3" :key="c3.id"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'CategorySelect',
    props:['show'],
    data() {
        return {
            // 一级分类的数据
            list1: [],
            // 二级分类的数据
            list2: [],
            // 三级分类的数据
            list3: [],
            // 收集相应的一二三级分类的id
            cForm: {
                category1Id: '',
                category2Id: '',
                category3Id: '',
            }
        }
    },
    // 组件挂载完毕，向服务器发请求，获取相应的一级分类的数据
    mounted() {
        // 获取一级分类数据的方法
        this.getCategory1List();
    },
    methods: {
        async getCategory1List() {
            let result = await this.$API.attr.reqCategory1List();
            if (result.code === 200) {
                this.list1 = result.data;
            } else { }
        },
        // 一级分类select标签的change方法：选中值发生变化时触发,即一级分类的option发生变化时获取二级分类数据
        async handler1() {
            // 清除原本的数据
            this.list2=[];
            this.list3=[];
            this.cForm.category2Id='';
            this.cForm.category3Id='';
            // 发请求
            const { category1Id } = this.cForm;
            // 将id传给父组件
            this.$emit('getCategoryId',{categoryId:category1Id,level:1});
            let result = await this.$API.attr.reqCategory2List(category1Id);
            if (result.code === 200) {
                this.list2 = result.data;
            } else {
                return Promise.reject(new Error(error.message));
            }
        },
        // 二级分类select标签的change方法：二级分类的option发生变化时获取三级分类数据
        async handler2() {
            // 清除原本的数据
            this.list3=[];
            this.cForm.category3Id='';
            // 发请求
            const { category2Id } = this.cForm;
            this.$emit('getCategoryId',{categoryId:category2Id,level:2});
            let result = await this.$API.attr.reqCategory3List(category2Id);
            if (result.code === 200) {
                this.list3 = result.data;
            } else {
                return Promise.reject(new Error(error.message));
            }
        },
        // 三级分类的事件回调
        handler3(){
            const  { category3Id } = this.cForm;
            this.$emit('getCategoryId',{categoryId:category3Id,level:3});
        }
    }
}
</script>

<style>
</style>