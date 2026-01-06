# 🏷️ Database Model Decorators Guide

Simple, powerful decorators to enhance your SQLAlchemy models without complexity.

## 📋 Available Decorators

### 🕒 **Timestamp Decorators**

#### `@timestamped`

Adds basic timestamp tracking.

```python
@timestamped
class Invoice(Base):
    # Gets: created_at, updated_at
    pass

# Usage:
invoice = Invoice.create(db, amount=100)
print(invoice.created_at)  # 2024-01-15 10:30:00
print(invoice.updated_at)  # 2024-01-15 10:30:00
```

#### `@auto_updated`

Enhanced timestamps with automatic updates.

```python
@auto_updated
class MarginSetting(Base):
    # Gets: created_at, updated_at (auto-updates on ANY change)
    pass
```

#### `@creation_tracked`

Only tracks creation time (for immutable records).

```python
@creation_tracked
class AuditLog(Base):
    # Gets: created_at (only)
    pass
```

---

### 🗑️ **Soft Delete Decorators**

#### `@soft_deletable`

Enables soft delete functionality.

```python
@soft_deletable
class UserPaymentMethod(Base):
    # Gets: deleted_at field + methods
    pass

# Usage:
payment.soft_delete()          # Mark as deleted
print(payment.is_deleted)      # True
payment.restore()              # Restore the record
print(payment.is_deleted)      # False
```

#### `@auditable`

Complete audit trail (timestamps + soft delete).

```python
@auditable
class User(Base):
    # Gets: created_at, updated_at, deleted_at + soft delete methods
    pass

# RECOMMENDED for most business models
```

---

### 💾 **CRUD Operations Decorator**

#### `@crud_enabled`

Automatic CRUD operations for any model.

```python
@crud_enabled
@auditable
class Transaction(Base):
    __tablename__ = "transactions"
    # Your fields here

# Gets 8 automatic methods:
user = User.create(db, email="test@test.com")              # Create
user = User.get_by_id(db, user_id)                        # Read by ID
users = User.get_all(db)                                  # Read all
paginated = User.get_paginated(db, page=1, limit=10)     # Paginated
updated = User.update(db, user_id, {"email": "new@test"}) # Update
success = User.delete(db, user_id)                        # Delete
count = User.count(db)                                    # Count
exists = User.exists(db, user_id)                         # Exists check
```

**Features:**

- ✅ Respects soft deletes automatically
- ✅ Auto-updates timestamps
- ✅ Built-in pagination
- ✅ Works with all other decorators

---

### 🔐 **Security Decorator**

#### `@encrypted_field`

Automatic encryption/decryption of sensitive fields.

```python
@encrypted_field('wallet_address', 'iban')
@crud_enabled
@auditable
class UserPaymentMethod(Base):
    wallet_address = Column(String)  # Automatically encrypted
    iban = Column(String)            # Automatically encrypted
    currency = Column(String)        # Not encrypted

# Usage (transparent encryption/decryption):
payment = UserPaymentMethod.create(
    db,
    wallet_address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Plain text
    iban="GB82 WEST 1234 5698 7654 32"                    # Plain text
)

print(payment.wallet_address)  # Plain text (auto-decrypted)
print(payment.iban)           # Plain text (auto-decrypted)
# Database stores encrypted values!
```

**Features:**

- ✅ Transparent encryption/decryption
- ✅ Secure AES encryption (Fernet)
- ✅ Environment-based key management
- ✅ Works with all CRUD operations

---

## 🎯 Decorator Combinations

### **Recommended Combinations:**

```python
# Most business models (full features)
@encrypted_field('sensitive_field')  # If has sensitive data
@crud_enabled                        # Automatic CRUD
@auditable                          # Full audit trail
class BusinessModel(Base):
    pass

# Configuration models (frequently updated)
@crud_enabled
@auto_updated
class Settings(Base):
    pass

# Log/Event models (immutable)
@crud_enabled
@creation_tracked
class EventLog(Base):
    pass

# Simple models (basic needs)
@crud_enabled
@timestamped
class SimpleModel(Base):
    pass
```

---

## 🚀 Quick Start Examples

### **User Management:**

```python
@crud_enabled
@auditable
class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True)
    email = Column(String)
    # Gets: created_at, updated_at, deleted_at + 8 CRUD methods

# Usage:
user = User.create(db, email="john@example.com")
user = User.get_by_id(db, user_id)
User.delete(db, user_id)  # Soft delete
```

### **Secure Payment Methods:**

```python
@encrypted_field('value')  # Encrypt wallet/IBAN
@crud_enabled
@timestamped
class UserPaymentMethod(Base):
    __tablename__ = "user_payment_methods"

    value = Column(String)  # Automatically encrypted
    currency = Column(String)

# Usage:
wallet = UserPaymentMethod.create(
    db,
    value="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Stored encrypted
    currency="BTC"
)
print(wallet.value)  # Prints decrypted value
```

### **Transaction Processing:**

```python
@crud_enabled
@auditable
class Transaction(Base):
    __tablename__ = "transactions"

    amount = Column(DECIMAL)
    status = Column(String)

# Usage:
tx = Transaction.create(db, amount=100.50, status="pending")
paginated_tx = Transaction.get_paginated(db, page=1, limit=20)
Transaction.update(db, tx.id, {"status": "completed"})
```

---

## 💡 Best Practices

### ✅ **Do:**

- Use `@crud_enabled` on ALL models (eliminates 90% of boilerplate)
- Use `@auditable` for business-critical data
- Use `@encrypted_field` for sensitive data (wallets, IBANs, etc.)
- Combine decorators for maximum functionality
- Use custom repositories only for complex queries

### ❌ **Don't:**

- Mix multiple timestamp decorators on same model
- Use `@auditable` on high-volume log tables (use `@creation_tracked`)
- Forget to set encryption keys for `@encrypted_field`
- Create CRUD methods manually when `@crud_enabled` exists

---

## 🔧 Environment Setup

### **For Encryption:**

```bash
# .env file
ENCRYPTION_KEY=your-base64-encryption-key
# or
APP_SECRET=your-app-secret-for-key-derivation
```

### **Database Connection:**

```python
# Already configured in src/db/base.py
from src.db.base import get_db
```

---

## 📖 Manual Functions

### **Manual Encryption/Decryption:**

```python
from src.utils import encrypt_field_value, decrypt_field_value

encrypted = encrypt_field_value("sensitive_data")
decrypted = decrypt_field_value(encrypted)
```

### **Custom Repository Pattern:**

```python
# For complex queries beyond basic CRUD
class UserRepository:
    @staticmethod
    def find_by_email(db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()

# Usage:
user = User.get_by_id(db, user_id)  # Basic CRUD
user = UserRepository.find_by_email(db, "test@test.com")  # Custom query
```

---

## 🎉 Summary

**These decorators give you:**

- 🚀 **90% less boilerplate code**
- 🛡️ **Enterprise-level security**
- 📊 **Complete audit trails**
- ⚡ **Fast development**
- 🔧 **Simple maintenance**

**Perfect for crypto exchanges, fintech apps, and any application needing robust data management!**
