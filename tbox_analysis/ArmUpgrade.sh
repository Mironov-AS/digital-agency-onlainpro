#!/bin/sh

#zip
if [ -f "/soiw/ota/upgrade.zip"  ];then
    cp /soiw/ota/upgrade.zip /cache/bksystem.zip
	cp /soiw/ota/upgrade.zip /data/bksystem.zip
fi

#bin
if [ -d "/soiw/ota/upgrade/temp/soiw/bin"  ];then
    cp /soiw/ota/upgrade/temp/soiw/bin /soiw/ -rf
    chmod +x /soiw/bin/*
fi

#ini
if [ -d "/soiw/ota/upgrade/temp/soiw/ini"  ];then
    cp /soiw/ota/upgrade/temp/soiw/ini /soiw/ -rf
fi

#lib
if [ -d "/soiw/ota/upgrade/temp/soiw/lib"  ];then
    cp /soiw/ota/upgrade/temp/soiw/lib /soiw/ -rf
fi

#web
if [ -d "/soiw/ota/upgrade/temp/soiw/web"  ];then
    cp /soiw/ota/upgrade/temp/soiw/web /soiw/ -rf
    chmod +x /soiw/web/cgi-bin/*
fi

#xml
if [ -d "/soiw/ota/upgrade/temp/soiw/xml"  ];then
    cp /soiw/ota/upgrade/temp/soiw/xml /soiw/ -rf
fi

#mcu
if [ -d "/soiw/ota/upgrade/temp/soiw/mcu"  ];then
    cp /soiw/ota/upgrade/temp/soiw/mcu /soiw/ -rf
fi

#system
if [ -d "/soiw/ota/upgrade/temp/soiw/system"  ];then
    cp /soiw/ota/upgrade/temp/soiw/system /soiw/ -rf
	chmod +x /soiw/system/*
fi

if [ -f "/data/app/tboxlog/rsakey.db" ];then
    cp /data/app/tboxlog/rsakey.db /soiw/fake.db
fi

sync

