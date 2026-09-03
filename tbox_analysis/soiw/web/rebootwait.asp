<html>

<%
var LanguageCode=1;
var InfoHead;
var InfoTail;
var PageTitle;

if (LanguageCode == 1)
{
	InfoHead = "系统正在更新，请等待...";
	PageTitle = "升级进行中";
}
else
{
	InfoHead = "Please Wait!System is upgrading...";
	PageTitle = "Proceeding Upgrade";
}
%>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
<title>Please Wait</title>
<script type="text/javascript" src="js/jquery-1.9.1.js"></script>  
<script type="text/javascript" src="js/jquery-ui-1.10.3.custom.js"></script>
<style type="text/css">
<!--
body {
	/*background-color: #7593BF;*/
	margin-left: 0px;
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px;	
}

#menu_list { width:988px;height:35px;margin:0px 2px; margin-top:0px; }

.ui-progressbar {    position: relative;  }  
.progress-label {
	position: absolute;
	left: 934px;
	top: 112px;
	font-weight: bold;
	text-shadow: 1px 1px 0 #fff;
	height: 15px;
		 }

-->
</style>

<link href="style/jquery-ui-1.10.3.custom.css" rel="stylesheet" type="text/css">
</head>
<script type="text/javascript">

	$(function()
	 {  
	    var progressbar = $("#progressbar"),   
	    progressLabel = $(".progress-label"); 
		
	    progressbar.progressbar({     
		 value: false,     
		 change: function() {       
		 progressLabel.text( progressbar.progressbar( "value" ) + "%" );         },      
		 complete: function() {   
		  window.location.href="home.html"; 
		  }    
		  }); 
		      
		  function progress() 
		   {     
		   var val = progressbar.progressbar( "value" ) || 0; 
		    progressbar.progressbar( "value", val + 1 );      
		    if ( val < 400 ) {       
			       setTimeout( progress, 500 );     
			       }    
			  }     
			 setTimeout( progress, 40000 ); 
	 });  
</script>

<body >
<table width="988" height="580" border="0" align="center" cellpadding="0" cellspacing="0"  ID="Table1">
  <tr bgcolor="#F0F0F0">
    <td height="30"  align="center">
    <%write(PageTitle);%>
	</td>
  </tr>
  <tr>
    <td valign="top" bgcolor="#F0F0F0">
<div>
  <div style="padding-left:51px; padding-top:5px; height:25px; width:100%;">
  </div>
  <div style='text-align:center;'>
	<span style='text-align:left;'><%write(InfoHead);%></span>
  </div>
  <div style="padding-left:51px; padding-top:5px; height:25px; width:100%;">
	
  </div>
  <div align="center" >
    <div id="progressbar" style="width:60%;">
        <div align="center" class="progress-label">Loading...
        </div>
      </div>
  </div>
</div>
    </td>
  </tr>
  <tr bgcolor="#F0F0F0">
    <td valign="top">&nbsp;</td>
  </tr>
</table>
</body>
</html>
