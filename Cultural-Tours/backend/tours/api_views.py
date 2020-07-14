from rest_framework.generics import ListAPIView, GenericAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from tours.models import Route, Waypoint, WaypointOnRoute, Site
from tours.serializers import RouteSerializer, WaypointSerializer, \
    WaypointOnRouteSerializer, SiteSerializer

class SiteList(ListAPIView):
    """ListAPIView for Sitelist, allowing search and filtering"""
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filter_fields = ('id', 'category', 'interest', 'subcategory',)
    search_fields = ('name', 'category', 'interest', 'subcategory', 'description', 'organisation')

class RouteList(ListAPIView):
    """ListAPIView for Sitelist, allowing search and filtering"""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filter_fields = ('_short_name', '_operator', '_direction',)
    search_fields = ('_short_name', '_operator', '_direction',)

class RouteView(GenericAPIView):
    """
    API View to return a single Route. The JSON returned contains the stops on
    the route, excluding stops before first_stop, and stops after last_stop (if
    these parameters are included in the URL query). The URL QueryDict
    (request.GET) is passed to the serializer through the context argument,
    and may also contain params for adding nearby Sites to the data for each
    Waypoint on the route. These are:

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
    """
    lookup_field = 'id'
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

    def get(self, request, format=None, id=None):
        object = self.get_object()
        serializer = RouteSerializer(object, context=request.GET)
        return Response(serializer.data)
