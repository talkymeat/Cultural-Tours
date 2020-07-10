class WaypointIDConverter:
    regex = '([BC][0-9]{8})|(-)'

    def to_python(self, value):
        return value

    def to_url(self, value):
        return '%s' % value
