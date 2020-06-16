from django.db import models


class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=200)
    subcategory = models.CharField(max_length=200)
    organisation = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    website = models.CharField(max_length=200)
    # event ???
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(null=True)
    # Ask K & S about bool/int fields in spreadsheet cols L-AV

class Waypoint(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)

class Route(models.Model):
    name = models.CharField(max_length=200, primary_key=True)
    waypoints = models.ManyToManyField('Waypoint')
