"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
#from django.conf import settings
#from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path,  register_converter
from django.views.generic.base import RedirectView # ???

#import tours.views
import tours.api_views
from tours.converters import WaypointIDConverter

register_converter(WaypointIDConverter, 'wpt')
favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)

urlpatterns = [
    path(r'^favicon\.ico$', favicon_view),
    path('api/v1/sites/', tours.api_views.SiteList.as_view()),
    path('api/v1/routes/', tours.api_views.RouteList.as_view()),
    path('api/v1/tour/<int:id>/', tours.api_views.RouteView.as_view()),
    path('api/v1/categories/', tours.api_views.CategoryList.as_view()),
    path('admin/', admin.site.urls),
]
#+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # TODO: find out what this does
