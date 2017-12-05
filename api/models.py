import datetime

from django.db import models
from django.utils import timezone

class Todo(models.Model):
    HIGH = 3
    MIDDLE = 2
    LOW = 1
    PRIORITY = (
        (HIGH, 'High'),
        (MIDDLE, 'Middle'),
        (LOW, 'Low'),
    )
    content = models.CharField(max_length=300)
    finished = models.BooleanField(default=False)
    expire_date = models.DateField()
    priority = models.CharField(max_length=2,
                                choices=PRIORITY,
                                default=MIDDLE)
