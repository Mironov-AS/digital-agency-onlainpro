#!/bin/bash
# Автозапуск сервиса navi-logs

NAME="navi-logs"
PORT=3005
LOG_FILE="/home/user/navi-logs/server.log"
PID_FILE="/home/user/navi-logs/server.pid"
APP_DIR="/home/user/navi-logs"

start() {
    if [ -f $PID_FILE ]; then
        if kill -0 $(cat $PID_FILE) 2>/dev/null; then
            echo "$NAME is already running (PID: $(cat $PID_FILE))"
            return
        fi
        rm -f $PID_FILE
    fi
    
    echo "Starting $NAME..."
    cd $APP_DIR
    nohup node server.js > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    echo "$NAME started (PID: $!)"
    sleep 1
    tail -3 $LOG_FILE
}

stop() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if kill -0 $PID 2>/dev/null; then
            echo "Stopping $NAME (PID: $PID)..."
            kill $PID
            sleep 1
            rm -f $PID_FILE
            echo "$NAME stopped"
        else
            rm -f $PID_FILE
            echo "$NAME was not running"
        fi
    else
        # Пробуем найти процесс по порту
        PID=$(lsof -t -i:$PORT 2>/dev/null)
        if [ -n "$PID" ]; then
            echo "Stopping $NAME (PID: $PID from lsof)..."
            kill $PID
            echo "$NAME stopped"
        else
            echo "$NAME is not running"
        fi
    fi
}

status() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if kill -0 $PID 2>/dev/null; then
            echo "$NAME is running (PID: $PID)"
            tail -5 $LOG_FILE
        else
            echo "$NAME is not running (stale PID file)"
        fi
    else
        # Проверяем по порту
        if lsof -i:$PORT >/dev/null 2>&1; then
            echo "$NAME is running (port $PORT is in use)"
        else
            echo "$NAME is not running"
        fi
    fi
}

case "$1" in
    start) start ;;
    stop) stop ;;
    restart) stop; start ;;
    status) status ;;
    *) echo "Usage: $0 {start|stop|restart|status}" ;;
esac
