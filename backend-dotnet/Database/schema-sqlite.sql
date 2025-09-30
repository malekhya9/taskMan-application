-- TaskMan Database Schema for SQLite
-- This script creates all necessary tables for the TaskMan application

-- Users table
CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Role TEXT NOT NULL DEFAULT 'member',
    ParentOrgId INTEGER NULL,
    IsVerified INTEGER NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ParentOrgId) REFERENCES Users(Id)
);

-- Tasks table
CREATE TABLE Tasks (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Description TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'backlogged',
    DueDate DATETIME NULL,
    ProjectTag TEXT NULL,
    CreatedBy INTEGER NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ArchivedAt DATETIME NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);

-- Task Assignees junction table
CREATE TABLE TaskAssignees (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TaskId INTEGER NOT NULL,
    UserId INTEGER NOT NULL,
    AssignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE (TaskId, UserId)
);

-- Task Attachments table
CREATE TABLE TaskAttachments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TaskId INTEGER NOT NULL,
    Filename TEXT NOT NULL,
    OriginalName TEXT NOT NULL,
    FileSize INTEGER NOT NULL,
    UploadedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
);

-- Task Comments table
CREATE TABLE TaskComments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TaskId INTEGER NOT NULL,
    UserId INTEGER NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Invites table
CREATE TABLE Invites (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL,
    InvitedBy INTEGER NOT NULL,
    Role TEXT NOT NULL DEFAULT 'member',
    Message TEXT NULL,
    Token TEXT NOT NULL UNIQUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME NOT NULL,
    AcceptedAt DATETIME NULL,
    AcceptedBy INTEGER NULL,
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
('admin@taskman.com', 'admin123', 'Admin', 'User', 'lead', 1, 1);

-- Update the first user's ParentOrgId to reference itself
UPDATE Users SET ParentOrgId = Id WHERE Id = 1;

