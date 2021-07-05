import re

from django.db import models

ROUTE_TYPE_CHOICES = [('B', 'Bus route'), ('C', 'Cycle route')]

class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    interest = models.CharField(max_length=50)
    subcategory = models.CharField(max_length=50)
    organisation = models.CharField(max_length=50, blank=True)
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

    def __str__(self):
        return self.name

class Route(models.Model):
    name_regex = re.compile("^([a-zA-Z1-9-' ]+), ([a-zA-Z1-9-' ]+): ([a-zA-Z1-9-' ]+)$")
    _operator = models.CharField(max_length=32)
    _short_name = models.CharField(max_length=16)
    _direction = models.CharField(max_length=48)
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

    def __str__(self):
        return self.name

    @property
    def name(self):
        return f"{self.operator}, {self.short_name}: {self.direction}"

    @name.setter
    def name(self, name):
        name_match = name_regex.match(name)
        if name_match:
            self._operator = name_match.group(0)
            self._short_name = name_match.group(1)
            self._direction = name_match.group(2)
            self._name = name
        else:
            raise ValueError(f"The name '{name}' is incorrectly formatted. " +
                "The correct format is '$operator, $short_name: $direction', " +
                "using 'Bike Route' as $operator if the route is a bike route.")

    @property
    def operator(self):
        return self._operator

    @operator.setter
    def operator(self, operator):
        self._name = f"{operator}, {self.short_name}: {self.direction}"
        self._operator = operator

    @property
    def short_name(self):
        return self._short_name

    @short_name.setter
    def short_name(self, short_name):
        self._name = f"{self.operator}, {short_name}: {self.direction}"
        self._short_name = short_name

    @property
    def direction(self):
        return self._direction

    @direction.setter
    def direction(self, direction):
        self._name = f"{self.operator}, {self.short_name}: {direction}"
        self._direction = direction

class Waypoint(models.Model):
    id = models.CharField(max_length=9, primary_key=True)
    name = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    type = models.CharField(max_length=1, choices=ROUTE_TYPE_CHOICES)

    def __str__(self):
        return self.name

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
    is_keypoint = models.BooleanField(default=False)

    def __str__(self):
        return self.waypoint.name
