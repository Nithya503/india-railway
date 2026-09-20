# India Rail 360 — Full-stack starter

A React + FastAPI prototype for exploring scenic viewpoints around Indian railway routes.

## Backend
1. Open `backend`.
2. Create a virtual environment: `python -m venv .venv`
3. Activate it.
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --port 8000`
6. API docs: http://localhost:8000/docs

The backend uses SQLite for easy local development. The model is structured so it can later move to PostgreSQL/PostGIS.

## Frontend
1. Open `frontend`.
2. Install Node.js 20+.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the Vite URL, normally http://localhost:5173.

## Included
- India map with OpenStreetMap tiles
- Railway/viewpoint markers
- Search and category/state filters
- Viewpoint detail panel
- 360° panorama-style viewer area
- Popular viewpoints carousel
- FastAPI REST API
- SQLite database + seeded viewpoint data
- Endpoint for adding viewpoints
- Endpoint for uploading a panorama image

## Production next steps
- Replace SQLite with PostgreSQL + PostGIS
- Import licensed Indian railway geometry/station data
- Store panoramas in S3/Azure Blob or equivalent
- Replace demo panorama URLs with owned/licensed 360° images
- Add authentication/admin roles
- Add real route geometry instead of connecting sample viewpoints with straight lines
- Add proper 360° WebGL viewer and mobile UI
