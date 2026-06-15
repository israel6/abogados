-- SQL Server Tables for Bufete de Abogados Portal

USE bufete_abogados;
GO

-- Users table (for authentication)
CREATE TABLE [auth].[Users] (
    [UserId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Email] NVARCHAR(255) NOT NULL UNIQUE,
    [FullName] NVARCHAR(255) NOT NULL,
    [Phone] NVARCHAR(20),
    [Role] NVARCHAR(50) NOT NULL CHECK ([Role] IN ('client', 'lawyer', 'admin')),
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX [IX_Email] ([Email])
);
GO

-- Lawyers/Professionals table
CREATE TABLE [auth].[Lawyers] (
    [LawyerId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL UNIQUE,
    [Specialties] NVARCHAR(MAX),
    [Bio] NVARCHAR(MAX),
    [ProfilePhotoUrl] NVARCHAR(MAX),
    [Qualifications] NVARCHAR(MAX),
    [IsVisible] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId])
);
GO

-- Appointments table
CREATE TABLE [appointments].[Appointments] (
    [AppointmentId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ClientId] UNIQUEIDENTIFIER NOT NULL,
    [LawyerId] UNIQUEIDENTIFIER NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    [StartTime] DATETIME2 NOT NULL,
    [EndTime] DATETIME2 NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ([Status] IN ('pending', 'confirmed', 'cancelled', 'completed')),
    [Location] NVARCHAR(255),
    [GoogleCalendarEventId] NVARCHAR(MAX),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([ClientId]) REFERENCES [auth].[Users]([UserId]),
    FOREIGN KEY ([LawyerId]) REFERENCES [auth].[Users]([UserId]),
    INDEX [IX_ClientId] ([ClientId]),
    INDEX [IX_LawyerId] ([LawyerId]),
    INDEX [IX_Status] ([Status])
);
GO

-- Payments table
CREATE TABLE [payments].[Payments] (
    [PaymentId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [AppointmentId] UNIQUEIDENTIFIER,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Amount] DECIMAL(10, 2) NOT NULL,
    [Currency] NVARCHAR(10) NOT NULL DEFAULT 'USD',
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ([Status] IN ('pending', 'completed', 'failed', 'refunded')),
    [PaymentMethod] NVARCHAR(50),
    [TransactionId] NVARCHAR(255) UNIQUE,
    [PayphoneReference] NVARCHAR(255),
    [FailureReason] NVARCHAR(MAX),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([AppointmentId]) REFERENCES [appointments].[Appointments]([AppointmentId]),
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId]),
    INDEX [IX_UserId] ([UserId]),
    INDEX [IX_Status] ([Status])
);
GO

-- Blog Articles table
CREATE TABLE [blog].[Articles] (
    [ArticleId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [AuthorId] UNIQUEIDENTIFIER NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Slug] NVARCHAR(255) NOT NULL UNIQUE,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Summary] NVARCHAR(500),
    [Category] NVARCHAR(100),
    [FeaturedImageUrl] NVARCHAR(MAX),
    [IsPublished] BIT NOT NULL DEFAULT 0,
    [PublishedAt] DATETIME2,
    [ViewCount] INT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([AuthorId]) REFERENCES [auth].[Users]([UserId]),
    INDEX [IX_Slug] ([Slug]),
    INDEX [IX_IsPublished] ([IsPublished]),
    INDEX [IX_Category] ([Category])
);
GO

-- Testimonials table
CREATE TABLE [blog].[Testimonials] (
    [TestimonialId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ClientId] UNIQUEIDENTIFIER NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Rating] INT CHECK ([Rating] BETWEEN 1 AND 5),
    [IsApproved] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([ClientId]) REFERENCES [auth].[Users]([UserId])
);
GO

-- Notifications table
CREATE TABLE [notifications].[Notifications] (
    [NotificationId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Type] NVARCHAR(50) NOT NULL CHECK ([Type] IN ('email', 'whatsapp', 'push')),
    [Title] NVARCHAR(255) NOT NULL,
    [Message] NVARCHAR(MAX) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ([Status] IN ('pending', 'sent', 'failed')),
    [ScheduledFor] DATETIME2,
    [SentAt] DATETIME2,
    [FailureReason] NVARCHAR(MAX),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [auth].[Users]([UserId]),
    INDEX [IX_UserId] ([UserId]),
    INDEX [IX_Status] ([Status])
);
GO

-- AI Chat History table
CREATE TABLE [notifications].[ChatHistory] (
    [ChatId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER,
    [Message] NVARCHAR(MAX) NOT NULL,
    [Response] NVARCHAR(MAX),
    [SessionId] NVARCHAR(255),
    [TokensUsed] INT,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX [IX_UserId] ([UserId]),
    INDEX [IX_SessionId] ([SessionId])
);
GO

PRINT 'All tables created successfully.';
GO
