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
  "map/widgets/XMDZGL/ListDataRenderer",
  "map/component/ChosenSelect",
  "static/thirdparty/laydate/laydate",
  "static/thirdparty/bootstrap/js/bootstrap-v3.min"
  // "static/thirdparty/jquery-validation/jquery.validate.min" //添加jquery validation
  // "static/thirdparty/jquery-validation/messages_zh.min" //添加中文提示包
], function (declare, lang, arrayUtil, on, layer, Mustache, Handlebars, SlimScroll, laypage, Draw, Graphic, esriLang,
  QueryTask, FeatureSet, MapUtils, MapPopup, JsonConverters, BaseWidget, GeometryIO, ListDataRenderer, ChosenSelect) {


  var STATE_QUERY = "query";
  var STATE_RESULT = "result";

  var GET_XZQDM = "getXzqdm";
  var QUERY_FWXMJSON = "queryFwXmJson";
  var DEL_FWXMXX = "delFwXmxx";
  // var ADDRESS_FWXM = "http://192.168.50.169:8083/estateplat-cadastre/fwXmGl/";
  // var ADDRESS_BDCDY = "http://192.168.50.169:8083/estateplat-cadastre/bdcdy/";

  var HOSTADDRESS = 'http://' + window.location.host;
  // var HOSTADDRESS_API = 'http://192.168.50.169:8083';
  var ADDRESS_FWXM = HOSTADDRESS + "/estateplat-cadastre/fwXmGl/";
  var ADDRESS_BDCDY = HOSTADDRESS + "/estateplat-cadastre/bdcdy/";

  var $attrQueryPanel, $qResultPanel, $qSearchBtn, $lyrSelector;
  var _currentState = STATE_QUERY;

  // var _queryConfig, _map;
  // var mapPopup = MapPopup.getInstance();
  var _queryConfig;
  var query = declare([BaseWidget], {
    constructor: function () {},

    onCreate: function () {
      _queryConfig = this.getConfig();
      _init();
    },
    onPause: function () {
      // if (mapPopup.isShowing) mapPopup.closePopup();
      // _map.graphics.clear();
    },
    onDestroy: function () {
      // if (mapPopup.isShowing) mapPopup.closePopup();

    }
  });


  /**
   *  初始化图层查询界面及功能
   * @param _queryConfig
   */
  function _init() {


    //初始化jq变量
    $attrQueryPanel = $("#XMDZGLQueryPanel");
    $qResultPanel = $("#XMDZGLResultPanel");
    $lyrSelector = $("#XMDZGLayersSelect");
    $qSearchBtn = $("#XMDZGLSearchBtn");

    //从数据库表里获取行政单位，作为option添加到行政单位的select里
    $.ajax({
      // url: "/omp/static/js/map/widgets/XMDZGL/xzqdm.json",
      // dataType: "json",
      // type: 'GET',
      // async: false,
      // url: ADDRESS_BDCDY + GET_XZQDM,
      url: ADDRESS_BDCDY + GET_XZQDM,
      dataType: 'jsonp',
      jsonp: "callback",
      success: function (data) {
        // $("#XMXX_XZDW").append("<option value='" + data[0].xzqdm + "'>" + data[0].xzqdm + "</option>");
        loadSelectOptions($("#XMDZGL_XZDW"), data);
      },
      error: function () {
        alert("完了");
      }
    });

    //查询图层
    $qSearchBtn.on('click', function () {
      validateForm();

      // renderQueryResult(items_fake);
      renderToResultList();
    });

    //清空重置监听
    $("#XMDZGLResetBtn").on('click', function () {
      var _selItem = $lyrSelector.val();
      $("#XMDZGLLayerForm")[0].reset();
      $lyrSelector.val(_selItem);
    });
  }

  function validateForm() {
    if (validateXmmc() == false && validateLszd() == false) {
      layer.confirm("请输入查询内容");
      return false;
    }
    return true;
  }


  function validateXmmc() {
    var valueXmmc = $("#XMDZGL_queryValXMMC").val();
    if (valueXmmc == null || valueXmmc == "") {
      return false;
    }
    return true;
  }

  function validateLszd() {
    var valueLszd = $("#XMDZGL_queryValLSZD").val();
    if (valueLszd == null || valueLszd == "") {
      return false;
    }
    return true;
  }

  function renderToResultList() {
    var data = {
      "page": 1,
      "pagesize": parseInt(($(window).height() - 280) / 50, 10),
      // "pagesize": 5,
      "xzqdm": $('#XMDZGL_XZDW').val(),
      "xmmc": $('#XMDZGL_queryValXMMC').val(),
      "lszd": $('#XMDZGL_queryValLSZD').val()
    };
    console.log(data);
    $.ajax({
      // url: "/omp/static/js/map/widgets/XMDZGL/xmxx.json",
      // dataType: "json",
      // type: 'GET',
      // data: data,
      url: ADDRESS_FWXM + QUERY_FWXMJSON,
      data: data,
      type: 'GET',
      dataType: 'jsonp',
      // jsonp: "callback",
      success: function (r) {
        console.log(r);
        renderQueryResult(r.rows);
        // renderQueryResult(r);
        showPageTool("XMDZGL_pageTool", r.total, data.page, data);
        // laypage({
        //   cont: 'pageTool',
        //   pages: 3, //总页数
        //   curr: 1
        // });

      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest.status);
        console.log(textStatus);
      }
    });
  }

  // 动态加载select的选项
  function loadSelectOptions($selector, data) {
    var options = [];
    // var responseData = data.data[0];
    var responseData = data;
    $.each(responseData, function (idx, obj) {
      // console.log(obj.xzqdm);
      options.push({
        xzqdm: obj.xzqdm
      });
    });

    var tpl = $("#XMDZGLConditionTpl").html();
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

    var tpl = $("#XMDZGLResultTpl").html();
    $qResultPanel.empty();
    $qResultPanel.append(Mustache.render(tpl, {
      result: items,
      size: items.length
    }));
    var listDataRenderer = new ListDataRenderer({
      renderTo: $('#XMDZGLResultList'),
      type: "editAndDel",
      // map: map.map(),
      renderData: items
    });
    listDataRenderer.render();
    //结果界面可滚动
    var scrollHeight = $(window).height() - 220;
    $("#XMDZGLResultList").slimScroll({
      height: scrollHeight,
      railVisible: true,
      railColor: '#333',
      railOpacity: .2,
      railDraggable: true
    });

    listDataRenderer.on('edit', function (item) {
      editItem(item);
      // console.log(item);
      // alert("edit!");
    });

    listDataRenderer.on('delete', function (item) {
      // alert("delete!")
      deleteItem(item);
    });
    // //返回查询界面
    // $("#XMDZGLReturnBtn").on('click', lang.hitch(this, changeState, STATE_QUERY));

    $("#XMDZGLAddBtn").on("click", function () {
      var lszd = $("#XMDZGL_queryValLSZD").val();
      layer.open({
        type: 2,
        title: '新增项目',
        shadeClose: true,
        shade: 0.8,
        area: ['767px', '90%'],
        // content: 'http://192.168.50.121:8083/estateplat-cadastre/static/html/XMDZGL/addItem.html' //iframe的url
        // content: '/omp/static/js/map/widgets/XMDZGL/addItem.html?lszd=' + lszd //iframe的ur
        content: _queryConfig.interfaceHost + _queryConfig.addItemAddress + '?lszd=' + lszd //iframe的ur
        // end: function(layero, index) {
        //   renderToResultList();
        // }
      });
    });
    // http://192.168.50.121:8083/estateplat-cadastre/static/html/XMDZGL/addItem.html
    //返回查询界面
    $("#XMDZGLReturnBtn").on('click', function () {
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
      jump: function (obj, first) {
        if (!first) {
          data.page = obj.curr;
          $.ajax({
            url: ADDRESS_FWXM + QUERY_FWXMJSON,
            dataType: "jsonp",
            type: 'GET',
            data: data,
            success: function (r) {
              renderQueryResult(r.rows);
              showPageTool("XMDZGL_pageTool", r.total, data.page, data);
            }
          });
        }
      }
    });
  }

  // var index = parent.layer.getFrameIndex(window.name); //获取当前窗体索引
  function editItem(data) {
    // console.log(data.XMMC);
    layer.open({
      type: 2,
      title: '查看项目',
      shadeClose: true,
      shade: 0.8,
      area: ['767px', '90%'],
      content: _queryConfig.interfaceHost + _queryConfig.editItemAddress + '?fw_xmxx_index=' + data.FW_XMXX_INDEX, //iframe的url
      // content: '/omp/static/js/map/widgets/XMDZGL/editItem.html?fw_xmxx_index=' + data.FW_XMXX_INDEX, //iframe的url
      // content: 'http://192.168.50.121:8083/estateplat-cadastre/static/html/XMDZGL/editItem.html?fw_xmxx_index=' + data.FW_XMXX_INDEX, //iframe的url
      //父传子的关键是把通信放在success后面的回调里
      success: function () {
        // console.log(data.title);
        // var body = layer.getChildFrame('body', index);
        // var input_xmmc = body.contents().find('#XMXX_XMMC');
        // input_xmmc.val(data.title);
        // console.log(input_xmmc.val());
        // console.log(input_xmmc);
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
    }, function (index) {
      $.ajax({
        url: ADDRESS_FWXM + DEL_FWXMXX,
        dataType: "jsonp",
        data: {
          "fwXmxxIndex": data.FW_XMXX_INDEX
        },
        success: function () {
          layer.msg("已删除此项目信息！", {
            time: 1000,
            end: function () {
              renderToResultList();
            }
          });
          renderToResultList();
        },
        error: function () {
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