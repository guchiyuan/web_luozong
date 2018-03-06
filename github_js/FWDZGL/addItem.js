var lszd = getQueryString("lszd");
var fwDcbIndex;

// var ADDRESS_FWDZ = "http://192.168.50.121:8083/estateplat-cadastre/fwDzGl/";
// var ADDRESS_QLR = "http://192.168.50.121:8083/estateplat-cadastre/qlr/";
// var ADDRESS_FWDZ = "http://192.168.50.127:8080/estateplat-cadastre/fwDzGl/";
// var ADDRESS_QLR = "http://192.168.50.127:8080/estateplat-cadastre/qlr/";

var hostAddress = 'http://' + window.location.host;
// var hostAddress = 'http://192.168.50.169:8083';
var ADDRESS_FWDZ = hostAddress + "/estateplat-cadastre/fwDzGl/";
var ADDRESS_QLR = hostAddress + "/estateplat-cadastre/qlr/";
//打开新增权利人界面的地址，需要配置
var ADDRESS_ADDQLR = hostAddress + "/estateplat-cadastre/static/html/FWDZGL/addQlrxx.html";
var ADDRESS_EDITQLR = hostAddress + "/estateplat-cadastre/static/html/FWDZGL/editQlrxx.html";

// var QUERY_FWXX = "queryFwxx";
var QUERY_FWFCQLR = "queryFwFcqlr";
// var QUERY_FWDZHST = "queryFwDzHst";
var ADD_FWDZ = "addFwDz";
var SAVE_FWLJZ = "saveFwLjz";
var DEL_FWFCQLR = "delFwFcqlr";
// var DEL_FWDZ = "delFwDz";

// var $panelLZXXTpl = $("#panelLZXXTpl");
// var $panelDCXXTpl = $("#panelDCXXTpl");
// var $panelFCQLRTpl = $("#panelFCQLRTpl");
// var $panelPMTTpl = $("#panelPMTTpl");

var LZXX = "lzxx";
var DCXX = "dcxx";
var FCQLR = "fcqlr";
var PMT = "pmt";

var itemData = {};

// Handlebars.registerHelper('format', function(date, options) {
//   return new Date(date).toLocaleString();
// });
Handlebars.registerHelper('format', function(date) {
  var result;
  //如果date为undefined或者为空，会显示NaN-NaN-NaN
  if (date !== undefined && date !== "") {
    date = new Date(date);
    result = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    return result;
  }
});

$(function() {
  renderToTpl(LZXX);

  var data = {
    "lszd": lszd
  };

  $.ajax({
    url: ADDRESS_FWDZ + ADD_FWDZ,
    data: data,
    dataType: "jsonp",
    success: function(data) {
      // console.log(data);
      fwDcbIndex = data.fwDcbIndex;
    }
  });
})

//点击楼幢信息标签
$("#linkLZXX").on("click", function() {
  itemData.cqly = $("#DCXX_CQLY").val();
  itemData.gyqk = $("#DCXX_GYQK").val();
  itemData.fjsm = $("#DCXX_FJSM").val();
  itemData.dcyj = $("#DCXX_DCYJ").val();
  itemData.dcz = $("#DCXX_DCZ").val();
  itemData.dcsj = $("#DCXX_DCSJ").val();
  // console.log(itemData);
  $("#close").show();
  $("#save").show();
  renderToTpl(LZXX);
});

//点击调查信息标签
$("#linkDCXX").on("click", function() {
  itemData.fwmc = $("#LZXX_GNQMC").val();
  itemData.bdcdyh = $("#LZXX_BDCDYH").val();
  itemData.zldz = $("#LZXX_ZLDZ").val();
  itemData.dh = $("#LZXX_ZH").val();
  itemData.mph = $("#LZXX_MPH").val();
  itemData.fwjg = $("#LZXX_FWJG").val();
  itemData.fwyt = $("#LZXX_FWYT").val();
  itemData.zzdmj = $("#LZXX_ZDMJ").val();
  itemData.zydmj = $("#LZXX_YDMJ").val();
  itemData.fwcs = $("#LZXX_FWCS").val();
  itemData.dscs = $("#LZXX_DSCS").val();
  itemData.dxcs = $("#LZXX_DXCS").val();
  itemData.ycjzmj = $("#LZXX_YCJZMJ").val();
  itemData.ycdxmj = $("#LZXX_YCDXMJ").val();
  itemData.ycqtmj = $("#LZXX_YCQTMJ").val();
  itemData.scjzmj = $("#LZXX_SCJZMJ").val();
  itemData.scdxmj = $("#LZXX_SCDXMJ").val();
  itemData.scqtmj = $("#LZXX_SCQTMJ").val();
  itemData.jgrq = $("#LZXX_JGRQ").val();
  itemData.bz = $("#LZXX_BZ").val();
  // console.log(itemData);
  $("#close").show();
  $("#save").show();
  renderToTpl(DCXX);
});

