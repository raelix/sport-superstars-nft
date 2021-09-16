#!/bin/bash

FILENAME=${1:-./NFT.svg}
OUTPUT_FOLDER=${2:-./input}

# Default binary path
#binary=/snap/bin/inkscape
binary=/usr/bin/inkscape
unameOut="$(uname -s)"

case "${unameOut}" in
Linux*)
    machine=linux
    ;;
Darwin*)
    machine=mac
    binary=/Applications/Inkscape.app/Contents/MacOS/inkscape
    ;;
CYGWIN*)
    machine=Cygwin
    ;;
MINGW*)
    machine=MinGw
    ;;
*)
    machine="UNKNOWN:${unameOut}"
    ;;
esac

function getName() {
    cat ${FILENAME} | grep -w $1 -A2 -B2 | grep label | cut -d '=' -f2 | tr -d '"' | tr -d '\n'
}

echo "This is a $machine machine"
echo Inkscape version $($binary --version)

echo "removing old files"

rm -rf ./input/*

for layer in $($binary --actions="select-all:groups;select-invert:all;select-list" $FILENAME | grep -v svg | awk '{print $1}'); do
    label=$(getName $layer)
    label_with_underscore=${label// /_}
    directory=$(echo $label_with_underscore | grep -o '[A-Za-z]*' | head -n1 | tr -d '\n')
    echo "creating directory: $OUTPUT_FOLDER/$directory - if not exists"
    mkdir -p $OUTPUT_FOLDER/$directory
    item=$(echo $label_with_underscore | sed "s/${directory}_//g")
    echo $item
    $binary ${FILENAME} -i $layer --with-gui --batch-process --actions="verb:LayerShowAll" -j -C --export-filename=${OUTPUT_FOLDER}/${directory}/${item}.png --export-type="png"
done
