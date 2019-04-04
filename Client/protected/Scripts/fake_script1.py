import cv2
import numpy as np
import math
import sys
import argparse
import os
from scipy import misc
import random

def computeScore(im1, im2):
    return round(random.uniform(0, 1), 2)
    
argParser = argparse.ArgumentParser(description='Perform fake process on two images and return score')
argParser.add_argument('-i1', type=str, required=True, help="image 1 path ")
argParser.add_argument('-i2', type=str, required=True, help="image 2 path")
args = argParser.parse_args()

image1 = cv2.imread(args.i1)
image2 = cv2.imread(args.i2)

print(computeScore(image1, image2))





