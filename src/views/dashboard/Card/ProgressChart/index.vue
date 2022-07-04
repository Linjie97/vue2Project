<template>
    <!-- 容器 -->
    <div class="charts" ref="charts"></div>
</template>

<script>
// 引入echarts
import echarts from 'echarts';
export default {
    name: 'ProgressChart',
    mounted() {
        // 初始化echarts实例
        let LineCharts = echarts.init(this.$refs.charts);
        //配置数据
        LineCharts.setOption({
            xAxis: {
                // 隐藏x轴
                show: false,
                // 最大值与最小值的设置
                min:0,
                max:100,
            },
            yAxis: {
                show: false,
                type: 'category',
            },
            series: [
                {
                    type: 'bar',
                    data: [78],
                    color:'yellowgreen',
                    // 柱状图的宽度
                    barWidth:10,
                    // 背景颜色设置
                    showBackground:true,
                    backgroundStyle:{
                        color:'#eee',
                    },
                    // 文本
                    label:{
                        show:true,
                        // 显示的内容设置
                        formatter:'|',
                        position:'right',
                    }
                }
            ],
            // 布局调试
            grid: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            }
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