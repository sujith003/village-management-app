import random

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import PublicOTP


@api_view(["POST"])
def send_otp(request):
    phone = request.data.get("phone")

    if not phone:
        return Response(
            {"error": "Mobile number is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    phone = str(phone).strip()

    # Basic Indian mobile number validation
    if not phone.isdigit() or len(phone) != 10 or phone[0] not in "6789":
        return Response(
            {"error": "Enter a valid 10-digit mobile number"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Mark previous OTPs as verified/inactive
    PublicOTP.objects.filter(
        phone=phone,
        is_verified=False
    ).update(is_verified=True)

    # Save new OTP
    PublicOTP.objects.create(
        phone=phone,
        otp=otp
    )

    return Response(
        {
            "message": "OTP sent successfully",
            "phone": phone,
            "otp": otp
        },
        status=status.HTTP_200_OK
    )