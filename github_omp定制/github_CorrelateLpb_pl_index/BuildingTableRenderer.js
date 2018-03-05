/*!
 * 楼盘表列表数据渲染器 用于渲染前端列表数据
 * 用法:
 * >>>>实例化: 使用 new ListDataRenderer(option)并传递相应的参数
 *  >>>>renderTo:dom对象或jq对象或id名称
 *  >>>>renderData:要进行渲染的json数据
 * >>>>进行渲染:
 * >>>> var listDataRenderer=new ListDataRenderer({renderTo:$listContainer,renderData:[{title:'标题',subtitle:'副标题'}],type:'io'});
 * >>>> listDataRenderer.render();
 */
define(["dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/json",
    "dojox/uuid/generateRandomUuid",
    "handlebars",
    "map/utils/MapUtils",
    "esri/graphic",
    "esri/lang"], function (Evented, declare, lang, arrayUtil, dojoJSON, generateRandomUuid, Handlebars, MapUtils, Graphic, esriLang) {

        var _noData, _type;
        //定位事件
        var LIST_EVENT_LOC = "location";

        var noDataTpl = '<span class="text-muted pull-left no-data">{{desc}}</span>';

        //基础模板
        var baseTpl = '<div class="info-box">' +
            '<div class="info-box-content">' +
            '<span class="info-box-title text-primary">{{title}}</span>' +
            '<span class="info-box-subtitle">{{subtitle}}{{#blankData subtitle}}{{/blankData}}</span>' +
            '</div></div>';

        //定位模板
        var locTpl = '<div class="info-box">' +
            '<div class="info-box-opt">' +
            '<span class="iconfont text-primary info-box-btn-loc" title="定位" data-uid="{{uid}}">&#xe634;</span>' +
            '</div>' +
            '<div class="info-box-content">' +
            '<span class="info-box-title text-primary">{{title}}</span>' +
            '<span class="info-box-subtitle">{{subtitle}}{{#blankData subtitle}}{{/blankData}}</span>' +
            '</div></div>';

        //楼盘表关联模板
        var lpbRelateTpl = '<div class="info-box" data-uid="{{uid}}">' +
                '<div>'+
                '<span class="info-box-rightlink text-primary" data-uid="{{uid}}">{{linkname}}</span>'+
                '</div>'+
            '<div class="info-box-content" data-uid="{{uid}}">' +
            '<span class="info-box-title text-primary">{{title}}</span>' +
            '<span class="info-box-subtitle">{{subtitle1}}{{#blankData subtitle1}}{{/blankData}}</span>' +
            '<span class="info-box-subtitle">{{subtitle2}}{{#blankData subtitle2}}{{/blankData}}</span>' +
            '</div></div>';

        //楼盘表导入模板
        var lpbImportTpl = '<div class="info-box" data-uid="{{uid}}">' +
            '<div>'+
            '<span class="info-box-view text-primary" data-uid="{{uid}}">{{viewname}}</span>'+
            '<span class="info-box-import text-primary" data-uid="{{uid}}">{{importname}}</span>'+
            '</div>'+
            '<div class="info-box-content" data-uid="{{uid}}">' +
            '<span class="info-box-title text-primary">{{title}}</span>' +
            '<span class="info-box-subtitle">{{subtitle1}}{{#blankData subtitle1}}{{/blankData}}</span>' +
            '<span class="info-box-subtitle">{{subtitle2}}{{#blankData subtitle2}}{{/blankData}}</span>' +
            '</div></div>';
    

        var $container, _cacheData = [], _activeData = [];

        var me = declare([Evented], {

            /**
             * 渲染目标节点
             * jq/dom/string
             */
            renderTo: undefined,

            /***
             * 渲染的数据
             * json
             */
            renderData: undefined,
            /***
             * 模板类型
             * basic ---基本模板
             * analysis---分析列表模板
             * loc----属性识别/信息查询模板
             * io-----导入导出
             */
            type: 'basic',
            /***
             *
             */
            noData: '无数据',
            /***
             *
             */
            map: undefined,

            constructor: function (option) {
                lang.mixin(this, option);
                _noData = this.noData;
                _type = this.type;
                MapUtils.setMap(this.map);
                Handlebars.registerHelper('blankData', function (context, options) {
                    if (context === undefined || context === "")
                        return new Handlebars.SafeString("<small class='text-muted'>空</small>");
                });
            },
            /***
             * 渲染数据
             * @param data
             */
            render: function (rd) {
                if (esriLang.isDefined(rd)) this.renderData = rd;
                var renderTo = this.renderTo;
                var data = this.renderData;
                if (esriLang.isDefined(renderTo)) {
                    $container = getContainer(renderTo);
                    if (data === '' || !esriLang.isDefined(data)) {
                        $container.append(renderTpl(noDataTpl, { desc: _noData }));
                    } else {
                        if (lang.isString(data)) {
                            data = dojoJSON.parse(data);
                        }
                        if (lang.isArray(data)) {
                            $.each(data, lang.hitch(this, this._renderItem));
                        }
                    }
                } else
                    console.error("Property renderTo cannot be undefined!");
                //监听按钮事件

                $(".info-box").on('dblclick',lang.hitch(this,this._eventListeners,'boxDbClick'));
                $(".info-box-rightlink").on('click',lang.hitch(this,this._eventListeners,'rightLinkClick'));
                $(".info-box-view").on('click',lang.hitch(this,this._eventListeners,'viewClick'));
                $(".info-box-import").on('click',lang.hitch(this,this._eventListeners,'importClick'));
                selectionListener();
            },
            /***
             * 获取已经选中的列表数据(针对有状态的数据)
             */
            getActiveData: function () {
                return _activeData;
            },
            /***
             * 渲染单个项目
             * @param item
             * @private
             */
            _renderItem: function (idx, item) {
                //渲染数据列表
                if (esriLang.isDefined(item)) {
                    if (!item.hasOwnProperty("id")) {
                        item.uid = generateRandomUuid();
                    }
                    _cacheData.push(item);
                    _activeData.push(item);//默认"选中"状态
                    $container.append(renderTpl(item));
                }
            },
            /***
             * 发布事件监听
             * @private
             */
            _eventListeners: function (evtType, evt) {
                var uid = $(evt.currentTarget).data("uid");
                var tmp = arrayUtil.filter(_cacheData, function (item) {
                    return item.uid === uid;
                });
                if (tmp.length > 0) {
                    switch (evtType) {
                        case 'location':
                            this.emit(LIST_EVENT_LOC, tmp[0]);
                            break;
                        case 'boxDbClick':
                            this.emit('boxDbClick',tmp[0]);
                            break;
                        case 'rightLinkClick':
                            this.emit('rightLinkClick',tmp[0]);
                            break;
                        case 'viewClick':
                            this.emit('viewClick',tmp[0]);
                            break;
                        case 'importClick':
                            this.emit('importClick',tmp[0]);
                            break;
                    }
                }
            }
        });
        /**
         * 监听选中切换按钮
         */
        function selectionListener() {
            $(".info-box-btn-sel").on('click', function () {
                var $this = $(this);
                var uid = $this.data("uid");
                var isActive = $this.hasClass("active");
                if (isActive) {
                    $this.removeClass("active");
                    $this.empty();
                    $this.html("&#xe60c;");
                    arrayUtil.forEach(_activeData, function (item) {
                        if (esriLang.isDefined(item) && item.hasOwnProperty("uid") && uid === item.uid) {
                            _activeData.splice(i, 1);
                            return;
                        }
                    });
                } else {
                    $this.addClass("active");
                    $this.empty();
                    $this.html("&#xe61c;");
                    arrayUtil.forEach(_cacheData, function (item) {
                        if (esriLang.isDefined(item) && item.hasOwnProperty("uid") && uid === item.uid) {
                            _activeData.push(item);
                            return;
                        }
                    });
                }
            });
        }

        /***
         * render tpl with handlebars
         * @param source   render tpl
         * @param data     render data
         */
        function renderTpl(data) {
            var source = "";
            switch (_type) {
                case 'loc':
                    source = locTpl;
                    break;
                case 'basic':
                    source = baseTpl;
                    break;
                case 'boxloc':
                    source = lpbRelateTpl;
                    break;
                case 'scLpbImport':
                    source=lpbImportTpl;
            }
            var template = Handlebars.compile(source);
            return template(data);
        }

        /***
         * jq object
         * @param t
         * @returns {*}
         */
        function getContainer(t) {
            if (lang.isString(t)) {
                if (t.startWith('#')) return $(t);
                else return $('#' + t);
            } else if (t && typeof t === 'object' && t.nodeType === 1 && typeof t.nodeName === 'string') {
                return $(t);
            } else if (t instanceof Object) {
                return t;
            } else return undefined;
        }

        return me;
    });