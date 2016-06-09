#!/usr/bin/python3

import requests
import json

def main():
    urlSkel = 'http://raw.githubusercontent.com/factbook/factbook.json/master/{0}/{1}.json'
    regions = ['africa', 'australia-oceania', 'central-america-n-caribbean',
               'central-asia', 'east-n-southeast-asia', 'europe', 'middle-east',
               'north-america', 'south-america', 'south-asia']

    f = open('iso2GEC.json', 'r')
    jsonstr = f.read().rstrip()
    f.close()
    data = json.JSONDecoder().decode(jsonstr)


    totalRoadLens = {}
    for country in data:
        for region in regions:
            url = urlSkel.format(region, data[country]['GEC'].lower())
            resp = requests.get(url)
            if resp.status_code == 404:
                continue
            print('Found', data[country]['name'])
            totalRoadLens[country] = getRoadwayData(resp.json())
            break
    f = open('roadTotals.json','w')
    f.write(json.JSONEncoder().encode(totalRoadLens))
    f.close()

def getRoadwayData(country):
    try:
        return int(country['Transportation']['Roadways']['total']['text'].split()[0].replace(',',''))
    except Exception as e:
        print('No road data for them')
        return None

if __name__ == '__main__':
    main()
