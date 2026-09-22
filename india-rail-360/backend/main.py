from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, String, Float, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from pathlib import Path
import shutil

BASE = Path(__file__).resolve().parent.parent
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)
DB_URL = f"sqlite:///{BASE / 'rail360.db'}"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

class Base(DeclarativeBase): pass

class Viewpoint(Base):
    __tablename__ = "viewpoints"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    state: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(80))
    route: Mapped[str] = mapped_column(String(150))
    station: Mapped[str] = mapped_column(String(150))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text, default="")
    panorama_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

Base.metadata.create_all(engine)

app = FastAPI(title="India Rail 360 API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ViewpointIn(BaseModel):
    name: str; state: str; category: str; route: str; station: str
    latitude: float; longitude: float; description: str = ""; panorama_url: str | None = None

@app.get("/api/health")
def health(): return {"status": "ok"}

@app.get("/api/viewpoints")
def list_viewpoints(state: str | None = None, category: str | None = None, q: str | None = None):
    with Session(engine) as s:
        rows = s.query(Viewpoint).all()
        if state and state != "All States": rows = [r for r in rows if r.state.lower() == state.lower()]
        if category and category != "All Viewpoints": rows = [r for r in rows if r.category.lower() == category.lower()]
        if q:
            ql = q.lower(); rows = [r for r in rows if ql in (r.name + r.state + r.route + r.station).lower()]
        return [serialize(r) for r in rows]

@app.get("/api/viewpoints/{vid}")
def get_viewpoint(vid: int):
    with Session(engine) as s:
        r = s.get(Viewpoint, vid)
        if not r: raise HTTPException(404, "Viewpoint not found")
        return serialize(r)

@app.post("/api/viewpoints")
def create_viewpoint(data: ViewpointIn):
    with Session(engine) as s:
        r = Viewpoint(**data.model_dump()); s.add(r); s.commit(); s.refresh(r); return serialize(r)

@app.post("/api/viewpoints/{vid}/panorama")
def upload_panorama(vid: int, file: UploadFile = File(...)):
    with Session(engine) as s:
        r = s.get(Viewpoint, vid)
        if not r: raise HTTPException(404, "Viewpoint not found")
        ext = Path(file.filename or "panorama.jpg").suffix.lower() or ".jpg"
        dest = UPLOADS / f"viewpoint_{vid}{ext}"
        with dest.open("wb") as out: shutil.copyfileobj(file.file, out)
        r.panorama_url = f"/uploads/{dest.name}"; s.commit(); return serialize(r)

def serialize(r: Viewpoint):
    return {"id": r.id, "name": r.name, "state": r.state, "category": r.category, "route": r.route, "station": r.station, "latitude": r.latitude, "longitude": r.longitude, "description": r.description, "panorama_url": r.panorama_url}

@app.on_event("startup")
def seed():
    with Session(engine) as s:
        if s.query(Viewpoint).count(): return
        data = [
            Viewpoint(name="Konkan Railway Viewpoint", state="Maharashtra", category="Beaches", route="Konkan Railway", station="Ratnagiri (RN)", latitude=16.9905, longitude=73.3120, description="Coastal railway scenery with green hills, bridges, tunnels and Arabian Sea views.", panorama_url="https://pannellum.org/images/alma.jpg"),
            Viewpoint(name="Dudhsagar Falls", state="Goa", category="Waterfalls", route="South Western Railway", station="Castle Rock", latitude=15.3144, longitude=74.3142, description="A dramatic waterfall beside the railway route through the Western Ghats.", panorama_url="https://pannellum.org/images/alma.jpg"),
            Viewpoint(name="Nilgiri Mountain Route", state="Tamil Nadu", category="Mountains", route="Nilgiri Mountain Railway", station="Coonoor", latitude=11.3520, longitude=76.7950, description="Mountain railway views through forests and misty Nilgiri hills.", panorama_url="https://pannellum.org/images/alma.jpg"),
            Viewpoint(name="Pamban Bridge", state="Tamil Nadu", category="Bridges", route="Rameswaram Line", station="Rameswaram", latitude=9.2797, longitude=79.2037, description="Railway crossing with panoramic views of the sea around Rameswaram.", panorama_url="https://pannellum.org/images/alma.jpg"),
            Viewpoint(name="Kalka–Shimla Scenic Route", state="Himachal Pradesh", category="Mountains", route="Kalka–Shimla Railway", station="Shimla", latitude=31.1048, longitude=77.1734, description="Mountain railway scenery, valleys, tunnels and pine forests.", panorama_url="https://pannellum.org/images/alma.jpg"),
            Viewpoint(name="Thar Desert Railway View", state="Rajasthan", category="Deserts", route="Jodhpur–Jaisalmer", station="Jaisalmer", latitude=26.9157, longitude=70.9083, description="Golden desert landscapes visible from the railway corridor.", panorama_url="https://pannellum.org/images/alma.jpg"),
        ]
        s.add_all(data); s.commit()
