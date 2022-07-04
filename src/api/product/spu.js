import request from '@/utils/request';

// 获取SPU列表数据的接口
// /admin/product/{page}/{limit},除此之外还需要category3Id这个参数，可以放在params参数中携带过去
export const reqSpuList = (page, limit, category3Id) => request({ url: `/admin/product/${page}/${limit}`, method: 'get', params: { category3Id } });

// 获取某一个spu描述信息的接口 /admin/product/getSpuById/{spuId}
export const reqSpu = (spuId) => request({ url: `/admin/product/getSpuById/${spuId}`, method: 'get' });

// 获取品牌信息  /admin/product/baseTrademark/getTrademarkList
export const reqTradeMarkList = () => request({ url: '/admin/product/baseTrademark/getTrademarkList', method: 'get' });

// 获取图片 /admin/product/spuImageList/{spuId}
export const reqSpuImageList = (spuId) => request({ url: `/admin/product/spuImageList/${spuId}`, method: 'get' });

// 获取销售属性  /admin/product/baseSaleAttrList
export const reqBaseSaleAttrList = () => request({ url: '/admin/product/baseSaleAttrList', method: 'get' });


// 修改spu|添加spu:对于修改或添加，携带给服务器参数大致一样，区别在于携带的参数是否带id，在attr部分也写过类似接口
export const reqAddOrUpdateSpu = (spuInfo)=>{
  // 携带的参数带有id---修改spu
  if(spuInfo.id){
    return request({url:'/admin/product/updateSpuInfo',method:'post',data:'spuInfo'});
  }else{
    // 添加新的spu
    return request({url:'/admin/product/saveSpuInfo',method:'post',data:'spuInfo'});
  }
}
// 添加spu的时候需要给服务器携带的参数  /admin/product/saveSpuInfo
/*
{
  "category3Id": 0,
  "tmId": 0,
  "description": "string",
  "id": 0,
  "spuImageList": [
    {
      "id": 0,
      "imgName": "string",
      "imgUrl": "string",
      "spuId": 0
    }
  ],
  "spuName": "string",
  "spuSaleAttrList": [
    {
      "baseSaleAttrId": 0,
      "id": 0,
      "saleAttrName": "string",
      "spuId": 0,
      "spuSaleAttrValueList": [
        {
          "baseSaleAttrId": 0,
          "id": 0,
          "isChecked": "string",
          "saleAttrName": "string",
          "saleAttrValueName": "string",
          "spuId": 0
        }
      ]
    }
  ],
}
*/

// 删除SPU
export const reqDeleteSpu = (spuId)=>request({url:`/admin/product/deleteSpu/${spuId}`,method:'delete'}); 

// 获取销售属性的数据
export const reqSpuSaleAttrList = (spuId)=>request({url:`/admin/product/spuSaleAttrList/${spuId}`,method:'get'});

// 获取平台属性的数据
export const reqAttrInfoList = (category1Id,category2Id,category3Id)=>request({url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,method:'get'});

// 添加SKU
//  /admin/product/saveSkuInfo 收集数组的接口 post
export const reqAddSku = (skuInfo)=>request({url:'/admin/product/saveSkuInfo',method:'post',data:skuInfo});

// 获取SKU列表数据的接口
// /admin/product/findBySpuId/{spuId}
export const reqSkuList = (spuId)=>request({url:`/admin/product/findBySpuId/${spuId}`,method:'get'});


