-- ============================================
-- Migration: Add responsibilities field
-- Database: MySQL
-- Date: 2026-02-23
-- Description: Add responsibilities field to invites and users tables
-- ============================================

USE project_management_db;

-- Step 1: Add responsibilities field to invites table
ALTER TABLE invites 
ADD COLUMN responsibilities TEXT NULL AFTER description;

-- Step 2: Add responsibilities field to users table
ALTER TABLE users 
ADD COLUMN responsibilities TEXT NULL AFTER description;

-- Step 3: Verify changes
SHOW COLUMNS FROM invites LIKE 'responsibilities';
SHOW COLUMNS FROM users LIKE 'responsibilities';

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Open MySQL Workbench or your MySQL client
-- 3. Paste and execute this script
-- ============================================
