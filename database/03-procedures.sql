-- SQL Server Stored Procedures for Bufete de Abogados Portal

USE bufete_abogados;
GO

-- ===== AUTHENTICATION PROCEDURES =====

-- Create or update user
CREATE PROCEDURE [auth].[sp_CreateUser]
    @Email NVARCHAR(255),
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(20),
    @Role NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @UserId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM [auth].[Users] WHERE [Email] = @Email)
        BEGIN
            THROW 50001, 'Email already exists', 1;
        END
        
        SET @UserId = NEWID();
        
        INSERT INTO [auth].[Users] (
            [UserId], [Email], [FullName], [Phone], [Role], [PasswordHash]
        )
        VALUES (
            @UserId, @Email, @FullName, @Phone, @Role, @PasswordHash
        );
        
        SELECT 'User created successfully' AS [Message];
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Get user by email (includes PasswordHash for authentication)
CREATE PROCEDURE [auth].[sp_GetUserByEmail]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        [UserId], [Email], [FullName], [Phone], [Role], [PasswordHash], [IsActive],
        [CreatedAt], [UpdatedAt]
    FROM [auth].[Users]
    WHERE [Email] = @Email
    AND [IsActive] = 1;
END
GO

-- ===== APPOINTMENT PROCEDURES =====

-- Get available appointment slots
CREATE PROCEDURE [appointments].[sp_GetAvailableSlots]
    @LawyerId UNIQUEIDENTIFIER,
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- This would typically query calendar system
    -- For now, return basic structure
    SELECT 
        [StartTime],
        [EndTime]
    FROM [appointments].[Appointments]
    WHERE [LawyerId] = @LawyerId
    AND CAST([StartTime] AS DATE) BETWEEN @StartDate AND @EndDate
    AND [Status] = 'confirmed'
    ORDER BY [StartTime];
END
GO

-- Create appointment
CREATE PROCEDURE [appointments].[sp_CreateAppointment]
    @ClientId UNIQUEIDENTIFIER,
    @LawyerId UNIQUEIDENTIFIER,
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @StartTime DATETIME2,
    @EndTime DATETIME2,
    @Location NVARCHAR(255),
    @AppointmentId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check for conflicts
        IF EXISTS (
            SELECT 1 FROM [appointments].[Appointments]
            WHERE [LawyerId] = @LawyerId
            AND [Status] IN ('pending', 'confirmed')
            AND (
                (@StartTime BETWEEN [StartTime] AND [EndTime])
                OR (@EndTime BETWEEN [StartTime] AND [EndTime])
                OR ([StartTime] BETWEEN @StartTime AND @EndTime)
            )
        )
        BEGIN
            THROW 50002, 'Time slot not available', 1;
        END
        
        SET @AppointmentId = NEWID();
        
        INSERT INTO [appointments].[Appointments] (
            [AppointmentId], [ClientId], [LawyerId], [Title], [Description],
            [StartTime], [EndTime], [Location], [Status]
        )
        VALUES (
            @AppointmentId, @ClientId, @LawyerId, @Title, @Description,
            @StartTime, @EndTime, @Location, 'pending'
        );
        
        SELECT 'Appointment created successfully' AS [Message];
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ===== PAYMENT PROCEDURES =====

-- Record payment
CREATE PROCEDURE [payments].[sp_RecordPayment]
    @AppointmentId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @Amount DECIMAL(10, 2),
    @Currency NVARCHAR(10),
    @TransactionId NVARCHAR(255),
    @PaymentId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SET @PaymentId = NEWID();
        
        INSERT INTO [payments].[Payments] (
            [PaymentId], [AppointmentId], [UserId], [Amount], [Currency],
            [Status], [TransactionId]
        )
        VALUES (
            @PaymentId, @AppointmentId, @UserId, @Amount, @Currency,
            'completed', @TransactionId
        );
        
        -- Update appointment status
        UPDATE [appointments].[Appointments]
        SET [Status] = 'confirmed'
        WHERE [AppointmentId] = @AppointmentId;
        
        SELECT 'Payment recorded successfully' AS [Message];
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ===== BLOG PROCEDURES =====

-- Create article
CREATE PROCEDURE [blog].[sp_CreateArticle]
    @AuthorId UNIQUEIDENTIFIER,
    @Title NVARCHAR(255),
    @Slug NVARCHAR(255),
    @Content NVARCHAR(MAX),
    @Summary NVARCHAR(500),
    @Category NVARCHAR(100),
    @FeaturedImageUrl NVARCHAR(MAX),
    @ArticleId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM [blog].[Articles] WHERE [Slug] = @Slug)
        BEGIN
            THROW 50003, 'Article slug already exists', 1;
        END
        
        SET @ArticleId = NEWID();
        
        INSERT INTO [blog].[Articles] (
            [ArticleId], [AuthorId], [Title], [Slug], [Content],
            [Summary], [Category], [FeaturedImageUrl]
        )
        VALUES (
            @ArticleId, @AuthorId, @Title, @Slug, @Content,
            @Summary, @Category, @FeaturedImageUrl
        );
        
        SELECT 'Article created successfully' AS [Message];
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Get published articles
CREATE PROCEDURE [blog].[sp_GetPublishedArticles]
    @Category NVARCHAR(100) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [ArticleId], [AuthorId], [Title], [Slug], [Summary],
        [Category], [FeaturedImageUrl], [ViewCount], [PublishedAt]
    FROM [blog].[Articles]
    WHERE [IsPublished] = 1
    AND (@Category IS NULL OR [Category] = @Category)
    ORDER BY [PublishedAt] DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- ===== NOTIFICATION PROCEDURES =====

-- Queue notification
CREATE PROCEDURE [notifications].[sp_QueueNotification]
    @UserId UNIQUEIDENTIFIER,
    @Type NVARCHAR(50),
    @Title NVARCHAR(255),
    @Message NVARCHAR(MAX),
    @ScheduledFor DATETIME2 = NULL,
    @NotificationId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SET @NotificationId = NEWID();
        
        INSERT INTO [notifications].[Notifications] (
            [NotificationId], [UserId], [Type], [Title], [Message],
            [ScheduledFor], [Status]
        )
        VALUES (
            @NotificationId, @UserId, @Type, @Title, @Message,
            @ScheduledFor, 'pending'
        );
        
        SELECT 'Notification queued successfully' AS [Message];
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'All stored procedures created successfully.';
GO
