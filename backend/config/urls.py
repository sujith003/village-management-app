from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/login/", obtain_auth_token),
    path("api/auth/", include("accounts.urls")),

    path("api/dashboard/", include("dashboard.urls")),

    path("api/", include("families.urls")),
    path("api/", include("festivals.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("expenses.urls")),
    path("api/", include("gallery.urls")),
    path("api/", include("contacts.urls")),
    path("api/announcements/", include("announcements.urls")),
    path("api/notifications/", include("user_notifications.urls")),
    path("api/", include("admin_details.urls")),
    path("api/", include("important_persons.urls")),
]


urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)