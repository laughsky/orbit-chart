
var ajax = function (url, data, dataType, sucess, async, type, before, complete) {
    $.ajax(
        {
            type: (type === "POST" ? "POST" : "GET"),
            url: url,
            async: !(async === false),
            data: data,
            dataType: dataType,
            success: sucess,
            cache: false,
            beforeSend: before,
            complete: complete,
            error: function (req, status, error) {
                // alert("数据失败：" + req.responseText)
                alert("操作失败。\n\n代码：" + req.status + "\n信息：" + req.statusText)
            }
        })
}

$(function () {
    var srcPath = '../src'

    ajax('./data/type.json', {}, 'json', function (data, status) {
        var types = data
        ajax('./data/node.json', {}, 'json', function (data, status) {
            var nodes = data
            ajax('./data/line.json', {}, 'json', function (data, status) {
                var lines = data

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
            })
        })
    })

})