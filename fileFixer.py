import csv
import os
import json

os.chdir(os.path.dirname(__file__))

mylist = []
myDict = {'wave1':{}, 'wave2':{}, 'wave3':{}, 'wave4':{}}
waveList = ['wave1', 'wave2', 'wave3', 'wave4']
fileNameList = ['/Important_Family.csv', '/Important_Friends.csv', '/Important_Leisure_time.csv', 
            '/Important_Politics.csv', '/Important_Religion.csv', '/Important_Work.csv']
fileNameOther = ['/Life_satisfaction.csv', '/Men_rather_than_women.csv', '/Religious_person.csv']
objectNameList = ['Important_Family', 'Important_Friends', 'Important_Leisure_time',
                'Important_Politics', 'Important_Religion', 'Important_Work']

path = os.path.abspath("src/data/files/wave4/important_life/")


counter = 0
waveCounter = 0
for wave in waveList:
    path = os.path.abspath("src/data/files/" + wave + "/important_life/")
    pathOther = os.path.abspath("src/data/files/" + wave + "/other/")
    
    for fileName in fileNameList:
        with open(path + fileName, 'r') as csvfile:
            readlines = csv.reader(csvfile, delimiter=';', quotechar='|')
            for row in readlines:
                if row[0] not in myDict[wave]:
                    myDict[wave][row[0]] = {}
                myDict[wave][row[0]][objectNameList[counter]] = {
                    'very': row[1],
                    'rather': row[2],
                    'notVery': row[3],
                    'notAtAll': row[4],
                    'NA': row[5],
                    'DK': row[6]
                    }
            counter = counter + 1
    

    for fileNames in fileNameOther:
        with open(pathOther + fileNames, 'r') as csvfile:
            readlines = csv.reader(csvfile, delimiter=';', quotechar='|')
            for row in readlines:
                if fileNames == '/Life_satisfaction.csv':
                    if row[0] not in myDict[wave]:
                        myDict[wave][row[0]] = {}      
                    myDict[wave][row[0]]['Life_Satisfaction'] = {
                    '1': row[1],
                    '2': row[2],
                    '3': row[3],
                    '4': row[4],
                    '5': row[5],
                    '6': row[6],
                    '7': row[7],
                    '8': row[8],
                    '9': row[9],
                    '10': row[10],
                    'DK': row[13],
                    'Mean': row[14],
                    'Standard Deviation': row[15]
                    }

                if fileNames == '/Men_rather_than_women.csv':
                    if row[0] not in myDict[wave]:
                        myDict[wave][row[0]] = {}
                    myDict[wave][row[0]]['Men_Rather_Than_Women'] = {
                    'Agree': row[1],
                    'Neither': row[2],
                    'Disagree': row[3],
                    'DK': row[5]
                    }

                if fileNames == '/Religious_person.csv':
                    if row[0] not in myDict[wave]:
                        myDict[wave][row[0]] = {}
                    myDict[wave][row[0]]['Religious_Person'] = {
                    'Yes': row[1],
                    'No': row[2],
                    'Atheist': row[3],
                    'DK': row[5]
                    }

    counter = 0

with open('result.json', 'w') as fp:
    json.dump(myDict, fp)