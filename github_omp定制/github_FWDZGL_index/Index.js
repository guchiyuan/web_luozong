define(["dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/on",
  "layer",
  "mustache",
  "handlebars",
  "slimScroll",
  "static/thirdparty/laypage/laypage",
  "esri/toolbars/draw",
  "esri/graphic",
  "esri/lang",
  "map/core/QueryTask",
  "esri/tasks/FeatureSet",
  "map/utils/MapUtils",
  "map/component/MapPopup",
  "map/core/JsonConverters",
  "map/core/BaseWidget",
  "map/core/GeometryIO",
  "map/widgets/FWDZGL/ListDataRenderer",
  "map/component/ChosenSelect",
  "static/thirdparty/laydate/laydate",
  "static/thirdparty/bootstrap/js/bootstrap-v3.min"
], function(declare, lang, arrayUtil, on, layer, Mustache, Handlebars, SlimScroll, laypage, Draw, Graphic, esriLang,
  QueryTask, FeatureSet, MapUtils, MapPopup, JsonConverters, BaseWidget, GeometryIO, ListDataRenderer, ChosenSelect) {
  
  var STATE_QUERY = "query";
  var STATE_RESULT = "result";

  var DEL_FWDZ = "delFwDz";
  var QUERY_FWDZJSON = "queryFwDzJson";
  var GET_XZQDM = "getXzqdm";
  var ADDRESS_FWDZ = "http://192.168.50.169:8083/estateplat-cadastre/fwDzGl/";
  var ADDRESS_BDCDY = "http://192.168.50.169:8083/estateplat-cadastre/bdcdy/";

  var HOSTADDRESS = 'http://' + window.location.host;
  // var HOSTADDRESS = 'http://192.168.50.169:8083';
  // var ADDRESS_FWDZ = HOSTADDRESS + "/estateplat-cadastre/fwDzGl/";
  // var ADDRESS_BDCDY = HOSTADDRESS + "/estateplat-cadastre/bdcdy/";


  var $attrQueryPanel, $qResultPanel, $qSearchBtn, $lyrSelector;
  var _currentState = STATE_QUERY;
  var _queryConfig;
  var query = declare([BaseWidget], {
    constructor: function() {},

    onCreate: function() {
      _queryConfig = this.getConfig();
      _init();
    },

    onPause: function() {},

    onOpen: function() {}
  });

  /**
   *  初始化图层查询界面及功能
   *
   */
  function _init() {
    //初始化jq变量
    $attrQueryPanel = $("#FWDZGLQueryPanel");
    $qResultPanel = $("#FWDZGLResultPanel");
    $lyrSelector = $("#FWDZGLayersSelect");
    $qSearchBtn = $("#FWDZGLSearchBtn");

    //从数据库表里获取行政单位，作为option添加到行政单位的select里
    $.ajax({
      // url: "/omp/static/js/map/widgets/XMDZGL/xzqdm.json",
      // dataType: "json",
      // type: 'GET',
      // async: false,
      url: ADDRESS_BDCDY + GET_XZQDM,
      dataType: 'jsonp',
      jsonp: "callback",
      success: function(data) {
        // $("#XZDW").append("<option value='" + data[0].xzqdm + "'>" + data[0].xzqdm + "</option>");
        loadSelectOptions($("#FWDZGL_XZDW"), data);
      },
      error: function() {
        alert("完了");
      }
    });

    //查询图层
    $qSearchBtn.on('click', function() {
      validateForm();
      // renderQueryResult(items_fake);
      renderToResultList();

    });
  }

  function validateForm() {
    if (validateLszd() == false) {
      return false;
    }
    return true;
  }

  function validateLszd() {
    var valueLszd = $("#FWDZGL_queryValLSZD").val();
    if (valueLszd == null || valueLszd == "") {
      layer.confirm("请输入隶属宗地");
      return false;
    }
    return true;
  }


  function renderToResultList() {
    var data = {
      "page": 1,
      "pagesize": parseInt(($(window).height() - 280) / 50, 10),
      // "pagesize": 5,
      "xzqdm": $('#FWDZGL_XZDW').val(),
      "lszd": $('#FWDZGL_queryValLSZD').val()
    };

    $.ajax({
      // url: "/omp/static/js/map/widgets/FWDZGL/ljz.json",
      // dataType: "json",
      // type: 'GET',
      url: ADDRESS_FWDZ + QUERY_FWDZJSON,
      data: data,
      type: 'GET',
      dataType: 'jsonp',
      success: function(r) {
        console.log(r);
        console.log(data);
        // deleteQLRNull(r.rows);
        renderQueryResult(r.rows);
        // renderQueryResult(r);
        showPageTool("FWDZGL_pageTool", r.total, data.page, data);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest.status);
        console.log(textStatus);
      }
    });
  }

  // function deleteQLRNull(items) {
  //   for (var i = 0; i < items.length; i++) {
  //     var data = {
  //       "fwDcbIndex": items[i].FW_DCB_INDEX
  //     };
  //     $.ajax({
  //       url: ADDRESS_QLR + QUERY_FWFCQLR,
  //       dataType: "jsonp",
  //       data: data,
  //       success: function(data) {
  //         if (data === null) {
  //           $.ajax({
  //             url: ADDRESS_FWDZ + DEL_FWDZ,
  //             dataType: "jsonp",
  //             data: {
  //               "fwDcbIndex": data.FW_DCB_INDEX
  //             },
  //             success: function(r) {
  //               console.log(r);
  //             },
  //             error: function(r) {
  //               console.log(r);
  //             }
  //           });
  //         }
  //       }
  //     });
  //   }
  // }
  // 动态加载select的选项
  function loadSelectOptions($selector, data) {
    var options = [];
    // var responseData = data.data[0];
    var responseData = data;
    $.each(responseData, function(idx, obj) {
      // console.log(obj.xzqdm);
      options.push({
        xzqdm: obj.xzqdm
      });
    });

    var tpl = $("#FWDZGLConditionTpl").html();
    var rendered = RenderData(tpl, {
      condition: options
    });
    $selector.append(rendered);
  }

  function RenderData(tpl, data) {
    var tempelete = Handlebars.compile(tpl);
    return tempelete(data);
  }

  //渲染模板显示结果
  function renderQueryResult(items) {
    changeState(STATE_RESULT);
    // console.log(items);

    var tpl = $("#FWDZGLResultTpl").html();
    $qResultPanel.empty();
    $qResultPanel.append(Mustache.render(tpl, {
      result: items,
      size: items.length
    }));
    var listDataRenderer = new ListDataRenderer({
      renderTo: $('#FWDZGLResultList'),
      type: "fwdz_editAndDel",
      // map: map.map(),
      renderData: items
    });
    listDataRenderer.render();
    //结果界面可滚动
    var scrollHeight = $(window).height() - 220;
    $("#FWDZGLResultList").slimScroll({
      height: scrollHeight,
      railVisible: true,
      railColor: '#333',
      railOpacity: .2,
      railDraggable: true
    });

    listDataRenderer.on('edit', function(item) {
      editItem(item);
    });

    listDataRenderer.on('delete', function(item) {
      deleteItem(item);
    });

    $("#FWDZGLAddBtn").on("click", function() {
      var lszd = $("#FWDZGL_queryValLSZD").val();
      layer.open({
        type: 2,
        title: '新增项目',
        shadeClose: true,
        shade: 0.8,
        area: ['767px', '90%'],
        // content: 'http://192.168.50.121:8083/estateplat-cadastre/static/html/XMDZGL/addItem.html' //iframe的url
        // content: '/omp/static/js/map/widgets/FWDZGL/addItem.html?lszd=' + lszd //iframe的url
        content: _queryConfig.interfaceHost + _queryConfig.addItemAddress + '?lszd=' + lszd //iframe的url
      });
    });

    //返回查询界面
    $("#FWDZGLReturnBtn").on('click', function() {
      changeState(STATE_QUERY);
    });

  }

  function showPageTool(selector, pageCount, currPage, data) {
    // var $selector;
    // if (typeof selector === "string") {
    //   $selector = $("#" + selector);
    //   console.log(selector);
    // }
    // $selector.show();
    laypage({
      cont: selector,
      pages: pageCount,
      groups: 5,
      curr: currPage,
      skip: false,
      skin: '#236b8e',
      first: 1,
      last: pageCount,
      prev: false,
      next: false,
      jump: function(obj, first) {
        if (!first) {
          data.page = obj.curr;
          $.ajax({
            url: ADDRESS_FWDZ + QUERY_FWDZJSON,
            dataType: "jsonp",
            type: 'GET',
            data: data,
            success: function(r) {
              renderQueryResult(r.rows);
              showPageTool("FWDZGL_pageTool", r.total, data.page, data);
            }
          });
        }
      }
    });
  }

  function editItem(data) {
    layer.open({
      type: 2,
      title: '查看项目',
      shadeClose: true,
      shade: 0.8,
      area: ['767px', '90%'],
      // content: '/omp/static/js/map/widgets/FWDZGL/editItem.html?fw_dcb_index=' + data.FW_DCB_INDEX, //iframe的url
      content: _queryConfig.interfaceHost + _queryConfig.editItemAddress + '?fw_dcb_index=' + data.FW_DCB_INDEX, //iframe的url
      // content: 'http://192.168.50.121:8083/estateplat-cadastre/static/html/FWDZGL/editItem.html??fw_dcb_index=' + data.FW_DCB_INDEX, //iframe的url
      //父传子的关键是把通信放在success后面的回调里
      success: function() {

      }
      // end: function(layero, index) {
      //   renderToResultList();
      // }
    });
  }

  function deleteItem(data) {

    layer.confirm('确定删除此项目？', {
      btn: ['确定', '取消'] //按钮
      // end: function(layero, index) {
      //      renderToResultList();
      //   }
    }, function(index) {
      $.ajax({
        url: ADDRESS_FWDZ + DEL_FWDZ,
        dataType: "jsonp",
        data: {
          "fwDcbIndex": data.FW_DCB_INDEX
        },
        success: function() {
          layer.msg("已删除此项目信息！", {
            time: 1000,
            end: function() {
              renderToResultList();
            }
          });
        },
        error: function(r) {
          console.log(r);
          layer.msg("此项目删除失败！")
        }
      });
      layer.close(index);
    });

    // layer.open({
    //   type: 1,
    //   content: "确定删除此项目？",
    //   btn: ['确定', '取消'],
    //   yes: function(index) {
    //     $.ajax({
    //       url: ADDRESS_FWXM + DEL_FWXMXX,
    //       dataType: "jsonp",
    //       data: {
    //         "fwXmxxIndex": data.FW_XMXX_INDEX
    //       },
    //       success: function(r) {
    //         layer.msg("已删除此项目信息！");
    //       },
    //       error: function() {
    //         layer.msg("此项目删除失败！")
    //       }
    //     });
    //     layer.close(index);
    //   },
    //   end: function(layero, index) {
    //     renderToResultList();
    //   }
    // });
  }

  /***
   * 切换当前面板状态
   * @param s
   */
  function changeState(s) {
    _currentState = s;
    switch (_currentState) {
      case STATE_QUERY:
        $qResultPanel.empty();
        $attrQueryPanel.show();
        // if (mapPopup.isShowing) mapPopup.closePopup();
        // _map.graphics.clear();
        break;
      case STATE_RESULT:
        $attrQueryPanel.hide();
        break;
    }
  }

  return query;
});
