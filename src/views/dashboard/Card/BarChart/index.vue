<template>
    <!-- 容器 -->
    <div class="charts" ref="charts"></div>
</template>

<script>
// 引入echarts
import echarts from 'echarts';
export default {
    name: 'BarChart',
    mounted() {
        // 初始化echarts实例
        let LineCharts = echarts.init(this.$refs.charts);
        //配置数据
        LineCharts.setOption({
            xAxis: {
                // 隐藏x轴
                show: false,
                type: 'category',
            },
            yAxis: {
                show: false,
            },
            series: [
                {
                    type: 'bar',
                    data: [10, 7, 33, 12, 48, 9,29,10,44,23,45,36],
                    color:'skyblue'
                }
            ],
            // 布局调试
            grid: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            // 提示信息
            tooltip:{},
        })
    }
}
</script>

<style>
.charts {
    width: 100%;
    height: 100%;
}
</style>