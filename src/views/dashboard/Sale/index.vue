<template>
    <el-card class="box-card" style="10px 0px">
        <div slot="header" class="clearfix">
            <!--  @tab-click="handleClick" -->
            <!-- Sale模块的头部左侧内容 -->
            <el-tabs class="tab" v-model="activeName">
                <el-tab-pane label="销售额" name="sale"></el-tab-pane>
                <el-tab-pane label="访问量" name="visit"></el-tab-pane>
            </el-tabs>
            <!-- Sale模块的头部右侧内容 -->
            <div class="right">
                <span @click="setDay">今日</span>
                <span @click="setWeek">本周</span>
                <span @click="setMonth">本月</span>
                <span @click="setYear">本年</span>
                <el-date-picker v-model="date" value-format="yyyy-MM-dd" class="date" type="datetimerange"
                    range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
            </div>
        </div>
        <div>
            <el-row :gutter="10">
                <el-col :span="18">
                    <!-- 放柱状图的容器 -->
                    <div class="charts" ref="charts"></div>
                </el-col>
                <el-col :span="6">
                    <div>
                        <h3>门店{{ title }}排名</h3>
                        <ul>
                            <li>
                                <span class="rindex">1</span>
                                <span>肯德基</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="rindex">2</span>
                                <span>麦当劳</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="rindex">3</span>
                                <span>华莱士</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="nindex">4</span>
                                <span>海底捞</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="nindex">5</span>
                                <span>西贝莜面村</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="nindex">6</span>
                                <span>汉堡王</span>
                                <span class="rvalue">4562</span>
                            </li>
                            <li>
                                <span class="nindex">7</span>
                                <span>真功夫</span>
                                <span class="rvalue">4562</span>
                            </li>
                        </ul>
                    </div>
                </el-col>
            </el-row>
        </div>
    </el-card>
</template>

<script>
// 引入echarts
import echarts from 'echarts';
import dayjs from 'dayjs';
import { mapState } from 'vuex';
export default {
    name: 'Sale',
    data() {
        return {
            activeName: 'sale',
            mycharts: null,
            // 收集日历数组
            date: [],
        }
    },
    mounted() {
        // 初始化echarts实例
        this.mycharts = echarts.init(this.$refs.charts)
        // 配置数据
        this.mycharts.setOption({
            title: {
                text: this.title + "趋势",
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.listState.orderFullYearAxis,
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Direct',
                    type: 'bar',
                    barWidth: '60%',
                    data: this.listState.orderFullYear,
                    color: '#4a4aa5'
                }
            ]
        });
        // 上面是mounted：第一次没有数组不显示，需要点击title之后才会显示，因此可以监听listState
    },
    computed: {
        // 计算属性-标题
        title() {
            return this.activeName == 'sale' ? '销售额' : '访问量';
        },
        ...mapState({
            listState: state => state.home.list
        })
    },
    watch: {
        // 这里是为了监听title的变化以改变显示的标题，因为title是再mounted里面的，只执行一次，需要用到监听
        title() {
            // 重新修改图表的配置数据
            this.mycharts.setOption({
                title: {
                    text: this.title + "趋势"
                },
                xAxis: {
                    data: this.title == '销售额' ? this.listState.orderFullYearAxis : this.listState.orderFullYearAxis,

                },
                series: [{
                    name: 'Direct',
                    type: 'bar',
                    barWidth: '60%',
                    data: this.title == '销售额' ? this.listState.orderFullYear : this.listState.userFullYear,
                    color: '#4a4aa5'
                }]
            })
        },
        listState() {
            this.mycharts.setOption({
                title: {
                    text: this.title + "趋势",
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: this.listState.orderFullYearAxis,
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: 'Direct',
                        type: 'bar',
                        barWidth: '60%',
                        data: this.listState.orderFullYear,
                        color: '#4a4aa5'
                    }
                ]
            });

        },
    },
    methods: {
        setDay() {
            // "今日"的回调
            const day = dayjs().format('YYYY-MM-DD');//使用dayjs插件获取今日的日期
            this.date = [day, day];
        },
        setWeek() {
            // "本周"的回调
            const start = dayjs().day(1).format('YYYY-MM-DD');
            const end = dayjs().day(7).format('YYYY-MM-DD');
            this.date = [start, end]
        },
        setMonth() {
            // "本月"的回调
            const start = dayjs().startOf('month').format('YYYY-MM-DD');
            const end = dayjs().endOf('month').format('YYYY-MM-DD');
            this.date = [start, end]
        },
        setYear() {
            // "本年"的回调
            const start = dayjs().startOf('year').format('YYYY-MM-DD');
            const end = dayjs().endOf('year').format('YYYY-MM-DD');
            this.date = [start, end]
        }
    },
}
</script>

<style scoped>
.clearfix {
    display: flex;
    justify-content: space-between;
    position: relative;
}

.tab {
    width: 100%;
}

.right {
    position: absolute;
    right: 0px;
}

.right span {
    margin: 0px 10px;
}

.date {
    width: 250px;
    margin: 0px 10px;
}

.charts {
    width: 100%;
    height: 300px;
}

ul {
    list-style: none;
    width: 100%;
    height: 300px;
    padding: 0px;
}

ul li {
    height: 8%;
    margin: 10px 0px;
}

ul li span {
    margin: 0px 10px;
}

.rindex {
    float: left;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: black;
    color: white;
    text-align: center;
}

.nindex {
    float: left;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: black;
    text-align: center;
}

.rvalue {
    float: right;
}

>>>.el-card__header {
    border-bottom: none;
}
</style>