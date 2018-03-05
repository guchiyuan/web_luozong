var queryConfig;
var hostAddress = 'http://' + window.location.host;
$(function() {
  var layerAlias = getQueryString('layerAlias');
  var queryFieldAlias = getQueryString('queryFieldAlias');
  var queryValue = getQueryString('queryValue');
  $("#lblDJH").html(queryFieldAlias + "：");
  $("#DJH").val(queryValue);
  $("#Target").val(layerAlias);

  $.ajax({
    url: "../../js/CorrelateLpb/ApiConfig.json",
    async: false,
    dataType: 'json',
    success: function(data) {
      queryConfig = data.queryConfig;
    }
  });

  $("#condition").on("change", function() {
    changeChildCondition($(this).val());
  })

  loadCondition({
    condition: queryConfig.queryType
  }, $("#condition"));
  $('#condition').trigger('change');

  $("#queryBtn").on("click", function() {
    query();
  })

  $(document).on('click', ".operation-view", function() {
    var request = {
      fwDcbIndex: $(this).attr('fw_index'),
      djh: $(this).attr('djh')
    };
    layer.open({
      type: 2,
      title: '户室信息查看',
      maxmin: true,
      shadeClose: false, //点击遮罩关闭层
      area: ['750px', '480px'],
      content: "ViewBuildingTableInfo.html",
      success: function(layero, index) {
        var body = layer.getChildFrame('body', index);
        var iframeWin = window[layero.find('iframe')[0]['name']];
        iframeWin.DoRender(hostAddress + queryConfig.viewInterface.url, request);
      }
    });
  });

  $("#btnCorrelate").click(function() {
    // alert("ddd");
    var listRow = [];
    var tclx = "";
    switch (layerAlias) {
      case "房屋":
        tclx = "FW"
        break;
      case "宗地":
        tclx = "ZD";
        break;
    }

    $("input[name='rowCheck']:checked").each(function() {
      var request = {
        "tclx": tclx,
        "fwDcbIndex": $(this).parent().parent().attr('fw_index'),
        "djh": $("#DJH").val()
      };

      listRow.push(request);

      var requestDataString = JSON.stringify(listRow);
      requestDataString = requestDataString.replace(/},{/g, ';');
      requestDataString = requestDataString.replace('[{', '');
      requestDataString = requestDataString.replace('}]', '');
      requestDataString = requestDataString.replace(/\"/g, '');
      console.log(requestDataString);

      $.ajax({
        // url: hostAddress + queryConfig.checkCondition.url,
        url: hostAddress + queryConfig.checkCondition.url,
        data: {
          "lpbData": requestDataString
        },
        dataType: "jsonp",
        success: function(data) {
          if (data.returncode === "true") {
            $.ajax({
              url: hostAddress + queryConfig.relatedInterface.url,
              data: {
                "lpbData": requestDataString
              },
              dataType: "jsonp",
              success: function(data) {
                if (data.returncode === "true") {
                  $("#dcb-djh").html($("#DJH").val());
                  layer.msg("不动产单元编号成功！");
                } else {
                  layer.msg("关联失败：" + data.returncode);
                }
              }
            });
          } else {
            layer.msg("关联失败：" + data.returncode);
          }
        }
      });
    });


  });

  $("#btnCancelCorrelate").click(function() {
    // var $td1 = $(this).parent();
    // var $td2 = $td1.parent();
    // var $td3 = $td2.find(".dcb-djh");
    var listRow = [];
    var tclx = "";
    switch (layerAlias) {
      case "房屋":
        tclx = "FW"
        break;
      case "宗地":
        tclx = "ZD";
        break;
    }
    $("input[name='rowCheck']:checked").each(function() {
      var requestData = {
        "tclx": tclx,
        "fwDcbIndex": $(this).parent().parent().attr('fw_index'),
        "djh": $("#DJH").val()
      };
      listRow.push(requestData);
    });
    console.log(listRow);
    var requestDataString = JSON.stringify(listRow);
    requestDataString = requestDataString.replace(/},{/g, ';');
    requestDataString = requestDataString.replace('[{', '');
    requestDataString = requestDataString.replace('}]', '');
    requestDataString = requestDataString.replace(/\"/g, '');

    console.log(requestDataString);
    console.log(typeof(requestDataString));
    $.ajax({
      url: hostAddress + queryConfig.canceldInterface.url,
      data: {
        "lpbData": requestDataString
      },
      dataType: "jsonp",
      success: function(data) {
        // if (data.returncode == "取消关联成功！") {
        if (data.returncode == "true") {
          $("#dcb-djh").empty();
          layer.msg("取消关联成功");
        } else {
          layer.msg("取消关联失败：" + data.returncode);
        }
      }
    });
  });

  $("#checkall").click(function() {
    $("input[name='rowCheck']").prop("checked", this.checked);
  });

  var $rowCheck = $("input[name='rowCheck']");
  $rowCheck.click(function() {
    $("#checkall").prop("checked", $rowCheck.length == $("input[name='rowCheck']:checked").length ? true : false);
  });
});

function query() {
  var queryConditions = {
    cxfs: $("#condition").val(),
    cxtj1: $("#condition1").val(),
    cxnr1: $("#conditionInput1").val(),
    cxtj2: $("#condition2").val(),
    cxnr2: $("#conditionInput2").val(),
    returncode: "0000",
    page: 1,
    pagesize: parseInt((($(window).height() - $("#conditionPanel").height() - 20) / $("tr").height()), 10),
  };
  $.ajax({
    url: hostAddress + queryConfig.queryInterface.url,
    data: queryConditions,
    type: "GET",
    dataType: 'jsonp',
    jsonp: "callback",
    success: function(data) {
      parseQueryResult(data);
      showPageTool("pageTool", data, queryConditions, hostAddress + queryConfig.queryInterface.url)
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var url = decodeURI(window.location.search);
  var r = url.substr(1).match(reg);
  if (r != null) return (r[2]);
  return null;
}

function loadCondition(condition, parent) {
  var conditionTpl = $("#conditionTpl").html();
  var html = RenderData(conditionTpl, condition);
  parent.html(html);
}

function responseError(data) {
  switch (data.head.retruncode) {
    case "1001":
      layer.msg("查询数据失败");
      break;
    case "1002":
      layer.msg("请求参数为空");
      break;
    case "fail":
      layer.msg("查询失败");
      break;
  }
}

function RenderData(tpl, data) {
  var tempelete = Handlebars.compile(tpl);
  return tempelete(data);
}

function changeChildCondition(cxfs) {
  var requestData = {
    cxfs: cxfs
  };
  $.ajax({
    url: hostAddress + queryConfig.getCondition1.url,
    data: requestData,
    type: 'GET',
    dataType: 'jsonp',
    jsonp: "callback",
    success: function(data) {
      parseConditionData(data, $("#condition1"));
    }
  });
  $.ajax({
    url: hostAddress + queryConfig.getCondition2.url,
    data: requestData,
    type: 'GET',
    dataType: 'jsonp',
    jsonp: "callback",
    success: function(data) {
      parseConditionData(data, $("#condition2"));
    }
  });
}

function parseConditionData(data, target) {
  var condition = [];
  var thisData = data;
  var lx = thisData[0];
  for (var idx in lx.cxtj) {
    for (var csz in lx.cxtj[idx]) {
      condition.push({
        "csmc": lx.cxtj[idx][csz],
        "csz": csz
      });
    }

  }
  loadCondition({
    condition: condition
  }, target);
}

function parseQueryResult(data) {
  // if (data.head.returncode=="0000")
  {
    var $tBody = $("#tableBody");
    $tBody.empty();
    $.each(data.rows, function(idx, obj) {
      var rowData = obj;
      rowData.djh = $("#DJH").val();
      var tbodyTpl = $("#resultTpl").html();
      var renderedData = RenderData(tbodyTpl, obj);
      $tBody.append(renderedData);
    })
  }
  /*    else
      {
          responseError(data);
      }*/
}

function RequestConstructor(head, data) {
  this.head = head;
  this.data = data;
}

function showPageTool(selector, responseHead, requireData, url) {
  if (typeof selector === "string")
    selector = $("#" + selector);
  selector.show();
  laypage({
    cont: selector,
    pages: responseHead.total,
    groups: 5,
    curr: responseHead.page,
    skip: false,
    skin: '#428BCA',
    first: 1,
    last: responseHead.total,
    prev: "<",
    next: ">",
    jump: function(obj, first) {
      if (!first) {
        requireData.page = obj.curr;
        $.ajax({
          url: url,
          type: "GET",
          data: requireData,
          dataType: 'jsonp',
          jsonp: "callback",
          success: function(r) {
            parseQueryResult(r);
            showPageTool("pageTool", r, requireData, url);
          }
        });
      }
    }
  });
}
