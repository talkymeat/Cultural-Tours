from django.shortcuts import render # <- don't think I need this
from django.http import HttpResponse

def tour(request, route, start, end, distance, filters):
    return HttpResponse('asdfgh')
