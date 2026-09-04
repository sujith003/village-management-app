from django.contrib import admin
from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve
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

# Serve uploaded photos (gallery, admin, important persons) directly,
# regardless of DEBUG. Django's usual static() helper only serves media
# when DEBUG=True, which would otherwise make every uploaded photo show
# as broken once DEBUG=False in production. This app doesn't have a
# separate file/CDN server in front of it, so Django serves them itself
# — fine at this app's traffic scale, though a dedicated storage service
# (S3/Cloudinary) would be the more scalable choice down the line.
urlpatterns += [
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]