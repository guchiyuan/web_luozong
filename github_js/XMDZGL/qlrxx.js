$(function() {
  tpl = $("#panelAddandEditFCQLRTpl").html();
  //预编译模板
  template = Handlebars.compile(tpl);
  html = template();
  //输入模板
  $(".panel-body").html(html);
  // console.log(window.location.search);
})

$("#save").on("click", function() {
  $.ajax({
    url: "http://192.168.50.121:8083/estateplat-cadastre/qlr/addFwFcqlr",
    dataType: "jsonp",
    data: {
      "fwDcbIndex": getQueryString("fw_xmxx_index")
    },
    success: function(r) {
      //得到fwFcqlrIndex回调调用保存权利人信息接口 r.fwFcqlrIndex
      $.ajax({
        url: "http://192.168.50.121:8083/estateplat-cadastre/qlr/saveFwFcqlr",
        dataType: "jsonp",
        data: {
          "s": [{
            "FWFCQLRINDEX": r.fwFcqlrIndex,
            "QLR": $("#QLRXX_QLR").val(),
            "QLRXZ": $("#QLRXX_QLRXZ").val(),
            "QLRZJLX": $("#QLRXX_QLRZJLX").val(),
            "QLRZJH": $("#QLRXX_QLRZJH").val()
          }]
        },
        success: function () {
          layer.msg("新增权利人成功");
        },
        error: function () {
          layer.msg("新增权利人失败");
        }
      });
    }
  });
})

// 点击关闭按钮
$("#close").on("click", function() {
  var index = parent.layer.getFrameIndex(window.name); //获取当前窗体索引
  parent.layer.close(index); //执行关闭
});

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
