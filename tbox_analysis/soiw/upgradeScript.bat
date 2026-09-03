echo "Skywell T-Box System Upgrade Damon V1.0"
echo "copy file from pc to system"

adb push ./bin /soiw/
adb push ./ini /soiw/
adb push ./lib /soiw/
adb push ./web /soiw/
adb push ./xml /soiw/
adb push ./system /soiw/
adb push ./ota /soiw/
adb push ./system/bksystem.zip   /data/
adb push ./system/bksystem.zip   /cache/
adb reboot
