/**********************************************************************************************************
 * Copyright 2018 Shenzhen One IOT World Co., Ltd. All rights reserved
 *
 * This file is used to describe the release history lists.
 * For details about the test scheme, please read the solution design description document
 * Filename: 文件说明
 * Version:	 V1.0
 * Date: 2021-10-28
 * Author:邹晓龙

 *Version History
 V1.0-------initiate
**********************************************************************************************************/



1、平台连接相关配置项
配置文件 /soiw/ini/tbox_client/tspservice.ini

2、配置文件中的域名项
用于T-Box连接开沃正式环境域名（默认）：commonserverdomainpara         = gw.coolwellcloud.com
用于T-Box连接开沃正式环境域名长度 ：commonservicedomainlen         = 20

用于T-Box连接开沃测试环境域名（默认）：commonserverdomainpara         = tsp-beta.coolwellcloud.com
用于T-Box连接开沃测试环境域名长度 ：commonservicedomainlen         = 26


3、ARM端软件升级方式
可通过本地web使用上级目录下的upgrade.zip进行升级/平台OTA接口使用上级目录下的upgrade.zip进行升级/本地执行upgradeScript.bat进行升级

4、MCU端软件升级可
可通过本地web使用上级目录下的upgrade.zip进行升级/平台OTA接口使用上级目录下的upgrade.zip进行升级/烧写器烧写MCU上级路径下的*.mot格式文件升级