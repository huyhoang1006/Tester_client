# Beads Workflow Documentation for AI Agents

## Overview

This document describes complete workflows for using beads (bd) as an AI agent coding assistant.

**Version:** beads 0.50+  
**Backend:** SQLite (CGO disabled) / Dolt (CGO enabled)  
**Last Updated:** 2026-02-16

---

## 1. NORMAL FLOW - Luồng Thực Hiện Bình Thường

### 1.1 Session Initialization (Khởi Động Session)

```bash
# Step 1: Check beads status
bd info --json

# Expected Output:
# {
#   "database_path": "/path/to/.beads/beads.db",
#   "issue_prefix": "bd",
#   "daemon_running": true,
#   "backend": "sqlite"
# }

# Step 2: Check for ready work
bd ready --json

# Step 3: Check for stale/abandoned work
bd stale --days 7 --status in_progress --json
```

**Success Criteria:**
- Database path exists and accessible
- Backend configured (sqlite or dolt)
- issue_prefix configured
- No errors in output

### 1.2 Finding and Claiming Work (Tìm và Claim Việc)

#### Primary Path: Claim Ready Work

```bash
# Find unblocked, unassigned issues
bd ready --json | jq '.[0]'

# Example Output:
# {
#   "id": "bd-a3f8",
#   "title": "Implement user authentication",
#   "status": "open",
#   "priority": 1,
#   "type": "feature"
# }

# Claim the issue (atomic operation)
bd update bd-a3f8 --claim --json

# Verify claim
bd show bd-a3f8 --json | jq '{id, status, assignee}'

# Expected Output:
# {
#   "id": "bd-a3f8",
#   "status": "in_progress",
#   "assignee": "current-user"
# }
```

**Success Criteria:**
- Issue status changed to "in_progress"
- Assignee field populated
- No error messages

#### Secondary Path: Create New Work

```bash
# When no ready work exists or new feature needed
bd create "Feature title" \
  -t feature \
  -p 1 \
  --description "Detailed description of the work" \
  --json

# Expected Output:
# {
#   "id": "bd-b2c4",
#   "title": "Feature title",
#   "status": "open",
#   "priority": 1,
#   "type": "feature"
# }

# Immediately claim it
bd update bd-b2c4 --claim --json
```

### 1.3 Working on Issue (Thực Hiện Công Việc)

```bash
# Step 1: Get full context
bd show bd-a3f8 --json | jq '{
  id, title, description, priority, status,
  acceptance_criteria, design_notes, notes,
  dependencies: .dependencies
}'

# Step 2: Check dependencies
bd dep tree bd-a3f8

# Step 3: Update progress during work
bd update bd-a3f8 \
  --notes "Phase 1 complete: JWT middleware implemented" \
  --json
```

**Progress Update Pattern:**
```bash
# Update notes every 30-60 minutes
bd update bd-a3f8 --notes "Progress: X% - Current status" --json

# Update design notes when architecture changes
bd update bd-a3f8 --design "Updated design: using RS256 instead of HS256" --json
```

### 1.4 Discovery Pattern (Phát Hiện Việc Mới)

```bash
# While working on bd-a3f8, discover a bug
bd create "Token validation bypass vulnerability" \
  -t bug \
  -p 0 \
  --description "Found security issue in token validation" \
  --deps discovered-from:bd-a3f8 \
  --json

# Result: New issue bd-c5d6 linked to parent bd-a3f8
# Parent's source_repo inherited automatically
```

### 1.5 Epic/Sub-task Management

```bash
# Create epic for large feature
bd create "Authentication System" -t epic -p 1 --json
# Returns: bd-a3f8

# Add child tasks
bd create "Design auth flow" -t task -p 1 --parent bd-a3f8 --json
# Returns: bd-a3f8.1

bd create "Implement JWT" -t task -p 1 --parent bd-a3f8 --json
# Returns: bd-a3f8.2

bd create "Write tests" -t task -p 2 --parent bd-a3f8 --json
# Returns: bd-a3f8.3

# View epic tree
bd dep tree bd-a3f8

# Work on children
bd update bd-a3f8.1 --claim --json
bd close bd-a3f8.1 --reason "Design approved" --json

bd update bd-a3f8.2 --claim --json
bd close bd-a3f8.2 --reason "Implementation complete" --json
```

### 1.6 Completion and Sync (Hoàn Thành và Đồng Bộ)

