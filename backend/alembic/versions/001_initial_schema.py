"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-03 15:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. patients table
    op.create_table(
        'patients',
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('gender', sa.String(length=20), nullable=False),
        sa.Column('mrn', sa.String(length=50), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('address', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('patient_id')
    )
    op.create_index(op.f('ix_patients_mrn'), 'patients', ['mrn'], unique=True)

    # 2. insurance_policies table
    op.create_table(
        'insurance_policies',
        sa.Column('insurance_policy_id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('payer_name', sa.String(length=150), nullable=False),
        sa.Column('payer_id', sa.String(length=50), nullable=False),
        sa.Column('plan_name', sa.String(length=150), nullable=True),
        sa.Column('member_id', sa.String(length=50), nullable=False),
        sa.Column('policy_number', sa.String(length=50), nullable=False),
        sa.Column('group_number', sa.String(length=50), nullable=True),
        sa.Column('policy_status', sa.String(length=30), nullable=False),
        sa.Column('network_tier', sa.String(length=30), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('card_ocr_data', sa.JSON(), nullable=True),
        sa.Column('field_validations', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ),
        sa.PrimaryKeyConstraint('insurance_policy_id')
    )
    op.create_index(op.f('ix_insurance_policies_patient_id'), 'insurance_policies', ['patient_id'], unique=False)
    op.create_index(op.f('ix_insurance_policies_member_id'), 'insurance_policies', ['member_id'], unique=False)

    # 3. appointments table
    op.create_table(
        'appointments',
        sa.Column('appointment_id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('insurance_policy_id', sa.String(length=36), nullable=True),
        sa.Column('appointment_time', sa.DateTime(), nullable=False),
        sa.Column('provider_name', sa.String(length=150), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('facility_name', sa.String(length=150), nullable=True),
        sa.Column('procedure_code', sa.String(length=30), nullable=False),
        sa.Column('procedure_description', sa.String(length=255), nullable=False),
        sa.Column('estimated_cost', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['insurance_policy_id'], ['insurance_policies.insurance_policy_id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ),
        sa.PrimaryKeyConstraint('appointment_id')
    )
    op.create_index(op.f('ix_appointments_patient_id'), 'appointments', ['patient_id'], unique=False)
    op.create_index(op.f('ix_appointments_insurance_policy_id'), 'appointments', ['insurance_policy_id'], unique=False)
    op.create_index(op.f('ix_appointments_appointment_time'), 'appointments', ['appointment_time'], unique=False)

    # 4. clearance_records table
    op.create_table(
        'clearance_records',
        sa.Column('clearance_id', sa.String(length=36), nullable=False),
        sa.Column('patient_id', sa.String(length=36), nullable=False),
        sa.Column('appointment_id', sa.String(length=36), nullable=False),
        sa.Column('clearance_status', sa.String(length=30), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False),
        sa.Column('risk_level', sa.String(length=20), nullable=False),
        sa.Column('is_blocked', sa.Boolean(), nullable=False),
        sa.Column('blocking_reasons', sa.JSON(), nullable=True),
        sa.Column('factors', sa.JSON(), nullable=True),
        sa.Column('recommended_actions', sa.JSON(), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(), nullable=True),
        sa.Column('evaluated_by', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.appointment_id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.patient_id'], ),
        sa.PrimaryKeyConstraint('clearance_id')
    )
    op.create_index(op.f('ix_clearance_records_patient_id'), 'clearance_records', ['patient_id'], unique=False)
    op.create_index(op.f('ix_clearance_records_appointment_id'), 'clearance_records', ['appointment_id'], unique=False)

def downgrade() -> None:
    op.drop_table('clearance_records')
    op.drop_table('appointments')
    op.drop_table('insurance_policies')
    op.drop_table('patients')
