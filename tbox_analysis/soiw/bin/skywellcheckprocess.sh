#!/bin/sh
#ZXL,20220414, Just For ReSusre T-Box process is running correctly, if the proocess monit(/soiw/bin/monit) go break. 
while true
    do
        sleep 7

        count=`ps -ef|grep iot_logd|grep -v grep`
        if [ "$?" != "0" ];
        then
           echo "$(date "+%Y-%m-%d %H:%M:%S") no iot_logd, need restart" >> /data/app/tboxlog/skywellcheckprocess.log
           /soiw/bin/iot_logd &
        fi

        count=`ps -ef|grep tbox_serverd|grep -v grep`
        if [ "$?" != "0" ];
        then
           echo "$(date "+%Y-%m-%d %H:%M:%S") no tbox_serverd, need restart" >> /data/app/tboxlog/skywellcheckprocess.log
           /soiw/bin/tbox_serverd &
        fi

        count=`ps -ef|grep tbox_clientd|grep -v grep`
        if [ "$?" != "0" ];
        then
           echo "$(date "+%Y-%m-%d %H:%M:%S") no tbox_clientd, need restart" >> /data/app/tboxlog/skywellcheckprocess.log
           /soiw/bin/tbox_clientd &
        fi

        count=`ps -ef|grep iot_gpsd_le20|grep -v grep`
        if [ "$?" != "0" ];
        then
           echo "$(date "+%Y-%m-%d %H:%M:%S") no iot_gpsd_le20, need restart" >> /data/app/tboxlog/skywellcheckprocess.log
           /soiw/bin/iot_gpsd_le20 &
        fi
    done

