from rest_framework import serializers
from django.http import QueryDict
from django.db.models import QuerySet, Q

import re

from .models import Site, Route, Waypoint, WaypointOnRoute
from .utils import parse_search_string, get_distance

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class SiteSerializer(serializers.ModelSerializer):
    """
    ModelSerializer for the Site model. Reads off all the fields in the
    model, except id. The only field in the serializer that is an exception to
    this is dist_to_stop, which is used when nearby sites are being added to the
    `sites` field of WaypointOnRouteSerializer. The distance is calculated by
    WaypointSerializer and is simply passed to SiteSerializer in its `context`
    param.
    """
    name = serializers.CharField(max_length=100, read_only=True)
    category = serializers.CharField(max_length=50, read_only=True)
    interest = serializers.CharField(max_length=50, read_only=True)
    subcategory = serializers.CharField(max_length=50, read_only=True)
    organisation = serializers.CharField(max_length=50, read_only=True)
    address = serializers.CharField(max_length=100, read_only=True)
    website = serializers.CharField(max_length=100, read_only=True)
    lat = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    lon = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    description = serializers.CharField(read_only=True)
    dist_to_stop = serializers.SerializerMethodField()

    class Meta:
        model = Site
        fields = ['name', 'category', 'interest', 'subcategory', 'dist_to_stop',
            'organisation', 'address', 'website', 'lat', 'lon', 'description']

    def get_dist_to_stop(self, instance):
        """
        When WaypointOnRouteSerializer finds Sites sufficiently close to the
        Waypoint, it adds the pk (primary key) of the Site to a dict called
        dist_dict as a key, mapping to a value that is the distance from
        Waypoint to Site in metres. This dict is passed to SiteSerializer as the
        `context` param, so that this method can look up instance.pk and return
        the distance
        """
        return self.context.get(instance.pk, None)


class WaypointSerializer(serializers.ModelSerializer):
    """
    ModelSerializer for the Waypoint model. Reads off all the fields in the
    model, except id.
    """
    name = serializers.CharField(max_length=100, read_only=True)
    lat = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    lon = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    type = serializers.CharField(max_length=1, read_only=True)

    class Meta:
        model = Waypoint
        fields = ['name', 'lat', 'lon', 'type']


