"""Initial schema

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-03-11

"""

from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('OWNER', 'EMPLOYEE', 'SUPERADMIN', name='user_role'), nullable=False),
        sa.Column('avatar', sa.String(length=500), nullable=True),
        sa.Column('job_title', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('responsibilities', sa.Text(), nullable=True),
        sa.Column('skills', sa.Text(), nullable=True),
        sa.Column('shift', sa.Enum('morning', 'afternoon', 'night', 'flexible', name='employee_shift'), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('status', sa.Enum('active', 'disabled', name='user_status'), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )

    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('timezone', sa.String(length=64), nullable=False, server_default='America/Mexico_City'),
        sa.Column('date_format', sa.String(length=32), nullable=False, server_default='dd/MM/yyyy'),
        sa.Column('state', sa.String(length=64), nullable=True),
        sa.Column('owner_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('active', 'disabled', name='project_status'), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], name='fk_projects_owner_id_users'),
        sa.UniqueConstraint('owner_id', name='uq_projects_owner_id'),
    )

    op.create_table(
        'memberships',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.Enum('OWNER', 'EMPLOYEE', name='membership_role'), nullable=False),
        sa.Column('status', sa.Enum('active', 'disabled', name='membership_status'), nullable=False, server_default='active'),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_memberships_project_id_projects'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_memberships_user_id_users'),
        sa.UniqueConstraint('user_id', 'project_id', name='unique_user_project'),
    )

    op.create_table(
        'tasks',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'blocked', 'done', name='task_status'), nullable=False, server_default='pending'),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', 'urgent', name='task_priority'), nullable=False, server_default='medium'),
        sa.Column('assigned_to', sa.String(length=36), nullable=True),
        sa.Column('created_by', sa.String(length=36), nullable=False),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], name='fk_tasks_assigned_to_users'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], name='fk_tasks_created_by_users'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_tasks_project_id_projects'),
    )

    op.create_table(
        'invites',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('invited_by', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('pending', 'accepted', 'expired', 'cancelled', name='invite_status'), nullable=False, server_default='pending'),
        sa.Column('resend_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('job_title', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('responsibilities', sa.Text(), nullable=True),
        sa.Column('skills', sa.Text(), nullable=True),
        sa.Column('shift', sa.Enum('morning', 'afternoon', 'night', 'flexible', name='employee_shift'), nullable=True),
        sa.Column('department', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['invited_by'], ['users.id'], name='fk_invites_invited_by_users'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_invites_project_id_projects'),
        sa.UniqueConstraint('token', name='uq_invites_token'),
    )

    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_notifications_project_id_projects'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_notifications_user_id_users'),
    )

    op.create_table(
        'comments',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('task_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], name='fk_comments_task_id_tasks'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_comments_user_id_users'),
    )

    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('project_id', sa.String(length=36), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.String(length=36), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_audit_logs_project_id_projects'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_audit_logs_user_id_users'),
    )


def downgrade():
    op.drop_table('audit_logs')
    op.drop_table('comments')
    op.drop_table('notifications')
    op.drop_table('invites')
    op.drop_table('tasks')
    op.drop_table('memberships')
    op.drop_table('projects')
    op.drop_table('users')
