<!-- 该组件为hover按钮的时候出现提示，elementui中有对应的使用插件 -->
<template>
  <a :title="title" style="margin:10px">
    <el-button v-bind="$attrs" v-on="$listeners"></el-button>
  </a>
</template>

<script>
export default {
    name:'HintButton',
    props:['title'],
}
</script>

<style>

</style>