```bash
# Step 1: Close completed issue
bd close bd-a3f8 \
  --reason "Implemented, tested, 95% coverage, documented" \
  --json

# Step 2: Verify all children closed (for epics)
bd list --parent bd-a3f8 --status open --json
# Should return empty array []

# Step 3: Close epic if all children done
bd close bd-a3f8 --reason "All subtasks completed" --json

# Step 4: CRITICAL - Sync to remote
bd sync

# Step 5: Verify sync
bd sync --status
# Output: "Database and JSONL are in sync"

git status
# Output: "Your branch is up to date with 'origin/main'"
```

**Session End Checklist:**
- [ ] All completed issues closed with reason
- [ ] All discovered issues created and linked
- [ ] `bd sync` executed successfully
- [ ] `git status` shows up to date
- [ ] No uncommitted changes in `.beads/`

---

## 2. ALTERNATIVE FLOW - Luồng Thay Thế

### 2.1 No Ready Work Available

**Trigger:** `bd ready --json` returns empty array `[]`

#### Alternative 2.1.1: Create New Feature

```bash
# Check project status
bd list --status open --json | jq 'length'

# If no open issues, create from project requirements
bd create "Setup project structure" \
  -t task \
  -p 1 \
  --description "Initialize repository, setup build tools, CI/CD" \
  --json

bd update bd-xxx --claim --json
```

#### Alternative 2.1.2: Work on Backlog

```bash
# Find backlog items
bd list --priority 4 --status open --json

# Or find unassigned work
bd list --no-assignee --status open --json

# Claim and work
bd update bd-xxx --claim --json
```

#### Alternative 2.1.3: Review Stale Work

```bash
# Find abandoned in-progress work
bd stale --days 7 --status in_progress --json

# If legitimate abandonment, unclaim and reclaim
bd update bd-xxx --status open --json
bd update bd-xxx --claim --json
```

### 2.2 Blocked by Dependencies

**Trigger:** `bd ready` doesn't show expected issue

```bash
# Check why issue is blocked
bd show bd-xxx --json | jq '.dependencies'

# Example: Blocked by bd-yyy
# {
#   "dependencies": [
#     {"id": "bd-yyy", "type": "blocks", "status": "open"}
#   ]
# }

# ALTERNATIVE 1: Work on blocker first
bd update bd-yyy --claim --json
# ... complete blocker ...
bd close bd-yyy --reason "Done" --json

# Now bd-xxx should appear in bd ready
bd ready --json

# ALTERNATIVE 2: Reorder dependencies (if blocker not critical)
bd dep remove bd-xxx bd-yyy --json
# OR create parallel path
bd create "Alternative implementation" \
  -t task \
  -p 1 \
  --deps discovered-from:bd-xxx \
  --json
```

### 2.3 Partial Completion

**Trigger:** Issue too large, need to split

```bash
# Original issue
bd show bd-xxx --json
# Title: "Implement full authentication system"

# Strategy: Convert to epic and create subtasks
bd update bd-xxx --type epic --json

# Create children
bd create "Phase 1: JWT implementation" -t task -p 1 --parent bd-xxx --json
bd create "Phase 2: Refresh tokens" -t task -p 1 --parent bd-xxx --json
bd create "Phase 3: OAuth integration" -t task -p 2 --parent bd-xxx --json

# Work on Phase 1
bd update bd-xxx.1 --claim --json
# ... complete phase 1 ...
bd close bd-xxx.1 --reason "JWT working" --json

# Close original epic when all phases done
bd close bd-xxx --reason "All phases completed" --json
```

### 2.4 Batch Operations

**Trigger:** Multiple similar issues to process

```bash
# Find all bugs in component
bd list --type bug --label auth --json | jq -r '.[].id'
# Output:
# bd-101
# bd-102
# bd-103

# Update all at once
bd update bd-101 bd-102 bd-103 --priority 0 --json

# Add label to all
bd label add bd-101 bd-102 bd-103 urgent --json

# Close batch when fixed
bd close bd-101 bd-102 bd-103 --reason "Fixed in PR #123" --json
```

### 2.5 Switching Work Mid-Session

**Trigger:** Priority change or interruption

```bash
# Current work
bd update bd-current --status open --json

# Add note about pause
bd update bd-current \
  --notes "PAUSED: Implementing core logic, need to fix critical bug first" \
  --json

# Switch to urgent work
bd update bd-urgent --claim --json

# Complete urgent work
bd close bd-urgent --reason "Critical fix deployed" --json

# Resume previous work
bd update bd-current --claim --json
bd update bd-current --notes "RESUMED: Continuing implementation" --json
```

