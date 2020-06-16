from django.db import models


class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    lat = models.DecimalField()
    lon = models.DecimalField()
    description = models.TextField(null=True)
    # OTHERS: ADD MORE

class Waypoint(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=200)
    lat = models.DecimalField()
    lon = models.DecimalField()

class Route(models.Model):
    name = models.CharField(max_length=200, primary_key=True)
    waypoints = models.ManyToManyField('Waypoint')
