#!/bin/sh

dir_path="packages/**/dist/*"

for d in $dir_path ; do
    cp -r $d ./nodejs/
done

7z a layer.zip ./nodejs