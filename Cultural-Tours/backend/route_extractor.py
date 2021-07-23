from csv import DictReader, DictWriter
import gpxpy, re
import gpxpy.gpx
import os, webbrowser
import requests
import json
import math
from tours.utils import dist_pts

_CS_APIKEY = "985402ceaaed2402"

def approx_eq(x, y, eta = 0.0000001):
    """Return true iff x and y differ by less than eta"""
    return abs(x-y) < eta

def points_approx_eq(pt1, pt2, eta = 0.0000001):
    """Return true iff all elements of pt1 differs from the corresponding
    element of pt2 by less than eta

    >>> points_approx_eq((55.5555, -3.3333), (55.5555, -3.3333))
    True
    >>> points_approx_eq((55.5555, -3.3333), (55.5555, -3.3333000001))
    True
    >>> points_approx_eq((55.5555, -3.3333), (55.5555, -2.3333))
    False
    >>> points_approx_eq((55.5555, -3.3333), (55.5555, -3.3332))
    False
    """
    close = 1
    for a, b in zip(pt1, pt2):
        close *= approx_eq(a, b, eta)
    return bool(close)

def format_as_url_param(param):
    """Formats strings as REST API params, replacing spaces with + and commas
    with %2C
    """
    return param.replace(" ", "+").replace(",", "%2C")

def unformat_url_param(param):
    """Formats REST API params as readable strings, replacing + with spaces
    and %2C with commas
    """
    return param.replace("+", " ").replace("%2C", ",")

def make_route_filename(plan, points):
    """Create a filename for a route csv, in the format
    {quietest|fastest|balanced}_{lat1}_{lon1}_to_ ... _to_{latn}_{lonn}.csv"""
    return f"{plan}_" + "_to_".join([f"{pt['lat']}_{pt['lon']}" for pt in points]) + ".csv"

def file_needs_newline(filename):
    with open(filename) as file:
        return file.read()[-1] != '\n'



