from rest_framework.generics import ListAPIView, GenericAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from tours.models import Route, Waypoint, WaypointOnRoute, Site
from tours.serializers import RouteSerializer, WaypointSerializer, \
    WaypointOnRouteSerializer, SiteSerializer

class SiteList(ListAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filter_fields = ('id', 'category', 'interest', 'subcategory',)
    search_fields = ('name', 'category', 'interest', 'subcategory', 'description', 'organisation')

class RouteList(ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filter_fields = ('_name', '_short_name', '_operator', '_direction',)
    search_fields = ('_name', '_short_name', '_operator', '_direction',)

class RouteView(GenericAPIView):
    pass
