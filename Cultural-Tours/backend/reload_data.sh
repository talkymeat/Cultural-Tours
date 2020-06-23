rm db.sqlite3
if [[ $1 == "-m" ]]; then
  python3 manage.py makemigrations
fi
python3 manage.py migrate
python3 manage.py load_data
