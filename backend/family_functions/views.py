from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FamilyFunction
from .serializers import FamilyFunctionSerializer

from user_notifications.models import Notification


class FamilyFunctionViewSet(viewsets.ModelViewSet):

    queryset = FamilyFunction.objects.all().order_by("-created_at")
    serializer_class = FamilyFunctionSerializer

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        function = self.get_object()
        function.status = "APPROVED"
        function.is_active = True
        function.save(update_fields=["status", "is_active"])

        Notification.objects.create(
            title="New Family Function 🎉",
            message=(
                f"{function.host_name} has added a new "
                f"{function.get_function_type_display()} function."
            ),
            notification_type="FAMILY_FUNCTION",
            audience="ALL",
        )

        return Response(FamilyFunctionSerializer(function).data)

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        function = self.get_object()
        function.status = "REJECTED"
        function.save(update_fields=["status"])
        return Response(FamilyFunctionSerializer(function).data)

    @action(detail=True, methods=["patch"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        function = self.get_object()
        function.is_active = not function.is_active
        function.save(update_fields=["is_active"])
        return Response(FamilyFunctionSerializer(function).data)

    def perform_create(self, serializer):
        function = serializer.save()

        Notification.objects.create(
            title="New Family Function Request",
            message=(
                f"{function.host_name} submitted a new "
                f"{function.get_function_type_display()} function "
                "for approval."
            ),
            notification_type="FAMILY_FUNCTION",
            audience="ADMIN",
        )