class Route_Extractor():
    """Extracts cycling route data from GPX files and adds it to the CSV files that
    define the Flaneur backend dataset. The backend dataset consists as follows:

    'bike_waypoints.csv':
    Database of individual waypoints, containing the fields:

        'ID': a unique 8-digit number from 00000000 to 99999999)
        'Name'
        'Latitude'
        'Longitude'

    'routes.csv'
    Small database containing metadata for each route (bus and bike), including
    filepaths for further CSV files containing the actual routes. Contains the
    fields:

        'Operator': 'Bicycle' is used in this field for bike routes
        'Short name'
        'Direction': routes may have different waypoints in different
        directions - this gives the direction using the start and endpoints, or
        'Clockwise'/'Anticlockwise' for circular routes.
        'Type': 'bus' or 'bike'
        'Filename': filepath to the relevant csv file.

    '{route_name}.csv'
    Several csv files detailing the actual routes of routes named in
    'routes.csv'. Each consists of a single field 'Waypoint', consisting of the
    8-digit unique IDs for waypoints in 'bike_waypoints.csv' (or
    'bus_stops.csv'), prefixed by 'C' for cycle (or 'B' for bus)
    """

    def __init__(self):
        """Constructor for the GPX_Extractor class. Read the existing bike
        waypoints database, so that waypoints on new routes can be checked:
        when GPX_Extractor is extracting a GPX, if a waypoint on the new route
        already exists in the bike waypoints database, the ID in the CSV for the
        new route will be 'C' plus the existing waypoint ID; if it does not
        exist, a new waypoint will be created in the bike waypoints database.
        """
        # This is used to keep track of the lowest waypoint ID available for use
        # by a new waypoint.
        self.lowest_unused_bike_wpt_ID = 0
        # two lists to store waypoint data - wpt_IDs, storing the 8-digit ID
        # numbers, and bike_wpts, in which each item is a dict of the full data
        # for one waypoint
        self.wpt_IDs = []
        self.bike_wpts = []
        # Newline character variable, used to insert newlines into f-strings
        self.nl = '\n'
        # Check that the bike waypoints and routes CSV files exist: if not,
        # create them as CSV file containing only the header(s).
        if not os.path.isfile('bike_waypoints.csv'):
            with open('bike_waypoints.csv', 'a') as bike_waypoints:
                bike_waypoints.write("ID,Name,Latitude,Longitude")
        if not os.path.isfile('routes.csv'):
            with open('routes.csv', 'a') as routes:
                routes.write("Operator,Short name,Direction,Type,Filename")
        # code block in which bike_waypoints contains the file for the existing
        # set of waypoints, decanted into a DictReader object.
        with open('bike_waypoints.csv') as bike_waypoints:
            bike_wpts_dict_reader = DictReader(bike_waypoints)
            # Populates wpt_IDs and bike_wpts
            for row in bike_wpts_dict_reader:
                self.wpt_IDs += [row['ID']]
                self.bike_wpts.append(row)
            self.wpt_IDs.sort() # numerically orders wpt_IDs
            # If the list contains gaps, set lowest_unused_bike_wpt_ID to be 1 +
            # the value immediately before the first gap; if it doesn't, then
            # set lowest_unused_bike_wpt_ID to be 1 + the last value in the
            # list.
            self.set_lowest_unused_bike_wpt_ID()

    def next_bike_wpt_ID(self, peek=False):
        """Return the next available waypoint ID. If `peek` is true, just return
        the next ID. Otherwise, assume that the code calling next_bike_wpt_ID is
        creating a new waypoint-- add the lowest unused waypoint ID to the list
        of IDs, and update `lowest_unused_bike_wpt_ID`.

        Parameters:
            peek (bool): Determines whether we are just peeking at the value of
            the next ID, or adding a new waypoint.

        Returns:
            next_ID (str): the next bike waypoint ID, as an 8-digit numerical
            string.
        """
        # check that the list of waypoints is strictly increasing and set
        # the value of lowest_unused_bike_wpt_ID to 1 + the lowest value in
        # the list to not be followed by its successor
        self.set_lowest_unused_bike_wpt_ID(check_from=0)
        # next_ID is the return value - copied from `lowest_unused_bike_wpt_ID`,
        # formatted, and made a separate variable so `lowest_unused_bike_wpt_ID`
        # can be updated if necessary
        next_ID = f'{self.lowest_unused_bike_wpt_ID:0>8d}'
        # If we're not just peeking at the value, then...
        if not peek:
            # ...insert next_ID into the list, at the point corresponsing to its
            # value ...
            self.wpt_IDs.insert(self.lowest_unused_bike_wpt_ID, next_ID)
            # then update lowest_unused_bike_wpt_ID
            self.set_lowest_unused_bike_wpt_ID()
        return next_ID

    def set_lowest_unused_bike_wpt_ID(self, check_from=-1):
        """Checks that the values in the list wpt_IDs are strictly increasing
        from `check_from` onwards.

        Parameters:
            check_from (int): The index to start checking from. Equal to
            `lowest_unused_bike_wpt_ID` by default
        """
        # if check_from is a non-default value (e.g., 0),
        # lowest_unused_bike_wpt_ID is set to match it. The checking that
        # follows will ensure that it is set to match the *next* unused ID.
        if check_from >= 0:
            self.lowest_unused_bike_wpt_ID = check_from
        # Iterate through the values in wpt_IDs from lowest_unused_bike_wpt_ID
        # to ensure that i == wpt_IDs[i]. If i < wpt_IDs[i], that's fine: that
        # means wpt_IDs[i-1]+1 is the correct value for
        # lowest_unused_bike_wpt_ID. If i > wpt_IDs[i], that's an error, and an
        # AssertError is thrown.
        # If i == wpt_IDs[i] for all values in wpt_IDs, the correct value for
        # lowest_unused_bike_wpt_ID is len(wpt_IDs), and when this is reached
        # the loop terminates
        # NB: I changed `int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID][1:])`
        # to `int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID])` - the previous
        # code assumed (falsely) that the waypoint IDs are stored with the
        # `B` and `C` prefixes to distinguish bus-stops from bike waypoints-
        # but this is not the case.
        while self.lowest_unused_bike_wpt_ID < len(self.wpt_IDs) and \
            self.lowest_unused_bike_wpt_ID == \
            int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID]):
                # unless the value of lowest_unused_bike_wpt_ID we are checking
                # is the last value in wpt_IDs...
                if len(self.wpt_IDs)-1 > self.lowest_unused_bike_wpt_ID:
                    # ...assert that the next value is higher. The values in
                    # wpt_IDs should be strictly ascending
                    assert int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID]) < int(self.wpt_IDs[self.lowest_unused_bike_wpt_ID+1]), f"{self.wpt_IDs[self.lowest_unused_bike_wpt_ID]}, {self.wpt_IDs[self.lowest_unused_bike_wpt_ID+1]}"
                # assuming everything checks out, move on to the next value...
                self.lowest_unused_bike_wpt_ID +=1
                # if the next value isn't in wpt_IDs, either because we're at
                # the end of the list or we've reached a gap in the list, then
                # lowest_unused_bike_wpt_ID is at its correct value and we can
                # return.
                if not f'{self.lowest_unused_bike_wpt_ID:0>8d}' in self.wpt_IDs:
                    return

    def get_bike_wpt(self, name, lat, lon):
        """Returns ID of first waypoint in database to match the given
        name, latitude, and longitude. Returns the empty string if no match
        found. CycleStreets does not distinguish latitudes and longitudes beyond
        the fifth decimal place, so latitudes and longitudes are compared using
        approx_eq with the default eta of 0.0000001

        Parameters:
            name (str): name of waypoint.
            lat (float): latitude
            lon (float): longitude

        Return:
            8-character, left-zero-padded numerical ID of waypoint, or empty
            string.
        """
        for row in self.bike_wpts:
            if row['Name'] == name and approx_eq(float(row['Latitude']), lat) \
                and approx_eq(float(row['Longitude']), lon):
                    return row['ID'] # return ID, if matched
        return '' # return empty string if no match found

    def get_bike_wpt_from_id(self, id):
        for row in self.bike_wpts:
            if row['ID'] == id:
                print(type(row))
                return row
        return {}

    def get_or_add_bike_wpt(self, name, lat, lon, nl_needed):
        with open('bike_waypoints.csv', 'a+') as wpts_file:
            # if waypoint exists in waypoints database, get
            # its ID; if it doesn't `ID` is set to the empty
            # string.
            ID = self.get_bike_wpt(name, lat, lon)
            # double quotes are used in CSV files, in the
            # case where the value in a cell is a string
            # containing a comma, which would otherwise be
            # read as a separator
            if ',' in name:
                name=f'"{name}"'
            # if `ID` is the empty string, the next unused
            # waypoint ID will be used as the ID for the
            # current waypoint, and it will be appended to
            # the waypoints file, on a new line
            if not ID:
                # Get the next unused waypoint ID
                ID = self.next_bike_wpt_ID()
                # Write the data for the waypoint to the bike waypoints csv...
                wpts_file.write(
                    f'{self.nl if nl_needed else ""}{ID},{name},' +
                    f'{lat},{lon}'
                )
                # ...and to the live database in memory
                self.bike_wpts = self.bike_wpts + [{
                    "ID": ID,
                    "Name": name,
                    "Latitude": lat,
                    "Longitude": lon
                }]
                # Since the above does not put a newline at
                # the end of the line, the next line to be
                # added to the file will need to add a
                # newline first.
                nl_needed = True
            return ID, nl_needed

    def read_waymarked_trails_gpx(self, name, route_fn, start_fn='', end_fn='', start_nm='', end_nm='', desc='', operator=''):
        def glance_gpx(fn, start=True):
            with open(fn) as gpx_file:
                gpx = gpxpy.parse(gpx_file)
                pt = gpx.routes[0].points[int(start)-1]
                return {'lat': pt.latitude, 'lon': pt.longitude}

        def init_terminus(fn='', start=True):
            terminus = {'idx': int(start)-1}
            if fn:
                terminus = {**terminus, **glance_gpx(fn, start)}
                terminus['min_dist'] = 1000000000000000
            else:
                terminus['min_dist'] = 0
            return terminus
        def terminus_compare(terminus, rt_pt, idx):
            dist = dist_pts(terminus, rt_pt)
            if dist < terminus['min_dist']:
                terminus['min_dist'] = dist
                terminus['idx'] = idx
        with open(route_fn) as rt_gpx_file:
            rt_gpx = gpxpy.parse(rt_gpx_file)
        termini = (init_terminus(start_fn, True), init_terminus(end_fn, False))
        routes = []
        if len(rt_gpx.tracks) > 1:
            print('Weird. This GPX file has more than one track.')
        for track in rt_gpx.tracks:
            route = []
            for segment in track.segments:
                for point in segment.points:
                    rt_pt = {
                        'lat': point.latitude,
                        'lon': point.longitude
                    }
                    for terminus in termini:
                        if 'lat' in terminus and 'lon' in terminus:
                            terminus_compare(terminus, rt_pt, len(route))
                    route.append(rt_pt)
            fwds = termini[0]['idx']<termini[1]['idx']
            route = route[termini[0]['idx']:termini[1]['idx']:1 if fwds else -1]
            print(
                f'This route runs {"forwards" if fwds else "backwards"}, has ' +
                f'{len(route)} waypoints, and ' +
                f'comes within {termini[0]["min_dist"]:.3f}m of the given start ' +
                f'at {route[0]["lat"]}, {route[0]["lon"]}, '
                f'and {termini[1]["min_dist"]:.3f}m of the given end, at ' +
                f'{route[-1]["lat"]}, {route[0-1]["lon"]}.'
            )
            test_segment = len(route) # set to len(route) when testing is done
            for wpt in route[:test_segment]:
                closest_point = requests.get(
                    url = "https://api.cyclestreets.net/v2/nearestpoint?",
                    params = {
                        "lonlat": f"{wpt['lon']},{wpt['lat']}",
                        "key": _CS_APIKEY
                    }
                ).json()
                if len(closest_point['features']) > 1:
                    raise ValueError(
                        'CycleStreets returned ' +
                        f'{len(closest_point["features"])} features for lat: ' +
                        f'{wpt["lat"]}, lon: {wpt["lon"]}'
                    )
                if closest_point['features'][0]['geometry']['type'] != 'Point':
                    raise ValueError(
                        'CycleStreets returned a feature of type ' +
                        f'\'{closest_point["features"][0]["geometry"]["type"]}\' ' +
                        f'for lat: {wpt["lat"]}, lon: {wpt["lon"]}'
                    )
                wpt["lat"] = closest_point['features'][0]['geometry']['coordinates'][1]
                wpt["lon"] = closest_point['features'][0]['geometry']['coordinates'][0]
                wpt["name"] = closest_point['features'][0]['properties']['name']
            for wpt in route[test_segment:]:
                wpt['name'] = "Test, please remove this"
            op = operator if operator else 'Bicycle'
            descs = self.paired_descriptions(
                desc,
                f'{start_nm if start_nm else route[0]["name"]}',
                f'{end_nm if end_nm else route[-1]["name"]}',
                True
            )
            for i in (0,1):
                routes.append({
                    'wpts': (route, route[-1::-1])[i],
                    'type': 'bike',
                    'description': descs[i],
                    'operator': op,
                    'name': name,
                    'filename': f'{op}_{name}_{descs[i]}.csv'.replace(' ', '_').replace("'", "")
                })
        return routes

    def route_json_pts_2_val_ids(self, route_json):
        route_json['wpts'] = self.wpts_to_IDs(self.validate_points(route_json['wpts'], False))
        return route_json

    def read_gpx(self, filename):
        """Read all the routes in a GPX file and outputs a list of JSON-like
        dicts, each containing the data for one of the routes contained in the
        GPX, either in original order or reversed. As the function reads the
        GPX, it also updates 'bike_waypoints.csv' with any previously unseen
        waypoints:

        'bike_waypoints.csv' contains the fields:

            'ID': a unique 8-digit number from 00000000 to 99999999)
            'Name'
            'Latitude'
            'Longitude'

        Parameters:
            filename (str): The gpx file to be read.
        Return:
            routes_data (list): a list of JSON-like dicts containing all the
                routes in the gpx file and their reverses, with the original
                routes at even indices and the reversed routes at odd indices.
                These dicts contain the following fields:
                    'wpts': The list of waypoint IDs for the route
                    'filename': the name of the file in which the waypoint IDs
                        are to be stored,
                    'operator': By default, 'Bicycle', but when the route is
                        part of a recognised cycle trail, the organisation
                        responsible for the trail is
                    'type': 'bus' or 'bike' - in this case always 'bike'
                    'name': E.g., NCN 76
                    'description': Usually '{start} to {end}'
        """
        # If the waypoints file does not end a newline, the next line must be
        # prepended with \n
        with open('bike_waypoints.csv') as wpts_file:
            nl_needed = wpts_file.read()[-1] != '\n'
        # Open the gpx file in read mode, and the routes and waypoints files in
        # read+append mode
        routes_data = []
        with open(filename) as gpx_file:
            gpx = gpxpy.parse(gpx_file)
            # initialise a counter, in case the file contains more than
            # one route: the counter value is appended to the filenames
            # for the route CSVs
            count = 0
            for route in gpx.routes:
                # We used the 'comment' field in the route metadata to
                # store information Edinburgh Flaneur needs, but which
                # the gpx format does not have a field for: operator and
                # type.
                operator,route_type = route.comment.split(',')
                # If `description` (the 'Direction' field in routes.csv) of the
                # non-reversed route is the names of the beginning and end of
                # the route (optionally with midpoints) separated by ' to ',
                # split the string on ' to ' and join on ' to ' in reverse
                # order: otherwise, append ' reversed' to description.
                desc_2 = ''
                if re.search(' to ', route.description):
                    desc_2 = ' to '.join(route.description.split(' to ')[-1::-1])
                else:
                    desc_2 = route.description + ' reversed'
                # The route data are bundled into JSON-like dicts, with separate
                # objects for the original route and its reverse. Some notes on
                # the fields in these objects:
                # wpts: initialised with empty lists for the waypoints.
                # filename: The base filename of the gpx file is used as the
                # filename for the CSVs. './routes/' and '.gpx' are
                # stripped from filename, and `count` is appended, to
                # ensure uniqueness.
                fwd_route = {
                    'wpts': [],
                    'filename': f'{filename[9:-4]}-{count:d}.csv',
                    'operator': operator,
                    'type': route_type,
                    'name': route.name,
                    'description': route.description
                }
                rev_route = {
                    'wpts': [],
                    'filename': f'{filename[9:-4]}-{count:d}_reversed.csv',
                    'operator': operator,
                    'type': route_type,
                    'name': route.name,
                    'description': desc_2
                }
                # newline
                nl = "\n"
                # iterate through gpx waypoints
                for point in route.points:
                    # name, lat and lon uniquely identify a waypoint
                    name, lat, lon = point.name, point.latitude, point.longitude
                    ID, nl_needed = get_or_add_bike_wpt(name, lat, lon, nl_needed)
                    # Append the waypoint ID
                    fwd_route['wpts'] = fwd_route['wpts'] + [ID]
                    # If the waypoint is named 'Start', create
                    # another with the same lat & lon and a new ID
                    # named 'Finish' - and vice versa. This is done
                    # so that the reversed route will not start at
                    # the Finish and finish at the Start. It is the
                    # ID for the switched waypoint that will be
                    # prepended to the reversed list of IDs.
                    if name == 'Start' or name == 'Finish':
                        name = 'Finish' if name=='Start' else 'Start'
                        ID = self.get_bike_wpt(name, lat, lon)
                        if not ID:
                            ID = self.next_bike_wpt_ID()
                            wpts_file.write(
                                f'{nl}{ID},{name},{lat},{lon}'
                            )
                    rev_route['wpts'] = [ID] + rev_route['wpts']
                routes_data = routes_data + [fwd_route, rev_route]
                # Increment route counter
                count +=1
        return routes_data

    def add_waymarked_trails(self, name, route_fn, start_fn='', end_fn='', start_nm='', end_nm='', desc='', operator=''):
        routes = self.read_waymarked_trails_gpx(
            name, route_fn, start_fn, end_fn, start_nm, end_nm, desc, operator)
        for route in routes:
            self.write_csvs(self.route_json_pts_2_val_ids(route))

    def write_csvs(self, route):
        """Takes a JSON-like dict object containing the metadata and data for
        one bike route, validates the input, and writes it to the two relevant
        cvs files: `routes.csv`, which contains the metadata for all routes, and
        an individual file containing the waypoint IDs for all waypoints on the
        route.

        Parameters:
            route (dict): Contains the following key-value pairs:
                wpts: (list) contains waypoint IDs of route, in order
        """
        # check that route contains the required keys, and that they map to
        # non-empty values.
        for key in ('wpts', 'operator', 'type', 'filename', 'name', 'description'):
            assert key in route, f"The route object does not contain the key '{key}'."
            assert route[key], f"The key '{key}' in route does not map to a value."
        for i in range(len(route['wpts'])):
            if isinstance(route["wpts"][i], str):
                route["wpts"][i] = {'id': route["wpts"][i], 'kpt': '1'}
            elif isinstance(route["wpts"][i], dict):
                assert 'id' in route["wpts"][i] and 'kpt' in route["wpts"][i], f'Incomplete waypoint data at index {i}: {route["wpts"][i]}'
                assert int(route["wpts"][i]['kpt']) == 0 or int(route["wpts"][i]['kpt']) == 1, f'kpt value at index {i} is {route["wpts"][i]["kpt"]}, should be 0 or 1'
            else:
                assert False, f'Janked waypoint data at index {i}: {wpts[i]}'
        self.write_routes_csv(
            route['operator'],
            route['type'],
            route['filename'],
            route['name'],
            route['description'])
        self.write_route_csv(
            route['filename'],
            route['wpts']
        )

    def write_routes_csv(self, operator, route_type, filename, name, description):
        """Adds one line to routes.csv, representing the metadata for one route,
        including the filepath for a CSV containing the actual route data.
        Contains the fields:

            'Operator': 'Bicycle' is used in this field for bike routes
            'Short name'
            'Direction': routes may have different waypoints in different
            directions - this gives the direction, generally using the start and
            endpoints, in the format 'Startpoint to Endpoint': if not (for
            example if the route is circular), 'reversed' will be appended to
            the description for the reverse direction.
            'Type': 'bus' or 'bike'
            'Filename': filepath to the relevant csv file.

        Parameters:
            operator: (str) included for consistency with bus routes - e.g.
                'National Cycling Route'
            route_type: (str) 'bike'
            filename: (str) filename for the individual route csv
            name: (str) name of route, e.g. 'NCN 76'
            description: (str) description, normally in the form "{start} to
                {end}"
        """
        # Check if 'routes.csv' and 'bike_waypoints.csv' end with a newline, so
        # that a newline can be added if needed.
        with open('routes.csv') as routes_file:
            nl_needed = routes_file.read()[-1] != '\n'
        # Append metadata for route appended to routes file, on new line.
        if "," in description:
            description = f'"{description}"'
        with open('routes.csv', 'a+') as routes_file:
            routes_file.write(
                f'{self.nl if nl_needed else ""}{operator},{name},{description},' +
                f'{route_type},{filename}'
            )

    def write_route_csv(self, filename, wpts):
        """Writes a new csv file containing the IDs in order of all the
        waypoints on a route. This consists of a single field
        'Waypoint', listing of the 8-digit unique IDs for waypoints in
        'bike_waypoints.csv' (or 'bus_stops.csv'), prefixed by 'C' for cycle (or
        'B' for bus).

        Parameters:
            filename (str)
            wpts (list): list of waypoints IDs.
        """
        with open('./routes/'+filename, 'a') as route_file:
            # CSV header line
            route_file.write('Waypoint,Is_Keypoint')
            # Write each waypoint ID, prepended with 'C' for Cycle
            for wpt in wpts:
                route_file.write(f"{self.nl}C{wpt['id']},{wpt['kpt']}")

    def add_gpx(self, filename):
        """Read all the routes in a GPX file and add their data to the CSV files
        that define the Edinburgh Flaneur bike route dataset. Recording a route
        involves four CSV files:

        'bike_waypoints.csv':
        All of the waypoints along the route will be added to this file, unless
        they are already included in the file. Contains the fields:

            'ID': a unique 8-digit number from 00000000 to 99999999)
            'Name'
            'Latitude'
            'Longitude'

        'routes.csv'
        Create a new line in this file with the metadata for the route,
        including the filepath for a CSV containing the actual route data.
        Contains the fields:

            'Operator': 'Bicycle' is used in this field for bike routes
            'Short name'
            'Direction': routes may have different waypoints in different
            directions - this gives the direction, generally using the start and
            endpoints, in the format 'Startpoint to Endpoint': if not (for
            example if the route is circular), 'reversed' will be appended to
            the description for the reverse direction.
            'Type': 'bus' or 'bike'
            'Filename': filepath to the relevant csv file.

        '{route_name}.csv' and '{route_name}_reversed.csv'
        CSVs containing the actual route data, consisting of a single field
        'Waypoint', listing of the 8-digit unique IDs for waypoints in
        'bike_waypoints.csv' (or 'bus_stops.csv'), prefixed by 'C' for cycle (or
        'B' for bus). The reversed file contains the same waypoints, but
        backwards. This is done for consistency with the bus route files, where
        the two directions of a route use different bus stops.

            Parameters:
                filename (str): filename of the GPX.
        """
        routes = self.read_gpx(filename)
        for route in routes:
            self.write_csvs(route)

    def add_gpxes(self):
        """Read a file containing filenames of GPX files to be extracted, & read
        all the listed GPXes with read_gpx.
        """
        with open('./gpxes.csv') as csv_file:
            csv_dict = DictReader(csv_file)
            for row in csv_dict:
                self.add_gpx('./routes/' + row['Filename'])

    def get_plan(self, name):
        """`plan` is a CycleStreets API parameter determining the type of route,
        which can be one of the values: balanced, fastest, quietest. From
        CycleStreets own documentation:
          - balanced: We recommend this to be the default route type in your
            interface - it aims to give practical routes that balance speed
            and pleasantness, suitable for most riders.
          - fastest: This route type will tend to favour busier roads that
            suit more confident riders.
          - quietest: The route type will produce more pleasant, but often
            less direct, routes.
        If `name` (the name of the route) matches one of these, it is returned
        in the correct case (lowercase); otherwise the default, 'quietest', is
        returned.
        """
        return name.lower() if name in ("Quietest", "Balanced", "Fastest") else "quietest"

    def paired_descriptions(self, description="", start={}, end={}, reverse=True):
        # The description is either given as a parameter, or if no description
        # parameter is provided, derived from the names of the start and end
        # points of the route ('{start} to {end}' and '{end} to {start}'). If a
        # description is provided (for the forward route), the description for
        # the reverse route is derived from it
        rev_description = ""
        if description:
            # If the route is circular, a description should be provided,
            # including the word 'Clockwise' or 'Anticlockwise': the description
            # for the reverse route is derived by exchanging these.
            if reverse:
                if "Anticlockwise" in description:
                    rev_description = description.replace(
                        "Anticlockwise",
                        "Clockwise"
                    )
                elif "Clockwise" in description:
                    rev_description = description.replace(
                        "Clockwise",
                        "Anticlockwise"
                    )
                # if the description consists of place names separated by " to ",
                # reverse the order - but in this case it is better to provide
                # 'start' and 'end' params.
                elif " to " in description:
                    rev_description = " to ".join(description.split(" to ")[-1::-1])
                # For any other provided description, derive the reverse description
                # simply by appending ", Reversed"
                else:
                    rev_description = description + ", Reversed"
        elif start and end:
            # The start and end points ar the same as the first and last
            # itinerary points, which are to be sent to the CycleStreets API in
            # the GET call.
            start_end = []
            for pt, se in ((start, "start"), (end, "end")):
                if isinstance(pt, dict):
                    if 'name' in pt:
                        start_end += [pt['name']]
                    else:
                        raise ValueError(f"{se} lacks the key 'name'")
                elif isinstance(pt, str):
                    start_end += [pt]
                else:
                    raise ValueError(f"{se} type is {type(pt)}: only str and " +
                        "dict are permitted")
            # Format the forward and reverse route descriptions, as explained
            # above
            description = f"{start_end[0]} to {start_end[1]}"
            if reverse:
                rev_description = f"{start_end[1]} to {start_end[0]}"
        else:
            raise ValueError("paired_descriptions must be given non-empty args"
                + " either for `description` or BOTH `start` and `end`")
        if reverse:
            return description, rev_description
        else:
            return description, ""

    def waypoints_from_cyclestreets_json(self, route_json, reverse=True):
        fwd_points = []
        if reverse:
            rev_points = []
        for route_segment in route_json["marker"]:
            if "points" in route_segment["@attributes"]:
                points = route_segment["@attributes"]["points"].split(" ")
                distances = route_segment["@attributes"]["distances"].split(",")
                name = route_segment["@attributes"]["name"]
                rev_dists = distances[1:] + ['0']
                for point, dist in zip(points, distances):
                    lon, lat = point.split(",")
                    fwd_points += [{
                        "name": name,
                        "lat": float(lat),
                        "lon": float(lon),
                        "dist": int(dist)
                    }]
                if reverse:
                    rev_dists = distances[1:] + ['0']
                    for rev_point, rev_dist in zip(points, rev_dists):
                        lon, lat = rev_point.split(",")
                        rev_points = [{
                            "name": name,
                            "lat": float(lat),
                            "lon": float(lon),
                            "dist": int(rev_dist)
                        }] + rev_points
        if reverse:
            return fwd_points, rev_points
        else:
            return fwd_points, {}

    def get_cyclestreets_route(self, itinerary_points, key=_CS_APIKEY, name="Quietest"):
        # `plan` is a CycleStreets API parameter determining the type of route,
        # which can be one of the values: balanced, fastest, quietest. From
        # CycleStreets own documentation:
        #   - balanced: We recommend this to be the default route type in your
        #     interface - it aims to give practical routes that balance speed
        #     and pleasantness, suitable for most riders.
        #   - fastest: This route type will tend to favour busier roads that
        #     suit more confident riders.
        #   - quietest: The route type will produce more pleasant, but often
        #     less direct, routes.
        plan = self.get_plan(name)
        # Waypoints are retrieved from the CycleStreets REST API using GET: the
        # `requests` package requires a url and params for a GET call.
        _url = "https://www.cyclestreets.net/api/journey.json?"
        _params = {
            "key": key,
            "reporterrors": 1,
            "itinerarypoints": "|".join([f'{pt["lon"]},{pt["lat"]},{format_as_url_param(pt["name"])}' for pt in itinerary_points]),
            "plan": plan
        }
        # GET the JSON for the route from CycleStreets
        print("Fetching route from CycleStreets")
        return requests.get(url=_url, params=_params).json()

    def get_route_json_from_cyclestreets(self, itinerary_points, key=_CS_APIKEY, name="Quietest", filename="", rev_filename="", operator="Bicycle", description = "", reverse = True, ids = True):
        cs_route = self.get_cyclestreets_route(itinerary_points, key=key, name=name)
        return self.cyclestreets_to_route_json(cs_route, itinerary_points, name=name, filename=filename, rev_filename=rev_filename, operator=operator, description=description, reverse=reverse, ids=ids)

    def cyclestreets_to_route_json(self, cs_route, itinerary_points=[], name="Quietest", filename="", rev_filename="", operator="Bicycle", description = "", reverse = True, ids = True):
        """
            Return:
                routes_data (list): a list of JSON-like dicts containing the
                    route and its reverse, each containing the following fields:
                        'wpts': List of dicts with two keys:
                            'id': 8-digit waypoint ID
                            'kpt': 1 if point is a keypoint (to be listed in the
                                itinerary for the user), or 0 if not (only used
                                to display path on map)
                        'filename': the name of the file in which the waypoint IDs
                            are to be stored,
                        'operator': By default, 'Bicycle', but when the route is
                            part of a recognised cycle trail, the organisation
                            responsible for the trail is
                        'type': 'bus' or 'bike' - in this case always 'bike'
                        'name': E.g., NCN 76
                        'description': Usually '{start} to {end}'
        """
        # `fwd_route` and `rev_route` are the dicts to be returned. The
        # following code blocks concern different elements of the dict.
        #################### 1: 'operator', 'type', 'name' ####################
        # The easy ones: the elements that ar either constant, or params of the
        # method
        fwd_route = {
            'operator': operator,
            'type': "bike",
            'name': name,
            'itinerary': cs_route["marker"][0]["@attributes"]["itinerary"]
        }
        if reverse:
            rev_route = {
                'operator': operator,
                'type': "bike",
                'name': name
            }
        else:
            rev_route = {}
        #################### 2: 'description' ------------ ####################
        # The description is either given as a parameter, or if no description
        # parameter is provided, derived from the names of the start and end
        # points of the route ('{start} to {end}' and '{end} to {start}'). If a
        # description is provided (for the forward route), the description for
        # the reverse route is derived from it.
        # if `reverse` is false, rv_desc will be the empty string.
        if itinerary_points:
            start = itinerary_points[0]
            end = itinerary_points[-1]
        else:
            start = {}
            end = {}
        fw_desc, rv_desc = self.paired_descriptions(description, start, end, reverse=reverse)
        fwd_route['description'] = fw_desc
        if reverse:
            rev_route['description'] = rv_desc
        #################### 3: 'filename' --------------- ####################
        # Filenames must be unique, but can be long. Unless otherwise specified,
        # they are based on the `plan` and the list of itinerary points. The
        # format is: '{plan}_{itin_pt[0].lat}_{itin_pt[0].lon}_to_ ...
        # ... _to_{itin_pt[-1].lat}_{itin_pt[-1].lon}.csv'
        plan = cs_route['marker'][0]['@attributes']['plan']
        fwd_route['filename'] = filename if filename else make_route_filename(
            plan, itinerary_points
        )
        # If applicable, make the reverse filename using `plan` and
        # itinerary_points in reverse order
        if reverse:
            rev_route['filename'] = rev_filename if rev_filename else make_route_filename(
                plan, itinerary_points[-1::-1]
            )
        #################### 4: 'wpts' ------------------- ####################
        # Generating the list(s) of waypoints happens in three stages:
        #################### 4: 'wpts' 4.1 Extract data from JSON #############
        # 4.1: extract relevant information from the CycleStreets JSON. Note
        # that while CycleStreets divides the route up into segments consisting
        # of several points, we need the route as a list of points.
        # If `reverse` is false, rev_points will be the empty dict
        fwd_points, rev_points = self.waypoints_from_cyclestreets_json(cs_route, reverse=reverse)
        #################### 4: 'wpts' 4.2 Postprocessing  ####################
        # 4.2: postprocessing: remove redundant points from list (the points at
        # the end of a CycleStreets segment and the beginning of the next have
        # the same lat/lon but different names: use the name for the new
        # segment) and identify keypoints
        #################### 4: 'wpts' 4.3 Convert to IDs (opt) ###############
        # 4.3 convert to IDs: The name and lat/lon values should be mapped to
        # waypoint IDs - either by finding an existing ID in the bike_waypoints
        # dataset, or by adding the waypoint to the dataset, with a new ID. The
        # 'wpts' list in the route dict consists only of the IDs paired with
        # flags indicating which are keypoints
        # Use lambdas to compose functions for postprocessing - either
        # validation + conversion to waypoint IDs (if ids is true), or else just
        # validation
        if ids:
            finalise_points = lambda pts: self.wpts_to_IDs(self.validate_points(pts))
        else:
            finalise_points = lambda pts: self.validate_points(pts)
        fwd_route['wpts'] = finalise_points(fwd_points)
        if reverse:
            rev_route['wpts'] = finalise_points(rev_points)
        # If `reverse` is false, `rev_route` will be the empty dict
        return [fwd_route, rev_route]

    def validate_points(self, wpts, segmented=True):
        """Take a list of waypoints, remove any that are equivalent (points with
        the same lat-lon or extremely close, even if they differ in name) to
        their neighbours, and determines which waypoints on the route are
        keypoints. Each waypoint is a dict that includes keys for 'lat' and
        'lon', and this method adds fields:

            'dist': distance from previous waypoint (only added if not already
                included: CycleStreets outputs already provide this)
            'kpt' (bool): indicates whether the point is considered a keypoint:
                the Edinburgh Flaneur frontend lists the keypoints on a route
                and shows which cultural sites are close to each - points that
                are not keypoints are only used to display the route as a line
                on a map
            'sd': 'sum of distances' -- this is shown for keypoints only, and
                gives the distance from the last keypoint to the current, using
                the sum of 'dist' values. This way, 'sd' shows the distance as
                travelled by someone following the route.

        Parameters:
            wpts (list(dict)): the original waypoints
            segmented (bool): True if the original data is organised as route-
                segments, such that each segment has the same name for all
                points (e.g. a street name), and the first point of each segment
                has the same lat & lon as the last point of the previous, and
                has a 'dist' of zero. CycleStreets data is structured this way.

        Returns:
            totally_valid (list(dict)): the validated waypoints
        """
        # 'dist' is used extensively in assigning keypoint status, and the
        # status of a point is used both by points behind and ahead. As such
        # it is best to ensure that all points include a 'dist' value, before
        # the rest of the computation is done
        for k in range(len(wpts)):
            # note that some route data sources provide distances, so the
            # distance is only calculated if needed.
            if not 'dist' in wpts[k]:
                wpts[k]['dist'] = dist_pts(wpts[k], wpts[k-1]) if k else 0
        # initialise the return variable
        totally_valid = []
        # used to track the distance travelled since the last keypoint
        sum_dists = 0
        for i in range(len(wpts)):
            sum_dists += wpts[i]['dist']
            # the validated list of points includes the final point, and all
            # points that are not approximately the same as the point that
            # follows
            if i == len(wpts)-1 or not points_approx_eq((wpts[i]['lat'],wpts[i]['lon']),(wpts[i+1]['lat'],wpts[i+1]['lon'])):
                # the conditional is enough to ensure that invalid points are
                # skipped - so any point that passes the conditional can be
                # added to totally_valid. The rest of the computation calculates
                # keypoint status
                totally_valid = totally_valid + [wpts[i]]
                # by default, points are not keypoints ...
                is_keypoint = False
                # ...however, the first and last points of a route are always
                # keypoints, as are the first points of each segment. For
                # segmented (`segment == True`) data, a 'dist' of 0 indicates a
                # new segment; otherwise, a point is considered the start of a
                # segment if it has a name different from the previous point
                if (wpts[i]['dist'] == 0 if segmented else wpts[i]['name'] != wpts[i-1]['name']) or i == len(wpts)-1 or i == 0:
                    is_keypoint = True
                else:
                    # ... however, some points in between segment boundaries may
                    # also be keypoints, if the keypoints would otherwise be too
                    # far apart. If a point is not less than 100m from the last
                    # keypoint, it will be a keypoint, unless it is less than
                    # 25m from the next certain-to-be-a-keypoint point
                    if sum_dists >= 100:
                        # First, keypoint is set to true: it will be set to
                        # false again if a point is found 25m or less ahead
                        # which *must* be a keypoint.
                        is_keypoint = True
                        # create a total to add up distances to the next must-be
                        # -a-keypoint point, and an index to check through
                        # points ahead.
                        dist_to_end_segment = 0
                        j = i+1
                        # Check points ahead as long as the following conditions
                        # hold:
                        #   * The end of the list has not been reached
                        #   * dist_to_end_segment hasn't gone over 25 (if it
                        #       has, wpt[i]'s keypoint status is certain, and we
                        #       can stop checking)
                        #   * Otherwise, we are looking for the next segment
                        #       break:
                        #       - If the route data is segmented, a 'dist' of
                        #           zero indicates a segment break has been
                        #           found.
                        #       - Otherwise, a change of street-name
                        while j < len(wpts) and dist_to_end_segment < 25 and (wpts[i]['dist'] > 0 if segmented else wpts[i]['name'] == wpts[i-1]['name']):
                            # add up distances
                            dist_to_end_segment += wpts[j]['dist']
                            # if a point is found 100m or more from the
                            # previous, the previous *must* be a keypoint, and
                            # so, in case wpts[i] is not the previous, keypoint
                            # is set to false.
                            if wpts[j]['dist'] >= 100 and wpts[j]['dist'] > wpts[i]['dist']:
                                is_keypoint = False
                            # increment the index
                            j += 1
                        # if a segment-break was found in under 25m, set
                        # keypoint to false
                        if dist_to_end_segment < 25:
                            is_keypoint = False
                    # if the next point is over 100m away, the current point
                    # *must* be a keypoint
                    if i+1 < len(wpts) and wpts[i+1]['dist'] >= 100:
                        is_keypoint = True
                # In the route JSON, the status os a point as a keypoint is
                # stored as a 0 or 1
                totally_valid[-1]["kpt"] = int(is_keypoint)
                # To check that the function is performing as expected, for each
                # keypoint, heep a record of how far it is from the previous
                # keypoint.
                if is_keypoint:
                    totally_valid[-1]["sd"] = sum_dists
                    sum_dists = 0
        #print(json.dumps(totally_valid, indent=2))
        return totally_valid

    def wpts_to_IDs(self, wpts):
        nl_needed = file_needs_newline('bike_waypoints.csv')
        new_wpts = []
        for wpt in wpts:
            ID, nl_needed = self.get_or_add_bike_wpt(wpt['name'], wpt['lat'], wpt['lon'], nl_needed)
            new_wpts += [{'id': ID, 'kpt': wpt['kpt']}]
        return new_wpts

    def add_cyclestreets(self, itinerary_points, key=_CS_APIKEY, name="Quietest", filename="", rev_filename="", operator="Bicycle", description = ""):
        """Read all the routes in a GPX file and add their data to the CSV files
        that define the Edinburgh Flaneur bike route dataset. Recording a route
        involves four CSV files:

        'bike_waypoints.csv':
        All of the waypoints along the route will be added to this file, unless
        they are already included in the file. Contains the fields:

            'ID': a unique 8-digit number from 00000000 to 99999999)
            'Name'
            'Latitude'
            'Longitude'

        'routes.csv'
        Create a new line in this file with the metadata for the route,
        including the filepath for a CSV containing the actual route data.
        Contains the fields:

            'Operator': 'Bicycle' is used in this field for bike routes
            'Short name'
            'Direction': routes may have different waypoints in different
            directions - this gives the direction, generally using the start and
            endpoints, in the format 'Startpoint to Endpoint': if not (for
            example if the route is circular), 'reversed' will be appended to
            the description for the reverse direction.
            'Type': 'bus' or 'bike'
            'Filename': filepath to the relevant csv file.

        '{route_name}.csv' and '{route_name}_reversed.csv'
        CSVs containing the actual route data, consisting of a single field
        'Waypoint', listing of the 8-digit unique IDs for waypoints in
        'bike_waypoints.csv' (or 'bus_stops.csv'), prefixed by 'C' for cycle (or
        'B' for bus). The reversed file contains the same waypoints, but
        backwards. This is done for consistency with the bus route files, where
        the two directions of a route use different bus stops.

            Parameters:
                filename (str): filename of the GPX.
        """
        # itinerary_points, key=_CS_APIKEY, name="Quietest", filename="", rev_filename="", operator="Bicycle", description = ""
        routes = self.get_route_json_from_cyclestreets(itinerary_points, key=key, name=name, filename=filename, rev_filename=rev_filename, operator=operator, description=description)
        for route in routes:
            self.write_csvs(route)

    def add_new_routes(self):
        funcs = {
            "cyclestreets": self.add_cyclestreets,
            "gpx": self.add_gpx,
            "waymarked": self.add_waymarked_trails
        }
        with open("load_routes.json") as file:
            new_routes = json.load(file)
        for route in new_routes:
            if route["new"]:
                route["new"] = 0
                if route["source"] in funcs:
                    funcs[route["source"]](**route["params"])
                else:
                    print(f'Source "{route["source"]}" not recognised')

    def route_json_to_geojson_linestring(self, route_json):
        coordinates = []
        for wpt in route_json["wpts"]:
            if "lat" in wpt and "lon" in wpt:
                lat, lon = float(wpt['lat']), float(wpt['lon'])
            elif "id" in wpt:
                waypt = self.get_bike_wpt_from_id(wpt['id'])
                lat, lon = float(waypt['Latitude']), float(waypt['Longitude'])
            else:
                raise ValueError("Malformed waypoint: waypoint must have a" +
                    " valid ID or a latitude and longitude")
            coordinates += [[lon, lat]]
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordinates
                    }
                }
            ]
        }
        return geojson

    def send_geojson_to_cyclestreets(self, geojson):
        _url = "https://api.cyclestreets.net/v2/gpstracks.add?"
        _data = {
            "key": _CS_APIKEY,
            "coords": geojson,
            "format": "geojson",
            "notes": "",
            "purpose": "",
            "start": 1616652397,
            "device": "Etch-a-Sketch",
            "username": "talkymeat",
            "password": "p4w7IgnVR^Un!ah^g$O7a^5w1KSddy%463hKfqGGk5DsP"
        }
        reply = requests.post(url = _url, data = _data)
        return reply.json()

    def cyclestreets_geocoder_search(self, query, limit=100, bbox="-3.4,55.85,-2.8,56.01", bounded=True, geometries=True):
        _url = "https://api.cyclestreets.net/v2/geocoder?"
        _params = {
            "key": _CS_APIKEY,
            "q": format_as_url_param(query),
            "limit": limit,
            "bbox": bbox,
            "bounded": int(bounded),
            "geometries": int(geometries)
        }
        result = requests.get(url=_url, params=_params).json()
        if "error" in result:
            return result
        places = {}
        for feature in result["features"]:
            if feature["geometry"]["type"] != "Point":
                print(f"CycleStreets returned a {feature['geometry']['type']} feature")
            if not (feature["properties"]["name"], feature["properties"]["near"]) in places:
                places[(
                    feature["properties"]["name"],
                    feature["properties"]["near"]
                )] = []
            places[(
                feature["properties"]["name"],
                feature["properties"]["near"]
                )] += [feature["geometry"]["coordinates"],]
        return places

    def export_route_json(self, rt, fn):
        rt["name"] = rt["name"] if rt["name"] else "Quietest"
        rt["operator"] = rt["operator"] if rt["operator"] else "Bicycle"
        rt['description'] = self.paired_descriptions(
            description=rt['description'],
            start=rt['itinerary_points'][0],
            end=rt['itinerary_points'][-1],
            reverse=False
        )[0]
        if fn:
            if not fn.lower().endswith('.json'):
                fn += '.json'
        else:
            fn = 'route.json'
        with open(fn, 'w') as rt_json:
            rt_json.write(json.dumps(rt, indent=2))
            return fn

    def refine_route(self):
        dashed_line = '---------------------------------------------------'
        nyoo = 0
        def validate_point(point_str, prompt):
            lat_correct, lon_correct = False, False
            point = {}
            while not (lat_correct and lon_correct):
                if point_str.startswith('?'):
                    return choose_point(point_str[1:].strip())
                point_strings = point_str.strip().split(" ")
                if len(point_strings) == 2:
                    for i in [0, 1]:
                        while not [lat_correct, lon_correct][i]:
                            coord_str = point_strings[i].strip()
                            if re.fullmatch("-?[0-9][0-9]?[0-9]?\.[0-9]+", coord_str):
                                point[['lat', 'lon'][i]] = float(coord_str)
                                if i:
                                    if point['lon'] < -3.4 or point['lon'] > -2.8:
                                        print(f"Your {prompt.lower()} longitude {point['lon']}" +
                                            " is out of range: it should be between " +
                                            "-3.4 and -2.8. Please try again," +
                                            " or use '?' to search by place " +
                                            "name or postcode."
                                        )
                                        point_strings[i] = input("Longitude: ")
                                        if point_strings[i].startswith('?'):
                                            return choose_point(point_str[1:].strip())
                                        lon_correct = False
                                    else:
                                        lon_correct = True
                                else:
                                    if point['lat'] < 55.8 or point['lat'] > 56.01:
                                        print(f"Your {prompt.lower()} latitude {point['lat']}" +
                                            " is out of range: it should be between " +
                                            "55.85 and 56.01. Please try again," +
                                            " or use '?' to search by place " +
                                            "name or postcode."
                                        )
                                        point_strings[i] = input("Latitude: ")
                                        if point_strings[i].startswith('?'):
                                            return choose_point(point_str[1:].strip())
                                        lat_correct = False
                                    else:
                                        lat_correct = True
                            else:
                                print(f"Your {prompt.lower()} {['lat', 'long'][i]}itude " +
                                    "is not correctly formatted as a decimal " +
                                    f"number: '{coord_str}'. Please try again," +
                                    " or use '?' to search by place " +
                                    "name or postcode."
                                )
                                point_strings[i] = input(f"{['Lat', 'Long'][i]}itude: ")
                                if point_strings[i].startswith('?'):
                                    return choose_point(point_strings[i][1:].strip())
                                if i:
                                    lon_correct = False
                                else:
                                    lat_correct = False
                else:
                    print(f"Your {prompt.lower()} should consist only of two " +
                        "decimal numbers separated by a space."
                    )
                    point_str = input("Please try again, or use '?' to search" +
                        " by place name or postcode: ")
                    [lat_correct, lon_correct] = False, False
                    if point_str.startswith('?'):
                        return choose_point(point_str[1:].strip())
                if lat_correct and lon_correct:
                    closest_point = requests.get(
                        url = "https://api.cyclestreets.net/v2/nearestpoint?",
                        params = {
                            "lonlat": f"{point['lon']},{point['lat']}",
                            "key": _CS_APIKEY
                        }
                    ).json()
                    if "error" in closest_point:
                        print(
                            "The CycleStreets API returned the following error: ",
                            closest_point['error']
                        )
                        point_str = input("Please try again: ")
                        [lat_correct, lon_correct] = False, False
                    else:
                        new_point = {
                            "lat": closest_point["features"][0]["geometry"]["coordinates"][1],
                            "lon": closest_point["features"][0]["geometry"]["coordinates"][0],
                            "name": closest_point["features"][0]["properties"]["name"]
                        }
                        print(
                            "The closest point on the CycleStreets network to " +
                            f"({point['lat']:5f}, {point['lon']:.5f}) is " +
                            f"{new_point['name']} at ({new_point['lat']:5f}, " +
                            f"{new_point['lon']:.5f})."
                        )
                        point_str = input(
                            "Press Enter to accept this, or enter a new lat-lon pair" +
                            " to try again."
                            )
                        if point_str:
                            [lat_correct, lon_correct] = False, False
            return new_point

        def choose_point(q):
            width = os.get_terminal_size()[0]
            selection_of_points = self.cyclestreets_geocoder_search(q)
            chosen_point = {}
            while not chosen_point:
                if "error" in selection_of_points:
                    print(
                        "CycleStreets returned the following error: ",
                        selection_of_points["error"]
                    )
                    selection_of_points = self.cyclestreets_geocoder_search(
                        input("Please try again: ? ")
                    )
                elif selection_of_points:
                    point_i_list = []
                    print(f"CycleStreets found {len(selection_of_points)} " +
                        "locations matching your search. Please select:"
                    )
                    print(dashed_line)
                    for k, v in selection_of_points.items():
                        print(f"{k[0]}, {k[1]}:")
                        print_str = ""
                        for point in v:
                            pt_str = f"#{len(point_i_list)}: {point[1]:.5f}, {point[0]:.5f}"
                            point_i_list += [{
                                "name": k[0],
                                "lat": point[1],
                                "lon": point[0]
                            }]
                            if len(print_str) + len(pt_str) + 1 > width:
                                print(print_str)
                                print_str = ""
                            print_str += " " + pt_str
                        if print_str:
                            print(print_str)
                    str_i = input("Select a point using its ID number: #")
                    chosen_point = point_i_list[
                        select_index(str_i, len(point_i_list)-1, "point")
                    ]
                    while not chosen_point:
                        if re.fullmatch("[0-9]+", str_i):
                            i = int(str_i)
                            if i >= len(point_i_list):
                                print(f"No point {i} exists")
                                str_i = input("Please try again: #")
                            else:
                                chosen_point = point_i_list[i]
                        else:
                            print(
                                f"{str_i} is not a valid input. Please enter " +
                                "only digits."
                            )
                            str_i = input("Select a point using its ID number: #")
                else:
                    print("CycleStreets found no results for your search.")
                    selection_of_points = self.cyclestreets_geocoder_search(
                        input("Please try again: ? ")
                    )
            return chosen_point

        def select_index(str_i, max, pos):
            while True:
                if re.fullmatch("[0-9]+", str_i):
                    i = int(str_i)
                    if i > max:
                        print(f"No {pos} {i} exists")
                        str_i = input("Please try again: #")
                    else:
                        return i #chosen_point = point_i_list[i]
                else:
                    print(
                        f"{str_i} is not a valid input. Please enter " +
                        "only digits."
                    )
                    str_i = input(f"Select a {pos} using its ID number: #")

        def whats_the_point(prompt, del_avail=False, nope_avail=False):
            sq = "'"
            print(f"Please enter the latitude and longitude of your {prompt.lower()}, " +
                "separated only by a space, e.g.: '55.99058 -3.38423', OR, if you" +
                " wish to search for a street, landmark, or postcode, enter '?' " +
                " followed by your search string, e.g.: '? Princes Street'" +
                f"{', OR enter '+sq+'-'+sq+' to delete the chosen point' if del_avail else ''}" +
                f"{', OR just press Enter to go back a step.' if nope_avail else '.'}"
            )
            in_str = input(f"{prompt}: ")
            if in_str.startswith('?'):
                return choose_point(in_str)
            elif del_avail and in_str == '-':
                return {}
            elif nope_avail and not in_str:
                return {"nope": "nope"}
            else:
                return validate_point(in_str, prompt)

        def display_name(rt):
            op = rt['operator'] if rt['operator'] else 'Bicycle'
            name = rt['name'] if rt['name'] else 'Quietest'
            desc = self.paired_descriptions(
                description=rt['description'],
                start=rt['itinerary_points'][0],
                end=rt['itinerary_points'][-1],
                reverse=False
            )[0]
            return f"{op} {name}, {desc}"

        def display_point(point):
            return f"{point['name']}, ({point['lat']}, {point['lon']})"

        def get_route_url(rewt):
            if "error" in rewt:
                return ""
            id = rewt["marker"][0]["@attributes"]["itinerary"]
            return f"https://edinburgh.cyclestreets.net/journey/{id}/"

        def get_part_route_url(it_pts, *args):
            cs_part_url = get_route_url(
                self.get_cyclestreets_route(
                    itinerary_points = [it_pts[i] for i in args],
                    key=_CS_APIKEY
                )
            )
            return cs_part_url

        rt = {}
        print("Welcome to the Edinburgh Flaneur Route Refiner. Please enter " +
            "the name of the route operator (e.g. National Cycle Network), or" +
            " just hit enter to use the default value, 'Bicycle'."
        )
        rt["operator"] = input("Operator: ")
        print("Please enter the name of the route: e.g. for an NCN route, use" +
            " the route number. The default is 'Quietest'."
        )
        rt["name"] = input("Name: ")
        print("By default, the Route Refiner generates a description based on" +
            " the start and end points of the route. If you wish to use a " +
            "different description, please enter it here."
        )
        rt["description"] = input("Description: ")
        rt["itinerary_points"] = [whats_the_point('Start point')]
        rt["itinerary_points"] += [whats_the_point("End point")]
        satisfied = False
        while not satisfied:
            padded_points = [{}]*(len(rt['itinerary_points'])*2+1)
            for j, pnt in enumerate(padded_points):
                if j%2:
                    padded_points[j] = rt['itinerary_points'][(j-1)//2]
            print(dashed_line)
            print(f"{display_name(rt)}:")
            for i, point in enumerate(padded_points):
                if point:
                    print(f"#{i}: {display_point(point)}")
                else:
                    print(f"#{i}: ----------------------------")
            shared = ("one of the position IDs above. Even-numbered IDs " +
                "insert a new point, while odd-numbered IDs insert replace or" +
                " delete an existing point.")
            cs_rt = self.get_cyclestreets_route(
                itinerary_points = rt['itinerary_points'],
                key=_CS_APIKEY
            )
            cs_url = get_route_url(cs_rt)
            if cs_url:
                print(
                    "If you are satisfied with this route, press Enter. If you " +
                    "would like to change it, enter " + shared
                )
                webbrowser.open(cs_url, nyoo, False) # urlesque
            else:
                print(
                    "CycleStreets was unable to find a route for these " +
                    "itinerary points, and returned the following error:"
                )
                print(cs_rt['error'])
                print(
                    "To try again, alter the itinerary points. Enter " + shared +
                    "Alternatively, to quit press Enter"
                )
            id_str = input("# ")
            if id_str:
                waiting_for_id = True
                id_no = select_index(
                    id_str,
                    len(rt['itinerary_points'])*2,
                    'position'
                )
                prompt = ""
                if not id_no:
                    print(
                        "You are inserting a new start point before " +
                        f"{display_point(padded_points[1])}."
                    )
                    prompt = "New start"
                    if len(padded_points) > 5:
                        cs_part_url = get_part_route_url(padded_points, 1, 3)
                        if cs_part_url:
                            webbrowser.open(cs_part_url, nyoo, False) # urlesque
                elif id_no == len(padded_points)-1:
                    print(
                        "You are inserting a new end point after " +
                        f"{display_point(padded_points[-2])}."
                    )
                    prompt = "New end"
                    if len(padded_points) > 5:
                        cs_part_url = get_part_route_url(padded_points, -4, -2)
                        if cs_part_url:
                            webbrowser.open(cs_part_url, nyoo, False) # urlesque
                elif padded_points[id_no]:
                    print(f"You are replacing {display_point(padded_points[id_no])}.")
                    prompt = "Replacement"
                    if len(padded_points) > 7 or (len(padded_points) == 7 and id_no != 3):
                        args = [id_no-2] if id_no > 1 else []
                        args += [id_no]
                        args += [id_no+2] if id_no < len(padded_points) -1 else []
                        cs_part_url = get_part_route_url(padded_points, *args)
                        if cs_part_url:
                            webbrowser.open(cs_part_url, nyoo, False) # urlesque
                else:
                    print(
                        "You are inserting a new point between " +
                        f"{display_point(padded_points[id_no-1])} and " +
                        f"{display_point(padded_points[id_no+1])}"
                    )
                    prompt = "New point"
                    if len(padded_points) > 5:
                        cs_part_url = get_part_route_url(padded_points, id_no-1, id_no+1)
                        if cs_part_url:
                            webbrowser.open(cs_part_url, nyoo, False) # urlesque
                bonus_point = whats_the_point(prompt, True, True)
                if "nope" in bonus_point:
                    print("OK, try again.")
                else:
                    padded_points[id_no] = bonus_point
                rt["itinerary_points"] = []
                for it_pt in padded_points:
                    if it_pt:
                        rt["itinerary_points"] += [it_pt]
            else:
                satisfied = True
        print(f"Your route, '{display_name(rt)}', is complete. Enter:")
        print("1 to add your route to the Edinburgh Flaneur routes database.")
        print("2 to export your route metadata as a JSON file.")
        print("3 to do both.")
        print("Or anything else to exit.")
        opt = input("Your choice: ")
        if opt in ("1", "2", "3"):
            if opt in ("2", "3"):
                print("Enter a filename for your JSON, or press enter to use " +
                    "the default, 'route.json':"
                )
                fn = input("Filename: ")
                fn = self.export_route_json(rt, fn)
                print(f"JSON exported as '{fn}'")
            if opt in ("1", "3"):
                self.add_cyclestreets(**rt)
                print(
                    f"'{display_name(rt)}' has been added to your local copy " +
                    "of the Edinburgh Flaneur route database. Remember to " +
                    "push to GitHub if you want to add it to the live database."
                )
        print(
            "Do you wish to add another route? If yes, enter 'y', if no, " +
            "enter anything else."
        )
        y_n = input("Again? ")
        if y_n.lower().startswith('y'):
            self.refine_route()
        else:
            print("Thank you and goodbye!")

if __name__ == '__main__':
    # create GPX extractor and extract all GPXes listed in gpxes.csv
    routex = Route_Extractor()
    # While testing, load the JSON for the route data from a file, saved
    # from a previous call on the CycleStreets REST API, so this should be
    # set to 'if 0:'. Set to 'if 1:' for deployment
    # if 1:
    #
    # else:
    #     # Load the JSON for the route from file
    #     with open("route.json") as file:
    #         cs_json = json.loads(file.read())
    routex.add_new_routes()
    # with open("route.json") as file:
    #     cs_json = json.loads(file.read())
    # #cs_route, itinerary_points, name="Quietest", filename="", rev_filename="", operator="Bicycle", description = "", reverse = True, ids = True
    # route_json, nothing = routex.cyclestreets_to_route_json(cs_json, filename = "fake.csv", description="Testing a Thing", reverse = False, ids = False)
    # geojson = routex.route_json_to_geojson_linestring(route_json)
    # print(routex.send_geojson_to_cyclestreets(geojson))
    # routex.refine_route()
    # print(routex.cyclestreets_geocoder_search("princes Street"))
    # test_rte = routex.read_waymarked_trails_gpx(
    #     '(JMW)',
    #     'routes/downloads-main/waymarkedTrails/ncn/john-muir-way.gpx',
    #     start_fn='routes/downloads-main/waymarkedTrails/ncn/john-muir-way-start-musselburgh.gpx',
    #     end_fn='routes/downloads-main/waymarkedTrails/ncn/john-muir-way-end-south-queensferry.gpx',
    #     start_nm='Musselburgh',
    #     end_nm='South Queensferry',
    #     operator='John Muir Way'
    # )
    # print(json.dumps(test_rte, indent=2))
    # def read_waymarked_trails_gpx(self, name, route_fn, start_fn='', end_fn='', start_nm='', end_nm='', desc='' operator=''):
