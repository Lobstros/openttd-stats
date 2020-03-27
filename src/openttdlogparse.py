#!/usr/bin/env python

import sys
import re
import time
from collections import namedtuple
import json

# Below regex matches responses to 'companies' in OTTD console
# and returns data from matched groups as below:
#          1: Date in '%Y-%m-%d %H:%M:%S' format
#          2: Company number
#          3: Company colour (referred to in code as 'color' for consistency with js)
#          4: Company name
#          5: Year founded
#      6,7,8: Money in possession, loan amount, total value
# 9,10,11,12: Trains, road vehicles, air vehicles and ships owned
RE_LINEMATCH = r"\[([^[]*)\] #:(.)\(([^)]*)\) Company Name: '(.*)'  Year Founded: ([0-9]+)  Money: ([^ ]+)  Loan: ([^ ]+)  Value: ([^ ]+)  \(T:([^,]+), R:([^,]+), P:([^,]+), S:([^)]+)\)"

StatPoint = namedtuple("StatPoint", "t money numtrains numcars numplanes numships")

class Player(object):

    """
    Contains defining information about an OTTD company (name and colour),
    and arrays that specify when stats were read and money it has at these times.
    """

    def __init__(self, name, color):
        self.name = name
        self.color = color
        self.stats = []

    def addstatpoint(self, dpt):
        """Adds a sampled set of values to player's history."""
        self.stats.append(dpt)

    def updatename(self, name):
        """Update company's name (e.g. when changed by player)."""
        self.name = name

    def updatecolor(self,color):
        """Update company's colour (e.g. when changed by player)."""
        self.color = color

    def stats_as_dict(self):
        return [{"t": sp.t,
                 "value": sp.money,
                 "cars": sp.numcars,
                 "trains": sp.numtrains,
                 "planes": sp.numplanes,
                 "ships": sp.numships,
                } for sp in self.stats
               ]

    def all_data_as_dict(self):
        return {"name": self.name, "color": self.color, "data": self.stats_as_dict()}


def date_to_epoch(datestr):
    """Takes OTTD date; returns seconds since epoch in string."""
    pattern = '%Y-%m-%d %H:%M:%S'
    return str(int(time.mktime(time.strptime(datestr, pattern))))


def main():
    """
    This parses an OpenTTD log, picking out values of interest for every time
    the command 'companies' was run, and presents the results as a JSON array.
    """
    players = {}
    for line in sys.stdin:
        m = re.search(RE_LINEMATCH, line)
        if m is not None:
            pnum = m.group(2)
            if pnum not in players:
                players[pnum] = Player(m.group(4), m.group(3))
            newpt = StatPoint(t=date_to_epoch(m.group(1)),
                              money=m.group(8),
                              numtrains=m.group(9),
                              numcars=m.group(10),
                              numplanes=m.group(11),
                              numships=m.group(12)
                             )
            players[pnum].addstatpoint(newpt)
            # Keep name and colour up to date.
            if players[pnum].name is not (m.group(4)):
                players[pnum].updatename(m.group(4))
            if players[pnum].color is not (m.group(3)):
                players[pnum].updatecolor(m.group(3))
    allplayerdata = [player.all_data_as_dict() for player in players.values()]
    print(f"var allcompanydata = {json.dumps(allplayerdata)};")

if __name__ == "__main__":
    main()
