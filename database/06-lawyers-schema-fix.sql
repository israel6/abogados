-- =============================================
-- Migration 06: Fix auth.Lawyers schema
-- Replaces columns defined in 02-tables.sql 
-- (Specialties, Qualifications, IsVisible) with
-- the columns expected by lawyerService.ts
-- =============================================

USE bufete_abogados;
GO

-- Drop old table if it exists (no data yet in dev)
IF OBJECT_ID(N'[auth].[Lawyers]', N'U') IS NOT NULL
    DROP TABLE [auth].[Lawyers];
GO

CREATE TABLE [auth].[Lawyers] (
    [LawyerId]          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
    [UserId]            UNIQUEIDENTIFIER    NULL,
    [FirstName]         NVARCHAR(100)       NOT NULL,
    [LastName]          NVARCHAR(100)       NOT NULL,
    [Email]             NVARCHAR(255)       NOT NULL UNIQUE,
    [Phone]             NVARCHAR(30)        NOT NULL,
    [Specialization]    NVARCHAR(150)       NOT NULL,
    [Bio]               NVARCHAR(MAX)       NOT NULL DEFAULT '',
    [Experience]        INT                 NOT NULL DEFAULT 0,
    [ProfileImageUrl]   NVARCHAR(MAX)       NULL,
    [IsAvailable]       BIT                 NOT NULL DEFAULT 1,
    [SuccessCases]      INT                 NOT NULL DEFAULT 0,
    [Rating]            DECIMAL(3, 2)       NOT NULL DEFAULT 0.00,
    [TotalReviews]      INT                 NOT NULL DEFAULT 0,
    [CreatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]         DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_Lawyers] PRIMARY KEY CLUSTERED ([LawyerId]),
    CONSTRAINT [FK_Lawyers_Users] FOREIGN KEY ([UserId])
        REFERENCES [auth].[Users] ([UserId]) ON DELETE SET NULL,
    CONSTRAINT [CK_Lawyers_Rating] CHECK ([Rating] BETWEEN 0 AND 5),
    CONSTRAINT [CK_Lawyers_Experience] CHECK ([Experience] >= 0)
);
GO

CREATE NONCLUSTERED INDEX [IX_Lawyers_Specialization]
    ON [auth].[Lawyers] ([Specialization], [IsAvailable]);
GO

CREATE NONCLUSTERED INDEX [IX_Lawyers_Rating]
    ON [auth].[Lawyers] ([Rating] DESC);
GO

-- =============================================
-- Seed: sample lawyers for development
-- =============================================
INSERT INTO [auth].[Lawyers]
    ([FirstName], [LastName], [Email], [Phone], [Specialization], [Bio], [Experience], [IsAvailable], [SuccessCases], [Rating], [TotalReviews])
VALUES
    ('Juan',   'García',      'juan.garcia@bufete.com',      '+593987654321', 'Derecho Laboral',
     'Especialista en derecho laboral con amplia experiencia en casos de despido intempestivo y contratos colectivos.',
     12, 1, 85, 4.80, 42),
    ('María',  'López',       'maria.lopez@bufete.com',      '+593987654322', 'Derecho Civil',
     'Experta en derecho civil, contratos, familia y sucesiones. Ha representado a más de 200 clientes satisfactoriamente.',
     9,  1, 63, 4.60, 31),
    ('Carlos', 'Rodríguez',   'carlos.rodriguez@bufete.com', '+593987654323', 'Derecho Penal',
     'Abogado penalista con sólida trayectoria en defensa criminal y procesos de apelación ante la Corte Provincial.',
     15, 1, 120, 4.90, 58),
    ('Ana',    'Martínez',    'ana.martinez@bufete.com',     '+593987654324', 'Derecho Mercantil',
     'Asesora legal de empresas. Especializada en constitución de compañías, fusiones y derecho societario.',
     7,  1, 47, 4.50, 22),
    ('Pedro',  'Sánchez',     'pedro.sanchez@bufete.com',    '+593987654325', 'Derecho Tributario',
     'Consultor tributario con experiencia en planificación fiscal, impugnaciones al SRI y obligaciones aduaneras.',
     10, 1, 72, 4.70, 35);
GO

PRINT 'Migration 06-lawyers-schema-fix.sql executed successfully.';
GO
