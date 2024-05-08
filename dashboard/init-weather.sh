#!/bin/sh

echo '' > /mnt/us/dashboard/log.txt

sleep 120 #I get an error when framework stops straight away.

/etc/init.d/framework stop
/etc/init.d/powerd stop
/mnt/us/dashboard/display-weather.sh
