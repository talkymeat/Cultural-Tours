# Generated by Django 3.0.7 on 2021-07-09 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0006_auto_20210709_0908'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='id',
            field=models.IntegerField(default=-1, unique=True),
            preserve_default=False,
        ),
    ]
