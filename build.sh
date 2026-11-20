#!/bin/bash

cd LXX-Swete-1930 && ./build_txt.js txt  > ../LXX-Swete-1930.txt; cd -
cd LXX-Swete-1930 && ./build_txt.js html > ../LXX-Swete-1930.html; cd -
cd Nestle1904 && ./build.js txt > ../Nestle1904.txt; cd -
cd Nestle1904 && ./build.js html > ../Nestle1904.html; cd -

