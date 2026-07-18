from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer


class ArticleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Article.objects.filter(is_active=True)

        category = request.query_params.get('category')
        search = request.query_params.get('search', '').strip()
        level = request.query_params.get('level')

        if category:
            category_key = {v: k for k, v in Article.CATEGORY_DISPLAY.items()}.get(category, category)
            qs = qs.filter(category=category_key)

        if search:
            qs = qs.filter(title__icontains=search)

        if level:
            level_key = {v: k for k, v in Article.LEVEL_DISPLAY.items()}.get(level, level)
            qs = qs.filter(level=level_key)

        return Response(ArticleListSerializer(qs, many=True).data)


class ArticleCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(list(Article.CATEGORY_DISPLAY.values()))


class ArticleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, article_id):
        try:
            article = Article.objects.get(id=article_id, is_active=True)
        except Article.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ArticleDetailSerializer(article).data)
