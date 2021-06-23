from csv import DictReader, DictWriter
import gpxpy, re
import gpxpy.gpx
import os
import requests
import json
import math

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
            assert key in route, f"The route object does not contain the key {key}."
            assert route[key], f"The key {key} in route does not map to a value."
        for i in range(len(route['wpts'])):
            if isinstance(route["wpts"][i], str):
                route["wpts"][i] = {'id': route["wpts"][i], 'kpt': '1'}
            elif isinstance(route["wpts"][i], dict):
                assert 'id' in route["wpts"][i] and 'kpt' in route["wpts"][i], f'Incomplete waypoint data at index {i}: {route["wpts"][i]}'
                #print(type(route["wpts"][i]['kpt']))
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

    def get_cyclestreets_route(self, itinerary_points, key=_CS_APIKEY, name="Quietest", filename="", operator="Bicycle", description = ""):
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
        plan = name.lower() if name in ("Quietest", "Balanced", "Fastest") else "quietest"
        # `fwd_route` and `rev_route` are the dicts to be returned. The
        # following code blocks concern different elements of the dict.
        #################### 1: 'operator', 'type', 'name' ####################
        # The easy ones: the elements that ar either constant, or params of the
        # method
        fwd_route = {
            'operator': operator,
            'type': "bike",
            'name': name,
        }
        rev_route = {
            'operator': operator,
            'type': "bike",
            'name': name
        }
        #################### 2: 'description' ------------ ####################
        # The description is either given as a parameter, or if no description
        # parameter is provided, derived from the names of the start and end
        # points of the route ('{start} to {end}' and '{end} to {start}'). If a
        # description is provided (for the forward route), the description for
        # the reverse route is derived from it
        if not description:
            # The start and end points ar the same as the first and last
            # itinirary points, which are to be sent to the CycleStreets API in
            # the GET call.
            start = itinerary_points[0]["name"]
            end = itinerary_points[-1]["name"]
            # Format the forward and reverse route descriptions, as explained
            # above
            fwd_route['description'] = f"{start} to {end}"
            rev_route['description'] = f"{end} to {start}"
        else:
            fwd_route['description'] = description
            # If the route is circular, a description should be provided,
            # including the word 'Clockwise' or 'Anticlockwise': the description
            # for the reverse route is derived by exchanging these.
            if "Anticlockwise" in description:
                rev_route['description'] = description.replace(
                    "Anticlockwise",
                    "Clockwise"
                )
            elif "Clockwise" in description:
                rev_route['description'] = description.replace(
                    "Clockwise",
                    "Anticlockwise"
                )
            # For any other provided description, derive the reverse description
            # simply by appending ", Reversed"
            else:
                rev_route['description'] = description + ", Reversed"
        #################### 3: 'filename' --------------- ####################
        # Filenames must be unique, but can be long. They are based on the
        # `plan` and the list of itinerary points. The format is:
        # '{plan}_{itin_pt[0].lat}_{itin_pt[0].lon}_to_ ...
        # ... _to_{itin_pt[-1].lat}_{itin_pt[-1].lon}.csv'
        fwd_route['filename'] = make_route_filename(plan, itinerary_points)
        # Make the reverse filename using `plan` and itinerary_points in reverse
        # order
        rev_route['filename'] = make_route_filename(
            plan, itinerary_points[-1::-1]
        )
        #################### 4: 'wpts' ------------------- ####################
        # Waypoints are retrieved from the CycleStreets REST API using GET: the
        # `requests` package requires a url and params for a GET call.
        _url = "https://www.cyclestreets.net/api/journey.json?"
        _params = {
            "key": key,
            "reporterrors": 1,
            "itinerarypoints": "|".join([f'{pt["lon"]},{pt["lat"]},{format_as_url_param(pt["name"])}' for pt in itinerary_points]),
            "plan": plan
        }
        # While testing, load the JSON for the route data from a file, saved
        # from a previous call on the CycleStreets REST API, so this should be
        # set to 'if 0:'. Set to 'if 1:' for deployment
        if 1:
            # GET the JSON for the route from CycleStreets
            print("Fetching route from CycleStreets")
            route_json = requests.get(url=_url, params=_params).json()
        else:
            # Load the JSON for the route from file
            with open("route.json") as file:
                route_json = json.loads(file.read())
        # Temporary lists are created for the forward and reverse waypoints,
        # as these go through some post-processing before being added to the
        # lists in the route dicts. Generating the lists of waypoints happens in
        # three stages:
        # 4.1: extract relevant information from the CycleStreets JSON. Note
        # that while CycleStreets divides the route up into segments consisting
        # of several points, we need the route as a list of points.
        # 4.2: postprocessing: remove redundant points from list (the points at
        # the end of a CycleStreets segment and the beginning of the next have
        # the same lat/lon but different names: use the name for the new
        # segment) and identify keypoints
        # 4.3 convert to IDs: The name and lat/lon values should be mapped to
        # waypoint IDs - either by finding an existing ID in the bike_waypoints
        # dataset, or by adding the waypoint to the dataset, with a new ID. The
        # 'wpts' list in the route dict consists only of the IDs paired with
        # flags indicating which are keypoints
        fwd_points = []
        rev_points = []
        #################### 4: 'wpts' 4.1 Extract data from JSON #############
        #print(route_json)
        for route_segment in route_json["marker"]:
            if "points" in route_segment["@attributes"]:
                points = route_segment["@attributes"]["points"].split(" ")
                distances = route_segment["@attributes"]["distances"].split(",")
                rev_dists = distances[1:] + ['0']
                name = route_segment["@attributes"]["name"]
                for point, dist, rev_dist in zip(points, distances, rev_dists):
                    lon, lat = point.split(",")
                    fwd_points = fwd_points + [{
                        "name": name,
                        "lat": float(lat),
                        "lon": float(lon),
                        "dist": int(dist)
                    }]
                    rev_points = [{
                        "name": name,
                        "lat": float(lat),
                        "lon": float(lon),
                        "dist": int(rev_dist)
                    }] + rev_points

        #################### 4: 'wpts' 4.2 Postprocessing  ####################
        nl_needed = file_needs_newline('bike_waypoints.csv')
        for wpts, route in ((fwd_points, fwd_route), (rev_points, rev_route)):
            route['wpts'] = self.validate_points(wpts)
            ################ 4: 'wpts' 4.3 Convert to IDs  ####################
            for wpt in route['wpts']:
                ID, nl_needed = self.get_or_add_bike_wpt(wpt['name'], wpt['lat'], wpt['lon'], nl_needed)
                wpt['id'] = ID
        return [fwd_route, rev_route]

    def validate_points(self, wpts):
        totally_valid = []
        sum_dists = 0
        for i in range(len(wpts)):
            sum_dists += wpts[i]['dist']
            if i == len(wpts)-1 or not points_approx_eq((wpts[i]['lat'],wpts[i]['lon']),(wpts[i+1]['lat'],wpts[i+1]['lon'])):
                totally_valid = totally_valid + [wpts[i]]
                is_keypoint = False
                if wpts[i]['dist'] == 0 or i == len(wpts)-1:
                    is_keypoint = True
                else:
                    if sum_dists >= 100:
                        is_keypoint = True
                        dist_to_end_segment = 0
                        j = i+1
                        while j < len(wpts) and dist_to_end_segment < 25 and wpts[j]['dist'] > 0:
                            dist_to_end_segment += wpts[j]['dist']
                            if wpts[j]['dist'] >= 100:
                                is_keypoint = False
                            j += 1
                        if dist_to_end_segment < 25:
                            is_keypoint = False
                    if i+1 < len(wpts) and wpts[i+1]['dist'] >= 100:
                        is_keypoint = True
                totally_valid[-1]["kpt"] = int(is_keypoint)
                if is_keypoint:
                    totally_valid[-1]["sd"] = sum_dists
                    sum_dists = 0
                    #print(f"{wpts[i]['sd']}\t{wpts[i]['name']}")
                    #if wpts[i]['sd'] >= 200:
                        #print(wpts[i])
        #print(json.dumps(totally_valid, indent=2))
        return totally_valid

    def add_cyclestreets(self, itinerary_points, key=_CS_APIKEY, name="Quietest", filename="", operator="Bicycle", description = ""):
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
        routes = self.get_cyclestreets_route(itinerary_points, key, name, filename, operator, description)
        for route in routes:
            self.write_csvs(route)

    def add_new_routes(self):
        funcs = {
            "cyclestreets": self.add_cyclestreets,
            "gpx": self.add_gpx
        }
        with open("load_routes.json") as file:
            new_routes = json.load(file)
        for route in new_routes:
            if route["new"]:
                route["new"] = 0
                #print(route)
                if route["source"] in funcs:
                    funcs[route["source"]](**route["params"])
                else:
                    print(f'Source "{route["source"]}" not recognised')

if __name__ == '__main__':
    # create GPX extractor and extract all GPXes listed in gpxes.csv
    routex = Route_Extractor()
    routex.add_new_routes()