### 2.6 Using Filters for Discovery

```bash
# Find by text
bd list --title-contains "auth" --json
bd list --desc-contains "TODO" --json

# Find by date
bd list --created-after 2024-01-01 --json
bd list --updated-before 2024-12-31 --json

# Find orphans
bd orphans --json

# Find duplicates
bd duplicates --dry-run --json
```

---

## 3. EXCEPTION FLOW - Luồng Xử Lý Lỗi

### 3.1 Database Not Initialized

**Error:** `database not initialized: issue_prefix config is missing`

```bash
# DIAGNOSIS
bd info --json

# If error, check if .beads exists
ls -la .beads/

# FIX 1: Initialize if not exists
bd init --prefix myproject

# FIX 2: If exists but corrupted, reset
# ⚠️ WARNING: This deletes all local data
bd admin reset --force
bd init --prefix myproject

# FIX 3: Set missing config
bd config set issue_prefix myproject
bd config set backend sqlite
```

### 3.2 Backend Mismatch (Dolt/SQLite)

**Error:** `Dolt backend requires CGO`

```bash
# DIAGNOSIS
bd info --json | jq '.backend'

# FIX: Switch to SQLite
bd config set backend sqlite

# Verify
bd info --json
```

### 3.3 Claim Conflict

**Error:** `issue already claimed by another user`

```bash
# DIAGNOSIS
bd show bd-xxx --json | jq '{id, assignee, status}'

# ALTERNATIVE 1: Find other work
bd ready --json

# ALTERNATIVE 2: Wait and retry (if assignee is temporary)
bd stale --days 1 --status in_progress --json

# ALTERNATIVE 3: Create related work
bd create "Alternative approach for bd-xxx" \
  -t task \
  -p 1 \
  --deps related:bd-xxx \
  --json

# ⚠️ NEVER force claim without coordination
```

### 3.4 Stale Database

**Error:** `database is stale, run 'bd import' or 'bd sync'`

```bash
# DIAGNOSIS
bd sync --status

# FIX 1: Import latest JSONL
bd import -i .beads/issues.jsonl --force

# FIX 2: Full sync
bd sync

# FIX 3: Emergency bypass (use with caution)
bd --allow-stale list --json
```

### 3.5 Merge Conflicts in JSONL

**Error:** Git merge conflict in `.beads/issues.jsonl`

```bash
# DIAGNOSIS
git status
# Shows: "both modified: .beads/issues.jsonl"

# FIX 1: Accept remote version
git checkout --theirs .beads/issues.jsonl
bd import -i .beads/issues.jsonl

# FIX 2: Accept local version
git checkout --ours .beads/issues.jsonl
bd export -o .beads/issues.jsonl

# FIX 3: Manual merge (keep newer timestamps)
# Edit file to resolve conflicts, then:
bd import -i .beads/issues.jsonl

git add .beads/issues.jsonl
git commit -m "Resolved beads merge conflict"
```

### 3.6 Sync Failure

**Error:** `sync failed: push rejected`

```bash
# DIAGNOSIS
git status

# FIX 1: Pull and rebase
git pull --rebase

# If conflict in JSONL:
git checkout --theirs .beads/issues.jsonl
bd import -i .beads/issues.jsonl
bd sync

# FIX 2: Force sync with conflict resolution
bd sync
# Follow prompts for conflict resolution

# FIX 3: Manual sync
git add .beads/issues.jsonl
git commit -m "Sync beads data"
git pull --rebase
git push
```

### 3.7 Daemon Issues

**Error:** `daemon connection failed` or `daemon not running`

```bash
# DIAGNOSIS
bd daemons list --json

# FIX 1: Restart daemon
bd daemons killall --force
# Daemon auto-starts on next command

# FIX 2: Use direct mode (bypass daemon)
bd --no-daemon list --json

# FIX 3: Disable daemon for session
export BEADS_NO_DAEMON=true
bd list --json
```

### 3.8 Invalid Issue ID

**Error:** `issue not found: bd-xxx`

```bash
# DIAGNOSIS
bd list --id bd-xxx --json

# If empty, find similar
bd list --title-contains "keyword" --json

# FIX: Use correct ID from search
bd show bd-yyy --json  # Found correct ID
```

