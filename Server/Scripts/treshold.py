import cv2
import numpy as np
import math
import sys
import argparse
import os
from scipy import misc
import random

def typeDir(str):
    if(not os.path.isdir(str[1:])):
        raise argparse.ArgumentTypeError("{0} is not a directory.".format(str))
    return str

def computeStuff(im):
    #img = cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    _, t2 = cv2.threshold(im,125,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    return t2

argParser = argparse.ArgumentParser(description='Perform fake process an image and output another image in outputDir')
argParser.add_argument('-i', type=str, required=True, help="image path")
argParser.add_argument('-o', '--outputDir', type=typeDir, required=True, help="output directory")
args = argParser.parse_args()
imgSource = args.i[1:]
destDir = args.outputDir[1:]

image = cv2.imread(imgSource,0)
ret = computeStuff(image)

cv2.imwrite(destDir + '/out.png', ret)





