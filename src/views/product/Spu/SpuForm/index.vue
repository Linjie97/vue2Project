<template>
    <div>
        <el-form ref="form" label-width="80px" :model="spu">
            <el-form-item label="SPU名称">
                <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
            </el-form-item>
            <el-form-item label="品牌">
                <el-select placeholder="请选择品牌" v-model="spu.tmId">
                    <el-option :label="tm.tmName" value="tm.id" v-for="(tm) in tradeMarkList" :key="tm.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="SPU描述">
                <el-input type="textarea" rows="4" placeholder="描述" v-model="spu.description"></el-input>
            </el-form-item>
            <el-form-item label="SPU图片">
                <!-- 使用upload的照片墙 action：图片上传地址  list-type文件列表的类型
                  on-preview点击文件列表中已上传的文件时的钩子，就是预览的时候触发
                  on-remove删除图片的时候触发
                  file-list照片墙需要展示的数据[数组内的怨怒是务必要有name，url属性]
                -->
                <el-upload action="/dev-api/admin/product/fileUpload" list-type="picture-card"
                    :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :file-list="spuImageList"
                    :on-success="handlerSuccess">
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible">
                    <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
            </el-form-item>
            <el-form-item label="销售属性">
                <el-select :placeholder="`还有${unSelectSaleAttr.length}未选择`" v-model="attrIdAndAttrName">
                    <el-option label="unselect.name" :value="`${unselect.id}:${unselect.name}`"
                        v-for="(unselect) in unSelectSaleAttr" :key="unselect.id"></el-option>
                </el-select>
                <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAndAttrName" style="margin:10px 20px"
                    @click="addSaleAttr">添加销售属性</el-button>
                <!-- 展示的是当前spu属于自己的销售属性 -->
                <el-table style="width:100%" border :data="spu.spuSaleAttrList">
                    <el-table-column type="index" label="序号" width="80px" align="center"></el-table-column>
                    <el-table-column prop="saleAttrName" label="属性名" width="width" align="center"></el-table-column>
                    <el-table-column prop="prop" label="属性值名称列表" width="width" align="center">
                        <template slot-scope="{row}">
                            <!-- el-tag：用户展示已有属性值列表的数据 -->
                            <el-tag :key="tag.id" v-for="(tag, index) in row.spuSaleAttrValueList" closable
                                :disable-transitions="false" @close="row.spuSaleAttrValueList.splice(index, 1)">
                                {{ tag.saleAttrValueName }}
                            </el-tag>
                            <!-- 底下的结构与之前attr.vue中的input和span的切换差不多 -->
                            <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue"
                                ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm"
                                @blur="handleInputConfirm(row)">
                            </el-input>
                            <!-- @click="showInput" -->
                            <el-button v-else class="button-new-tag" size="small" @click="addSaleAttrValue(row)">添加
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="prop" label="操作" width="width" align="center">
                        <template slot-scope="{row,$index}">
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="spu.spuSaleAttrList.splice($index, 1)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
                <el-button @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'SpuForm',
    data() {
        return {
            dialogImageUrl: '',
            dialogVisible: false,
            // spu初始化之后是一个空的对象，当用户点击修改spu，向服务器发请求后，把服务器返回的数据（对象）赋值给spu属性
            // 即替换了初始定义的spu对象，在修改的时候可以利用这个对象收集（双向绑定）最新的数据提交给服务器
            // 添加SPU，并没有一开始就向服务器发请求，数据也是收集到spu，收集数据需要的字段查看文档得知，因此这里别写出空对象，写对应需要的字段
            spu: {
                "category3Id": 0,//三级分类的id
                "tmId": "",//品牌id
                "description": "",//描述
                "spuImageList": [ //收集的图片信息
                    // {
                    //     "id": 0,
                    //     "imgName": "",
                    //     "imgUrl": "",
                    //     "spuId": 0
                    // }
                ],
                "spuName": "",//spu名称
                "spuSaleAttrList": [
                    // {
                    //     "baseSaleAttrId": 0,
                    //     "id": 0,
                    //     "saleAttrName": "",
                    //     "spuId": 0,
                    //     "spuSaleAttrValueList": [
                    //         {
                    //             "baseSaleAttrId": 0,
                    //             "id": 0,
                    //             "isChecked": "",
                    //             "saleAttrName": "",
                    //             "saleAttrValueName": "",
                    //             "spuId": 0
                    //         }
                    //     ]
                    // }
                ],
            },//存储spu信息数据
            tradeMarkList: [],//存储品牌信息
            spuImageList: [],//存储spu图片的数据
            saleAttrList: [],//存储销售属性的数据(项目全部的销售属性)
            attrIdAndAttrName: '',//收集未选择的销售属性的id
        }
    },
    methods: {
        // 照片墙图片的删除
        handleRemove(file, fileList) {
            // file代表要删除的那张图片
            // fileList代表照片墙删除某一张图片后剩余的其他图片
            // console.log(file, fileList);
            // 收集照片墙图片的数据,对于显示的这些图片，前面我们给加上了name和url字段，对于服务器而言这两个是不需要的
            this.spuImageList = fileList;
        },
        // 照片墙图片预览的回调
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;//将图片地址赋值给这个属性
            this.dialogVisible = true;//显示放大图片的对话框
        },
        // 照片墙新增图片上传成功的回调
        handlerSuccess(response, file, fileList) {
            // 收集图片信息
            this.spuImageList = fileList;
        },
        // 初始化SpuForm数据，这里的spu来自于父组件传过来的row
        async initSpuData(spu) {
            // 获取spu信息的数据
            let spuResult = await this.$API.spu.reqSpu(spu.id);
            if (spuResult.code == 200) {
                this.spu = spuResult.data;
            };
            // 获取品牌信息
            let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
            if (tradeMarkResult.code == 200) {
                this.tradeMarkList = tradeMarkResult.data;
            };
            // 获取图片
            let spuImageResult = await this.$API.spu.reqSpuImageList();
            if (spuImageResult.code == 200) {
                let listArr = spuImageResult.data;
                // 由于照片墙显示图片的数据需要数据，数组中的元素需要有name与url属性
                listArr.forEach(item => {
                    item.name = item.imgName;
                    item.url = item.imgUrl;
                });
                this.spuImageList = listArr;
            };
            // 获取平台全部销售属性
            let saleResult = await this.$API.spu.reqBaseSaleAttrList();
            if (saleResult.code == 200) {
                this.saleAttrList = saleResult.data;
            };
        },
        // 添加新的销售属性的回调
        addSaleAttr() {
            // 把收集到的销售属性数据进行分割
            const [baseSaleAttrId, saleAttrName] = this.attrIdAndAttrName.split(':');
            // 向spu对象中添加新的销售属性
            let newSaleAttr = { baseSaleAttrId, saleAttrName, spuSaleAttrValueList: [] };
            this.spu.spuSaleAttrList.push(newSaleAttr);
            // 清空数据
            this.attrIdAndAttrName = "";
        },
        // 添加按钮的回调
        addSaleAttrValue(row) {
            // 点击销售属性值中添加按钮时，需要由button变为input，通过当前销售属性的inputVisible控制
            // 挂载在销售属性身上的响应式数据inputVisible，控制button与input切换
            this.$set(row, 'inputVisible', true);
            // 通过响应式数据inputValue字段收集新增的销售属性值
            this.$set(row, 'inputValue', '');
        },
        // el-input失去焦点回调
        handleInputConfirm(row) {
            // 解构出销售属性当中收集的数据
            const { baseSaleAttrId, inputValue } = row;
            // 新增的销售属性值的名称不能为空
            if (inputValue.trim() == "") {
                this.$message('属性值不能为空');
                return;
            };
            // 属性值不能重复
            let result = row.spuSaleAttrValueList.every(item => item.saleAttrValueName != inputValue);
            if (!result) return;
            // 新增的销售属性值
            let newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue };
            row.spuSaleAttrValueList.push(newSaleAttrValue);
            // inputVisible已经是响应式数据，只需修改其为false即可,由input变为button
            row.inputVisible = false;
        },
        // 保存按钮的回调
        async addOrUpdateSpu() {
            // 整理参数：只需要整理照片墙的数据
            // 对于图片，需要携带imgName和imgUrl的字段
            this.spu.spuImageList = this.spuImageList.map(item => {
                return {
                    imgName: item.name,
                    // 地址栏：新增的图片的地址||修改的图片的地址
                    imgUrl: (item.response && item.response.data) || item.url,
                }
            });
            // 参数整理完毕就要发请求
            let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu);
            if (result.code == 200) {
                this.$message({ type: 'success', message: '保存成功' });
                // 通知父组件回到场景0
                this.$emit('changeScene', {scene:0,flag:this.spu.id?'修改':'添加'});
            }
        },
        // 点击添加spu按钮的时候，发请求的函数
        async addSpuData(category3Id) {
            // 添加spu的时候收集三级分类的id
            this.spu.category3Id = category3Id;
            // 获取品牌信息
            let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
            if (tradeMarkResult.code == 200) {
                this.tradeMarkList = tradeMarkResult.data;
            };
            // 获取平台全部销售属性
            let saleResult = await this.$API.spu.reqBaseSaleAttrList();
            if (saleResult.code == 200) {
                this.saleAttrList = saleResult.data;
            };
        },
        // 取消按钮
        cancel(){
            // 取消按钮的回调，通知父组件场景变为0
            this.$emit('changeScene', {scene:0,flag:''});
            // 清除数据
            // Object.assign：es6中新增的方法，可以合并对象（浅拷贝）
            // 组件实例this._data，可以操作data当中响应式数据
            // this.$options可以获取配置对象（就是上面的data,methods,name,computed这些）,配置对象的data函数执行，执行的响应式数据为空
            Object.assign(this._data,this.$options.data());
            // console.log(this.$options.data());
        }
    },
    computed: {
        // 一共有三个销售属性(颜色，尺寸，版本)，计算还未选择的销售属性
        // 平台全部销售属性--saleAttrList，当前spu拥有的销售属性--spu.spuSaleAttrList
        unSelectSaleAttr() {
            // filter从已有数组中过滤出需要的元素，并返回一个新的数组
            // 当不等于spu拥有的属性时，说明这个属性未被选择
            return this.saleAttrList.filter(item => {
                return this.spu.spuSaleAttrList.every(item1 => {
                    return item.name != item1.saleAttrName;
                })
            })
        }
    }
}
</script>

<style>
.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>