# Generated by Django 3.0.7 on 2021-07-09 09:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tours', '0005_auto_20210704_2000'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('name', models.CharField(max_length=49, primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='Subcategory',
            fields=[
                ('_full_name', models.CharField(max_length=101, primary_key=True, serialize=False)),
                ('_subcat_name', models.CharField(max_length=49)),
                ('_super_category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='tours.Category')),
            ],
        ),
        migrations.AlterField(
            model_name='site',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.Category'),
        ),
        migrations.AlterField(
            model_name='site',
            name='subcategory',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tours.Subcategory'),
        ),
    ]