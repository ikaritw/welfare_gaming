function getGateName() {
    var gate = Cookies.get('gate');
    if (typeof (gate) === "undefined") {
        gate = prompt("請輸入名稱", "");
        if (gate === null) {
            alert("名稱取得失敗");
        } else if (gate === "") {
            alert("名稱不得為空值");
        } else {
            Cookies.set('gate', gate);
        }
    }

    if (gate !== null && gate !== "") {
        $('.gate').text(gate).attr('data-logintime', new Date().toJSON());
        $('.row').removeClass('inactive');
    } else {
        //$('.row').addClass('inactive');
    }
    return gate;
}

function logout() {
    Cookies.remove('gate');
    location.replace("/");
}

// The download function takes a CSV string, the filename and mimeType as parameters
// Scroll/look down at the bottom of this snippet to see how download is called
function download(content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';

    if (navigator.msSaveBlob) { // IE10
        navigator.msSaveBlob(new Blob([content], {
            type: mimeType
        }), fileName);
    } else if (URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
}

function exportToCsv(filename, data) {
    // Building the CSV from the Data two-dimensional array
    // Each column is separated by ";" and new line "\n" for next row
    var csvContent = '';
    data.forEach(function (infoArray, index) {
        dataString = infoArray.join(',');
        csvContent += index < data.length ? dataString + '\r\n' : dataString;
    });
    download(csvContent, filename, 'text/csv;encoding:utf-8');
}

function log(obj) {
    if (window.console) {
        window.console.log(obj);
    }
}

function exportToXLSX(filename, data, sheetName) {
    /* original data */
    //var filename = moment(new Date()).format("YYYYMMDDhhmmss") + "_write";
    //var ext = document.getElementById("ext").value;
    var ext = 'xlsx';

    //var data = getData();
    //var header = ["checkintime", "name", "no", "id"];
    //var sheetName = "SheetJS";
    log(sheetName + " data.length:" + data.length);

    //log(new Date());
    var workbook = XLSX.utils.book_new();

    var worksheet = null;
    worksheet = XLSX.utils.aoa_to_sheet(data);
    /*
    worksheet = XLSX.utils.json_to_sheet(data, {
        header: header,
        skipHeader: false
    });
    */

    /* add worksheet to workbook */
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    /* write workbook */
    //log(new Date());
    XLSX.writeFile(workbook, filename + "." + ext);
    log("download:" + filename + "." + ext);
}

$(function () {
    var navv = [];
    navv.push('<div class="container-fluid">');
    navv.push('<div class="navbar-header">');
    navv.push('<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">');
    navv.push('<span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>');
    navv.push('</button>');
    navv.push('<a class="navbar-brand" href="/"><img src="/images/logo.png" style="width:24px" /></a>');
    navv.push('</div>');
    navv.push('<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">');
    navv.push('<ul class="nav navbar-nav">');
    navv.push('<li><a href="index.html">報到處</a></li>');

    //下拉開始
    navv.push('<li class="dropdown">');
    navv.push(' <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">資料維護<span class="caret"></span></a>');
    navv.push(' <ul class="dropdown-menu">');
    navv.push('  <li><a href="emps.html">員工維護</a></li>');
    navv.push('  <li><a href="signup.html">報名紀錄</a></li>');
    navv.push('  <li><a href="checkin.html">報到紀錄</a></li>');
    navv.push(' </ul>');
    navv.push('</li>');
    //下拉結束

    navv.push('<li><a href="report.html">報表</a></li>');
    navv.push('<li><a href="setting.html">設定</a></li>');

    if (navigator.userAgent.indexOf("Chrome/") == -1) {
        navv.push('<li><a href="install.html">下載Chrome</a></li>');
    }

    navv.push('</ul>');
    navv.push('<ul class="nav navbar-nav navbar-right">');
    navv.push('<li><a href="#" class="login"><span class="glyphicon glyphicon-user"></span><span class="gate"></span></a></li>');
    navv.push('<li><a href="#" class="logout"><span class="glyphicon glyphicon-log-out"></span>Logout</a></li>');
    navv.push('</ul>');
    navv.push('</div>');
    navv.push('</div>');
    $(navv.join("")).appendTo($('nav.navv'));

    //$('nav.navbar').remove('navbar-default').addClass('navbar-inverse');

    var paths = location.pathname.split("/");
    if (paths.length > 0) {
        var page = paths[paths.length - 1];
        if (page == "") {
            page = "index.html";
        }
        var act = $('a[href="' + page + '"]');
        if (act.length > 0) {
            $('.navbar-nav .active').removeClass('active');
            act.parent().addClass('active');
        }
    }

    getGateName();

    $('.logout').on('click', logout);
    $('.login').on('click', getGateName);
});