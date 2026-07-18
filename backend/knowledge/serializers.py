from rest_framework import serializers
from .models import Article


class ArticleListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category_display')
    level = serializers.CharField(source='level_display')
    read_time = serializers.CharField(source='read_time_display')

    class Meta:
        model = Article
        fields = ['id', 'category', 'title', 'read_time', 'level']


class ArticleDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category_display')
    level = serializers.CharField(source='level_display')
    read_time = serializers.CharField(source='read_time_display')

    class Meta:
        model = Article
        fields = ['id', 'category', 'title', 'read_time', 'level', 'body']
