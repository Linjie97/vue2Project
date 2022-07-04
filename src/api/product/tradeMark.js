import request from '@/utils/request';
// 获取品牌列表接口
// /admin/product/baseTrademark/{page}/{limit}  GET page：当前页码 limit：每页记录数
export const reqTradeMark = (page,limit)=>request({url:`/admin/product/baseTrademark/${page}/${limit}`,method:"get"});

// 处理添加品牌的操作
// /admin/product/baseTrademark/save  POST  携带参数：品牌名称，品牌logo
// 切记：对于新增的品牌，给服务器传数据，无需传递id，这是由后台服务器生成的

// 修改品牌的操作
// /admin/product/baseTrademark/update  PUT  携带参数：品牌id，品牌名称，品牌logo

// 将添加和修改的请求写在一个函数中
export const reqAddOrUpdateTradeMark=(tradeMark)=>{
    // 带给服务器数据携带ID--修改
    if(tradeMark.id){
        return request({url:'/admin/product/baseTrademark/update',method:'put',data:tradeMark})
    }else{
        return request({url:'/admin/product/baseTrademark/save',method:'post',data:tradeMark})
    }
};

// 删除品牌接口
// /admin/product/baseTrademark/remove/{id}  DELETE
export const reqDeleteTradeMark = (id)=>request({url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})
