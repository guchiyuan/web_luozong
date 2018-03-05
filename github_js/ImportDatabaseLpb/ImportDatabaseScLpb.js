// var HOSTADDRESS = 'http://' + window.location.host;
var HOSTADDRESS = 'http://192.168.50.169:8083';
var GETFIELDSOPTION = '/estateplat-cadastre/chLpb/getFieldsOption';
var GETCHLPBCXTJ = '/estateplat-cadastre/chLpb/getChLpbCxtj';
var QUERYFCSCLPBJSON = '/estateplat-cadastre/chLpb/queryFcScLpbJson';
var IMPCHLPBXX = '/estateplat-cadastre/chLpb/impChLpbxx';

$(function() {
  var reqData;
  $.ajax({
    url: HOSTADDRESS + GETFIELDSOPTION,
    async: false,
    dataType: 'jsonp',
    success: function(resData) {
      // console.log(resData);
      layer.load(1, {
        shade: [0.5, '#000'] //0.5透明度的黑色背景
      });
      createTable(resData);
    }
  });

  $.ajax({
    url: HOSTADDRESS + GETCHLPBCXTJ,
    async: false,
    dataType: 'jsonp',
    success: function(resData) {
      // console.log(resData);
      loadSelectOptions($("#queryLx"), resData);

      $("#queryBtn").click(function() {
        var idx;
        var option = $("#queryLx").val();
        $.each(resData, function(i, item) {
          if (item.查询字段 === option) {
            idx = i;
          }
        });
        reqData = {
          "cxzd": resData[idx].查询字段,
          "cxb": resData[idx].查询表,
          "cxsql": resData[idx].查询语句,
          "cxnr": $("#queryCondition").val()
        };
        // reqData["cxnr"] = $("#queryCondition").val();
        console.log(reqData);
        $.ajax({
          url: HOSTADDRESS + QUERYFCSCLPBJSON,
          data: reqData,
          dataType: 'jsonp',
          success: function(resData) {
            // console.log(resData);
            $("#tbLpb").bootstrapTable('load', resData);
          }
        });
      });
    }
  });
})

$("#importBtn").click(function() {
  var djh = getQueryString("djh");
  var zrzh = getQueryString("zrzh");
  var tclx = getQueryString("tclx");
  var fwlx = getQueryString("fwlx");
  var objectid = getQueryString("objectid");
  var glycxx = $("#glycxxOption").is(':checked').toString();
  var drzhs = $("#drzhsOption").is(':checked').toString();
  var fgyysj = $("#fgyysjOption").is(':checked').toString();
  var getSelections = $("#tbLpb").bootstrapTable('getAllSelections');
  if (zrzh === "空") {
    zrzh = "";
  }
  // console.log(drzhs);
  // console.log(getSelections);
  var zjDataStr;
  var zjDataArr = [];
  $.each(getSelections, function(i, item) {
    zjDataArr.push(item.ID_LID);
    zjDataStr = zjDataArr.join();
  });
  var reqData = {
    drzhs: drzhs,
    fgyysj: fgyysj,
    glycxx: glycxx,
    tclx: tclx,
    zrzh: zrzh,
    djh: djh,
    fwlx: fwlx,
    objectid: objectid,
    zjmc: 'ID_LID',
    zjData: zjDataStr
  }
  console.log(reqData);
  $.ajax({
    url: HOSTADDRESS + IMPCHLPBXX,
    data: reqData,
    dataType: 'jsonp',
    success: function(resData) {
      console.log(resData);
      layer.msg("测绘楼盘表导入成功！");
    },
    error: function(err) {
      console.log(err);
      layer.msg(err);
    }
  });
});

function createTable(resData) {
  var fieldsOption = resData;
  var columns = [{
    checkbox: true
  }];
  $.each(fieldsOption, function(i, item) {
    // console.log(item.DICTIONARY_INFO.split(';'));
    switch (item.DICTIONARY_INFO) {
      case '':
        columns.push({
          "field": item.FLD_ENGLISH_NAME.toUpperCase(),
          "title": item.FLD_CHINESE_NAME
        });
        break;
      default:
        columns.push({
          "field": item.FLD_ENGLISH_NAME.toUpperCase(),
          "title": item.FLD_CHINESE_NAME,
          formatter: function(value, row, index) {
            var dicArray = item.DICTIONARY_INFO.split(';');
            var dicTxt;
            // console.log(dicArray);
            $.each(dicArray, function(i, item) {
              if (item.split(':')[0] === value) {
                dicTxt = item.split(':')[1]
              }
            });
            return dicTxt;
          }
        });
    }
  });
  $("#tbLpb").bootstrapTable({
    striped: true,
    detailView: false,
    pagination: true, //启用分页
    pageSize: parseInt(($(window).height() - 280) / 30, 10), //每页行数
    pageIndex: 0,
    columns: columns
  });
  layer.closeAll('loading');
}

// 动态加载select的选项
function loadSelectOptions($selector, data) {
  var options = [];
  var resData = data;
  $.each(resData, function(i, item) {
    options.push({
      cxmc: item.名称,
      cxzd: item.查询字段
    });
  });
  var tpl = $("#queryLxTpl").html();
  var rendered = RenderData(tpl, {
    condition: options
  });
  $selector.append(rendered);
}

function RenderData(tpl, data) {
  var tempelete = Handlebars.compile(tpl);
  return tempelete(data);
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var url = decodeURI(window.location.search);
  var r = url.substr(1).match(reg);
  if (r != null) return (r[2]);
  return '';
}
