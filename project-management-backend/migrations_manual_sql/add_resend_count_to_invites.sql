-- ============================================
-- Migration: Add resend_count and fix status ENUM in invites table
-- Database: MySQL
-- Date: 2026-02-23
-- Description: Add resend counter and 'cancelled' status to invitations
-- ============================================

-- Select database
USE project_management_db;

-- Step 1: Modify status ENUM to include 'cancelled'
ALTER TABLE invites 
MODIFY COLUMN status ENUM('pending', 'accepted', 'expired', 'cancelled') 
DEFAULT 'pending' NOT NULL;

-- Step 2: Add resend_count column if it doesn't exist
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS resend_count INT DEFAULT 0 NOT NULL;

-- Step 3: Add updated_at column if it doesn't exist
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Step 4: Update existing invitations (just in case)
UPDATE invites 
SET resend_count = 0 
WHERE resend_count IS NULL;

-- Step 5: Verify changes
SELECT 
    id, 
    email, 
    status, 
    resend_count, 
    created_at, 
    updated_at 
FROM invites 
LIMIT 5;

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Open MySQL Workbench or your MySQL client
-- 3. Paste and execute this script
-- ============================================
