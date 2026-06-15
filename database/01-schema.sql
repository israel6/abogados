-- SQL Server Database Schema for Bufete de Abogados Portal
-- Created: 2024

-- Use master database to create the main database
USE master;
GO

-- Drop existing database if exists (optional)
-- IF EXISTS (SELECT * FROM sys.databases WHERE name = 'bufete_abogados')
-- BEGIN
--     ALTER DATABASE bufete_abogados SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
--     DROP DATABASE bufete_abogados;
-- END
-- GO

-- Create database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'bufete_abogados')
BEGIN
    CREATE DATABASE bufete_abogados;
END
GO

-- Switch to the new database
USE bufete_abogados;
GO

-- Create schemas
CREATE SCHEMA [auth] AUTHORIZATION dbo;
GO

CREATE SCHEMA [appointments] AUTHORIZATION dbo;
GO

CREATE SCHEMA [payments] AUTHORIZATION dbo;
GO

CREATE SCHEMA [blog] AUTHORIZATION dbo;
GO

CREATE SCHEMA [notifications] AUTHORIZATION dbo;
GO

PRINT 'Database and schemas created successfully.';
GO
