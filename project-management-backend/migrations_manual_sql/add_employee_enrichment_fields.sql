-- ============================================
-- Migration: Add employee enrichment fields
-- Database: MySQL
-- Date: 2026-02-23
-- Description: Add job_title, description, skills, shift, department, phone to invites and users tables
-- ============================================

USE project_management_db;

-- Step 1: Add enrichment fields to invites table
ALTER TABLE invites 
ADD COLUMN job_title VARCHAR(100) NULL AFTER resend_count,
ADD COLUMN description TEXT NULL AFTER job_title,
ADD COLUMN skills TEXT NULL AFTER description,
ADD COLUMN shift ENUM('morning', 'afternoon', 'night', 'flexible') NULL AFTER skills,
ADD COLUMN department VARCHAR(100) NULL AFTER shift,
ADD COLUMN phone VARCHAR(20) NULL AFTER department;

-- Step 2: Add enrichment fields to users table
ALTER TABLE users 
ADD COLUMN job_title VARCHAR(100) NULL AFTER avatar,
ADD COLUMN description TEXT NULL AFTER job_title,
ADD COLUMN skills TEXT NULL AFTER description,
ADD COLUMN shift ENUM('morning', 'afternoon', 'night', 'flexible') NULL AFTER skills,
ADD COLUMN department VARCHAR(100) NULL AFTER shift,
ADD COLUMN phone VARCHAR(20) NULL AFTER department;

-- Step 3: Verify changes in invites table
SHOW COLUMNS FROM invites;

-- Step 4: Verify changes in users table
SHOW COLUMNS FROM users;

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Open MySQL Workbench or your MySQL client
-- 3. Paste and execute this script
-- ============================================
