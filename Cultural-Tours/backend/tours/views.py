from django.shortcuts import render # <- don't think I need this
from django.http import HttpResponse

# This isn't needed for now - the Django part of the site code just serves up
# the API, not the site itself
def tour(request, route, start, end, distance, filters):
    return HttpResponse('asdfgh')
