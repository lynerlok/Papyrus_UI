import cv2
import numpy as np
import math
import sys
import argparse
import os
from scipy import misc
import random

def typeDir(str):
    if(not os.path.isdir(str)):
        raise argparse.ArgumentTypeError("{0} is not a directory.".format(str))
    return str

def computeStuff(im):
    _, t2 = cv2.threshold(im, 10, 255, cv2.THRESH_BINARY)
    return t2

argParser = argparse.ArgumentParser(description='Perform fake process an image and output another image in outputDir')
argParser.add_argument('-i', type=str, required=True, help="image path")
argParser.add_argument('-o', '--outputDir', type=typeDir, required=True, help="output directory")
args = argParser.parse_args()

image = cv2.imread(args.i)

ret = computeStuff(image)

cv2.imwrite(args.outputDir+"/out.png", ret)





