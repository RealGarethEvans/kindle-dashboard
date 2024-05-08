#!/bin/sh

# set a cron job to run this script once a minute

cd "$(dirname "$0")"
BATTLEVEL=`gasgauge-info -c |grep -o '[0-9]*'`
TEMP=`cat /sys/devices/system/luigi_battery/luigi_battery0/battery_temperature` #This is in farenheit
UPTIME=`uptime |sed -r -e "s/^.+up *//" |sed -r -e "s/, load.+//" |sed -r -e "s/ /%20/g"`

date # For the benefit of the log
powerd_test -i #Simulates a button press, to avoid sleep
rm dynamic-dashboard.png
#eips -c

if wget -O dynamic-dashboard.png http://your.server.address/?batt=$BATTLEVEL\&temp=$TEMP\&uptime=$UPTIME; then
        sleep 1
        eips -c
        eips -g dynamic-dashboard.png
else
        eips -c
        eips -g weather-image-error.png
fi


# Sometimes the config file for usbNetwork gets corrupted. This is an attempt to repair it
CONFIG_LINE=`head -1 /mnt/us/usbnet/etc/config`
if [[ $CONFIG_LINE = '#!/bin/sh' ]]; then
        echo "usbnet config file is fine"
else
        echo "the config file for usbnet is corrupted. Attempting repair"
        cp /mnt/us/usbnet/etc/config.gareth /mnt/us/usbnet/etc/config
#       reboot
fi