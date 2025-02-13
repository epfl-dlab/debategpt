#!/bin/bash

empirica bundle
BACK_PID=$!
wait $BACK_PID

mkdir temp; mv debategpt.tar.zst temp; cd temp;
tar --use-compress-program=zstd -xvf debategpt.tar.zst
rm debategpt.tar.zst

mkdir callbacks/node_modules;
cp -r ../server/node_modules/better-sqlite3/ callbacks/node_modules/

tar --use-compress-program=zstd -cvf debategpt.tar.zst .
mv debategpt.tar.zst ../; cd ../; rm -r temp
