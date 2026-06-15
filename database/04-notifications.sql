-- =============================================
-- Fase 8: Tablas de Notificaciones
-- Portal Bufete de Abogados
-- =============================================

-- Schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'notifications')
BEGIN
    EXEC('CREATE SCHEMA notifications')
END
GO

-- =============================================
-- Tabla: NotificationLog
-- Historial de todas las notificaciones enviadas
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[notifications].[NotificationLog]')
    AND type = N'U'
)
BEGIN
    CREATE TABLE [notifications].[NotificationLog] (
        [NotificationId]    UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWSEQUENTIALID(),
        [UserId]            UNIQUEIDENTIFIER    NULL,         -- Destinatario (puede ser anónimo)
        [Channel]           NVARCHAR(20)        NOT NULL,     -- 'email', 'sms', 'whatsapp'
        [Recipient]         NVARCHAR(255)       NOT NULL,     -- email o número de teléfono
        [Subject]           NVARCHAR(500)       NULL,         -- Solo para emails
        [TemplateType]      NVARCHAR(100)       NOT NULL,     -- 'appointment_confirmation', 'payment_receipt', etc.
        [Status]            NVARCHAR(20)        NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
        [Attempts]          INT                 NOT NULL DEFAULT 0,
        [ErrorMessage]      NVARCHAR(MAX)       NULL,
        [SentAt]            DATETIME2           NULL,
        [CreatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
        [ReferenceId]       NVARCHAR(255)       NULL,         -- AppointmentId o PaymentId relacionado
        CONSTRAINT [PK_NotificationLog] PRIMARY KEY CLUSTERED ([NotificationId]),
        CONSTRAINT [CK_NotificationLog_Channel] CHECK ([Channel] IN ('email', 'sms', 'whatsapp')),
        CONSTRAINT [CK_NotificationLog_Status] CHECK ([Status] IN ('pending', 'sent', 'failed', 'skipped'))
    )

    CREATE NONCLUSTERED INDEX [IX_NotificationLog_UserId]
        ON [notifications].[NotificationLog] ([UserId])

    CREATE NONCLUSTERED INDEX [IX_NotificationLog_Status_CreatedAt]
        ON [notifications].[NotificationLog] ([Status], [CreatedAt])

    CREATE NONCLUSTERED INDEX [IX_NotificationLog_ReferenceId]
        ON [notifications].[NotificationLog] ([ReferenceId])

    PRINT 'Tabla notifications.NotificationLog creada.'
END
GO

-- =============================================
-- Stored Procedure: sp_LogNotification
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[notifications].[sp_LogNotification]'))
    DROP PROCEDURE [notifications].[sp_LogNotification]
GO

CREATE PROCEDURE [notifications].[sp_LogNotification]
    @Channel        NVARCHAR(20),
    @Recipient      NVARCHAR(255),
    @Subject        NVARCHAR(500) = NULL,
    @TemplateType   NVARCHAR(100),
    @Status         NVARCHAR(20),
    @UserId         UNIQUEIDENTIFIER = NULL,
    @ReferenceId    NVARCHAR(255) = NULL,
    @ErrorMessage   NVARCHAR(MAX) = NULL,
    @NotificationId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @inserted TABLE ([NotificationId] UNIQUEIDENTIFIER);

    INSERT INTO [notifications].[NotificationLog]
        ([Channel], [Recipient], [Subject], [TemplateType], [Status],
         [UserId], [ReferenceId], [ErrorMessage], [Attempts], [SentAt])
    OUTPUT INSERTED.[NotificationId] INTO @inserted
    VALUES
        (@Channel, @Recipient, @Subject, @TemplateType, @Status,
         @UserId, @ReferenceId, @ErrorMessage, 1,
         CASE WHEN @Status = 'sent' THEN GETUTCDATE() ELSE NULL END);

    SELECT @NotificationId = [NotificationId] FROM @inserted;
END
GO

PRINT 'Script 04-notifications.sql ejecutado correctamente.'
