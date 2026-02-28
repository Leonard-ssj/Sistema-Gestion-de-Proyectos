-- ============================================
-- CRITICAL FIX: Add 'cancelled' to invites status ENUM
-- Database: MySQL
-- Date: 2026-02-23
-- ============================================

USE project_management_db;

ALTER TABLE invites 
MODIFY COLUMN status ENUM('pending', 'accepted', 'expired', 'cancelled') 
DEFAULT 'pending' NOT NULL;

-- Verify the change
SHOW COLUMNS FROM invites LIKE 'status';
