from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('lion_school', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ModuleQuizQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_text', models.TextField()),
                ('order', models.PositiveIntegerField(default=0)),
                ('options', models.JSONField(blank=True, default=dict)),
                ('correct_answer', models.CharField(max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quiz_questions', to='lion_school.module')),
            ],
            options={
                'ordering': ['module', 'order'],
                'unique_together': {('module', 'order')},
            },
        ),
        migrations.CreateModel(
            name='ModuleProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_completed', models.BooleanField(default=False)),
                ('attempts', models.PositiveIntegerField(default=0)),
                ('last_score', models.FloatField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('module', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_progress', to='lion_school.module')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='module_progress', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
                'unique_together': {('student', 'module')},
            },
        ),
    ]

