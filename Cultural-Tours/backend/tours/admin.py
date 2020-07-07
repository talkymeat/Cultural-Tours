from django.contrib import admin

from .models import Site, Route, Waypoint, WaypointOnRoute

@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'interest', 'subcategory',
        'organisation', 'address', 'website', 'lat', 'lon', 'description']

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'operator', 'short_name', 'direction',
        'type', 'first_stop', 'last_stop']

@admin.register(Waypoint)
class WaypointAdmin(admin.ModelAdmin):
    list_display = ['name', 'lat', 'lon', 'type']

@admin.register(WaypointOnRoute)
class WaypointOnRouteAdmin(admin.ModelAdmin):
    list_display = ['waypoint', 'route', 'next', 'is_beginning', 'is_end']