### 3.9 Permission Errors

**Error:** `permission denied: .beads/issues.jsonl`

```bash
# DIAGNOSIS
ls -la .beads/

# FIX 1: Fix permissions
chmod -R u+rw .beads/

# FIX 2: On Windows, check file locks
# Close any editor with files open

# FIX 3: Run with elevated permissions (last resort)
# On Linux/Mac: sudo (not recommended for regular use)
```

### 3.10 Network/Remote Issues

**Error:** `push failed: could not resolve host`

```bash
# DIAGNOSIS
git remote -v
ping github.com

# FIX 1: Work offline, sync later
export BEADS_NO_DAEMON=true
# ... do work ...
# Later when online:
bd sync

# FIX 2: Check remote URL
git remote set-url origin https://github.com/user/repo.git
```

### 3.11 Testing Issues (Don't Pollute Production DB)

**Scenario:** Need to test beads commands

```bash
# CORRECT: Use temp database
export BEADS_DB=/tmp/test-beads.db
bd init --prefix test
bd create "Test issue" -p 1
# ... test ...
rm -f /tmp/test-beads.db

# INCORRECT: Never do this
bd create "Test issue" -p 1  # Pollutes production!
```

### 3.12 Recovery from Bad State

**Scenario:** Database in inconsistent state

```bash
# STEP 1: Stop daemon
bd daemons killall --force

# STEP 2: Check integrity
bd doctor

# STEP 3: Fix issues
bd doctor --fix

# STEP 4: Rebuild from JSONL
mv .beads/beads.db .beads/beads.db.bak
bd import -i .beads/issues.jsonl

# STEP 5: Verify
bd list --json | jq 'length'
# Should match expected issue count

# STEP 6: Clean up if successful
rm -f .beads/beads.db.bak
```

---

## 4. COMMAND REFERENCE QUICK CARD

### Essential Commands

| Action | Command |
|--------|---------|
| **Check status** | `bd info --json` |
| **Find ready work** | `bd ready --json` |
| **Claim issue** | `bd update <id> --claim --json` |
| **Create issue** | `bd create "Title" -t task -p 1 --json` |
| **Close issue** | `bd close <id> --reason "Done" --json` |
| **Sync** | `bd sync` |
| **Show details** | `bd show <id> --json` |

### Flags Reference

| Flag | Purpose | Example |
|------|---------|---------|
| `--json` | Machine-readable output | `bd list --json` |
| `--claim` | Atomic claim | `bd update <id> --claim` |
| `--description` | Add context | `bd create "X" --description "Y"` |
| `--deps` | Link issues | `--deps discovered-from:bd-xxx` |
| `--parent` | Epic child | `--parent bd-epic` |
| `--dry-run` | Preview only | `bd duplicates --dry-run` |
| `--no-daemon` | Direct mode | `bd --no-daemon list` |
| `--allow-stale` | Emergency bypass | `bd --allow-stale list` |

### Issue Types

| Type | Use For | Priority |
|------|---------|----------|
| `bug` | Something broken | 0-4 |
| `feature` | New functionality | 0-4 |
| `task` | Work item | 0-4 |
| `epic` | Large feature | 0-4 |
| `chore` | Maintenance | 0-4 |

### Status Flow

```
open → in_progress → closed
  ↓       ↓           ↓
  └──── blocked ←─────┘
        deferred
        pinned
        tombstone
```

---

## 5. EXAMPLES BY SCENARIO

### Scenario A: New Feature Implementation

```bash
# 1. Create epic
bd create "User Authentication System" -t epic -p 1 \
  --description "Complete auth system with JWT, OAuth, refresh tokens" \
  --json

# 2. Create subtasks
for task in "Design auth API" "Implement JWT middleware" "Add OAuth providers" "Write tests"; do
  bd create "$task" -t task -p 1 --parent bd-xxx --json
done

# 3. Work through tasks
bd ready --json | jq -r '.[0].id' | xargs -I {} bd update {} --claim --json

# 4. Complete and close
bd close bd-xxx.1 --reason "Done" --json
bd close bd-xxx --reason "All subtasks complete" --json

# 5. Sync
bd sync
```

### Scenario B: Bug Fix During Feature Work

