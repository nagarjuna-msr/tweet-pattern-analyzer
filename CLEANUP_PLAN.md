# Project Cleanup Plan

## Files to Archive

### Research Tasks (Move to archive/research_tasks/)
- ✅ RESEARCH_TASK_POSTGRESQL_SSL_RENDER.md
- ✅ RESEARCH_TASK_REACT_ERROR_300.md  
- ✅ RESEARCH_TASK_RENDER_SPA_ROUTING.md
- ✅ SOLUTION_DATABASE_CONNECTION.md

### Deprecated/Temporary Files (Move to archive/deprecated_files/)
- ✅ runtime.txt (was temporary Python version pin)
- ✅ setup_github.sh (one-time setup script)
- ✅ requirements.txt (root level - backend has its own)
- ✅ render.yaml (root level - backend has its own)
- ✅ backend/backend.log (log file, add to .gitignore)
- ✅ frontend/frontend.log (log file, add to .gitignore)
- ✅ backend/pattern_analyzer.db (SQLite DB, no longer used)

### Old Code (Move to archive/old_code/)
- ✅ tweet_scraper/ directory (old scraper, replaced by Lobstr API)
- ✅ tests/ directory with JSON files (old manual tests)
- ✅ examples/ directory (sample code, not used)

### Already Archived (Keep in docs/archive/)
- DEPLOYMENT_GUIDE.md
- FRONTEND_README.md
- MVP_IMPLEMENTATION_STATUS.md
- MVP_README.md
- QUICK_START.md

## Files to Keep

### Root Level
- README.md (main project doc)
- env.example (for local setup)

### Backend
- backend/ (entire directory - production code)
  - Exclude: backend.log, pattern_analyzer.db, venv/

### Frontend
- frontend/ (entire directory - production code)
  - Exclude: frontend.log, dist/, node_modules/

### Documentation
- docs/ (API docs and guides)
- mvp_v1/ (MVP planning docs - useful for context)

## .gitignore Updates Needed
Add:
- *.log
- *.db
- backend/backend.log
- frontend/frontend.log
- backend/pattern_analyzer.db
- archive/

## Folder Structure After Cleanup

```
tweet_scraper/
├── README.md (Main project overview)
├── env.example
├── backend/ (Backend API)
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   ├── render.yaml
│   └── ... (other backend files)
├── frontend/ (Frontend SPA)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ... (other frontend files)
├── docs/ (Documentation)
│   ├── API_REFERENCE.md
│   ├── HOW_IT_WORKS.md
│   └── archive/ (old docs)
├── mvp_v1/ (MVP planning docs)
│   ├── ADMIN_GUIDE.md
│   ├── SETUP.md
│   └── ... (other MVP docs)
└── archive/ (Archived files)
    ├── research_tasks/
    ├── old_code/
    └── deprecated_files/
```
