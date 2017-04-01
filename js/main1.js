//初始化
$(function(){
	/* 获取频道列表 */
	getChannel();
	/* 获取专辑列表 */
	getAlbums();
});

//获取频道列表
function getChannel() {
	var html = "";
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://api.jirengu.com/fm/getChannels.php",
		success: function(response) {
			var channels = response.channels; //取到的是一个数组，数组元素是对象
			//Math.floor 方法用于对数值向下取整，即得到小于或等于该数值的最大整数
			var num = Math.floor(Math.random()*channels.length); // num生成的刚好是数组的索引
			var channelname = channels[num].name;
			var channelID = channels[num].channel_id;
			$('.record').text("频道："+channelname);
			$('.record').attr('title', channelname);
			$('.record').attr('data-id', channelID);
			getMusic();// 获取歌曲
		}
	})
}

//获取歌曲
function getMusic() {
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://api.jirengu.com/fm/getSong.php",
		data: {'channel':$('.record').attr('data-id')},
		success: function(response) {
			var resource = response.song[0];
			var sid = resource.sid;
			var title = resource.title;
			var bgPic = resource.picture;
			var author = resource.artist;
			var url = resource.url;
			var lrc = resource.lrc;
			$('audio').attr('src',url);
			$('.musicname').text(title);
			$('.musicer').text("作者: "+author);
			$('.album').text("专辑编号: "+sid);
			$('.wrap-bg').css({
				'background':'url('+bgPic+')',
				'background-repeat':'no-repeat',
				'background-position':'center',
				'background-size':'cover',
			});
			play();//正式播放歌曲  
		}
	})
}

var myAudio = $('audio')[0]; //转为DOM对象

$('.btnPlay').on("click", function(){
	if (myAudio.paused) {
		play(); //播放音乐函数，自定义的
	}
	else {
		pause(); //暂停音乐函数，自定义的
	}
});

function play() {
	myAudio.play();
	//把播放按钮的样式移除，并且添加暂停按钮样式
	$('.wrap-control .btnPP').removeClass("fa-play").addClass("fa-pause");
}
function pause() {
	myAudio.pause();
	$('.wrap-control .btnPP').removeClass("fa-pause").addClass("fa-play");
}

$(".btnPN").on("click", function(){
	getMusic();
});

$(".btn-random").on("click", function(){
	getChannel();
});

//进度条
setInterval(present, 500);
$('.wrap-basebar').on("mousedown" ,function(e){
	var posX = e.clientX; //获取到鼠标指针在视口(客户区)中的水平坐标
	var targetLeft = $(this).offset().left; //获取到距离客户区的左距离
	var percentage = (posX-targetLeft)/400  ;
	myAudio.currentTime=myAudio.duration*percentage; //duration 获取媒体文件的总时长，以秒（s）为单位
});
function present() {
	var length = myAudio.currentTime/myAudio.duration * 100; //因为进度条总宽度400px，所以要乘以100倍数
	$('.progressbar').width(length+'%');
	if (myAudio.currentTime == myAudio.duration) { //如果歌曲播放完，则随机播放一首歌
		getMusic();
	}
}

/* 分享，喜欢，收藏icon改变 */
$('.fa-star').on("click", function(){
	$(this).toggleClass('stared');
});

$('.fa-heart').on("click", function(){
	$(this).toggleClass('loved');
});

/* 音量按钮切换 */
$('.volume-control').on("click", function(){
	$('.volume-control-progress').toggle("slow");
});

//设置音量、音量条初始值
myAudio.volume = 0.5; //将音频音量设置为50%
$('.volume-control-time-start').height(50+'%');
$('.volume-control-time-end').height(50+'%');
$('.volume-control-tag').offset().top = $('.volume-control-tag').offset().top + (50-$('.volume-control-tag').height()); //最后得到的值是38px;

$('.volume-control-progress').on("mousedown", function(e){

	e.stopImmediatePropagation();//函数用于阻止剩余的事件处理函数的执行，并防止当前事件在DOM树上冒泡。
	var volumeTagH = $('.volume-control-tag').height();  //12px 中间小圆点元素高度
	var posY = Math.ceil(e.clientY);
	var targetTop = Math.ceil($(this).offset().top);
	var height = $(this).height(); //整个音量条高度为100px;
	var percentage = (targetTop+height-posY); //就是得到volume-control-time-start音量条高度


	$('.volume-control-time-start').height(percentage+'%');
	$('.volume-control-time-end').height((height-percentage)+'%');
	 
	myAudio.volume = percentage/100;
	$(this).on("mouseleave", function(){
		$(this).hide('slow');
	});
});

$(".volume-control-progress").on("mouseup click",function(e){
		e.stopImmediatePropagation();
	})

//获取专辑列表
function getAlbums() {
	var html="";
	var albums;
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://api.jirengu.com/fm/getChannels.php",
		data: {'channel':$('.record').attr('data-id')},
		success: function(data) {
			     albums = data.channels; //取到的是一个数组，数组元素是对象
			 for (var i=0; i<albums.length; i++) {
			 	if (i == 0) {
			 		html = html +'<li class="music-item music-item-active" data-channel-id='+albums[i].channel_id+'>' +albums[i].name +'</li>';
			 	}
			 	else {
			 		html = html +'<li class="music-item" data-channel-id='+albums[i].channel_id+'>' +albums[i].name +'</li>';
			 	}
			 }
			 $('.music-menu').append(html);
		}
	})
}
//设置专辑列表效果,点击换频道，音乐专辑列表出现
$('.music-menu-icon').on("click", function(){
	$('.music-menu').animate({
		left:"0"
	}, 800);
});

//当鼠标离开专辑列表，专辑列表隐藏
$('.music-menu').on("mouseleave",function(){
	var leftX = -$(this).width();  //变成负值宽度 -150px；
	$(this).animate({
		left:leftX
	}, 800);
});

//设置频道： 点击列表li,切换到相应的频道
$('.music-menu').on("click", ".music-item", function(e){
	var $that = $(this);
	pause();
	var curChannel = $that.attr("data-channel-id"); //获取当前li 频道ID值
	var curChannelName = $that.text();  //获取频道名称
	$that.addClass("music-item-active");
	$that.siblings().removeClass("music-item-active");
	$('.record').attr('data-id', curChannel);
	$('.record').text("频道："+curChannelName);
	getMusic();
});





























































































