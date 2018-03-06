/**
 * Created by zhuyuheng on 2017/4/18.
 */
var hostAddress = 'http://' + window.location.host;
// var hostAddress = 'http://192.168.50.169:8083';
var path;
$(function() {
  // var path='http://192.168.200.200/estateplat-cadastre/lpbDr/impLpbXls';
  // path = 'http://192.168.50.121:8083/estateplat-cadastre/lpb/impLpbExcel';
  path = hostAddress + '/estateplat-cadastre/lpb/impLpbExcel';
  var ljzMc = getQueryString("ljzmc").slice(5);
  var djh = getQueryString("djh").slice(5);
  $('#submitForm').attr('action', path);
  console.log(djh);
  console.log(ljzMc);
  $('#ljzmc').html(ljzMc);
  $('#resPage').on('load', function() {
    var returnUrl = $(this)[0].contentWindow.location.href;
    var returncode = returnUrl.match(/returncode=(\S*)/)[1].slice(0, 4);
    console.log(returncode);
    if (returncode === 'true') {
      showResponse();
    } else {
      // parent.layer.closeAll('loading');
      parent.layer.msg("导入实测楼盘表失败！");
    }

  })

  $(document).on("click", "#btnAdd", function() {
    $('#addBody').append(
      "<tr>" +
      "<td>" + ljzMc + "</td>" +
      "<td><input type='file' name='myfile' style='float: left' /></td>" +
      "<td><input type='button' value='删除' onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)' ></td>" +
      "</tr>"
    );

    $(':file').last().click();
  });
  // ------------------普通form提交----------------------------
  // var returnmsg = getQueryString("returnmsg");
  // if (returnmsg !== '') {
  //   var returncode = returnmsg.match(/=(\S*),/)[1];
  //   // // console.log(resUrl);
  //   console.log(returnmsg);
  //   console.log(returncode);
  //   if (returncode === 'true') {
  //     // parent.layer.msg("上传成功");
  //     console.log("上传成功");
  //     showResponse();
  //   } else {
  //     parent.layer.closeAll('loading');
  //     parent.layer.msg("文件上传失败！");
  //   }
  // }

  // ajaxSubmit
  // -----------------------------------------------------------
  var options = {
    // target: "resPage", //把服务器返回的内容放入name为resPage的元素中
    data: {
      "djh": djh
    },
    // async: false,
    beforeSubmit: showRequest, //提交前的回调函数
    // success: function(res) {
    //   console.log(res);
    //   if (res.returncode === 'true') {
    //     showResponse();
    //   } else {
    //     layer.msg("文件上传失败！");
    //   }
    // }, //提交成功后的回调函数
    // error: function(res) {
    //   console.log(res);
    //   layer.closeAll('loading');
    //   layer.msg("发生错误！");
    //   // showResponse();
    // },
    // complete: function(xhr) {
    //   console.log(xhr);
    //   console.log(xhr._url);
    //
    // }, //提交完成无论成功与否后的回调函数
    // url: url,           //默认是form的action，如果声明，则会覆盖
    // type: type, //默认是form的method，如果声明，则会覆盖
    // dataType: "json", //接受服务端返回的类型
    // contentType: "application/json; charset=utf-8",
    clearForm: true, //成功提交后，清除所有表单元素的值
    resetForm: true //成功提交后，重置所有表单元素的值
    // timeout: 10000 //限制请求的时间，当请求大于10秒后，跳出请求
  };

  $("#submitForm").submit(function() {
    $(this).ajaxSubmit(options);
    // return false; //防止表单自动提交
  });




})

function showRequest() {
  var r = confirm("是否导入当前文件！");
  if (r === true) {
    // layer.load(1, {
    //   shade: [0.5, '#000'] //0.5透明度的黑色背景
    // });
  } else {
    return false;
  }
}

function showResponse() {
  // parent.layer.closeAll('loading');
  parent.layer.msg('导入实测楼盘表成功！');
  // parent.layer.confirm('文件上传成功！页面将跳转到上传页。', {
  //   btn: ['确定'] //按钮
  // }, function() {
  //   location.href = "ImportScLpb.html"; //location.href实现客户端页面的跳转
  // });
}

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var url = decodeURI(window.location.search);
  var r = url.substr(1).match(reg);
  if (r != null) return (r[2]);
  return '';
}
