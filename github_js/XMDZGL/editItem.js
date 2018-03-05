var fwXmxxIndex = getQueryString("fw_xmxx_index");
// var ADDRESS_FWXM = "http://192.168.50.121:8083/estateplat-cadastre/fwXmGl/";
// var ADDRESS_QLR = "http://192.168.50.121:8083/estateplat-cadastre/qlr/";

// var ADDRESS_FWXM = "http://192.168.50.127:8080/estateplat-cadastre/fwXmGl/";
// var ADDRESS_QLR = "http://192.168.50.127:8080/estateplat-cadastre/qlr/";

// var hostAddress = 'http://' + window.location.host;
var hostAddress = 'http://192.168.50.169:8083';
var ADDRESS_FWXM = hostAddress + "/estateplat-cadastre/fwXmGl/";
var ADDRESS_QLR = hostAddress + "/estateplat-cadastre/qlr/";

var ADDRESS_ADDQLR = hostAddress + "/estateplat-cadastre/static/html/XMDZGL/addQlrxx.html";
var ADDRESS_EDITQLR = 'http://' + window.location.host + "/estateplat-cadastre/static/html/XMDZGL/editQlrxx.html";


var QUERY_FWXMXX = "queryFwXmxx";
var QUERY_FWLJZ = "queryFwLjz";
var QUERY_FWPMT = "queryFwXmHst";
var QUERY_FWFCQLR = "queryFwFcqlr";
var DEL_FWFCQLR = "delFwFcqlr";
var SAVE_FWXMXX = "saveFwXmxx";

var XMXX = "xmxx";
var DCXX = "dcxx";
var FCQLR = "fcqlr";
var LJZ = "ljz";
var PMT = "pmt";


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
  var data = {
    "fwXmxxIndex": fwXmxxIndex
  };
  renderQueryResults(data, QUERY_FWXMXX, XMXX);

})

function renderQueryResults(reqData, apiType, mytpl) {
  $.ajax({
    url: ADDRESS_FWXM + apiType,
    data: reqData,
    dataType: "jsonp",
    success: function(result) {
      // console.log(result);
      renderToTpl(mytpl, result);
    }
  });
}

function renderToTpl(mytpl, data) {
  var r = 0;
  var template, html, tpl;
  switch (mytpl) {
    case XMXX:
      tpl = $("#panelXMXXTpl").html();
      r = 1;
      break;
    case DCXX:
      tpl = $("#panelDCXXTpl").html();
      r = 2;
      break;
    case FCQLR:
      tpl = $("#panelFCQLRTpl").html();
      break;
    case LJZ:
      tpl = $("#panelLJZLBTpl").html();
      break;
    case PMT:
      tpl = $("#panelPMTTpl").html();
      break;
    default:
  }
  //预编译模板
  template = Handlebars.compile(tpl);
  html = template(data);
  //输入模板
  $(".panel-body").html(html);
  // console.log(data.fwlx);
  if (r === 1) {
    $("#XMXX_FWLX option").each(function() {
      if ($(this).val() === data.fwlx) {
        $(this).attr('selected', true);
      }
    });

    $("#XMXX_FWXZ option").each(function() {
      if ($(this).val() === data.fwxz) {
        $(this).attr('selected', true);
      }
    });
  }
  if (r === 2) {
    laydate.render({
      elem: '#DCXX_DCSJ' //指定元素
    });
  }
}


$("#linkXMXX").on("click", function() {
  $("#close").show();
  $("#save").show();
  var data = {
    "fwXmxxIndex": fwXmxxIndex
  };
  renderQueryResults(data, QUERY_FWXMXX, XMXX);
});

$("#linkDCXX").on("click", function() {
  $("#close").show();
  $("#save").show();
  var data = {
    "fwXmxxIndex": fwXmxxIndex
  };
  renderQueryResults(data, QUERY_FWXMXX, DCXX);
});

