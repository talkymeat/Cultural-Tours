from django.db import models

ROUTE_TYPE_CHOICES = [('B', 'Bus route'), ('C', 'Cycle route')]

class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    interest = models.CharField(max_length=50)
    subcategory = models.CharField(max_length=50)
    organisation = models.CharField(max_length=50)
    address = models.CharField(max_length=100)
    website = models.CharField(max_length=100, blank=True)
    # event ???
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(null=True)
    # Outdoors/indoors bool field?
    # isOpen bool
    # opening hours ...
    # level access
    # local history
    # N edinburgh gas tower
    # viewpoints & vistas & architectural treasures

class Route(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    operator = models.CharField(max_length=32)
    short_name = models.CharField(max_length=16)
    direction = models.CharField(max_length=48)
    waypoints = models.ManyToManyField('WaypointOnRoute', related_name="on_routes")
    type = models.CharField(max_length=1, choices=ROUTE_TYPE_CHOICES)
    first_stop = models.OneToOneField(
        'WaypointOnRoute',
        models.SET_NULL,
        null=True,
        related_name="starts_routes"
    )
    last_stop = models.OneToOneField(
        'WaypointOnRoute',
        models.SET_NULL,
        null=True,
        related_name="ends_routes"
    )

class Waypoint(models.Model):
    id = models.CharField(max_length=9, primary_key=True)
    name = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    type = models.CharField(max_length=1, choices=ROUTE_TYPE_CHOICES)

class WaypointOnRoute(models.Model):
    waypoint = models.ForeignKey('Waypoint', models.CASCADE)
    route = models.ForeignKey('Route', models.CASCADE)
    next = models.OneToOneField(
        'WaypointOnRoute',
        models.SET_NULL,
        null=True,
        related_name="previous"
    )
    is_beginning = models.BooleanField(default=False)
    is_end = models.BooleanField(default=False)
