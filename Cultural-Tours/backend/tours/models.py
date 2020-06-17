from django.db import models


class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    interest = models.CharField(max_length=50)
    subcategory = models.CharField(max_length=50)
    organisation = models.CharField(max_length=50)
    address = models.CharField(max_length=100)
    website = models.CharField(max_length=100)
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


class Waypoint(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)

class Route(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    waypoints = models.ManyToManyField('Waypoint')
