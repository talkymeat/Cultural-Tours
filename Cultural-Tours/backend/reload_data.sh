# Just a wee shell script to speed up the process of dumping and reloading the
# SQLite database
rm db.sqlite3
if [[ $1 == "-m" ]]; then
  python3 manage.py makemigrations
fi
python3 manage.py migrate
python3 manage.py load_data
