/**
 * Created by zhuyuheng on 2017/4/17.
 */
function DoRender(url,requestData) {
    $(function () {
        requestData.page=1;
        requestData.pagesize=parseInt((($(window).height()-20)/$("tr").height()),10) ,
        $.ajax({
            url:url,
            data:requestData,
            dataType:'jsonp',
            jsonp:'callback',
            success:function (data) {
                RenderTpl(data);
                showPageTool("pageTool",data,requestData,url);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.info(XMLHttpRequest.readyState);
                console.info(errorThrown);
                alert(textStatus);
            },
        });
    })
}

function RenderTpl(data) {
    var tpl= $("#rowsTpl").html();
    var temptpl=Handlebars.compile(tpl);
    var html= temptpl(data);
    var $tbody= $("#tableBody");
    $tbody.empty();
    $tbody.html(html);
}

function showPageTool(selector,responseHead,requireData,url) {
    if (typeof selector === "string")
        selector = $("#" + selector);
    selector.show();
    laypage({
        cont: selector,
        pages: responseHead.total,
        groups: 3,
        curr: responseHead.page,
        skip: false,
        skin: '#428BCA',
        first: 1,
        last: responseHead.total,
        prev: "<",
        next: ">",
        jump: function (obj, first) {
            if (!first) {
                requireData.page = obj.curr;
                $.ajax({
                    url:url,
                    type:"GET",
                    data:requireData,
                    dataType:'jsonp',
                    jsonp:"callback",
                    success: function (r) {
                        RenderTpl(r);
                        showPageTool("pageTool",r, requireData,url);
                    }
                });
            }
        }
    });
}