//点击房产权利人标签
$("#linkFCQLR").on("click", function() {
  layer.confirm(
    '请确认是否已保存楼幢信息和调查信息', {
      btn: ['确定', '取消'] //按钮
    },
    function(index) {
      $("#close").hide();
      $("#save").hide();
      renderToTpl(FCQLR);
      $("#tb_FCQLR").bootstrapTable({
        striped: true,
        toolbar: "#toolbarQLR",
        pagination: true, //启用分页
        pageSize: 5, //每页行数
        pageIndex: 0,
        columns: [{
            field: "QLR",
            title: "权利人"
          }, {
            field: "QLRBH",
            title: "权利人编号"
          }, {
            field: "QLRZJLX",
            title: "权利人证件类型",
            formatter: function(value, row, index) {
              switch (value) {
                case "1":
                  return "身份证"
                  break;
                case "2":
                  return "港澳台身份证"
                  break;
                case "3":
                  return "护照"
                  break;
                case "4":
                  return "户口簿"
                  break;
                case "5":
                  return "军官证（士兵证）"
                  break;
                case "6":
                  return "组织机构代码"
                  break;
                case "7":
                  return "营业执照"
                  break;
                case "99":
                  return "其它"
                  break;
                default:
              }
            }
          }, {
            field: "QLRZJH",
            title: "权利人证件号"
          },
          {
            field: "id",
            title: "操作",
            align: "center",
            formatter: operateFormatterQLR
          }
        ]
      });

      renderQlrTable();
      layer.close(index);
    }
  );

});

function renderQlrTable() {
  var data = {
    "fwDcbIndex": fwDcbIndex
  };
  $.ajax({
    url: ADDRESS_QLR + QUERY_FWFCQLR,
    dataType: "jsonp",
    data: data,
    // url: "/omp/static/js/map/widgets/XMDZGL/qlrxx.json",
    // dataType: "json",
    success: function(data) {
      $("#tb_FCQLR").bootstrapTable('load', data);
    }
  });
}


//点击平面图标签
$("#linkPMT").on("click", function() {
  // renderToTpl(PMT);
  layer.msg("暂无此功能！");
});

$("#save").on("click", function() {
  saveFwDzxx(fwDcbIndex);
  // closeCurrentWindow();
});

function saveFwDzxx(fwDcbIndex) {
  // console.log(fwDcbIndex);
  // console.log($("#LZXX_JGRQ").val());
  var data = [{
    //fw_ljz表主键
    "fwDcbIndex": fwDcbIndex,
    "lszd": lszd,
    "BDCDYFWLX": "2",
    //项目信息
    "FWMC": $("#LZXX_GNQMC").val(),
    "BDCDYH": $("#LZXX_BDCDYH").val(),
    "ZLDZ": $("#LZXX_ZLDZ").val(),
    "DH": $("#LZXX_ZH").val(),
    "MPH": $("#LZXX_MPH").val(),
    "FWJG": $("#LZXX_FWJG").val(),
    "FWYT": $("#LZXX_FWYT").val(),
    "ZZDMJ": $("#LZXX_ZDMJ").val(),
    "ZYDMJ": $("#LZXX_YDMJ").val(),
    "FWCS": $("#LZXX_FWCS").val(),
    "DSCS": $("#LZXX_DSCS").val(),
    "DXCS": $("#LZXX_DXCS").val(),
    "YCJZMJ": $("#LZXX_YCJZMJ").val(),
    "YCDXMJ": $("#LZXX_YCDXMJ").val(),
    "YCQTMJ": $("#LZXX_YCQTMJ").val(),
    "SCJZMJ": $("#LZXX_SCJZMJ").val(),
    "SCDXMJ": $("#LZXX_SCDXMJ").val(),
    "SCQTMJ": $("#LZXX_SCQTMJ").val(),
    "JGRQ": $("#LZXX_JGRQ").val(),
    "BZ": $("#LZXX_BZ").val(),
    //调查信息
    "CQLY": $("#DCXX_CQLY").val(),
    "GYQK": $("#DCXX_GYQK").val(),
    "DCSJ": $("#DCXX_DCSJ").val(),
    "DCYJ": $("#DCXX_DCYJ").val(),
    "DCZ": $("#DCXX_DCZ").val(),
    "FJSM": $("#DCXX_FJSM").val()
  }];
  
  $.ajax({
    url: ADDRESS_FWDZ + SAVE_FWLJZ,
    dataType: "jsonp",
    data: {
      // "fwDcbIndex": fwDcbIndex,
      "s": JSON.stringify(data) //因为参数是字符串，所以需要把json数据转成字符串
    },
    success: function(r) {
      //弹出msg窗口后自动关闭
      layer.msg("新增独幢项目成功！", {
        time: 1000
      });
      // console.log(r.msg);
    }
  });
}

