#!/bin/sh


IHUNetIint()
{
    iptables -N ONE_IOT
    iptables -F ONE_IOT	
    iptables -A ONE_IOT -i bridge0 -j DROP
}

IHUNetOpen()
{
    iptables -D FORWARD -j ONE_IOT
}

IHUNetClose()
{
    iptables -D FORWARD -j ONE_IOT
    sleep 2
    iptables -A FORWARD -j ONE_IOT
}

case $1 in
    "init")
        IHUNetIint
    ;;
    "open")
        IHUNetOpen
    ;;
    "close")
        IHUNetClose
    ;;
esac
