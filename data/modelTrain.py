import json
import numpy as np

encodingsFile = open('encodings.json')
dataFile = open('data.json')

encodings = json.load(encodingsFile)
data = json.load(dataFile)

print(encodings)