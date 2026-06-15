# Database Schema Documentation

## Overview
SQL Server database for the Bufete de Abogados Portal with complete schema for authentication, appointments, payments, blog, and notifications.

## Schemas

### auth
- Users
- Lawyers

### appointments
- Appointments

### payments
- Payments

### blog
- Articles
- Testimonials

### notifications
- Notifications
- ChatHistory

## Setup Instructions

1. **Create Database and Schema**
   ```sql
   sqlcmd -S localhost -U sa -P YourPassword -i 01-schema.sql
   ```

2. **Create Tables**
   ```sql
   sqlcmd -S localhost -U sa -P YourPassword -d bufete_abogados -i 02-tables.sql
   ```

3. **Create Procedures**
   ```sql
   sqlcmd -S localhost -U sa -P YourPassword -d bufete_abogados -i 03-procedures.sql
   ```

## Key Tables

### Users (auth.Users)
- UserId (PK)
- Email (UNIQUE)
- FullName
- Phone
- Role (client, lawyer, admin)
- PasswordHash
- IsActive
- Timestamps

### Appointments (appointments.Appointments)
- AppointmentId (PK)
- ClientId (FK)
- LawyerId (FK)
- Title, Description
- StartTime, EndTime
- Status (pending, confirmed, cancelled, completed)
- GoogleCalendarEventId
- Timestamps

### Payments (payments.Payments)
- PaymentId (PK)
- AppointmentId (FK)
- UserId (FK)
- Amount, Currency
- Status (pending, completed, failed, refunded)
- TransactionId
- PayphoneReference
- Timestamps

### Articles (blog.Articles)
- ArticleId (PK)
- AuthorId (FK)
- Title, Slug
- Content, Summary
- Category
- IsPublished, PublishedAt
- ViewCount
- Timestamps

### Notifications (notifications.Notifications)
- NotificationId (PK)
- UserId (FK)
- Type (email, whatsapp, push)
- Title, Message
- Status (pending, sent, failed)
- ScheduledFor
- Timestamps

## Stored Procedures

### Authentication
- `sp_CreateUser` - Create new user
- `sp_GetUserByEmail` - Retrieve user

### Appointments
- `sp_GetAvailableSlots` - Get free slots
- `sp_CreateAppointment` - Create appointment with conflict check

### Payments
- `sp_RecordPayment` - Record payment and confirm appointment

### Blog
- `sp_CreateArticle` - Create article
- `sp_GetPublishedArticles` - Get published articles with pagination

### Notifications
- `sp_QueueNotification` - Queue notification for sending
