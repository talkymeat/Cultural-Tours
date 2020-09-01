from csv import DictReader, DictWriter
import gpxpy, re
import gpxpy.gpx

class GPX_Extractor():

    def __init__(self):
        self.lowest_unused_bike_wpt_ID = 0
        self.wpt_IDs = []
        self.bike_wpts_dict = []
        with open('bike_waypoints.csv') as bike_waypoints:
            bike_wpts_dict_reader = DictReader(bike_waypoints)
            for row in bike_wpts_dict_reader:
                self.wpt_IDs += [row['ID']]
                self.bike_wpts_dict.append(row)
            self.wpt_IDs.sort()
            while self.lowest_unused_bike_wpt_ID < len(self.wpt_IDs) and \
                self.lowest_unused_bike_wpt_ID == \
                int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID][1:]):
                    self.lowest_unused_bike_wpt_ID +=1

    @property
    def next_bike_wpt_ID(self):
        next_ID = f'{self.lowest_unused_bike_wpt_ID:0>8d}'
        self.wpt_IDs.insert(self.lowest_unused_bike_wpt_ID, next_ID)
        while self.lowest_unused_bike_wpt_ID < len(self.wpt_IDs) and \
            self.lowest_unused_bike_wpt_ID == \
            int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID][1:]):
                self.lowest_unused_bike_wpt_ID +=1
        return next_ID

    def get_bike_wpt(self, name, lat, lon):
        for row in self.bike_wpts_dict:
            if row['Name'] == name and row['Latitude'] == lat and \
                row['Longitude'] == lon:
                    return row['ID']
        return ''

    def add_gpxes(self):
        with open('./gpxes.csv') as csv_file:
            csv_dict = DictReader(csv_file)
            for row in csv_dict:
                self.read_gpx('./routes/' + row['Filename'])

    def read_gpx(self, filename):
        with open('routes.csv') as routes_file:
            nl_needed = routes_file.read()[-1] != '\n'
        with open('bike_waypoints.csv') as wpts_file:
            nl_needed_wpts = wpts_file.read()[-1] != '\n'
        with open(filename) as gpx_file:
            with open('routes.csv', 'a+') as routes_file:
                with open('bike_waypoints.csv', 'a+') as wpts_file:
                    gpx = gpxpy.parse(gpx_file)
                    count = 0
                    for route in gpx.routes:
                        route_filename = f'{filename[9:-4]}-{count:d}.csv'
                        rev_IDs = []
                        operator,type = route.comment.split(',')
                        nl = "\n"
                        with open('./routes/'+route_filename, 'a') as route_file:
                            route_file.write('Waypoint')
                            routes_file.write(f'{nl if nl_needed else ""}'
                                + f'{operator},{route.name},{route.description}'
                                + f',{type},{route_filename}'
                            )
                            for point in route.points:
                                name, lat, lon = point.name, point.latitude, point.longitude
                                ID = self.get_bike_wpt(name, lat, lon)
                                if ',' in name:
                                    name=f'"{name}"'
                                if not ID:
                                    ID = self.next_bike_wpt_ID
                                    wpts_file.write(
                                        f'{nl if nl_needed_wpts else ""}{ID},' +
                                        f'{name},{lat},{lon}'
                                    )
                                    nl_needed_wpts = True
                                route_file.write('\nC'+ID)
                                if name == 'Start' or name == 'Finish':
                                    name = 'Finish' if name=='Start' else 'Start'
                                    ID = self.get_bike_wpt(name, lat, lon)
                                    if not ID:
                                        ID = self.next_bike_wpt_ID
                                        wpts_file.write(
                                            f'{nl}{ID},{name},{lat},{lon}'
                                        )
                                rev_IDs = [ID] + rev_IDs
                            nl_needed = True
                        route_filename_2 = f'{filename[9:-4]}-{count:d}-reversed.csv'
                        with open('./routes/'+route_filename_2, 'a') as route_file_2:
                            route_file_2.write('Waypoint')
                            desc_2 = ''
                            if re.search(' to ', route.description):
                                desc_2 = ' to '.join(route.description.split(' to ')[-1::-1])
                            else:
                                desc_2 = route.description + ' reversed'
                            routes_file.write(
                                f'{nl}{operator},{route.name},{desc_2},{type},'+
                                f'{route_filename_2}'
                            )
                            for id in rev_IDs:
                                route_file_2.write(f'{nl}C{id}')
                        count +=1

if __name__ == '__main__':
    gpxx = GPX_Extractor()
    gpxx.add_gpxes()
