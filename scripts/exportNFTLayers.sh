#!/bin/bash

FILENAME=../NFT.svg
OUTPUT_FOLDER=../input/all

function getName(){
cat ${FILENAME} | grep -w $1 -A2 -B2 | grep label | cut  -d '=' -f2 | tr -d '"' | tr -d '\n'
}


for layer in $(inkscape  --actions="select-all:groups;select-invert:all;select-list" $FILENAME  | grep -v svg | awk  '{print $1}'); do 
    label=$(getName $layer)
    label_with_underscore=${label// /_}
    inkscape ${FILENAME} -i $layer -j -C --export-png=${OUTPUT_FOLDER}/$label_with_underscore.png
    
    done
