from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'read_time_minutes', 'is_active', 'created_at']
    list_filter = ['category', 'level', 'is_active']
    list_editable = ['is_active']
    search_fields = ['title', 'body']
    ordering = ['-created_at']
