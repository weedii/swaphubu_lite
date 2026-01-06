# KYC Documentation

## Overview

SwapHubu KYC system handles identity verification using Shufti Pro. Users submit documents and complete face verification to get verified status on the platform.

## Quick Setup

```bash
# Environment Variables
SHUFTI_CLIENT_ID="your_client_id"
SHUFTI_SECRET_KEY="your_secret_key"
SHUFTI_BASE_URL="https://api.shuftipro.com"
CALLBACK_URL="https://your-domain.com/kyc/webhook"
VERIFICATION_TTL=43200
WEBHOOK_TIMEOUT=30
MAX_VERIFICATION_ATTEMPTS=3
DEBUG_MODE=1 # 1 or 0  if set to 1 system will handle this as true else false
ENVIRONMENT="development"
```

## API Endpoints

### Start KYC

```bash
POST /kyc/start
{
    "user_id": "user-uuid"
}
```

**Response:**

```json
{
  "verification_id": "550e8400-e29b-41d4-a716-446655440000",
  "reference": "KYC_550e8400",
  "verification_url": "https://shuftipro.com/verify/550e8400",
  "message": "KYC verification initiated successfully"
}
```

### Check Status

```bash
GET /kyc/status/{user_id}
```

**Response:**

```json
{
  "verification_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "submitted_at": "2025-07-20T14:30:00.000Z",
  "reviewed_at": null,
  "is_completed": false,
  "verification_url": "https://shuftipro.com/verify/550e8400",
  "decline_reasons": null,
  "verification_details": null,
  "message": "Verification in progress"
}
```

### Retry Verification

```bash
POST /kyc/retry/{user_id}
```

**Response:**

```json
{
  "status": "success",
  "message": "Verification retry initiated successfully",
  "data": {
    "verification_id": "550e8400-e29b-41d4-a716-446655440000",
    "reference": "KYC_550e8400_RETRY",
    "verification_url": "https://shuftipro.com/verify/550e8400"
  }
}
```

**Error Response:**

```json
{
  "detail": "No retry_pending verification found for this user"
}
```

### Webhook (Public)

```bash
POST /kyc/webhook
```

**Response:**

```json
{
  "message": "Webhook processed successfully",
  "status": "success"
}
```

### Health Check

```bash
GET /kyc/health
```

**Response:**

```json
{
  "status": "healthy",
  "environment": "development",
  "timestamp": "2025-07-21T10:15:30.000Z",
  "error": null
}
```

## Status Flow

| Status          | Description                  | Next Action            |
| --------------- | ---------------------------- | ---------------------- |
| `initiated`     | Just created                 | Wait for Shufti Pro    |
| `pending`       | User completing verification | User completes process |
| `verified`      | ✅ Successfully verified     | None                   |
| `declined`      | ❌ Verification rejected     | Check auto-retry       |
| `retry_pending` | Auto-retry available         | Call retry endpoint    |
| `cancelled`     | Verification cancelled       | Start new verification |
| `error`         | Technical error              | Contact support        |

## Auto-Retry System

**Automatically retries for these decline codes:**

- Document quality issues (blurry, poor quality, tampered)
- Face detection issues (not visible, poor lighting)
- Technical issues (photocopy, screenshot)

**No retry for:**

- Name/DOB mismatch
- Face doesn't match document

**Limits:** Max 3 attempts per user

## Code Examples

### Service Usage

```python
from services.kyc_service import KYCService

# Check if verified
is_verified = KYCService.is_user_kyc_verified(user_id, db)

# Start verification
response = await KYCService.start_verification_by_user_id(user_id, db)
```

### Repository Usage

```python
from repositories.KYCRepository import KYCRepository

# Find pending verification
pending = KYCRepository.find_pending_verification_by_user(db, user_id)

# Get user history
history = KYCRepository.get_user_verifications(db, user_id)
```

### Model Usage (CRUD)

```python
from models.KYCVerification import KYCVerification

# Create
verification = KYCVerification.create(db, user_id=user_id, status="initiated")

# Update
KYCVerification.update(db, verification_id, {"status": "verified"})

# Get
verification = KYCVerification.get_by_id(db, verification_id)
```

## Security

### Webhook Signature Verification

```python
# Shufti Pro algorithm: hash(payload + hash(secret_key))
def verify_signature(payload: bytes, signature: str, secret_key: str) -> bool:
    secret_hash = hashlib.sha256(secret_key.encode()).hexdigest()
    concatenated = payload.decode() + secret_hash
    calculated = hashlib.sha256(concatenated.encode()).hexdigest()
    return hmac.compare_digest(calculated.lower(), signature.lower())
```

## Error Handling

```python
from services.kyc_exceptions import (
    KYCError,                    # Base exception
    KYCProviderError,           # Shufti Pro errors
    KYCConfigurationError,      # Config issues
    KYCVerificationNotFoundError # Not found
)
```

## Configuration

```python
from config.kyc_config import init_kyc_config

config = init_kyc_config()
print(f"Environment: {config.environment}")
print(f"Supported countries: {len(config.supported_countries)}")  # 195+
```

## Testing

### Mock Response

```python
MOCK_RESPONSE = {
    "reference": "test_ref_123",
    "event": "request.pending",
    "verification_url": "https://test.shuftipro.com/verify/123"
}
```

### Test Webhook

```python
TEST_WEBHOOK = {
    "reference": "KYC_test_123",
    "event": "verification.accepted",
    "verification_status": "1"
}
```

## Troubleshooting

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| Invalid signature   | Check SHUFTI_SECRET_KEY                       |
| User not found      | Verify user exists with required profile data |
| Duplicate reference | Check reference generation logic              |
| Timeout error       | Check Shufti Pro API connectivity             |
| Config error        | Verify all environment variables              |

## Database Schema

```sql
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reference VARCHAR UNIQUE NOT NULL,
    status VARCHAR NOT NULL,
    provider_response TEXT,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP
);
```

## Architecture

```
HTTP Layer (endpoints/kyc.py)
    ↓
Business Logic (services/kyc_service.py)
    ↓
External API (services/shufti_service.py)
    ↓
Data Access (repositories/KYCRepository.py)
    ↓
Database (models/KYCVerification.py)
```

## Monitoring

**Key metrics to track:**

- Verification success rate
- Average verification time
- Decline reasons frequency
- Retry success rate
- API response times

**Enable debug logging:**

```bash
DEBUG_MODE=1 # 1 or 0  if set to 1 system will handle this as true else false
```
