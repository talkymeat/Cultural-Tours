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

def dist_pts(pt1, pt2):
    return get_distance(pt1['lat'], pt1['lon'], pt2['lat'], pt2['lon'])


def parse_search_string(search):
    """
    Takes a search string and parses it into a list discrete search terms.
    Any space is considered a break between search terms, unless it is part of a
    multi-word search term. A multi-word search term is any substring between
    an opening and closing single-quote (in that order), an opening and closing
    double-quote (in that order), or an opening quote (single or double) and the
    end of the search string. A space or quote mark that is not enclosed in a
    multi-word search term is considered a break between search terms, and not
    a part of any search term. A quote mark that is not enclosed in a multi-word
    search term *opens* a multi-word search term, and the multi-word search
    term continutes until it is closed by an quote mark of the same kind, or the
    end of the search string. A quote mark or space inside a multi-word search
    term is treated as just another character in the search term.

    The function operates by scanning through the search string character by
    character, building the list of search terms. Each time the function
    encounters a character *other* than an unenclosed space or quote, it appends
    that character to the end of the *last* search term in the list. Once the
    end of the search string is reached, the list is filtered to remove any
    empty search terms, then returned

    @param search_string: the search terms passed as a single string
    @return: the list of terms

    >>> parse_search_string('potato')
    ['potato']
    >>> parse_search_string('baked potato')
    ['baked', 'potato']
    >>> parse_search_string('"baked potato"')
    ['baked potato']
    >>> parse_search_string("'baked potato'")
    ['baked potato']
    >>> parse_search_string("I can't even")
    ['I', 'can', 't even']
    >>> parse_search_string('I "can\\\'t" even')
    ['I', "can't", 'even']
    >>> parse_search_string('"All right," said Ford. "How would you react if I said that I\\\'m not from Guildford after all, but from a small planet somewhere in the vicinity of Betelgeuse?"')
    ['All right,', 'said', 'Ford.', "How would you react if I said that I'm not from Guildford after all, but from a small planet somewhere in the vicinity of Betelgeuse?"]
    """
    # Initialise the list of search terms, and initialise an empty string to be
    # the first search term
    search_terms = ['']
    # Initialise two booleans to indicate whether the character currently being
    # scanned is part of a multi-word search term. Iff exactly one of these is
    # True, the character is part of a multi-word search term; iff both are
    # False, it is not. At no point should both be True.
    in_double_quotes = False
    in_single_quotes = False
    # Iterate through the string, character by character
    for char in search:
        # if the current character is an unenclosed double quote...
        if char == '"' and not in_single_quotes:
            # ... then initialise a new search term as an empty string at the
            # end of the lst, unless the last search term is already an empty
            # string ...
            if search_terms[-1] != '':
                search_terms += ['']
            # ... and flip the value of in_double_quotes, thus opening a new
            # multi-word quote if no multi-word search term was open, or closing
            # the current multi-word search term, if a multi-word search term
            # was open.
            in_double_quotes = not in_double_quotes
        # if the current character is an unenclosed double quote...
        elif char == "'" and not in_double_quotes:
            # ... then initialise a new search term as an empty string at the
            # end of the lst, unless the last search term is already an empty
            # string ...
            if search_terms[-1] != '':
                search_terms += ['']
            # ... and flip the value of in_single_quotes, thus opening a new
            # multi-word quote if no multi-word search term was open, or closing
            # the current multi-word search term, if a multi-word search term
            # was open.
            in_single_quotes = not in_single_quotes
        # if the current character is an unenclosed space...
        elif char == ' ' and not in_single_quotes and not in_double_quotes:
            # ... then initialise a new search term as an empty string at the
            # end of the lst, unless the last search term is already an empty
            # string
            if search_terms[-1] != '':
                search_terms += ['']
        # otherwise the character is simply appended to the end of the last
        # string in the list
        else:
            search_terms[-1] += char
    # Finally, the list is filtered to remove empty strings, and returned
    return [term for term in search_terms if term]

if __name__ == "__main__":
    import doctest
    doctest.testmod()
