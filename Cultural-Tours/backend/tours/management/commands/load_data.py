from csv import DictReader
from datetime import datetime

from django.core.management import BaseCommand

from tours.models import Site, Waypoint, Route
from pytz import UTC



ALREADY_LOADED_ERROR_MESSAGE = """
If you need to reload the {} data from the CSV file,
first delete the db.sqlite3 file to destroy the database.
Then, run `python manage.py migrate` for a new empty
database with tables"""


class Command(BaseCommand):
    # Show this when the user types help
    help = "Loads data from cultural_sites.csv into our Sites model"

    def handle(self, *args, **options):

        if not Site.objects.exists():
            print("Loading cultural sites database")
            for row in DictReader(open('./cultural_sites.csv', encoding="utf-8-sig")):
                site = Site()
                site.name = row['Name']
                site.category = row['Category']
                site.interest = row['Area']
                site.subcategory = row['Sub category']
                site.organisation = row['Organisation']
                site.address = row['Address']
                site.website = row['Website']
                site.lat = row['y']
                site.lon = row['x']
                site.description = row['Summary']
                site.save()
        else:
            # TODO: replace with code that checks for new entries and adds them (?? maybe?)
            print('Site data already loaded...exiting.')
            print(ALREADY_LOADED_ERROR_MESSAGE.format('cultural site'))
            return

# TODO: class LoadRoutes(BaseCommand):
