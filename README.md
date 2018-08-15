# orbit-chart
一个简单的轨道图插件，可按类别和时间点展示节点和关系图。

## 用法
页面引用src/css/orbit.css和src/js/orbit.js，调用drawChart方法即可：
``` js
var chart = OrbitChart.instance
chart.drawChart({
    'type': types,
    'node': nodes,
    'line': lines,
    'horSpacing': 60,
    'verSpacing': 40,
    'typeFontSize': 14,
    'nodeFontSize': 10,
    'gridLine': true,
    'srcPath': '../src'
})
```

## drawChart方法参数说明：
``` js
{
    type: ['设计', '工程', ...], // 类别名称数组
    node: // 节点数组，节点结构如下：
    {
        id: 'A82B22C2-FF48-4A31-ACA6-B2F96CD936F8', // 节点ID
        name: '总包进场', // 节点名称
        typename: '工程', // 节点所属类别名称
        time: '2018-06-19', // 节点的时间点，决定了节点的横向位置
        keyt: 'Y', // 是否关键（Y或N），关键节点会显示节点名称
        desc: '', // 悬停描述
        img: '/src/images/node.png' // 节点图标路径，有默认值src/images/node.png
    },
    line: // 关系连线数据，结构如：
    {
        preid: '前置节点ID',
        id: '当前节点ID'
    },
    container: 'orbit-chart', // 图形容器div的ID，默认为orbit-chart
    typeWidth: 80, // 类别名称列的宽度，数字类型，默认80（像素）
    horSpacing: 80, // 节点横向间距，数字类型，默认80（像素）
    verSpacing: 40, // 节点纵向间距，数字类型，默认40（像素）
    typeFontSize: 12, // 类别名称字体大小，数字类型，默认12（像素）
    nodeFontSize: 12, // 节点名称字体大小，数字类型，默认12（像素）
    nodeIcoSize: 16, // 节点图标的边长尺寸，数字类型，默认16（像素）
    gridLine: false, // 是否绘制网格线，布尔类型，默认false
    draggable: true, // 是否可拖动图形，布尔类型，默认true
    before: funs // 图形绘制前置事件，function类型
    complete: funs // 图形绘制完成事件，function类型
    srcPath: '../src' // 插件目录相对于页面的路径（若node节点未指定img则要提供本字段）
}
```

## 示例
示例请<a href="https://laughsky.github.io/orbit-chart/example/index.html" target="_blank">点击查看</a>