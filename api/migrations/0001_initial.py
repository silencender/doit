# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Todo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content', models.CharField(max_length=300)),
                ('finished', models.BooleanField(default=False)),
                ('expire_date', models.DateField(default=datetime.datetime(2017, 12, 5, 15, 47, 55, 331178, tzinfo=utc))),
                ('priority', models.CharField(default=b'M', max_length=2, choices=[(b'H', b'High'), (b'M', b'Middle'), (b'L', b'Low')])),
            ],
        ),
    ]
