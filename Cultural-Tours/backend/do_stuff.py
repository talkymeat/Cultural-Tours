from rest_framework.renderers import JSONRenderer
import json

from tours.models import Route, Waypoint, WaypointOnRoute, Site
from tours.serializers import RouteSerializer, WaypointSerializer, WaypointOnRouteSerializer, SiteSerializer

renderer = JSONRenderer()

def print_json(data, indent=2):
    jason = renderer.render(data)
    parsd = json.loads(jason)
    print(json.dumps(parsd, indent=indent))

def get_json(p=-1):
    if p == -1:
        print('poo')
    else:
        model, serializer = [
            (Route, RouteSerializer),
            (Waypoint, WaypointSerializer),
            (WaypointOnRoute, WaypointOnRouteSerializer),
            (Site, SiteSerializer)
        ][p]
        obj = model.objects.all()[0]
        data = serializer(obj).data
        print_json(data)

if 'p' not in locals():
    get_json()
else:
    get_json(p)
