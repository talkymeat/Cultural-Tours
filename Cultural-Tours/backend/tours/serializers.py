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
    (Bus or Cycle), and the first and last stops of the route
    """
    name = serializers.CharField(read_only=True)
    waypoints = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    first_stop = serializers.SerializerMethodField()
    last_stop = serializers.SerializerMethodField()

    class Meta:
        model = Route
        depth = 1
        fields = ['name', 'type', 'first_stop', 'last_stop', 'waypoints']

    def get_type(self, instance):
        if instance.type == 'B':
            return 'Bus'
        elif instance.type == 'C':
            return 'Cycle'
        else:
            return instance.type

    def get_first_stop(self, instance):
        first_id = self.context.get('first_stop') \
            if self.context.get('first_stop', False) \
            else instance.first_stop.id
        first = WaypointOnRoute.objects.get(pk=first_id)
        return {
            'name': first.waypoint.name,
            'stop_id': first.waypoint.id
        }

    def get_last_stop(self, instance):
        last_id = self.context.get('last_stop') \
            if self.context.get('last_stop', False) \
            else instance.last_stop.id
        last = WaypointOnRoute.objects.get(pk=last_id)
        return {
            'name': last.waypoint.name,
            'stop_id': last.waypoint.id
        }

    def get_waypoints(self, instance):
        waypoints = WaypointOnRoute.objects.filter(route=instance)
        first_id = int(self.context.get('first_stop')) \
            if self.context.get('first_stop', False) \
            else instance.first_stop.id
        last_id = int(self.context.get('last_stop')) \
            if self.context.get('last_stop', False) \
            else instance.last_stop.id
        waypoint_list = []
        complete = False
        w = waypoints.get(pk=first_id)
        wpt_fields = (
            'name', 'stop_id', 'lat', 'lon', 'next', 'is_beginning','is_end'
        ) + (
            ('sites',)
            if re.match(r'[1-9][0-9]*', self.context.get('max_dist', ''))
            else ()
        )
        while not complete:
            if w.id == last_id:
                complete = True
            waypoint_list += [
                WaypointOnRouteSerializer(
                    w, context=self.context, fields=wpt_fields
                ).data
            ]
            if w.next:
                w = w.next
            else:
                complete = True
        return waypoint_list


class WaypointOnRouteSerializer(DynamicFieldsModelSerializer):
    is_beginning = serializers.BooleanField(read_only=True)
    is_end = serializers.BooleanField(read_only=True)
    name = serializers.SerializerMethodField()
    stop_id = serializers.SerializerMethodField()
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()
    route = serializers.SerializerMethodField()
    sites = serializers.SerializerMethodField()

    class Meta:
        model = WaypointOnRoute
        fields = [
            'name', 'stop_id', 'lat', 'lon', 'next', 'is_beginning', 'is_end',
            'route', 'sites'
        ]

    def get_name(self, instance):
        return instance.waypoint.name

    def get_stop_id(self, instance):
        return instance.waypoint.id

    def get_lat(self, instance):
        return instance.waypoint.lat

    def get_lon(self, instance):
        return instance.waypoint.lon

    def get_next(self, instance):
        if instance.next is not None:
            return {
                'name': instance.next.waypoint.name,
                'stop_id': instance.next.waypoint.id
            }

    def get_route(self, instance):
        return instance.route.name

    def get_sites(self, instance):
        if self.context.get('search', '') or self.context.get('category', ''):
            sites_of_interest = Site.objects.none()
            if self.context.get('category', False):
                for cat in self.context.getlist('category'):
                    sites_in_cat = Site.objects.filter(category__icontains=cat)
                    for subcat in self.context.getlist('subcat ' + cat.lower(), []):
                        sites_in_subcat = sites_in_cat.filter(subcategory__icontains=subcat)
                        sites_of_interest = sites_of_interest | sites_in_subcat
                        if subcat == self.context.getlist('subcat ' + cat.lower())[-1]:
                            break
                    else:
                        sites_of_interest = sites_of_interest | sites_in_cat
            if self.context.get('search', False):
                # TODO: This could be greatly improved is the sqlite3 database
                # were replaced with PostgreSQL - but that could be
                # time-consuming and ... *EHN DO IT LATER*. Let's get a basic
                # version working first.
                for search in self.context.getlist('search'):
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
                    sites_of_interest = sites_of_interest | hits
        else:
            sites_of_interest = Site.objects.all()
        nearby_sites_of_interest = Site.objects.none()
        dist_dict = {}
        for s_o_i in sites_of_interest:
            distance = get_distance(
                instance.waypoint.lat, instance.waypoint.lon,
                s_o_i.lat, s_o_i.lon
            )
            if distance <= float(self.context.get("max_dist")):
                dist_dict[s_o_i.pk] = distance
                nearby_sites_of_interest = \
                    nearby_sites_of_interest | sites_of_interest.filter(pk=s_o_i.pk)
        return SiteSerializer(
            nearby_sites_of_interest, many=True, context=dist_dict
        ).data
