var tpl, template, html;
var fwFcqlrIndex;
var fwDcbIndex = getQueryString("fw_xmxx_index"); //和房屋独幢的区别
// var ADDRESS_QLR = "http://192.168.50.121:8083/estateplat-cadastre/qlr/";
var hostAddress = 'http://' + window.location.host;
// var hostAddress = 'http://192.168.50.169:8083';
var ADDRESS_QLR = hostAddress + "/estateplat-cadastre/qlr/";
var ADD_FCQLR = "addFwFcqlr";
var SAVE_FCQLR = "saveFwFcqlr";

// var QUERY_FWFCQLR = "queryFwFcqlr";
// var QUERY_FWFCQLR = "queryFwFcqlr";

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
    url: ADDRESS_QLR + ADD_FCQLR,
    dataType: "jsonp",
    data: {
      "fwDcbIndex": fwDcbIndex
    },
    success: function(data) {
      //得到fwFcqlrIndex回调调用保存权利人信息接口 r.fwFcqlrIndex
      fwFcqlrIndex = data.fwFcqlrIndex;
      saveFwFcqlr(fwFcqlrIndex);
      // closeCurrentWindow();
      // refreshParent();
      // parent.renderQlrTable();
    }
  });

});


function saveFwFcqlr(fwFcqlrIndex) {
  var data = [{
    "FWINDEX": fwDcbIndex, //XMDZ中为fwXmxxIndex
    "FWFCQLRINDEX": fwFcqlrIndex,
    "QLR": $("#QLRXX_QLR").val(),
    "QLRBH": $("#QLRXX_QLRBH").val(),
    "QLRZJLX": $("#QLRXX_QLRZJLX").val(),
    "QLRZJH": $("#QLRXX_QLRZJH").val(),
    "FZJG": $("#QLRXX_FZJG").val(),
    "XB": $("#QLRXX_XB").val(),
    "DH": $("#QLRXX_DH").val(),
    "DZ": $("#QLRXX_DZ").val(),
    "YB": $("#QLRXX_YB").val(),
    "GZDW": $("#QLRXX_GZDW").val(),
    "QLRXZ": $("#QLRXX_QLRXZ").val(),
    "GYFS": $("#QLRXX_GYFS").val(),
    "QLBL": $("#QLRXX_QLBL").val(),
    "QLMJ": $("#QLRXX_QLMJ").val(),
    "BZ": $("#QLRXX_BZ").val()
  }];

  $.ajax({
    url: ADDRESS_QLR + SAVE_FCQLR,
    dataType: "jsonp",
    data: {
      "s": JSON.stringify(data) //因为参数是字符串，所以需要把json数据转成字符串
    },
    success: function(r) {
      //弹出msg窗口后自动关闭
      layer.msg("新增权利人成功", {
        time: 1000,
        end: function() {
          closeCurrentWindow();
        }
      });
      // console.log(r);
      // closeCurrentWindow();


    },
    error: function() {
      layer.msg("新增权利人失败");
    }
  });
}




// 点击关闭按钮
$("#close").on("click", function() {
  closeCurrentWindow();
});

function closeCurrentWindow() {
  // window.parent.location.reload();
  var index = parent.layer.getFrameIndex(window.name); //获取当前窗体索引
  parent.layer.close(index); //执行关闭
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// function refreshParent() {
//   window.opener.location.href = window.opener.location.href;
//   window.close();
//  }