$("#linkFCQLR").on("click", function() {
  $("#close").hide();
  $("#save").hide();
  renderToTpl(FCQLR);
  $("#tb_FCQLR").bootstrapTable({
    striped: true,
    toolbar: "#toolbarQLR",
    pagination: true, //启用分页
    pageSize: 5, //每页行数
    pageIndex: 0,
    // url: 'qlrxx.json',
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


});

function renderQlrTable() {
  var data = {
    "fwDcbIndex": fwXmxxIndex
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


function operateFormatterQLR(value, row, index) {
  var e = '<a href="#" mce_href="#" onclick="editQLR(\'' + row.FW_FCQLR_INDEX + '\')">编辑</a> ';
  var d = '<a href="#" mce_href="#" onclick="deleteQLR(\'' + row.FW_FCQLR_INDEX + '\')">删除</a> ';
  return e + d;
  return d;
}

function addQLR() {
  // layer.msg("新增权利人");
  layer.open({
    type: 2,
    title: '权利人信息',
    shadeClose: true,
    shade: 0.8,
    area: ['767px', '90%'],
    // content: '/omp/static/js/map/widgets/XMDZGL/addQlrxx.html?fw_xmxx_index=' + fwXmxxIndex, //iframe的url
    content: ADDRESS_ADDQLR + '?fw_xmxx_index=' + fwXmxxIndex, //iframe的url
    // content: '/omp/static/js/map/widgets/XMDZGL/qlrxx.html?fw_xmxx_index=' + getQueryString("fw_xmxx_index") //iframe的url
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
    content: ADDRESS_EDITQLR + '?fw_fcqlr_index=' + fwFcqlrIndex + '&fw_xmxx_index=' + fwXmxxIndex, //iframe的url
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

  // layer.open({
  //   type: 1,
  //   content: "确定删除此权利人？",
  //   btn: ['确定', '取消'],
  //   yes: function(index) {
  //     $.ajax({
  //       url: ADDRESS_QLR + DEL_FWFCQLR,
  //       dataType: "jsonp",
  //       data: {
  //         "fwFcqlrIndex": ids //需要获得权利人index
  //       },
  //       success: function(data) {
  //         // layer.msg("已删除此权利人！");
  //         $("#tb_FCQLR").bootstrapTable('remove', {
  //           field: 'FW_FCQLR_INDEX',
  //           values: [ids]
  //         });
  //       }
  //     });
  //     layer.close(index);
  //   }
  // });

}

$("#linkLJZLB").on("click", function() {
  $("#close").hide();
  $("#save").hide();
  renderToTpl(LJZ);
  $("#tb_LJZLB").bootstrapTable({
    striped: true,
    toolbar: "#toolbarLJZ",
    pagination: true, //启用分页
    pageSize: 5, //每页行数
    pageIndex: 0,
    columns: [{
        field: "zrzh",
        title: "自然幢号"
      }, {
        field: "fwmc",
        title: "房屋名称"
      }, {
        field: "fwjg",
        title: "房屋结构"
      }, {
        field: "fwcs",
        title: "房屋层数"
      }, {
        field: "ycjzmj",
        title: "预测建筑面积"
      }, {
        field: "scjzmj",
        title: "实测建筑面积"
      }, {
        field: "jgsj",
        title: "竣工时间"
      },
      {
        field: "id",
        title: "操作",
        align: "center",
        formatter: operateFormatterLJZ
      }
    ]
  });
  renderLjzTable();
  // $.ajax({
  //   url: "http://192.168.50.121:8083/estateplat-cadastre/fwXmGl/queryFwLjz",
  //   dataType: "jsonp",
  //   data: {
  //     "fwXmxxIndex": fwXmxxIndex
  //   },
  //   // url: "/omp/static/js/map/widgets/XMDZGL/ljzxx.json",
  //   // dataType: "json",
  //   success: function(data) {
  //     $("#tb_LJZLB").bootstrapTable('load', data);
  //   }
  // });
});

function renderLjzTable() {
  var data = {
    "fwXmxxIndex": fwXmxxIndex
  };
  $.ajax({
    url: ADDRESS_FWXM + QUERY_FWLJZ,
    dataType: "jsonp",
    data: data,
    // url: "/omp/static/js/map/widgets/XMDZGL/ljzxx.json",
    // dataType: "json",
    success: function(data) {
      $("#tb_LJZLB").bootstrapTable('load', data);
    }
  });
}

function operateFormatterLJZ(value, row, index) {
  // var e = '<a href="#" mce_href="#" onclick="editLJZ(\'' + row.zrzh + '\')">编辑</a> ';
  var d = '<a href="#" mce_href="#" onclick="deleteLJZ(\'' + row.zrzh + '\')">删除</a> ';
  // return e + d;
  return d;
}

function addLJZ() {
  layer.msg("新增逻辑幢");
}

function editLJZ() {
  layer.msg("编辑逻辑幢");
}

function deleteLJZ(ids) {
  $("#tb_LJZLB").bootstrapTable('remove', {
    field: 'zrzh',
    values: [ids]
  });
}



$("#linkPMT").on("click", function() {
  renderToTpl(PMT);
  // $.ajax({
  //   url: ADDRESS_FWXM + QUERY_FWPMT,
  //   data: fwXmxxIndex,
  //   dataType: "jsonp",
  //   success: function(data) {
  //     var wrappedObj = $("<code></code>").append($(data));
  //     var table = $(wrappedObj);
  //     $("#PMTContainer").html(table.html());
  //   }
  // });
  layer.msg("暂无此功能！");
});






//保存和关闭事件
$("#save").on("click", function() {
  saveFwXmxx(fwXmxxIndex);
  // closeCurrentWindow();
});

function saveFwXmxx(fwXmxxIndex) {
  // console.log(fwXmxxIndex);
  var data = [{
    "fwXmxxIndex": fwXmxxIndex,
    //项目信息
    "XMMC": $("#XMXX_XMMC").val(),
    "ZL": $("#XMXX_ZL").val(),
    "DYTDMJ": $("#XMXX_DYMJ").val(),
    "FTTDMJ": $("#XMXX_FTMJ").val(),
    "JYJG": $("#XMXX_JYJG").val(),
    "FWLX": $("#XMXX_FWLX").val(),
    "FWXZ": $("#XMXX_FWXZ").val(),
    "BZ": $("#XMXX_BZ").val(),
    //调查信息
    "CQLY": $("#DCXX_CQLY").val(),
    "GYQK": $("#DCXX_GYQK").val(),
    "DCSJ": $("#DCXX_DCSJ").val(),
    "DCYJ": $("#DCXX_DCYJ").val(),
    "DCZ": $("#DCXX_DCZ").val(),
    "FJSM": $("#DCXX_FJSM").val()
  }];
  $.ajax({
    url: ADDRESS_FWXM + SAVE_FWXMXX,
    dataType: "jsonp",
    data: {
      "s": JSON.stringify(data) //因为参数是字符串，所以需要把json数据转成字符串
    },
    success: function(r) {
      //弹出msg窗口后自动关闭
      layer.msg("保存修改成功！", {
        time: 1000
      });
      // console.log(r);
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

// 点击关闭按钮
$("#close").on("click", function() {
  closeCurrentWindow();
});

function closeCurrentWindow() {
  var index = parent.layer.getFrameIndex(window.name); //获取当前窗体索引
  parent.layer.close(index); //执行关闭
}
