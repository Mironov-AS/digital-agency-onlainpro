

var http = new Object();


//异步请求
http.request_text = function( url, call_back,param)
{
	var data;
	if(param)
		data=param;
	$.ajax({
		type:"GET",
		url:url,
		cache: false,
		data:data,
		dataType:"text",
		async:true,
		success:call_back
	})

}



//同步请求
http.request_text_sync = function( url, call_back,param)
{
	var data;
	if(param)
		data=param;
	$.ajax({
		type:"POST",
		url:url,
		cache: false,
		data:data,
		dataType:"text",
		async:false,
		timeout:2000,
		success:call_back
	})

}

//同步请求
http.request_text_scan = function( url, call_back,param)
{
	var data;
	if(param)
		data=param;
	$.ajax({
		type:"POST",
		url:url,
		cache: false,
		data:data,
		dataType:"text",
		async:false,
		timeout:2000,
		//beforeSend: function(data){ 
		//window.location.href="net_enter_wait.asp";
		//},
		success:call_back
	})

}
