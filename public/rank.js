function getGames(cb) {
    $.get('/games',function(results){
        cb(results);
    });
}

function getTeams(cb) {
    $.get('/teams',function(results){
        cb(results);
    });
}

function getSum(){
    window.setTimeout(function(){
        var $total = $('.total');

        var total = 0;
        $('.score').each(function(i,s){
            var t = parseInt($(s).text(),10);
            if (!isNaN(t)) {
                total += t;
            }
        });

        $total.text(total);
    },200);            
}

function insert(url, payload,cb) {
    var method = "POST";
    $.ajax({
        'url': url,
        'method': method,
        'dataType': 'json',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'data': JSON.stringify(payload),
        'success': function (jqXHR, textStatus) {
            console.log(textStatus);
        },
        'error': function (jqXHR, textStatus) {
            console.error(textStatus);
        },
        'done':function(data, textStatus, jqXHR){
            if (cb) {
                cb(data, textStatus, jqXHR);
            }
        }
    });
}

var games,teams;
var days={};
var accounts = [];
for(var i=1;i<=12;i++) {
    accounts.push("No " + i);
}

$(function(){

    $('.accounts').each(function(i,s){
        var $s = $(s).empty().append($("<option>"));
        jQuery.each(accounts,function(j,a){
            $s.append($("<option>").text(a));
        });
    });

    //回合選擇
    $('#teamTimes').empty().append( $('<option>') );
    for(var i=1;i<=3;i++) {
        $('#teamTimes').append( $('<option>').text("Round " + i) );
    }

    getGames(function(data){
        games = data;               
        
        jQuery.each(games,function(i,d){
            var time=new Date(d.time);
            var dateFmt = moment(time).format("YYYY/MM/DD");     
            if (!days.hasOwnProperty(dateFmt) ) {
                days[dateFmt] = [];
            }
            days[dateFmt].push(d.id);
        });
        
        //日期
        $('#gameDate').empty().append($('<option/>'));
        jQuery.each(Object.keys(days),function(i,d){
            $('#gameDate').append($('<option>').text(d));
        });
    });

    getTeams(function(data){
        teams = data;
    });

    //日期 -> 連動場次
    $('#gameDate').on('change',function(){
        var dateFmt = $(this).val();
        var $gameTime = $('#gameTime').empty().append($('<option/>'));
        jQuery.each(days[dateFmt],function(i,gameid){
            var _games = games.filter(function(g){
                return g.id === gameid;
            });
            if (_games.length > 0) {
                var opt = $('<option>');
                opt.val(_games[0].id);
                opt.text(moment(new Date(_games[0].time)).format("HH:mm") + " " + _games[0].id);
                opt.appendTo($gameTime);
            }
            
        });
    });
    
    //場次 -> 連動隊伍
    $('#gameTime').on('change',function(){
        var gameid = $(this).val();
        var gameDatas = games.filter(function(g){
            return g.id === gameid;
        });
        if (gameDatas.length == 1) {
            $('#teamNames').empty().append($('<option/>'));
            jQuery.each(gameDatas[0].team,function(i,team){
                $('#teamNames').append($('<option>').text(team));
            })
        }
    });
    
    //隊伍 -> 連動顯示內容
    $('#teamNames').on('change',function(){
        $('.kill').text(0);//歸零
        $('.score').text(0);//歸零

        var teamName = $(this).val();
        var findTeams = teams.filter(function(t){
            return t.name === teamName;
        });

        if (findTeams.length == 1) {
            var team = findTeams[0];
            var isFemale = false;
            var isManager= false;
            $('.user').each(function(i,u){
                var user = $(u);
                user.data("user",user) ;
                user.find('.name').text( team.user[i].name);
                user.find('.gender').text( team.user[i].gender);
                user.find('.manager').text( team.user[i].manager);
                user.find('.manager').data( "role",team.user[i].role);

                if(!isFemale && team.user[i].gender === "F") {
                    isFemale = true;
                }
                if(!isManager && team.user[i].manager === "Y") {
                    isManager = true;
                }                        
            });
            if (isFemale) {
                $('.isFemale').text("10");
            }

            if (isManager) {
                $('.isManager').text("5");
            }

            getSum();
        }

        

    });
    
    //隊伍排名
    $('#teamRank').on('change',function(){
        $('.teamScore').text($(this).val());
    });
    
    //是否有女性生存
    $('#checkFemaleSurvive').on('change',function(){
        if ($(this).prop("checked")) {
            $('.isFemaleSurvive').text(20);
        } else {
            $('.isFemaleSurvive').text(0);
        }       
    });            
    
    //擊殺數量
    $('.up,.down').on('click',function(){
        var self = $(this);
        var ki = self.parent().parent().find('.kill');
        
        if (ki.length > 0) {
            var count = parseInt(ki.text(),10);
            if (isNaN(count)) {
                count = 0;
            }
            
            var totalKill = 0;
            $('.kill').each(function(i,k){
                var kk = parseInt($(k).text(),10);
                if (!isNaN(kk)) {
                    totalKill += kk;
                }
            })
            if (self.hasClass('up') &&  count < 11 && totalKill < 11){
                count += 1;
            } else if (self.hasClass('down') && count > 0){
                count -= 1;
            }
            
            ki.text(count);   
            
            var hit= self.parent().parent().find('.hit');
            if (hit.length > 0) {
                hit.text(count*7);   
            }
        }
    });
    
    //自動計分
    $('.sum').on('click change',function(){
        getSum();
    });
    
    $('#start').on('click',function(){
        $('.fn').attr('disabled','disabled');
        $('.fn1').attr('disabled','disabled');
        $('.fn2').removeAttr('disabled');
    });

    $('#stwichTeam').on('click',function(){
        $('.fn').removeAttr('disabled');
        $('.fn1').removeAttr('disabled');
        $('.fn2').attr('disabled','disabled');
    });

    $('#saveData').on('click',function(){
        var payload = {};
        payload.user = [];
        
        payload.gameDate = $('#gameDate').val();
        payload.gameId = $('#gameTime').val();
        payload.teamName = $('#teamNames').val();
        payload.teamTimes = $('#teamTimes').val();
        payload.isFemaleSurvive = $('#checkFemaleSurvive').is(":checked");
        payload.teamRank = parseInt($('#teamRank option:checked').text(),10);

        payload.kill = 0;
        $('.user').each(function(i,tr){
            var row = $(tr);
            var user = {};
            user.isCheck = $('.isCheck').is(":checked");
            user.kill = parseInt(row.find('.kill').text(),10);
            user.name = row.find('.name').text();
            user.gender = row.find('.gender').text();
            user.manager = row.find('.manager').text();

            payload.kill += user.kill;

            payload.user.push(user);
        });

        payload.score_kill = payload.kill * 7;
        payload.score_Female = parseInt($('.isFemale').text(),10);
        payload.score_Manager = parseInt($('.isManager').text(),10);
        payload.score_teamRank = parseInt($('.teamScore').text(),10);
        payload.score_femaleSurvive = parseInt($('.isFemaleSurvive').text(),10);
        payload.score_total = parseInt($('.total').text(),10);

        console.log(payload);
        insert("/results",payload,function(data, textStatus){
            console.log(arguments);
        });

    });
});
