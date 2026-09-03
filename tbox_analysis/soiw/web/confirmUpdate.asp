<%
var PageTitle = "";
var LocalName = "";
var UploadName = "";
var DeviceInfoName = "";
var DataTypeName = "";
var FileInfoName = "";
var SoftVersionName = "";
var HardVersionName = "";
var FileSizeName = "";
var FileTimeName = "";
var Confirm = "";
var Cancel = "";
var ConfirmInfo = "";
var UploadFileStatusInfo = 0;


var LanguageCode = 1;
var UploadFileStatus = 0;
var DeviceFileMatch = 0;

var DeviceInfo = "";
var DataType = "";
var FileInfo = "";
var HardVersion = "";
var SoftVersion = "";
var FileTime = "";
var FileSize = "";

var LocalDeviceInfo = "";
var LocalFileInfo = "";
var LocalSoftVersion = "";
var LocalHardVersion = "";
var LocalFileTime = "";

aspGetUPdateFileInfo();

if (LanguageCode == 1)
{
	PageTitle = "确认信息";
	LocalName = "当前设备信息";
	UploadName = "上传文件信息"
	Confirm = "确认";
	Cancel = "取消";
	ConfirmInfo = "即将升级固件或参数，确认上传的文件无误，否则设备可能无法正常工作！注意：设备版本升级后可能会初始化当前所有的配置参数！完成后设备会自动重启。";
	DeviceInfoName = "对应设备：";
	DataTypeName = "文件类型：";
	HardVersionName = "硬件版本：";
	SoftVersionName = "软件版本：";
	FileTimeName = "生成时间：";
	FileSizeName = "文件大小（Byte）：";
	FileInfoName = "文件描述：";
	
	if (UploadFileStatus) 
	{
		if (DataType) 
		{
			DataType = "固件程序";
		}
		else
		{
			DataType = "配置参数";
		}
		UploadFileStatusInfo = "文件上传：成功";
	}
	else
	{
		UploadFileStatusInfo = "文件上传：失败";
	}
}
else 
{
	PageTitle = "Information Confirmation";
	LocalName = "Current Device Info";
	UploadName = "Upload File Info"
	Confirm = "Confirm";
	Cancel = "Cancel";
	ConfirmInfo = "Please ensure the uploaded file.otherwise this device may not function propperly!Attention, the parameter of the device may be initialized! The device will automatic reboot when finish.";
	DeviceInfoName = "Device:";
	DataTypeName = "File Type:";
	HardVersionName = "Hard Version:";
	SoftVersionName = "Soft Version:";
	FileTimeName = "File Generate Time:";
	FileSizeName = "File Size(Byte):";
	FileInfoName = "File Description:";
	if (UploadFileStatus) 
	{
		if (DataType) 
		{
			DataType = "Solid Program";
		}
		else
		{
			DataType = "Parameter Data";
		}
		UploadFileStatusInfo = "File Upload:Sucessful";
	}
	else
	{
		UploadFileStatusInfo = "File Upload:Failed";
	}
}

if (DeviceFileMatch) 
{
	DeviceFileMatch = "";
}
else
{
	DeviceFileMatch = "disabled='disabled'";
}
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
<title></title>
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

-->
</style>

<script type="text/javascript">
	function confirmUpgrade()
	{
		return confirm("<%write(ConfirmInfo);%>");
	}
	
	function OnloadFunc()
	{
		document.getElementById("formconfirm").onsubmit = confirmUpgrade;
	}
</script>
</head>
<body onLoad="OnloadFunc()">
<table width="988" height="580" border="0" align="center" cellpadding="0" cellspacing="0"  >
 
  <tr>
    <td valign="top" bgcolor="#F0F0F0">
<div>

<div class="fontgreen" style="padding-left:51px; padding-top:5px; height:25px; width:100%;"></div>
  <div>
	<table width="504" height="200" border="0" align="center" cellpadding="5" cellspacing="1" bgcolor="#008080">
		<caption style='color:<% if (UploadFileStatus) { write("green"); } else { write("red"); }%>;' ><%write(UploadFileStatusInfo);%></caption>
		<tr>
			<td height="24" bgcolor="#F5F9FE" class="font14">
			</td>
			<td align="left" bgcolor="#F5F9FE" class="font14">
			<%write(UploadName);%>
			</td>
			<td align="left" bgcolor="#F5F9FE" class="font14">
			<%write(LocalName);%>
			</td>
		</tr>

		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(DeviceInfoName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(DeviceInfo);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(LocalDeviceInfo);%>
			</td>
		</tr>

				
		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(HardVersionName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(HardVersion);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(LocalHardVersion);%>
			</td>
		</tr>
		
		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(SoftVersionName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(SoftVersion);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(LocalSoftVersion);%>
			</td>
		</tr>

		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileTimeName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileTime);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(LocalFileTime);%>
			</td>
		</tr>
		
		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileInfoName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileInfo);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(LocalFileInfo);%>
			</td>
		</tr>
			
		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(DataTypeName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(DataType);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			</td>
		</tr>

		<tr>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileSizeName);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			<%write(FileSize);%>
			</td>
			<td height="24" align="left" bgcolor="#FCFCFC">
			</td>
		</tr>
			
		<tr>
			<td height="24" colspan="3" align="right" bgcolor="#FCFCFC">
			<form name="input" action="/goform/formConfirmUpload" method="get" ID="formconfirm" target="_self">
				<input type="submit" value="<%write(Confirm);%>" ID="Submit3" NAME="Submit3"/ <%write(DeviceFileMatch);%>>
				<input type="button" name="button2" id="returnBtn" value="<%write(Cancel);%>"  onClick="location.href='home.html'"/>
			</form> 
			</td>
		</tr>
	</table>
    <br />
    <br />
  </div>
  <div align="center">
  </div>
    </div></td>
  </tr>
  <tr bgcolor="#F0F0F0">
    <td valign="top">&nbsp;</td>
  </tr>
</table>
</body>
</html>
