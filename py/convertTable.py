#!/usr/bin/python3
import json

def main():
    file = open('table.txt','r')
    lines = []
    while True:
        # The first line has the name and GEC code
        line = file.readline()
        if line == '':
            break
        line = line.expandtabs(tabsize=1)
        line = line.rstrip()
        # Get the 2 char iso
        line += ' ' + file.read(2)
        lines.append(line)
        # Discard the remainder of the line and the next
        file.readline()
        file.readline()
    file.close()

    file = open('iso2GEC.json','w')

    d = {}
    for line in lines:
        # If there is any empty values after the country name skip it
        index = line.find(' ')
        if '-' in line[index:]:
            continue
        list = line.split()
        if len(list[-1]) != len(list[-2]):
            continue
        name = ' '.join(list[:-2])
        d[list[-1]] = {'name': name, 'GEC': list[-2]}

    file.write(json.JSONEncoder().encode(d) + '\n')
    file.close()

if (__name__ == '__main__'):
    main()
