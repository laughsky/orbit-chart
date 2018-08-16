/*
    轨道图插件
*/
var OrbitChart = (function () {
    var orbit = function () {
        // 图形容器div
        this.frame = $('#orbit-chart')

        // 各种元素的尺寸
        this.sizes = {
            'type-width': 80,   // 类别名称列的宽度（像素）
            'hor-spacing': 80,  // 节点横向间距（像素）
            'ver-spacing': 40,  // 节点纵向间距（像素）
            'type-font-size': 12,   // 类别名称字体大小（像素）
            'node-font-size': 12,   // 节点名称字体大小（像素）
            'node-ico-size': 16 // 节点图标的边长尺寸（像素）
        }

        // 是否绘制网格线
        this.gridLine = false

        // 是否可拖动图形
        this.draggable = true

        // 默认的节点图标路径（节点数据里若未指定节点图标路径属性img，则使用此默认路径）
        this.nodeIcoUrl = 'images/node.png'

        // 类别和类别节点区的背景色（类别个数超出则循环使用背景色）
        this.bgColors = [
            ['#99B0FF', '#CCD7FF'],
            ['#F899FF', '#FCCCFF'],
            ['#FFA699', '#FFD3CC'],
            ['#FFDD99', '#FFEECC'],
            ['#F8FF99', '#FCFFCC'],
            ['#99FFC0', '#CCFFDF']
        ]

        // 各种元素的html模板
        this.htmls = {
            'type': '<div class="orbit-type font"></div>',
            'type-node': '<div class="orbit-type-node"></div>',
            'node': '<img class="orbit-node-ico"></img>',
            'node-name': '<div class="orbit-node-name font"></div>',
            'gray-hor-line': '<div class="orbit-line-hor-gray"></div>',
            'gray-ver-line': '<div class="orbit-line-ver-gray"></div>',
            'red-hor-line': '<div class="orbit-line-hor-red"></div>',
            'red-ver-line': '<div class="orbit-line-ver-red"></div>',
            'grid-hor-line': '<div class="orbit-line-hor-grid"></div>',
            'grid-ver-line': '<div class="orbit-line-ver-grid"></div>',
            'tip': '<div class="orbit-tip"></div>'
        }

        // 图形数据（初始化后）
        this.datas = []
    }

    var fn = orbit.prototype

    /*
       绘制图形，options参数为json对象，键值说明：
       type: ['设计', '工程', ...]，类别名称数组
       node: 节点数组，节点结构如下：
        {
            id: 'A82B22C2-FF48-4A31-ACA6-B2F96CD936F8', 节点ID
            name: '总包进场', 节点名称
            typename: '工程', 节点所属类别名称
            time: '2018-06-19', 节点的时间点，决定了节点的横向位置
            keyt: 'Y', 是否关键（Y或N），关键节点会显示节点名称
            desc: '', 悬停描述
            img: '/src/images/node.png' 节点图标路径，有默认值/src/images/node.png
        },
       line: 关系连线数据，结构如：
        {
            preid: '前置节点ID',
            id: '当前节点ID'
        },
       container: 'orbit-chart', 图形容器div的ID，默认为orbit-chart
       typeWidth: 80, 类别名称列的宽度，数字类型，默认80（像素）
       horSpacing: 80, 节点横向间距，数字类型，默认80（像素）
       verSpacing: 40, 节点纵向间距，数字类型，默认40（像素）
       typeFontSize: 12, 类别名称字体大小，数字类型，默认12（像素）
       nodeFontSize: 12, 节点名称字体大小，数字类型，默认12（像素）
       nodeIcoSize: 16, 节点图标的边长尺寸，数字类型，默认16（像素）
       gridLine: false, 是否绘制网格线，布尔类型，默认false
       draggable: true, 是否可拖动图形，布尔类型，默认true
       before: 图形绘制前置事件，function类型
       complete: 图形绘制完成事件，function类型
       srcPath: '../src' 插件目录相对于页面的路径（若node节点未指定img则要提供本字段）
    */
    fn.drawChart = function (options) {
        // 初始化配置
        this.initConfig(options)

        // 绘制前置事件
        if (options['before']) {
            options['before']()
        }

        // 初始化数据
        var types = options['type']
        var nodes = options['node']
        var lines = options['line']
        this.initData(types, nodes, lines)

        if (!this.datas['data'].length) {
            this.showTip('不存在任何节点。')
            return
        }

        // 清空图形
        this.clearChart()

        // 实现拖动效果
        if (this.draggable && !this.dragBinded) {
            this.bindDragEvent()
        }

        // 开始绘制
        for (var i in this.datas['data']) {
            var typeData = this.datas['data'][i]
            var nodes = typeData['nodes']
            var divType = $(this.htmls['type'])
            var divTypeNode = $(this.htmls['type-node'])
            var top = typeData['top'] * this.sizes['ver-spacing']
            var height = typeData['height'] * this.sizes['ver-spacing']
            var width = typeData['nodes'].length * this.sizes['hor-spacing']

            divType.text(typeData['type'])
            divType.css({
                'background-color': this.bgColors[i % 6][0],
                'top': top,
                'height': height - 1,
                'line-height': height + 'px',
                'width': this.sizes['type-width'] - 9,
                'font-size': this.sizes['type-font-size']
            })
            divTypeNode.css({
                'background-color': this.bgColors[i % 6][1],
                'left': this.sizes['type-width'],
                'top': top,
                'height': height - 1,
                'width': width - 2
            })
            if (i == 0) {
                divType.addClass('orbit-border-top')
                divTypeNode.addClass('orbit-border-top')
                divType.css({ 'height': height - 2 })
                divTypeNode.css({ 'height': height - 2 })
            }

            this.frame.append(divType)
            this.frame.append(divTypeNode)

            var jMin = jMax = kMin = kMax = -1
            for (var j in nodes) {
                var k = 0
                for (k in nodes[j]) {
                    var node = nodes[j][k]

                    // 绘制节点
                    var imgNode = $(this.htmls['node'])
                    imgNode.attr('src', node['img'] || this.nodeIcoUrl)
                    imgNode.attr('title', node['desc'])
                    imgNode.css({
                        'left': this.sizes['type-width'] + (2 * j + 1) * this.sizes['hor-spacing'] / 2 - this.sizes['node-ico-size'] / 2,
                        'top': top + height - (2 * k + 1) * this.sizes['ver-spacing'] / 2 - this.sizes['node-ico-size'] / 2
                    })
                    this.frame.append(imgNode)

                    // 绘制关键节点名称
                    if (node['keyt'] == 'Y') {
                        var divNode = $(this.htmls['node-name'])
                        divNode.text(node['name'])
                        divNode.css({
                            'left': this.sizes['type-width'] + j * this.sizes['hor-spacing'],
                            'top': top + height - (2 * k + 1) * this.sizes['ver-spacing'] / 2 - this.sizes['node-ico-size'] - 2,
                            'width': this.sizes['hor-spacing'],
                            'height': this.sizes['node-font-size'] + 2,
                            'line-height': this.sizes['node-font-size'] + 'px',
                            'font-size': this.sizes['node-font-size']
                        })
                        this.frame.append(divNode)

                        if (kMin == -1) {
                            kMin = parseInt(j)
                        }
                        if (kMax < parseInt(j)) {
                            kMax = parseInt(j)
                        }
                    }

                    if (jMin == -1) {
                        jMin = parseInt(j)
                    }
                    if (jMax < parseInt(j)) {
                        jMax = parseInt(j)
                    }
                }

                // 绘制纵向首尾节点之间的灰色细线
                if (k > 0) {
                    var lineVerGray = $(this.htmls['gray-ver-line'])
                    lineVerGray.css({
                        'left': this.sizes['type-width'] + (2 * j + 1) * this.sizes['hor-spacing'] / 2,
                        'top': top + height - (2 * k + 1) * this.sizes['ver-spacing'] / 2,
                        'height': k * this.sizes['ver-spacing']
                    })
                    this.frame.append(lineVerGray)
                }
            }

            // 绘制横向首尾节点之间的灰色细线
            if (jMax > jMin) {
                var lineHorGray = $(this.htmls['gray-hor-line'])
                lineHorGray.css({
                    'left': this.sizes['type-width'] + (2 * jMin + 1) * this.sizes['hor-spacing'] / 2,
                    'top': top + height - this.sizes['ver-spacing'] / 2,
                    'width': (jMax - jMin) * this.sizes['hor-spacing']
                })
                this.frame.append(lineHorGray)
            }

            // 绘制横向首尾关键节点之间的红色粗线
            if (kMax > kMin) {
                var lineHorRed = $(this.htmls['red-hor-line'])
                lineHorRed.css({
                    'left': this.sizes['type-width'] + (2 * kMin + 1) * this.sizes['hor-spacing'] / 2,
                    'top': top + height - this.sizes['ver-spacing'] / 2 - 1,
                    'width': (kMax - kMin) * this.sizes['hor-spacing']
                })
                this.frame.append(lineHorRed)
            }

            // 绘制网格线
            if (this.gridLine) {
                for (var j = 0; j < typeData['height']; j++) {
                    var lineHorRed = $(this.htmls['grid-hor-line'])
                    lineHorRed.css({
                        'left': this.sizes['type-width'],
                        'top': top + height - (2 * j + 1) * this.sizes['ver-spacing'] / 2,
                        'width': width
                    })
                    this.frame.append(lineHorRed)
                }
                if (parseInt(i) == this.datas['data'].length - 1) {
                    for (var j = 0; j < typeData['nodes'].length; j++) {
                        var lineVerRed = $(this.htmls['grid-ver-line'])
                        lineVerRed.css({
                            'left': this.sizes['type-width'] + (2 * j + 1) * this.sizes['hor-spacing'] / 2,
                            'top': 0,
                            'height': top + height
                        })
                        this.frame.append(lineVerRed)
                    }
                }
            }
        }

        // 绘制关系连线（红色粗线）
        for (var i in this.datas['line']) {
            var line = this.datas['line'][i]
            var pre = line[0]
            var next = line[1]

            if (pre['x'] == next['x']) {// 两节点纵向对齐，竖线连接
                var lineVerRed = $(this.htmls['red-ver-line'])
                lineVerRed.css({
                    'left': this.sizes['type-width'] + (2 * pre['x'] + 1) * this.sizes['hor-spacing'] / 2 - 1,
                    'top': (2 * Math.min(pre['y'], next['y']) - 1) * this.sizes['ver-spacing'] / 2,
                    'height': Math.abs(next['y'] - pre['y']) * this.sizes['ver-spacing']
                })
                this.frame.append(lineVerRed)
            } else if (pre['y'] == next['y']) {// 两节点横向对齐，横线连接
                var lineHorRed = $(this.htmls['red-hor-line'])
                lineHorRed.css({
                    'left': this.sizes['type-width'] + (2 * Math.min(pre['x'], next['x']) + 1) * this.sizes['hor-spacing'] / 2,
                    'top': (2 * pre['y'] - 1) * this.sizes['ver-spacing'] / 2 - 1,
                    'width': Math.abs(next['x'] - pre['x']) * this.sizes['hor-spacing']
                })
                this.frame.append(lineHorRed)
            } else {// 两节点横向和纵向均不对齐
                // 在前置节点处，向后续节点方向画竖线
                var lineVerRed = $(this.htmls['red-ver-line'])
                lineVerRed.css({
                    'left': this.sizes['type-width'] + (2 * pre['x'] + 1) * this.sizes['hor-spacing'] / 2 - 1,
                    'top': (2 * Math.min(pre['y'], next['y']) - 1) * this.sizes['ver-spacing'] / 2,
                    'height': Math.abs(next['y'] - pre['y']) * this.sizes['ver-spacing']
                })
                this.frame.append(lineVerRed)

                // 竖线到达后续节点纵向位置后，画横线连接后续节点
                var lineHorRed = $(this.htmls['red-hor-line'])
                lineHorRed.css({
                    'left': this.sizes['type-width'] + (2 * Math.min(pre['x'], next['x']) + 1) * this.sizes['hor-spacing'] / 2 + (pre['x'] < next['x'] ? -1 : 1),
                    'top': (2 * next['y'] - 1) * this.sizes['ver-spacing'] / 2 - 1,
                    'width': Math.abs(next['x'] - pre['x']) * this.sizes['hor-spacing'] + (pre['x'] < next['x'] ? 1 : -1)
                })
                this.frame.append(lineHorRed)
            }
        }

        // 绘制完成事件
        if (options['complete']) {
            options['complete']()
        }
    }

    // 初始化配置
    fn.initConfig = function (config) {
        for (var k in config) {
            switch (k) {
                case 'container':
                    if (!this.frame.length || this.frame.attr('id') != config[k]) {
                        this.frame = $('#' + config[k])
                    }
                    break
                case 'typeWidth':
                    this.sizes['type-width'] = config[k]
                    break
                case 'horSpacing':
                    this.sizes['hor-spacing'] = config[k]
                    break
                case 'verSpacing':
                    this.sizes['ver-spacing'] = config[k]
                    break
                case 'typeFontSize':
                    this.sizes['type-font-size'] = config[k]
                    break
                case 'nodeFontSize':
                    this.sizes['node-font-size'] = config[k]
                    break
                case 'nodeIcoSize':
                    this.sizes['node-ico-size'] = config[k]
                    break
                case 'gridLine':
                    this.gridLine = config[k]
                    break
                case 'draggable':
                    this.draggable = config[k]
                    break
                case 'srcPath':
                    this.nodeIcoUrl = config[k] + '/images/node.png'
                    break
                default:
                    break
            }
        }
    }

    // 初始化数据
    fn.initData = function (types, nodes, lines) {
        var data = []
        var relation = []

        // 初始化类别（height:类别下最多节点的时间点上的节点数/top:类别的以节点数为单位的top）
        for (var i in types) {
            data.push({ 'type': types[i], 'nodes': [], 'height': 0, 'top': 0 })
        }

        // 初始化类别节点
        var preTime = ''
        for (var i in nodes) {
            var node = nodes[i]
            var typeName = node['typename']
            var time = node['time']
            var isSameTime = preTime == time
            if (!isSameTime) {
                preTime = time
            }
            for (var j in data) {
                var typeData = data[j]
                var items = typeData['nodes']
                if (!isSameTime) {
                    items.push([])
                }
                if (typeData['type'] == typeName) {
                    items[items.length - 1].push(node)
                    if (items[items.length - 1].length > typeData['height']) {
                        typeData['height'] = items[items.length - 1].length
                    }
                }
            }
        }

        // 删除无节点的类别
        for (var i = data.length - 1; i >= 0; i--) {
            if (data[i]['height'] == 0) {
                data.splice(i, 1)
            }
        }

        // 设置类别的top（以节点数为单位）
        var top = 0
        for (var i in data) {
            data[i]['top'] = top
            top += data[i]['height']
        }

        // 初始化连线
        for (var y in data) {
            var nodes = data[y]['nodes']
            for (var x in nodes) {
                for (var z in nodes[x]) {
                    var node = nodes[x][z]
                    if (node['keyt'] == 'Y') {
                        var id = node['id']
                        for (var j in lines) {
                            var line = lines[j]
                            if (lines[j]['preid'] == id) {
                                line['prex'] = parseInt(x)
                                line['prey'] = data[y]['top'] + data[y]['height']
                                line['prez'] = parseInt(z)
                            } else if (line['id'] == id) {
                                line['nextx'] = parseInt(x)
                                line['nexty'] = data[y]['top'] + data[y]['height']
                                line['nextz'] = parseInt(z)
                            }
                        }
                    }
                }
            }
        }

        for (var i in lines) {
            var line = lines[i]
            relation.push([{
                'x': line['prex'],
                'y': line['prey'],
                'z': line['prez']
            }, {
                'x': line['nextx'],
                'y': line['nexty'],
                'z': line['nextz']
            }])
        }

        this.datas.length = 0
        this.datas = {
            'data': data,
            'line': relation
        }
    }

    // 实现拖动效果
    fn.bindDragEvent = function () {
        var that = this
        that.ox = 0
        that.oy = 0
        that.movable = false

        that.frame.on("mousedown", function () {
            var obj = this
            var box = obj.getBoundingClientRect()
            if (event.clientX > box.left
                && event.clientY > box.top
                && event.clientX < box.left + obj.offsetWidth - 20
                && event.clientY < box.top + obj.offsetHeight - 20) {
                obj.style.cursor = 'move'
                that.ox = event.clientX + obj.scrollLeft
                that.oy = event.clientY + obj.scrollTop
                that.movable = true
                return false
            }
        }).on("mousemove", function () {
            if (that.movable) {
                var obj = this
                obj.scrollLeft = that.ox - event.clientX
                obj.scrollTop = that.oy - event.clientY
            }

        }).on("mouseup", function () {
            if (that.movable) {
                var obj = this
                obj.style.cursor = 'default'
                that.movable = false
                return false
            }
        })

        that.dragBinded = true
    }

    // 清空图形
    fn.clearChart = function () {
        this.frame.empty()
    }

    // 提示信息
    fn.showTip = function (msg) {
        this.clearChart()

        var divTip = $(this.htmls['tip'])
        divTip.text(msg)
        this.frame.append(divTip)
    }

    orbit.instance = void 0

    return orbit
}())

$(function () {
    var chart = new OrbitChart()
    OrbitChart.instance = chart
})