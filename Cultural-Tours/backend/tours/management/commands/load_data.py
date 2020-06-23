from csv import DictReader

from django.core.management import BaseCommand

from tours.models import Site, Waypoint, Route



ALREADY_LOADED_ERROR_MESSAGE = """
If you need to reload the data from the CSV files,
first delete the db.sqlite3 file to destroy the database.
Then, run `python manage.py migrate` for a new empty
database with tables"""


class Command(BaseCommand):
    # Show this when the user types help
    help = "Loads data from cultural_sites.csv into our Sites model"

    #def add_arguments(self, parser):


    def handle(self, *args, **options):
        #  Loads all data from csv files
        if not Site.objects.exists() and not Route.objects.exists():
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
            print("Loading waypoints databases")
            for way_pt_db, type in (("bus_stops.csv", "B"), ("bike_waypoints.csv", "C")):
                for row in DictReader(open(f'./{way_pt_db}')):
                    wpt = Waypoint()
                    wpt.id = type + (row['NaptanCode'] if type == "B" else row['ID'])
                    wpt.name = row['CommonName'] if type == "B" else row['Name']
                    wpt.lat = row['Latitude']
                    wpt.lon = row['Longitude']
                    wpt.type = type
                    wpt.save()
            print("Loading tour routes")
            rownum = 1
            for row in DictReader(open('./routes.csv')):
                rownum += 1
                route = Route()
                route.name = f"{row['Operator']}, {row['Short name']}: {row['Direction']}"
                route.operator = row['Operator']
                route.short_name = row['Short name']
                route.direction = row['Direction']
                if row['Type'].lower().strip() == 'bus':
                    route.type = 'B'
                elif row['Type'].lower().strip() == 'bike':
                    route.type = 'C'
                else:
                    raise ValueError("The Type field in routes.csv should "+
                        f"only contain values 'bike' or 'bus', but row {rownum}"+
                        f" has {row['Type']}.")
                route.save()
                filename = row['Filename']
                first = True
                for wpt_row in DictReader(open(f'./{filename}')):
                    w_o_r = WaypointOnRoute()
                    way_pt = Waypoint.objects.get(id=wpt_row['Waypoint'])
                    w_o_r.route = route
                    w_o_r.waypoint = way_pt
                    if first:
                        w_o_r.is_beginning = True
                        first = False
                    else:
                        prev.next = w_o_r
                    prev = w_o_r
                w_o_r.is_end = True
        else:
            # TODO: replace with code that checks for new entries and adds them (?? maybe?)
            print('Site data already loaded...exiting.')
            print(ALREADY_LOADED_ERROR_MESSAGE)
            return
