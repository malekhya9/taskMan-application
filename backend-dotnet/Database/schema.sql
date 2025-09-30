-- TaskMan Database Schema for SQL Server
-- This script creates all necessary tables for the TaskMan application

-- Users table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'member',
    ParentOrgId INT NULL,
    IsVerified BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ParentOrgId) REFERENCES Users(Id)
);

-- Tasks table
CREATE TABLE Tasks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'backlogged',
    DueDate DATETIME2 NULL,
    ProjectTag NVARCHAR(100) NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ArchivedAt DATETIME2 NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);

-- Task Assignees junction table
CREATE TABLE TaskAssignees (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    UserId INT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE (TaskId, UserId)
);

-- Task Attachments table
CREATE TABLE TaskAttachments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    Filename NVARCHAR(255) NOT NULL,
    OriginalName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
);

-- Task Comments table
CREATE TABLE TaskComments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    UserId INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Invites table
CREATE TABLE Invites (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    InvitedBy INT NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'member',
    Message NVARCHAR(100) NULL,
    Token NVARCHAR(255) NOT NULL UNIQUE,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME2 NOT NULL,
    AcceptedAt DATETIME2 NULL,
    AcceptedBy INT NULL,
    FOREIGN KEY (InvitedBy) REFERENCES Users(Id),
    FOREIGN KEY (AcceptedBy) REFERENCES Users(Id)
);

-- Create indexes for better performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_ParentOrgId ON Users(ParentOrgId);
CREATE INDEX IX_Tasks_CreatedBy ON Tasks(CreatedBy);
CREATE INDEX IX_Tasks_Status ON Tasks(Status);
CREATE INDEX IX_Tasks_ArchivedAt ON Tasks(ArchivedAt);
CREATE INDEX IX_TaskAssignees_TaskId ON TaskAssignees(TaskId);
CREATE INDEX IX_TaskAssignees_UserId ON TaskAssignees(UserId);
CREATE INDEX IX_TaskAttachments_TaskId ON TaskAttachments(TaskId);
CREATE INDEX IX_TaskComments_TaskId ON TaskComments(TaskId);
CREATE INDEX IX_TaskComments_UserId ON TaskComments(UserId);
CREATE INDEX IX_Invites_Email ON Invites(Email);
CREATE INDEX IX_Invites_Token ON Invites(Token);
CREATE INDEX IX_Invites_InvitedBy ON Invites(InvitedBy);

-- Insert sample data for demo
INSERT INTO Users (Email, Password, FirstName, LastName, Role, ParentOrgId, IsVerified) VALUES
('admin@taskman.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', 'Admin', 'User', 'lead', 1, 1);

-- Update the first user's ParentOrgId to reference itself
UPDATE Users SET ParentOrgId = Id WHERE Id = 1;

