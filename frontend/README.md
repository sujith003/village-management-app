# Enga Ooru Vengamooru

A web application for managing village festival activities and community information.

The application helps manage families, festivals, payments, expenses, announcements, photos, contacts, important persons, and other village-related information.

The project has two main parts:

- **Backend** – Django + Django REST Framework + MySQL
- **Frontend** – React.js

The application supports **English and Tamil**, and users can switch the language from the top of the page.

---

## Features

- **Home Dashboard** – View total families, festivals, money collected, money spent, balance, and charts.
- **Families** – Add, edit, delete, and view family details.
- **Festivals** – Add, edit, delete, and view festival details.
- **Payments** – Track payments made by families for each festival.
- **Expenses** – Track festival expenses by category.
- **Announcements** – Publish important announcements for village users.
- **Gallery** – Upload and view festival photos.
- **Contacts** – Store important contact numbers such as electricians, priests, and other service providers.
- **Calendar** – View festival dates in a monthly calendar.
- **My Family** – Allows a family to view its own family details.
- **Admin Details** – View administrator information.
- **Important Persons** – Manage village representatives such as President and Secretary.
- **About Us** – Information about the application.
- **About Vengamur** – Information about Vengamur village.
- **License & Copyright** – Project license and copyright information.
- **English & Tamil** – Full language switching support.

---

## User Roles

### Admin

Admin users can manage the application and perform operations such as:

- Add, edit, and delete families
- Manage festivals
- Manage payments
- Manage expenses
- Manage announcements
- Manage gallery photos
- Manage contacts
- Manage important persons
- Manage admin details
- View dashboard statistics

### Public User

Public users can:

- Login using their mobile number
- Verify using the demo OTP
- View village information
- View festivals
- View announcements
- View gallery
- View contacts
- View important persons
- View their family information

---

## Technologies Used

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- i18next / react-i18next
- Lucide React

### Backend

- Python
- Django 5.2.17
- Django REST Framework
- django-cors-headers
- Pillow

### Database

- MySQL 8.0

### Database Driver

- mysqlclient

---

## Project Structure

```text
village-festival-management-updated_all/
│
├── backend/
│   ├── accounts/
│   ├── admin_details/
│   ├── announcements/
│   ├── config/
│   ├── contacts/
│   ├── dashboard/
│   ├── expenses/
│   ├── families/
│   ├── festivals/
│   ├── festival_photos/
│   ├── gallery/
│   ├── important_persons/
│   ├── notifications/
│   ├── payments/
│   ├── user_notifications/
│   ├── media/
│   ├── venv/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── vengamoor.png
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── i18n.js
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md