```bash
# Working on feature bd-100
bd update bd-100 --claim --json

# Discover bug
bd create "Critical: SQL injection in user input" \
  -t bug \
  -p 0 \
  --description "Found vulnerability in search function" \
  --deps discovered-from:bd-100 \
  --json

# Pause feature, fix bug
bd update bd-100 --notes "PAUSED: Found critical bug bd-101" --json
bd update bd-101 --claim --json

# Fix bug
bd close bd-101 --reason "Fixed and deployed hotfix" --json

# Resume feature
bd update bd-100 --claim --json
bd close bd-100 --reason "Feature complete" --json

bd sync
```

### Scenario C: Code Review Feedback

```bash
# PR review found issues
bd create "Address PR feedback: add error handling" \
  -t task \
  -p 1 \
  --description "Review comments: need try-catch in auth middleware" \
  --external-ref "gh-123" \
  --json

bd update bd-xxx --claim --json

# Make changes based on feedback
bd close bd-xxx --reason "All feedback addressed" --json

bd sync
```

---

## 6. CHECKLISTS

### Pre-Session Checklist
- [ ] `bd info --json` shows no errors
- [ ] Backend configured (sqlite/dolt)
- [ ] Daemon running (or using `--no-daemon`)
- [ ] Git working directory clean

### During Session Checklist (Every 30-60 min)
- [ ] Update notes on in-progress issues
- [ ] Create issues for discovered work
- [ ] Link related issues with dependencies
- [ ] Close completed subtasks

### End of Session Checklist (CRITICAL)
- [ ] All completed issues closed with reason
- [ ] All discovered work filed as issues
- [ ] Run `bd sync`
- [ ] Verify `git status` shows "up to date"
- [ ] No uncommitted changes
- [ ] Push successful

### Emergency Recovery Checklist
- [ ] Stop daemon: `bd daemons killall --force`
- [ ] Run `bd doctor`
- [ ] Fix issues: `bd doctor --fix`
- [ ] Rebuild from JSONL if needed
- [ ] Verify data integrity
- [ ] Restart workflow

---

## 7. ANTI-PATTERNS TO AVOID

### ❌ NEVER DO:

1. **Don't use `bd edit`**
   ```bash
   # WRONG - opens $EDITOR
   bd edit bd-xxx
   
   # CORRECT
   bd update bd-xxx --description "New description"
   ```

2. **Don't forget `bd sync`**
   ```bash
   # WRONG - leaves changes stranded
   bd close bd-xxx --reason "Done"
   # End session ❌
   
   # CORRECT
   bd close bd-xxx --reason "Done"
   bd sync  # ✅ REQUIRED
   ```

3. **Don't create test issues in production**
   ```bash
   # WRONG
   bd create "Test" -p 1
   
   # CORRECT
   export BEADS_DB=/tmp/test.db
   bd create "Test" -p 1
   ```

4. **Don't use markdown TODO lists**
   ```markdown
   <!-- WRONG -->
   - [ ] Fix bug
   - [ ] Add tests
   
   <!-- CORRECT -->
   # Use bd commands instead
   bd create "Fix bug" -t bug -p 1
   bd create "Add tests" -t task -p 1
   ```

5. **Don't suppress type errors**
   ```typescript
   // WRONG
   const x = data as any;
   
   // CORRECT
   const x: Issue = data;
   ```

---

## 8. TROUBLESHOOTING MATRIX

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| `database not initialized` | Missing config | `bd config set issue_prefix xxx` |
| `Dolt backend requires CGO` | Wrong backend | `bd config set backend sqlite` |
| `issue already claimed` | Race condition | Find other work with `bd ready` |
| `database is stale` | Sync needed | `bd sync` or `bd import -i .beads/issues.jsonl` |
| `merge conflict` | Parallel edits | `git checkout --theirs .beads/issues.jsonl && bd import` |
| `daemon connection failed` | Daemon crashed | `bd daemons killall --force` |
| `permission denied` | File locks | Close editors, fix permissions |
| `push rejected` | Remote changes | `git pull --rebase && bd sync` |
| `issue not found` | Wrong ID | `bd list --title-contains "keyword"` |

---

## Document Information

**Author:** AI Agent Workflow Team  
**Version:** 1.0  
**Created:** 2026-02-16  
**Last Updated:** 2026-02-16  
**Maintainer:** beads core team

**Related Documents:**
- `AGENTS.md` - Quick reference
- `docs/CLI_REFERENCE.md` - Complete command list
- `docs/TROUBLESHOOTING.md` - Detailed error handling
- `docs/ADVANCED.md` - Power user features