class RouteSerializer(serializers.ModelSerializer):
    """
    ModelSerializer for the Route model. Returns the list of waypoints
    (actually serialized by WaypointOnRouteSerializer), plus the name, type
    (Bus or Cycle), and the first and last stops of the route.

    Note that rather than using a direct many-to-many mapping to Waypoint
    objects, Route has a one-to-many mapping to WaypointOnRoute. This is done
    because some Waypoints appear on many routes, and because each
    WaypointOnRoute contains a field indicating which WaypointOnRoute is next
    *on that route*. Thus, for instance, the next stop after the Cameo Cinema
    for the Lothian 23 bus is different from the next stop for the 16.
    """
    name = serializers.CharField(read_only=True)
    waypoints = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    first_stop = serializers.SerializerMethodField()
    last_stop = serializers.SerializerMethodField()

    class Meta:
        model = Route
        depth = 1
        fields = ['id', 'name', 'type', 'first_stop', 'last_stop', 'waypoints']

    def get_type(self, instance):
        """
        Translates from the short representation of route-type stored in the DB
        to the full name (Bus/Cycle).
        """
        if instance.type == 'B':
            return 'Bus'
        elif instance.type == 'C':
            return 'Cycle'
        else:
            # A bit of future-proofing here, in case we add other route-types.
            return instance.type

    def get_first_stop(self, instance):
        """
        Two of the parameters that can be passed via the URL string to the API
        is `first_stop` and `last_stop`, which are then passed to the serializer
        via the self.context param. This allows the user, if they wish, to get
        information for only part of a route. This method returns information
        by default for the actual first stop on the route as stored in the
        database, but if the primary key/id of some other stop on the route is
        passed as first_stop in self.context, information is instead returned
        for that stop.

        @return a dict with two values - the name and id of the Waypoint. Note
        that these values are not stored directly in the WaypointOnRoute object,
        but the Waypoint that it maps to.
        """
        # Retrieves the id/pk of the stop to be displayed as first_stop. This is
        # either the id of the first_stop stored in the Route object, or the
        # value passed in self.context as first_stop
        first_id = self.context.get('first_stop') \
            if self.context.get('first_stop', False) \
            else instance.first_stop.id
        # Use this id to retrieve the correct WaypointOnRoute
        first = WaypointOnRoute.objects.get(pk=first_id)
        # return a dict containing the name and id values of the Waypoint which
        # the WaypointOnRoute maps to as waypoint
        return {
            'name': first.waypoint.name,
            'stop_id': first.waypoint.id
        }

    def get_last_stop(self, instance):
        """
        Two of the parameters that can be passed via the URL string to the API
        is `first_stop` and `last_stop`, which are then passed to the serializer
        via the self.context param. This allows the user, if they wish, to get
        information for only part of a route. This method returns information
        by default for the actual last stop on the route as stored in the
        database, but if the primary key/id of some other stop on the route is
        passed as last_stop in self.context, information is instead returned
        for that stop.

        @return a dict with two values - the name and id of the Waypoint.
        """
        # Retrieves the id/pk of the stop to be displayed as last_stop. This is
        # either the id of the last_stop stored in the Route object, or the
        # value passed in self.context as last_stop
        last_id = self.context.get('last_stop') \
            if self.context.get('last_stop', False) \
            else instance.last_stop.id
        # Use this id to retrieve the correct WaypointOnRoute
        last = WaypointOnRoute.objects.get(pk=last_id)
        # return a dict containing the name and id values of the Waypoint which
        # the WaypointOnRoute maps to as waypoint
        return {
            'name': last.waypoint.name,
            'stop_id': last.waypoint.id
        }

    def get_waypoints(self, instance):
        """
        Retrieves the list of waypoints on the route, in the correct order.

        Two of the parameters that can be passed via the URL string to the API
        is `first_stop` and `last_stop`, which are then passed to the serializer
        via the self.context param. This allows the user, if they wish, to get
        information for only part of a route. If `first_stop` is in
        self.context, the preceding stops will not be returned. If `last_stop`
        is in self.context, the following stops will not be returned

        Further self.context parameters may be passed on to
        WaypointOnRouteSerializer, which provides this function with the data
        for each waypoint. These are:

        `max_dist`: if max_dist is not set, no sites will be returned. If it is
            set, each waypoint will include information about relevant Sites
            max_dist metres from the Waypoint or less.
        `category`: filters the Sites database based on the `category`
            field in the database. If more than one category is set, results
            will be shown for all of the categories
        `subcategory <category>`: Filters the results for `category=<category>`
            based on the `subcategory` field in the database.
        `search`: Users can enter a string of search terms, which is parsed by
            utils.parse_search_string(search) into a list of search terms, where
            terms are separated by spaces unless they are enclosed in quotes;
            substrings in quotes are treated as multiword search terms. A search
            returns all of the Sites with _all_ of the search terms in _any_ of
            its searchable fields (category, subcategory, interest, description,
            name, and organisation).

        If multiple search-strings and filters are given, all the sites
        retrieved by any of them will be returned.

        @return a list of data from waypoints, from WaypointOnRouteSerializer.
        """
        # Gathers all the waypoints on the Route
        waypoints = WaypointOnRoute.objects.filter(route=instance)
        # Retrieves the id/pk of the stop to be displayed as first_stop. This is
        # either the id of the first_stop stored in the Route object, or the
        # value passed in self.context as first_stop
        first_id = int(self.context.get('first_stop')) \
            if self.context.get('first_stop', False) \
            else instance.first_stop.id
        # Retrieves the id/pk of the stop to be displayed as last_stop. This is
        # either the id of the last_stop stored in the Route object, or the
        # value passed in self.context as last_stop
        last_id = int(self.context.get('last_stop')) \
            if self.context.get('last_stop', False) \
            else instance.last_stop.id
        # List to store the Waypoints to be displayed, in order, starting with
        # first_stop, and ending with last_stop
        waypoint_list = []
        # Boolean flag to terminate a while-loop adding stops to waypoint_list
        # once last_stop has been added.
        complete = False
        # w acts as a moving pointer through the route, storing the next stop to
        # be added to waypoint_list
        w = waypoints.get(pk=first_id)
        # The fields to be retrieved by WaypointOnRouteSerializer. Iff a
        # positive integer value for max_dist is in self.context, the sites
        # field will be included. WaypointOnRouteSerializer is a
        # DynamicFieldsModelSerializer, so the fields returned can be controlled
        # in this way.
        wpt_fields = (
            'name','stop_id','lat','lon','next','is_beginning','is_end','id',
        ) + (
            ('sites',)
            if re.match(r'[1-9][0-9]*', self.context.get('max_dist', ''))
            else ()
        )
        # Loop to add waypoint data to waypoint_list
        while not complete:
            # Add the data for w to waypoint_list, using the
            # WaypointOnRouteSerializer, with self.context passed on so that the
            # serializer can use filters and searches when adding Sites
            waypoint_list += [
                WaypointOnRouteSerializer(
                    w, context=self.context, fields=wpt_fields
                ).data
            ]
            # Move w on to the next WaypointOnRoute, if w is not the last_stop,
            # and the next field for w is not null. Note that this second
            # condition is only not null in the case that a value for last_stop
            # is passed in self.context, but the id does not match any stop on
            # the route, or matches a stop that appears before first_stop. The
            # front end code should guard against this.
            if w.id != last_id and w.next:
                w = w.next
            # If the above condition is not met, the list is complete, and the
            # loop should terminate
            else:
                complete = True
        return waypoint_list


