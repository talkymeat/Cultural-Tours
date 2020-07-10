from math import sin, asin, cos, radians, fabs, sqrt

# from Linrui ipynb on 'basic functions for orgs adn localities'
# this is the function to calculate the distance(km)

EARTH_RADIUS=6371009 # the average radius of the Earth in metres

def hav(theta):
    s = sin(theta / 2)
    return s * s

def get_distance(lat0, lng0, lat1, lng1):

    lat0 = radians(lat0)
    lat1 = radians(lat1)
    lng0 = radians(lng0)
    lng1 = radians(lng1)

    dlng = fabs(lng0 - lng1)
    dlat = fabs(lat0 - lat1)
    h = hav(dlat) + cos(lat0) * cos(lat1) * hav(dlng)
    distance = 2 * EARTH_RADIUS * asin(sqrt(h))

    return distance


def parse_search_string(search):
    search_terms = ['']
    in_double_quotes = False
    in_single_quotes = False
    for char in search:
        if char == '"' and not in_single_quotes:
            if search_terms[-1] != '':
                search_terms += ['']
            in_double_quotes = not in_double_quotes
        elif char == "'" and not in_double_quotes:
            if search_terms[-1] != '':
                search_terms += ['']
            in_single_quotes = not in_single_quotes
        elif char == ' ' and not in_single_quotes and not in_double_quotes:
            if search_terms[-1] != '':
                search_terms += ['']
        else:
            search_terms[-1] += char
    return [term for term in search_terms if term]
