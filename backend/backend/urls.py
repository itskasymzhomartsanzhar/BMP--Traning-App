from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

admin.site.site_header = 'TRES — панель управления'
admin.site.site_title = 'TRES'
admin.site.index_title = 'Разделы'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('workouts.urls')),
    path('api/', include('nutrition.urls')),
    path('api/', include('knowledge.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