class WaypointOnRouteSerializer(DynamicFieldsModelSerializer):
    """
    DynamicFieldsModelSerializer for WaypointOnRoute.
    DynamicFieldsModelSerializer is used here so that sites data can be omitted
    if RouteSerializer was not passed a positive integer value for max_dist in
    self.context, and so that the route field can be omitted when
    RouteSerializer calls WaypointOnRouteSerializer, as this would be redundant.

    Note that WaypointOnRoute contains a one-to-many mapping to a Waypoint
    object, and much of the data retrieved by this serializer comes from the
    fields of this Waypoint.
    """
    # --- Fields taken directly from the WaypointOnRoute ---
    is_beginning = serializers.BooleanField(read_only=True)
    is_end = serializers.BooleanField(read_only=True)
    id = serializers.IntegerField()
    # --- Fields returned by methods, taking data from the Waypoint ---
    name = serializers.SerializerMethodField()
    stop_id = serializers.SerializerMethodField()
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()
    # --- Field returned by a method, taking data from the Route object, which
    # WaypointOnRoute has in a many-to-one mapping. Note that when
    # WaypointOnRouteSerializer is called by RouteSerializer, this field is
    # omitted. ---
    route = serializers.SerializerMethodField()
    # --- Field returned by a method, which filters the Sites database based on
    # any filters and/or searches in self.context, and on the distance of the
    # Site from the Waypoint ---
    sites = serializers.SerializerMethodField()

    class Meta:
        model = WaypointOnRoute
        fields = [
            'name', 'stop_id', 'id', 'lat', 'lon', 'next', 'is_beginning',
             'is_end', 'route', 'sites'
        ]

    def get_name(self, instance):
        """name of Waypoint"""
        return instance.waypoint.name

    def get_stop_id(self, instance):
        """
        id of Waypoint. Note that this is distinct from the id of the
        WaypointOnRoute, and in the case of bus stops, is the NaPTAN Code of the
        stop, prefixed by a 'B'.
        """
        return instance.waypoint.id

    def get_lat(self, instance):
        """Latitude of Waypoint"""
        return instance.waypoint.lat

    def get_lon(self, instance):
        """Longitude of Waypoint"""
        return instance.waypoint.lon

    def get_next(self, instance):
        """
        If there is a next Waypoint on the Route, this returns the name and id
        of that Waypoint. Note that this is distinct from the id of the
        WaypointOnRoute, and in the case of bus stops, is the NaPTAN Code of the
        stop, prefixed by a 'B'.
        """
        if instance.next is not None:
            return {
                'name': instance.next.waypoint.name,
                'stop_id': instance.next.waypoint.id
            }

    def get_route(self, instance):
        """Name of the Route the WaypointOnRoute appears on."""
        return instance.route.name

    def get_sites(self, instance):
        """
        Returns a list of Sites, based on parameters provided in self.context.
        These are:

        `max_dist`: Only waypoints less than max_dist metres from the Waypoint
            are returned.
        `category`: filters the Sites database based on the `category`
            field in the database. If more than one category is set, results
            will be returned for all of the categories
        `subcategory <category>`: Filters the results for `category=<category>`
            based on the `subcategory` field in the database.
        `search`: Users can enter a string of search terms, which is parsed by
            utils.parse_search_string(search) into a list of search terms, where
            terms are separated by spaces unless they are enclosed in quotes;
            substrings in quotes are treated as multiword search terms. A search
            returns all of the Sites with _all_ of the search terms in _any_ of
            its searchable fields (category, subcategory, interest, description,
            name, and organisation).

        If multiple search-strings and filters are given, all the sites
        retrieved by any of them will be returned
        """
        if not self.context.get("max_dist", False):
            # this *should* be redundant. get_sites should not be called if
            # self.context does not contain max_dist
            return
        # If the user is filtering results using categories (optionally
        # filtering within category by a subcategory), or retrieving Sites
        # based on one or more searches, this condition ensures the requested
        # Sites are returned
        if self.context.get('search', '') or self.context.get('category', ''):
            # Create an empty QuerySet on the Sites model. All Sites retrieved
            # by filters or searches will be added to this. This QuerySet is
            # then passed through another loop to pick out only the sites
            # within max_dist metres of the Waypoint.
            sites_of_interest = Site.objects.none()
            # First, the sites identified by filters are retrieved
            if self.context.get('category', False):
                # more than one category filter may be provided. Ths loop
                # iterates over the list of relevant categories
                for cat in self.context.getlist('category'):
                    # Create a QuerySet containing all sites with the current
                    # category
                    sites_in_cat = Site.objects.filter(category__icontains=cat)
                    # If self.context contains any subcategory filters for the
                    # current category, this loop picks out just the Sites in
                    # the category QuerySet with one of these subcategories
                    for subcat in self.context.getlist('subcat ' + cat.lower(), []):
                        # Creates a QuerySet with the category _and_
                        # subcategory, and merges it with sites_of_interest
                        sites_in_subcat = sites_in_cat.filter(subcategory__icontains=subcat)
                        sites_of_interest = sites_of_interest | sites_in_subcat
                        # Breaks the loop when the last subcategory is reached:
                        # this prevents the else-clause from running unless
                        # are no subcategories given for the current category.
                        if subcat == self.context.getlist('subcat ' + cat.lower())[-1]:
                            break
                    else:
                        # If NO subcategories are given for the current
                        # category, the complete set of sites for the current
                        # category are merged into sites_of_interest
                        sites_of_interest = sites_of_interest | sites_in_cat
            # now, the sites identified by search strings
            # TODO: This could be  improved if the sqlite3 database
            # were replaced with PostgreSQL - but that could be
            # time-consuming and ... *EHN DO IT LATER*. Let's get a basic
            # version working first.
            if self.context.get('search', False):
                # The user may enter multiple search strings: this loops over
                # all of them, adding the sites for each search to the QuerySet
                for search in self.context.getlist('search'):
                    # The parse_search_string(search) method splits the search
                    # string into a list of search terms (space-separated unless
                    # enclosed in quotes, in which case a multi-word search term
                    # is possible; for full details, see the docstring on
                    # parse_search_string in utils.py). The search proceeds
                    # first by creating a QuerySet with all Sites, then
                    # iteratively filtering it, so that at each step, only the
                    # Sites with the search term in at least ONE of the
                    # searchable fields remain. As a result, when the loop below
                    # is finished, only Sites with ALL of the search terms
                    # SOMEWHERE in their searchable fields remain.
                    hits = Site.objects.all()
                    for term in parse_search_string(search):
                        hits = hits.filter(
                            Q(category__icontains=term)|
                            Q(subcategory__icontains=term)|
                            Q(interest__icontains=term)|
                            Q(description__icontains=term)|
                            Q(name__icontains=term)|
                            Q(organisation__icontains=term)
                        )
                    # If any sites remain after filtering, these are merged into
                    # sites_of_interest
                    sites_of_interest = sites_of_interest | hits
        else:
            # if self.context contains no filters OR searches, all Sites within
            # max_dist are "of interest"
            sites_of_interest = Site.objects.all()
        # Create an empty QuerySet on the Site model. Any Site that is not more
        # than max_dist metres from the Waypoint will be added to
        # nearby_sites_of_interest, which will be passed to SiteSerializer to
        # produce the data to be returned.
        nearby_sites_of_interest = Site.objects.none()
        # A dict to store a mapping between the ids of included Sites and the
        # distance in metres of the Site from the Waypoint. This is passed to
        # SiteSerializer via the context param, so that SiteSerializer can
        # include the distance in the site data.
        dist_dict = {}
        for s_o_i in sites_of_interest:
            # The get_distance function is imported from utils.py, and provides
            # a decent approximation to the arc-length of the distance as the
            # crow flies on the surface of the Earth, assuming the earth is
            # exactly spherical.
            distance = get_distance(
                instance.waypoint.lat, instance.waypoint.lon,
                s_o_i.lat, s_o_i.lon
            )
            # if the distance is less than max_dist ...
            if distance <= float(self.context.get("max_dist")):
                # ... add the id -> distance mapping to dist_dict ...
                dist_dict[s_o_i.pk] = distance
                # ... and add the site to nearby_sites_of_interest
                nearby_sites_of_interest = \
                    nearby_sites_of_interest | sites_of_interest.filter(pk=s_o_i.pk)
        # Convert nearby_sites_of_interest to json, and return the data
        return SiteSerializer(
            nearby_sites_of_interest, many=True, context=dist_dict
        ).data
