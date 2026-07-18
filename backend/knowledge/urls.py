from django.urls import path
from .views import ArticleListView, ArticleCategoriesView, ArticleDetailView

urlpatterns = [
    path('articles/', ArticleListView.as_view()),
    path('articles/categories/', ArticleCategoriesView.as_view()),
    path('articles/<str:article_id>/', ArticleDetailView.as_view()),
]
