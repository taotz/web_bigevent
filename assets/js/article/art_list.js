$(function() {

    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义补零函数
    function padZero (n) {
        return n > 9 ? n : '0' + n
    }

    // 定义美化时间过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = dt.getMonth() + 1
        m = padZero(m)
        var d = dt.getDate()
        d = padZero(d)

        var hh = dt.getHours()
        hh = padZero(hh)
        var mm = dt.getMinutes()
        mm = padZero(mm)
        var ss = dt.getSeconds()
        ss = padZero(ss)

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss

    }


    // 定义一个查询参数的对象，请求数据的时候，需要将参数对象提交到服务器
    var q = {
        pagenum: 1,      // 页码值
        pagesize: 2,     // 每页显示多少条数据
        cate_id: '',     // 文章分类的 Id
        state: ''        // 文章的状态，可选值有：已发布、草稿
    }

    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg('获取文章列表失败!')
                }
                layer.msg('获取文章列表成功!')
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table',res)
                $('tbody').html(htmlStr)
                // 调用列表分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg('获取分类数据失败!')
                }

                // 调用模板引擎渲染分类可选项
                var htmlStr = template('tpl-cate',res)
                $('[name=cate_id]').html(htmlStr)
                // 通知layui重新渲染表单区域的ui结构
                form.render()
            }
        })
    }

    // 为筛选按钮添加submit事件
    $('#form-search').on('submit',function(e) {
        e.preventDefault()

        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为对象q中对应的参数赋值
        q.cate_id = cate_id
        q.state = state
        // 重新渲染表格数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用laypage.render()函数渲染分页
        laypage.render({
            elem: 'pageBox', // 分页容器的id
            count: total, // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum,   // 设置默认选中的分页
            layout: ['count','limit','prev','page','next','skip'],
            limits: [2, 3, 5, 10],
            // 分页切换的时候，触发jump回调
            // 触发jump回调的方式有两种：
            // 1.点击页码触发，此时first=false
            // 2.只要调用了laypage.render()方法就会触发jump回调，此时first=true
            jump: function(obj,first) {
                console.log(obj.curr)  // 打印当前点击的页码值
                console.log(obj.limit) // 拿到最新的条目数
                q.pagenum = obj.curr   // 把最新的页码值给pagenum
                q.pagesize = obj.limit // 把最新的条目数给pagesize
                if(!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的方式为删除按钮绑定点击事件
    $('tbody').on('click','.btn-delete',function() {

        // 获取删除按钮的个数
        var len = $('.btn-delete').length
        var id = $(this).attr('data-id')

        layer.confirm('确认删除？', { icon: 3, title: '提示' }, function(index){
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if(res.status !== 0 ) {
                        return layer.msg('删除文章失败!')
                    }
                    layer.msg('删除文章成功!')
                    if(len === 1) {
                        // len === 1时，点击删除后页面上没有数据了
                        // 页码值最小必须为1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index)
        })
    })
})