var fwFcqlrIndex = getQueryString("fw_fcqlr_index");
var fwXmxxIndex = getQueryString("fw_xmxx_index");
// var hostAddress = 'http://' + window.location.host;
var hostAddress = 'http://192.168.50.169:8083';
var DETAIL_QLRXX = '/estateplat-cadastre/qlr/getQlrxx';
var SAVE_FCQLR = "/estateplat-cadastre/qlr/saveFwFcqlr";

$(function() {
  var reqData = {
    "fwFcqlrIndex": fwFcqlrIndex
  };
  $.ajax({
    url: hostAddress + DETAIL_QLRXX,
    data: reqData,
    dataType: "jsonp",
    success: function(result) {
      console.log(result);
      renderToTpl(result);
    }
  });
})

function renderToTpl(data) {
  tpl = $("#panelAddandEditFCQLRTpl").html();
  //预编译模板
  template = Handlebars.compile(tpl);
  html = template(data);
  //输入模板
  $(".panel-body").html(html);

  $("#QLRXX_QLRZJLX option").each(function() {
    if ($(this).val() === data.qlrzjlx) {
      $(this).attr('selected', true);
    }
  });

  $("#QLRXX_XB option").each(function() {
    if ($(this).val() === data.xb) {
      $(this).attr('selected', true);
    }
  });

  $("#QLRXX_QLRXZ option").each(function() {
    if ($(this).val() === data.qlrxz) {
      $(this).attr('selected', true);
    }
  });

  $("#QLRXX_GYFS option").each(function() {
    if ($(this).val() === data.gyfs) {
      $(this).attr('selected', true);
    }
  });
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

$("#save").on("click", function() {
  saveFwFcqlr(fwFcqlrIndex);
});

function saveFwFcqlr(fwFcqlrIndex) {
  var data = [{
    "FWINDEX": fwXmxxIndex, //XMDZ中为fwXmxxIndex
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
    url: hostAddress + SAVE_FCQLR,
    dataType: "jsonp",
    data: {
      "s": JSON.stringify(data) //因为参数是字符串，所以需要把json数据转成字符串
    },
    success: function(r) {
      layer.msg("新增权利人成功", {
        time: 1000,
        end: function() {
          closeCurrentWindow();
        }
      });
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