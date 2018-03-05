define(["dojo/_base/declare",
  "dojo/_base/lang",
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
  "map/utils/MapUtils",
  "map/component/MapPopup",
  "map/core/JsonConverters",
  "map/core/BaseWidget",
  "map/widgets/ImportDatabaseLpb/BuildingTableRenderer",
  "map/component/ChosenSelect",
  "static/thirdparty/laydate/laydate",
  "static/thirdparty/bootstrap/js/bootstrap-v3.min"
], function(declare, lang, on, layer, Mustache, Handlebars, SlimScroll, laypage, Draw, Graphic, esriLang,
  QueryTask, MapUtils, MapPopup, JsonConverters, BaseWidget, ListDataRenderer, ChosenSelect) {

  var _queryConfig, _map;
  var mapPopup = MapPopup.getInstance();
  var query = declare([BaseWidget], {
    /**
     *
     */
    constructor: function() {},
    /**
     *
     */
    onCreate: function() {
      _map = this.getMap().map();
      _queryConfig = this.getConfig();
      _init();
    },
    onPause: function() {
      if (mapPopup.isShowing) mapPopup.closePopup();
      _map.graphics.clear();

    },
    onDestroy: function() {
      if (mapPopup.isShowing) mapPopup.closePopup();
      dateCondition = {};
    }
  });

  var drawTool, drawHandler;
  var dateCondition = {}; //存放日期型查询字段查询条件
  var rangeCondition = {}; //存放范围型的字段查询条件

  var STATE_QUERY = "query";
  var STATE_RESULT = "result";

  //设置属性识别后信息弹出窗的样式
  var POPUP_OPTION_INFO = "infoWindow";
  var POPUP_OPTION_MODAL = "modal";

  //默认是infowindow样式
  var popUpStyle = POPUP_OPTION_INFO;

  var $attrQueryPanel, $spatialQueryPanel, $qResultPanel, $qSearchBtn, $lyrSelector;
  var _currentState = STATE_QUERY;

  var geometryIO;

  var showFooter = false;
  var exportData = false;
  var exportTypes = "";
  /**
   *  初始化图层查询界面及功能
   * @param _queryConfig
   */
  function _init() {
    $("#importDatabaseLpbSpatialQueryPanel").animate();
    Handlebars.registerHelper('equals', function(left, operator, right, options) {
      if (arguments.length < 3) {
        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
      }
      var operators = {
        '==': function(l, r) {
          return l == r;
        },
        '===': function(l, r) {
          return l.equalsIgnoreCase(r);
        },
        '!=': function(l, r) {
          return l != r;
        },
        '!==': function(l, r) {
          return l !== r;
        },
        '<': function(l, r) {
          return l < r;
        },
        '>': function(l, r) {
          return l > r;
        },
        '<=': function(l, r) {
          return l <= r;
        },
        '>=': function(l, r) {
          return l >= r;
        },
        'typeof': function(l, r) {
          return typeof l == r;
        }
      };

      if (!operators[operator]) {
        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
      }

      var result = operators[operator](left, right);

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    Date.prototype.toLocaleString = function() {
      return this.getFullYear() + "年" + (this.getMonth() + 1) + "月" + this.getDate() + "日 ";
    };

    layer.config();
    laydate.skin('molv');
    //初始化jq变量
    $attrQueryPanel = $("#importDatabaseLpbQueryPanel");
    $qResultPanel = $("#importDatabaseLpbResultPanel");
    $spatialQueryPanel = $("#importDatabaseLpbSpatialQueryPanel");
    //读取弹出层方式
    if (_queryConfig.popUpStyle && _queryConfig.popUpStyle.equalsIgnoreCase('modal')) {
      popUpStyle = POPUP_OPTION_MODAL;
    } else {
      popUpStyle = POPUP_OPTION_INFO;
    }
    //空间查询按钮监听
    $spatialQueryPanel.find('span').on('click', function() {
      spatialClickHandler($(this).data("type"));
    });
    //初始化默认模板

    $attrQueryPanel.append(renderTpl($("#importDatabaseLpbLayerSelectTpl").html(), {
      layers: _queryConfig.layers
    }));
    $lyrSelector = $("#importDatabaseLpbLayersSelect");
    $qSearchBtn = $("#importDatabaseLpbSearchBtn");
    //默认选中第一个图层
    if (_queryConfig.layers.length > 0) {
      changeActiveLayer(_queryConfig.layers[0].serviceId + "-" + _queryConfig.layers[0].layerIndex);
      ChosenSelect({
        elem: '.chosen-select'
      });
      $(".layer-input-date").on('click', function() {
        var id = $(this).attr("id");
        laydate({
          elem: "#" + id,
          format: 'YYYY-MM-DD',
          max: laydate.now(),
          istime: false,
          istoday: false,
          choose: function(dates) {
            var $dateInput = $($(this).attr('elem'));
            var field = $dateInput.data("field");
            var order = $dateInput.data("order");
            //存储日期条件
            if (!dateCondition[field]) {
              dateCondition[field] = {};
            }
            if (order == 0) {
              dateCondition[field].start = dates;
            } else if (order == 1) {
              dateCondition[field].end = dates;
            }
          }
        });
      })
    }
    //监听选择的图层变化时，动态的修改条件
    $lyrSelector.on('change', function() {
      dateCondition = {};
      changeActiveLayer($(this).val());
    });
    //查询图层
    $qSearchBtn.on('click', function() {
      var serviceId = $("#importDatabaseLpbLayersSelect").val();
      $qSearchBtn.text('查询中 ...');
      $.each(_queryConfig.layers, function(i, n) {
        if (serviceId == (n.serviceId + "-" + n.layerIndex)) {
          var outFields = [];
          var outFieldsStr = "";
          var where = '';
          $.each(n.returnFields, function(i1, n1) {
            outFields.push(n1.name);
            if (i1 == n.returnFields.length - 1)
              outFieldsStr = outFieldsStr.concat(n1.name);
            else
              outFieldsStr = outFieldsStr.concat(n1.name).concat(",");
          });
          //从表单获取值组装where的条件
          var inputVal = $("#query-val")[0];
          var prefix = n.queryFields.prefix;
          var operator = ' LIKE ';
          var fieldName = $("#queryFields").find("option:selected").attr("name");
          //获取输入框输入的条件组成sql条件
          if (inputVal.nodeName.toLowerCase() == 'input' || inputVal.nodeName.toLowerCase() == 'select') {
            $.each(n.queryFields.fields, function(index1, field) {
              if (fieldName == field.name) {
                operator = field.operator;
                return false;
              }
            });
            if (inputVal.value != undefined && inputVal.value != '') {
              if (where.length > 0 && index < $("#importDatabaseLpbLayerForm :input").length) {

              }
              where += " " + fieldName + " " + operator + " '" + prefix + inputVal.value + prefix + "'";
            }
          };
          //单独组织日期条件
          for (var i in dateCondition) {
            if (i) {
              if (dateCondition[i].start) {
                if (where.length > 0) {
                  where += ' AND ';
                }
                where += "to_date('" + dateCondition[i].start + "','yyyy-mm-dd')" + " < " + i;
              }
              if (dateCondition[i].end) {
                if (where.length > 0) {
                  where += ' AND ';
                }
                where += i + " < " + "to_date('" + dateCondition[i].end + "','yyyy-mm-dd')";
              }
            }
          }
          if (where.length == 0) {
            where = null;
            $qSearchBtn.html('<i class="iconfont">&#xe602;</i>查询');
            return false;
          }

          console.info(where);
          var data = {
            layerUrl: getLayerUrl(n.layerUrl),
            where: where,
            returnFields: outFieldsStr,
            page: 1,
            size: parseInt(($(window).height() - 280) / 110, 10)
          };
          $.ajax({
            url: "/omp/map/query",
            data: data,
            success: function(r) {
              parseQueryResult(r);
              showPageTool("pageTool", r.totalPages, r.number, data); //使用分页
            }
          });
          where = null;
          return false;
        }
      });
    });
    //清空重置监听
    $("#importDatabaseLpbResetBtn").on('click', function() {
      var _selItem = $lyrSelector.val();
      $("#importDatabaseLpbLayerForm")[0].reset();
      $lyrSelector.val(_selItem);
      dateCondition = {};
      rangeCondition = {};
    });
  }

  /***
   * 改变当前查询图层
   * @param sid
   */
  function changeActiveLayer(sid) {
    showFooter = false;
    $.each(_queryConfig.layers, function(index, layer) {
      var tid = layer.serviceId + "-" + layer.layerIndex;
      if (sid === tid) {
        if (layer.hasOwnProperty("showFooter")) showFooter = layer.showFooter;
        for (var i in layer.queryFields.fields) {
          var field = layer.queryFields.fields[i];
          if (field.hasOwnProperty("defaultValue")) {
            //支持key-val 数组或 'xx,yy,zz'
            var dv = field.defaultValue;
            if (typeof dv === 'string') {
              var arr = field.defaultValue.split(",");
              if (arr.length > 1) {
                field.isArray = field.hasOwnProperty("range") ? false : true;
                if (field.hasOwnProperty("range")) {
                  if (!rangeCondition[field.name]) {
                    rangeCondition[field.name] = {};
                  }
                  rangeCondition[field.name].from = arr[0];
                  rangeCondition[field.name].to = arr[arr.length - 1];
                }
                field.defaultValue = arrayUtil.map(arr, function(item) {
                  return {
                    key: item,
                    value: item
                  };
                });
              }
            } else if (lang.isArray(dv)) {
              field.isArray = field.hasOwnProperty("range") ? false : true;
            }
          }
        }
        $("#importDatabaseLpbLayerCondition").empty();
        $("#importDatabaseLpbLayerCondition").append(renderTpl($("#importDatabaseLpbSearchTpl").html(), {
          fields: layer.queryFields.fields
        }));
        return false;
      }
    });
  }

  /***
   * 空间查询handler
   * @param evt
   */
  function spatialClickHandler(type) {
    if (drawTool != undefined) drawTool.deactivate();
    if (drawHandler != undefined) drawHandler.remove();
    drawTool = drawTool ? drawTool : new Draw(_map);
    drawHandler = on(drawTool, "draw-end", lang.hitch(this, doSpatialQuery));
    switch (type) {
      case "point":
        drawTool.activate(Draw.POINT);
        break;
      case "polyline":
        drawTool.activate(Draw.POLYLINE);
        break;
      case "rect":
        drawTool.activate(Draw.EXTENT);
        break;
      case "polygon":
        drawTool.activate(Draw.POLYGON);
        break;
      default:
        console.error(type + " is unsupported yet!");
        break;
    }
  }

  /***
   * 执行空间查询
   * @param evt
   */
  function doSpatialQuery(evt) {
    drawHandler.remove();
    drawTool.deactivate();
    //获取选择的图层id
    var serviceId = $('#importDatabaseLpbLayersSelect').val();
    $.each(_queryConfig.layers, function(i, n) {
      if (serviceId == n.serviceId) {
        var outFields = [];
        var outFieldsStr = "";
        $.each(n.returnFields, function(i1, n1) {
          outFields.push(n1.name);
          if (i1 == n.returnFields.length - 1)
            outFieldsStr = outFieldsStr.concat(n1.name);
          else
            outFieldsStr = outFieldsStr.concat(n1.name).concat(",");
        });
        var where = "1=1";
        var geometry = JSON.stringify(evt.geometry);
        var data = {
          layerUrl: getLayerUrl(n.layerUrl),
          where: where,
          geometry: geometry,
          returnFields: outFieldsStr,
          page: 1,
          size: parseInt(($(window).height() - 280) / 65, 10)
        };
        //和信息查询属性查询保持一致，利用后台进行分页
        $.ajax({
          url: "/omp/map/query",
          data: data,
          success: function(r) {
            parseQueryResult(r);
            showPageTool("pageTool", r.totalPages, r.number, data); //使用分页
          }
        });
      }
    });
  }

  /**
   *  图层查询后回调函数处理结果
   */
  function parseQueryResult(r) {
    $qSearchBtn.html('<i class="iconfont">&#xe602;</i>查询');
    if (r.hasOwnProperty("success")) {
      layer.open({
        icon: 0,
        title: '提示',
        content: r.msg
      });
      return;
    }
    var rp = {};
    var totalSize = 0;
    if (r.hasOwnProperty("content")) {
      if (r.totalElements == 0) {
        layer.msg('未查询到结果');
        return;
      }
      rp.features = r.content;
      totalSize = r.totalElements;
    } else {
      rp = r;
      totalSize = rp.features.length;
    }
    if (rp == undefined || rp.features == undefined) {
      layer.msg("查询结果为空！");
    } else {
      var attrs = []; //存放要进行展示的属性集合
      var layerObj = null; //选定的图层对象
      $.each(_queryConfig.layers, function(n, layerItem) {
        if ($lyrSelector.val() == (layerItem.serviceId + "-" + layerItem.layerIndex)) {
          layerObj = layerItem;
          var tf = layerItem.titleField;
          var sf = getSubTitleField(layerItem);
          var rf = layerItem.returnFields;
          $.each(rp.features, function(i, feature) {
            for (var j in rf) {
              if (rf[j].type == "DATE" && feature.attributes[rf[j].name]) {
                feature.attributes[rf[j].name] = new Date(feature.attributes[rf[j].name]).toLocaleString();
              }
            }
            var titleText = esriLang.substitute({
              alias: tf.alias,
              value: feature.attributes[tf.name] || '空'
            }, '${alias}:${value}');
            var subTitleText1 = sf.hasOwnProperty('title1') ? esriLang.substitute({
              alias: sf.title1.alias || '空',
              value: feature.attributes[sf.title1.name] || '空'
            }, '${alias}:${value}') : '';
            var subTitleText2 = sf.hasOwnProperty('title2') ? esriLang.substitute({
              alias: sf.title2.alias || '空',
              value: feature.attributes[sf.title2.name] || '空'
            }, '${alias}:${value}') : '';
            var subTitleText3 = sf.hasOwnProperty('title3') ? esriLang.substitute({
              alias: sf.title3.alias || '空',
              value: feature.attributes[sf.title3.name] || '空'
            }, '${alias}:${value}') : '';
            var subTitleText4 = sf.hasOwnProperty('title4') ? esriLang.substitute({
              alias: sf.title4.alias || '空',
              value: feature.attributes[sf.title4.name] || '空'
            }, '${alias}:${value}') : '';
            var g = rp.features[i];
            var graphic = new Graphic(g);
            attrs.push({
              title: titleText,
              subtitle1: subTitleText1,
              subtitle2: subTitleText2,
              subtitle3: subTitleText3,
              subtitle4: subTitleText4,
              graphic: graphic,
              viewname: "查看",
              importname: "导入"
            });
          });
        }
      });
      //切换面板状态 隐藏查询面板
      changeState(STATE_RESULT);
      //渲染模板显示结果
      var tpl = $("#importDatabaseLpbResultTpl").html();
      $qResultPanel.empty();
      $qResultPanel.append(Mustache.render(tpl, {
        result: attrs,
        size: totalSize
      }));
      console.log($("#queryFields").val());
      if ($("#queryFields").val() === "地籍号") {
        var listDataRendererZd = new ListDataRenderer({
          renderTo: $('#importDatabaseLpb_result'),
          type: "zdLpbImport",
          map: map.map(),
          renderData: attrs
        });
        listDataRendererZd.on('boxDbClick', function(data) {
          doLocation(data.graphic, layerObj);
        });
        listDataRendererZd.on('importClick', function(data) {
          // console.log($("#importDatabaseLpbLxSelect").val());
          var lpbLx = $("#importDatabaseLpbLxSelect").val();
          switch (lpbLx) {
            case "ycLpb":
              ImportYcClick(data, layerObj);
              break;
            case "scLpb":
              ImportScClick(data, layerObj);
              break;
            default:
          }

        });
        listDataRendererZd.render();
      } else {
        var listDataRendererFw = new ListDataRenderer({
          renderTo: $('#importDatabaseLpb_result'),
          type: "fwLpbImport",
          map: map.map(),
          renderData: attrs
        });
        listDataRendererFw.on('boxDbClick', function(data) {
          doLocation(data.graphic, layerObj);
        });
        listDataRendererFw.on('importClick', function(data) {
          // console.log($("#importDatabaseLpbLxSelect").val());
          var lpbLx = $("#importDatabaseLpbLxSelect").val();
          switch (lpbLx) {
            case "ycLpb":
              ImportYcClick(data, layerObj);
              break;
            case "scLpb":
              ImportScClick(data, layerObj);
              break;
            default:
          }

        });
        listDataRendererFw.render();
      }

      //结果界面可滚动
      var scrollHeight = $(window).height() - 220;
      $("#buildingtable_result").slimScroll({
        height: scrollHeight,
        railVisible: true,
        railColor: '#333',
        railOpacity: .2,
        railDraggable: true
      });
      //返回查询界面
      $("#importDatabaseLpbReturnBtn").on('click', lang.hitch(this, changeState, STATE_QUERY));
      var returnbtn = $("#importDatabaseLpbReturnBtn");
    }
  }


  

  function ImportYcClick(data, layerobject) {
    console.log(data);
    var uid = data.uid;
    var importYcLpbUrl;
    var fwlx = $("#"+uid).val();
    var cxzd = $("#queryFields").val();
    var checkRequired = validateRequired(uid);
    if (checkRequired) {
      if (cxzd === "地籍号") {
        importYcLpbUrl = _queryConfig.interfaceHost + _queryConfig.importDatabaseYcLpbAddress + '?djh=' + data.title.slice(4) + '&tclx=' + 'ZD';
      } else {
        importYcLpbUrl = _queryConfig.interfaceHost + _queryConfig.importDatabaseYcLpbAddress + '?djh=' + data.subtitle2.slice(5) + '&zrzh=' + data.subtitle3.slice(5) + '&tclx=' + 'FW' + '&objectid=' + data.subtitle4.slice(9) + '&fwlx=' + fwlx;
      }
      layer.open({
        type: 2,
        title: '房产数据库预测楼盘表导入',
        maxmin: true,
        shadeClose: false, //点击遮罩关闭层
        area: ['960px', '520px'],
        content: importYcLpbUrl
      });
    } 
  }


  function ImportScClick(data, layerobject) {
    console.log(data);
    var uid = data.uid;
    var importScLpbUrl;
    var fwlx = $("#"+uid).val();
    var cxzd = $("#queryFields").val();
    var checkRequired = validateRequired(uid);
    if (checkRequired) {
      if (cxzd === "地籍号") {
        importScLpbUrl = _queryConfig.interfaceHost + _queryConfig.importDatabaseScLpbAddress + '?djh=' + data.title.slice(4) + '&tclx=' + 'ZD';
      } else {
        importScLpbUrl = _queryConfig.interfaceHost + _queryConfig.importDatabaseScLpbAddress + '?djh=' + data.subtitle2.slice(5) + '&zrzh=' + data.subtitle3.slice(5) + '&tclx=' + 'FW' + '&objectid=' + data.subtitle4.slice(9) + '&fwlx=' + fwlx;
      }
      layer.open({
        type: 2,
        title: '房产数据库实测楼盘表导入',
        maxmin: true,
        shadeClose: false, //点击遮罩关闭层
        area: ['960px', '520px'],
        content: importScLpbUrl
      });
    }
  }

  function validateRequired(uid) {
    var value = $("#" + uid).val();
    if (value === null || value === "") {
      layer.confirm("请选择房屋类型");
      return false
    } else {
      return true
    }
  }
  


  /**
   * 设置二级标题字段
   * 选取非标题字段的第一个字段
   * @param lyr
   */
  function getSubTitleField(lyr) {
    var tf = lyr.titleField;
    var rf = lyr.returnFields;
    var subtitles = {};
    for (var i = 0, l = rf.length; i < l; i++) {
      var item = rf[i];
      if (esriLang.isDefined(item) && item.name != tf.name) {
        if (!subtitles.hasOwnProperty("title1")) {
          subtitles.title1 = item;
          continue;
        }
        if (!subtitles.hasOwnProperty("title2")) {
          subtitles.title2 = item;
          continue;
        }
        if (!subtitles.hasOwnProperty("title3")) {
          subtitles.title3 = item;
          continue;
        }
        if (!subtitles.hasOwnProperty("title4")) {
          subtitles.title4 = item;
          return subtitles;
        }
      }
    }
    return subtitles;
  }

  /***
   * 处理图层url
   * @param lyrUrl
   * @returns {string}
   */
  function getLayerUrl(lyrUrl) {
    var sr = _map.spatialReference.wkid;
    var realUrl;
    if (lyrUrl.startWith("http://")) {
      realUrl = sr != undefined ? lyrUrl.concat("/query").concat("?outSR=" + sr) : lyrUrl.concat("/query");
    } else {
      realUrl = sr != undefined ? lyrUrl.replace("/oms", omsUrl).concat("/query").concat("?outSR=" + sr) : lyrUrl.replace("/oms", omsUrl).concat("/query");
    }
    return encodeURI(realUrl);
  }

  /***
   * 定位图形
   * @param g
   */
  function doLocation(g, lyr) {
    var geo = g.geometry;
    var geoType = geo.type;
    var geoCenter;
    switch (geoType) {
      case 'point':
        geoCenter = geo;
        break;
      case 'polyline':
      case 'polygon':
        geoCenter = geo.getExtent().getCenter();
        break;
    }
    geoCenter = lang.mixin(geoCenter, {
      spatialReference: _map.spatialReference
    });
    var graphic = new Graphic(lang.mixin(geo, {
      spatialReference: _map.spatialReference
    }));
    graphic.setAttributes(g.attributes);
    MapUtils.setMap(map.map());
    MapUtils.highlightFeatures([graphic], false);
    if (popUpStyle == POPUP_OPTION_INFO) {
      if (mapPopup.isShowing) mapPopup.closePopup();
      mapPopup.setData(g.attributes);
      mapPopup.setTitleField(lyr.titleField.name);
      mapPopup.setFields(lyr.returnFields);
      mapPopup.setLink(lyr.link);
      mapPopup.openPopup(geoCenter).then(function() {
        if (geoType == 'point')
          MapUtils.locatePoint(graphic);
        else
          MapUtils.locateFeatures([graphic]);
      });
    } else if (popUpStyle == POPUP_OPTION_MODAL) {

      var x = (_map.position.x + 20) + 'px';
      layer.open({
        title: lyr.layerName,
        area: '300px',
        content: getInfoContent(graphic, lyr.returnFields),
        shade: 0,
        btn: [],
        offset: ['140px', x]
      });
      MapUtils.locateFeatures([graphic]);
    }


  }


  /**
   *
   * @param graphic
   * @param returnFields
   * @returns {*}
   */
  function getInfoContent(graphic, returnFields) {

    var data = [];
    var tmpl = $("#importDatabaseLpbInfoContentTpl").html();
    var showData = graphic.attributes;
    for (var i in showData) {
      for (var j = 0; j < returnFields.length; j++) {
        if (i.equalsIgnoreCase(returnFields[j].name)) {
          data.push({
            key: returnFields[j].alias,
            value: showData[i]
          });
        }
      }
    }
    return Mustache.render(tmpl, {
      data: data
    });
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
        $spatialQueryPanel.show();
        if (mapPopup.isShowing) mapPopup.closePopup();
        _map.graphics.clear();
        break;
      case STATE_RESULT:
        $attrQueryPanel.hide();
        $spatialQueryPanel.hide();
        break;
    }
  }

  /***
   * 显示分页工具
   * @param selector
   * @param pageCount
   * @param currPage
   * @param callback
   */
  function showPageTool(selector, pageCount, currPage, data) {
    if (typeof selector === "string")
      selector = $("#" + selector);
    selector.show();
    laypage({
      cont: selector,
      pages: pageCount,
      groups: 3,
      curr: currPage,
      skip: false,
      skin: '#428BCA',
      first: 1,
      last: pageCount,
      prev: false,
      next: false,
      jump: function(obj, first) {
        if (!first) {
          data.page = obj.curr;
          $.ajax({
            url: "/omp/map/query",
            data: data,
            success: function(r) {
              parseQueryResult(r);
              showPageTool("pageTool", r.totalPages, r.number, data);
            }
          });
        }
      }
    });
  }

  /***
   *
   * @param tpl
   * @param data
   * @returns {*}
   */
  function renderTpl(tpl, data) {
    var templ = Handlebars.compile(tpl);
    return templ(data);
  }

  return query;
});
