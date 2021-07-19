import re

from django.db import models

ROUTE_TYPE_CHOICES = [('B', 'Bus route'), ('C', 'Cycle route')]

class Category(models.Model):
    """docstring for Category."""
    name = models.CharField(max_length=49, primary_key=True)
    id = models.IntegerField(unique=True)

    def __str__(self):
        return self.name

class Subcategory(models.Model):
    """docstring for Subcategory."""
    name_regex = re.compile(r"^([a-zA-Z1-9-',()&é ]+)<([a-zA-Z1-9-',()&é ]+)>$")
    _full_name = models.CharField(max_length=101, primary_key=True)
    _subcat_name = models.CharField(max_length=49)
    _super_category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name = "subcategories"
    )

    @property
    def full_name(self):
        return f"{self._subcat_name}<{self._super_category.name}>"

    @full_name.setter
    def full_name(self, full_name):
        name_match = self.name_regex.match(full_name)
        #print(name_match, name_match.group(0), name_match.group(1), name_match.group(2))
        if name_match:
            supercat_name = name_match.group(2)
            if Category.objects.filter(name=supercat_name).exists():
                self._super_category = Category.objects.filter(
                    name=supercat_name
                )[0]
                self._subcat_name = name_match.group(1)
                self._full_name = full_name
            else:
                raise ValueError(f"No category exists named {supercat_name}.")
        else:
            raise ValueError(f"The name '{full_name}' is incorrectly formatted. " +
                "The correct format is '$subcat_name<$cat_name>'.")

    @property
    def subcat_name(self):
        return self._subcat_name

    @subcat_name.setter
    def subcat_name(self, subcat_name):
        self._full_name = f"{subcat_name}<{self._super_category.name}>"
        self._subcat_name = subcat_name

    @property
    def super_category(self):
        return self._super_category

    @super_category.setter
    def super_category(self, super_category):
        self._full_name = f"{self._subcat_name}<{super_category.name}>"
        self._super_category = super_category

    def __str__(self):
        return self._full_name

class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(Subcategory, on_delete=models.CASCADE)
    interest = models.CharField(max_length=50)
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
            print(name_match, name_match.group(0), name_match.group(1), name_match.group(2))
            self._operator = name_match.group(0)
            self._short_name = name_match.group(1)
            self._direction = name_match.group(2)
            self._name = name
        else:
            raise ValueError(f"The name '{name}' is incorrectly formatted. " +
                "The correct format is '$operator, $short_name: $direction'.")

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
