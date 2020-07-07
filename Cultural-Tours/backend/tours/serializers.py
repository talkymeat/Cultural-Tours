from rest_framework import serializers

from .models import Site, Route, Waypoint, WaypointOnRoute

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

    class Meta:
        model = Site
        fields = ['name', 'category', 'interest', 'subcategory',
            'organisation', 'address', 'website', 'lat', 'lon', 'description']


class WaypointSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100, read_only=True)
    lat = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    lon = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    type = serializers.CharField(max_length=1, read_only=True)

    class Meta:
        model = Waypoint
        fields = ['name', 'lat', 'lon', 'type']


class RouteSerializer(serializers.ModelSerializer):
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
        first = WaypointOnRoute.objects.get(pk=instance.first_stop.id)
        return {
            'name': first.waypoint.name,
            'stop_id': first.waypoint.id
        }

    def get_last_stop(self, instance):
        last = WaypointOnRoute.objects.get(pk=instance.last_stop.id)
        return {
            'name': last.waypoint.name,
            'stop_id': last.waypoint.id
        }

    def get_waypoints(self, instance):
        waypoints = WaypointOnRoute.objects.filter(route=instance)
        return WaypointOnRouteSerializer(
            waypoints, many=True,
            fields=(
                'name', 'stop_id', 'lat', 'lon', 'next', 'is_beginning',
                'is_end'
            )
        ).data


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
        pass

class TourSerialiser(RouteSerializer):
    pass