// 点击关闭按钮
$("#close").on("click", function() {
  closeCurrentWindow();
});

function closeCurrentWindow() {
  var index = parent.layer.getFrameIndex(window.name); //获取当前窗体索引
  parent.layer.close(index); //执行关闭
}

// function renderQueryResults(reqData, apiType, mytpl) {
//   $.ajax({
//     url: ADDRESS_FWDZ + apiType,
//     data: reqData,
//     dataType: "jsonp",
//     success: function(result) {
//       // console.log(result);
//       renderToTpl(mytpl, result);
//     }
//   });
// }

function renderToTpl(mytpl) {
  var r = 0;
  var template, html, tpl;
  switch (mytpl) {
    case LZXX:
      tpl = $("#panelLZXXTpl").html();
      r = 1;
      break;
    case DCXX:
      tpl = $("#panelDCXXTpl").html();
      r = 2;
      break;
    case FCQLR:
      tpl = $("#panelFCQLRTpl").html();
      break;
    case PMT:
      tpl = $("#panelPMTTpl").html();
      break;
    default:
  }
  //预编译模板
  template = Handlebars.compile(tpl);
  html = template(itemData);
  //输入模板
  $(".panel-body").html(html);

  if (r === 1) {
    laydate.render({
      elem: '#LZXX_JGRQ' //指定元素
    });
  }
  if (r === 2) {
    laydate.render({
      elem: '#DCXX_DCSJ' //指定元素
    });
  }

}

function operateFormatterQLR(value, row, index) {
  var e = '<a href="#" mce_href="#" onclick="editQLR(\'' + row.FW_FCQLR_INDEX + '\')">编辑</a> ';
  var d = '<a href="#" mce_href="#" onclick="deleteQLR(\'' + row.FW_FCQLR_INDEX + '\')">删除</a> ';
  return e + d;
  return d;
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

function addQLR() {
  // layer.msg("新增权利人");
  layer.open({
    type: 2,
    title: '权利人信息',
    shadeClose: true,
    shade: 0.8,
    area: ['767px', '90%'],
    content: ADDRESS_ADDQLR + '?fw_dcb_index=' + fwDcbIndex, //iframe的url
    // content: '/omp/static/js/map/widgets/FWDZGL/addQlrxx.html?fw_dcb_index=' + fwDcbIndex, //iframe的url
    // content: '/omp/static/js/map/widgets/XMDZGL/qlrxx.html?fw_xmxx_index=' + getQueryString("fw_xmxx_index") //iframe的url
    // content: ADDRESS_ADDQLR + '?fw_dcb_index=' + fwDcbIndex,
    //这个将实现子窗口关闭后，刷新父窗口功能
    end: function() {
      renderQlrTable();
    }
  });
}

function editQLR(FW_FCQLR_INDEX) {
  var fwFcqlrIndex = FW_FCQLR_INDEX;
  layer.open({
    type: 2,
    title: '权利人信息',
    shadeClose: true,
    shade: 0.8,
    area: ['767px', '90%'],
    content: ADDRESS_EDITQLR + '?fw_fcqlr_index=' + fwFcqlrIndex + '&fw_dcb_index=' + fwDcbIndex, //iframe的url
    end: function () {
      renderQlrTable();
    }
  });
}

//删除权利人--完成
function deleteQLR(ids) {
  layer.confirm('确定删除此项目？', {
    btn: ['确定', '取消'] //按钮
  }, function(index) {
    $.ajax({
      url: ADDRESS_QLR + DEL_FWFCQLR,
      dataType: "jsonp",
      data: {
        "fwFcqlrIndex": ids //需要获得权利人index
      },
      success: function() {
        // layer.msg("已删除此权利人！");
        $("#tb_FCQLR").bootstrapTable('remove', {
          field: 'FW_FCQLR_INDEX',
          values: [ids]
        });
      }
    });
    layer.close(index);
  });
}
