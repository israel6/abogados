-- =============================================
-- Fase 9: Tablas de IA / Chatbot Claude
-- Portal Bufete de Abogados
-- =============================================

-- Schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ai')
BEGIN
    EXEC('CREATE SCHEMA ai')
END
GO

-- =============================================
-- Tabla: Conversations
-- Sesiones de chat con el asistente IA
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[ai].[Conversations]')
    AND type = N'U'
)
BEGIN
    CREATE TABLE [ai].[Conversations] (
        [ConversationId]    UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWSEQUENTIALID(),
        [UserId]            UNIQUEIDENTIFIER    NULL,         -- NULL para usuarios anónimos (precalificación)
        [SessionToken]      NVARCHAR(255)       NULL,         -- Para usuarios anónimos
        [Title]             NVARCHAR(500)       NULL,         -- Resumen auto-generado de la consulta
        [CaseType]          NVARCHAR(100)       NULL,         -- Tipo detectado: 'civil', 'penal', 'laboral', etc.
        [Status]            NVARCHAR(20)        NOT NULL DEFAULT 'active', -- 'active', 'closed'
        [TotalTokensUsed]   INT                 NOT NULL DEFAULT 0,
        [CreatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Conversations] PRIMARY KEY CLUSTERED ([ConversationId]),
        CONSTRAINT [CK_Conversations_Status] CHECK ([Status] IN ('active', 'closed'))
    )

    CREATE NONCLUSTERED INDEX [IX_Conversations_UserId]
        ON [ai].[Conversations] ([UserId], [CreatedAt] DESC)

    CREATE NONCLUSTERED INDEX [IX_Conversations_SessionToken]
        ON [ai].[Conversations] ([SessionToken])

    PRINT 'Tabla ai.Conversations creada.'
END
GO

-- =============================================
-- Tabla: Messages
-- Mensajes individuales de cada conversación
-- =============================================
IF NOT EXISTS (
    SELECT * FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[ai].[Messages]')
    AND type = N'U'
)
BEGIN
    CREATE TABLE [ai].[Messages] (
        [MessageId]         UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWSEQUENTIALID(),
        [ConversationId]    UNIQUEIDENTIFIER    NOT NULL,
        [Role]              NVARCHAR(20)        NOT NULL,     -- 'user' o 'assistant'
        [Content]           NVARCHAR(MAX)       NOT NULL,
        [TokensUsed]        INT                 NOT NULL DEFAULT 0,
        [ModelUsed]         NVARCHAR(100)       NULL,         -- ej: 'claude-3-5-sonnet-20241022'
        [CreatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED ([MessageId]),
        CONSTRAINT [FK_Messages_Conversations] FOREIGN KEY ([ConversationId])
            REFERENCES [ai].[Conversations] ([ConversationId]) ON DELETE CASCADE,
        CONSTRAINT [CK_Messages_Role] CHECK ([Role] IN ('user', 'assistant', 'system'))
    )

    CREATE NONCLUSTERED INDEX [IX_Messages_ConversationId_CreatedAt]
        ON [ai].[Messages] ([ConversationId], [CreatedAt] ASC)

    PRINT 'Tabla ai.Messages creada.'
END
GO

-- =============================================
-- Stored Procedure: sp_CreateConversation
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[ai].[sp_CreateConversation]'))
    DROP PROCEDURE [ai].[sp_CreateConversation]
GO

CREATE PROCEDURE [ai].[sp_CreateConversation]
    @UserId         UNIQUEIDENTIFIER = NULL,
    @SessionToken   NVARCHAR(255) = NULL,
    @ConversationId UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ConversationId = NEWID();

    INSERT INTO [ai].[Conversations] ([ConversationId], [UserId], [SessionToken])
    VALUES (@ConversationId, @UserId, @SessionToken)
END
GO

-- =============================================
-- Stored Procedure: sp_AddMessage
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[ai].[sp_AddMessage]'))
    DROP PROCEDURE [ai].[sp_AddMessage]
GO

CREATE PROCEDURE [ai].[sp_AddMessage]
    @ConversationId UNIQUEIDENTIFIER,
    @Role           NVARCHAR(20),
    @Content        NVARCHAR(MAX),
    @TokensUsed     INT = 0,
    @ModelUsed      NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [ai].[Messages] ([ConversationId], [Role], [Content], [TokensUsed], [ModelUsed])
    VALUES (@ConversationId, @Role, @Content, @TokensUsed, @ModelUsed)

    -- Actualizar tokens totales y timestamp en la conversación
    UPDATE [ai].[Conversations]
    SET [TotalTokensUsed] = [TotalTokensUsed] + @TokensUsed,
        [UpdatedAt] = GETUTCDATE()
    WHERE [ConversationId] = @ConversationId
END
GO

PRINT 'Script 05-ai-conversations.sql ejecutado correctamente.'
