$(function() {

    var layer = layui.layer
    var form = layui.form

    initCate()
    // 初始化富文本编辑器
    initEditor()

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


    // 1. 初始化图片裁剪器
    var $image = $('#image')
    // 2. 裁剪选项
    var options = {
      aspectRatio: 400 / 280,
      preview: '.img-preview'
    }
    // 3. 初始化裁剪区域
    $image.cropper(options)

    // 选择封面按钮
    $('#btnChooseImage').on('click',function() {
        $('#coverFile').click()
    })

     // 为文件选择框绑定change事件
     $('#coverFile').on('change',function(e) {
        var filelist = e.target.files
        if(filelist.length === 0) {
            return layer.msg('请选择图片!')
        }

        // 1. 拿到用户选择的文件
        var file = e.target.files[0]
        // 2. 根据选择的文件，创建一个对应的 URL 地址：
        var newImgURL = URL.createObjectURL(file)
        // 3. 先`销毁`旧的裁剪区域，再`重新设置图片路径`，之后再`创建新的裁剪区域`：
        $image
            .cropper('destroy')      // 销毁旧的裁剪区域
            .attr('src', newImgURL)  // 重新设置图片路径
            .cropper(options)        // 重新初始化裁剪区域
    })


    // 定义文章的发布状态
    var art_state = '已发布'
    // 为存为草稿绑定点击事件
    $('#btnSave2').on('click',function() {
        art_state = '草稿'
    })

    // 为表单绑定提交事件
    $('#form-pub').on('submit',function(e) {
        e.preventDefault()

        // 基于表单 快速创建一个FormData对象
        var fd = new FormData($(this)[0])

        // 将文章的发布状态存到fd中
        fd.append('state',art_state)
        // fd.forEach(function(v,k) {
        //     console.log(k,v);
        // })

        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function(blob) {       // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                // 将文件对象存到fd中
                fd.append('cover_img',blob)

                // 发起ajax请求
                publishArticle(fd)
            })
    })

    // 定义一个发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是FormData格式的数据，必须添加以下两个配置
            contentType: false,
            processData: false,
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg('发布文章失败!')
                }
                layer.msg('发布文章失败!')

                location.href = '/article/art_list.html'
            }
        })
    }
})