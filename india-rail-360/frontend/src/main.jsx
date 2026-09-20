import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MapContainer,TileLayer,Marker,Popup,Polyline,useMap} from 'react-leaflet';
import L from 'leaflet';
import {Search,Map as MapIcon,Mountain,TreePalm, Waves, Landmark, Bridge, CircleUserRound, Heart, Navigation, Maximize2, TrainFront, ChevronLeft, ChevronRight, Menu} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const API='http://localhost:8000';
const cats=[['All Viewpoints','📍'],['Mountains','🏔️'],['Beaches','🌊'],['Forests','🌳'],['Waterfalls','💧'],['Bridges','🌉'],['Deserts','🏜️'],['Temples & Heritage','🛕']];
const icon=new L.Icon({iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',iconSize:[25,41],iconAnchor:[12,41]});

function FlyTo({selected}){const map=useMap();useEffect(()=>{if(selected)map.flyTo([selected.latitude,selected.longitude],8,{duration:.8})},[selected]);return null}
function App(){
 const [items,setItems]=useState([]),[selected,setSelected]=useState(null),[query,setQuery]=useState(''),[cat,setCat]=useState('All Viewpoints'),[state,setState]=useState('All States'),[loading,setLoading]=useState(true),[menu,setMenu]=useState(false);
 const load=async()=>{setLoading(true);const p=new URLSearchParams();if(query)p.set('q',query);if(cat!=='All Viewpoints')p.set('category',cat);if(state!=='All States')p.set('state',state);const r=await fetch(`${API}/api/viewpoints?${p}`);const d=await r.json();setItems(d);if(!selected&&d[0])setSelected(d[0]);setLoading(false)};
 useEffect(()=>{load()},[query,cat,state]);
 const states=[...new Set(items.map(x=>x.state))];
 const railwayLines=items.map(x=>[x.latitude,x.longitude]);
 return <div className="app">
  <header><div className="brand"><div className="trainLogo"><TrainFront size={30}/></div><div><b>INDIA RAIL 360</b><span>Explore India from the Railway Tracks</span></div></div><div className="search"><Search size={19}/><input placeholder="Search station, city or scenic location..." value={query} onChange={e=>setQuery(e.target.value)}/></div><nav><a className="active">Home</a><a>Explore</a><a>About</a><a><CircleUserRound size={17}/> Login</a><button>Sign Up</button></nav><button className="hamb" onClick={()=>setMenu(!menu)}><Menu/></button></header>
  <main>
   <aside className={menu?'open':''}><h2>Explore</h2>{cats.map(([c,emoji])=><button key={c} className={cat===c?'filter active':''} onClick={()=>setCat(c)}><span>{emoji}</span>{c}</button>)}<hr/><label>Filter by State</label><select value={state} onChange={e=>setState(e.target.value)}><option>All States</option>{states.map(s=><option key={s}>{s}</option>)}</select><label>Railway Zone / Route</label><select><option>All Routes</option><option>Konkan Railway</option><option>Nilgiri Mountain Railway</option><option>Rameswaram Line</option></select><button className="show" onClick={load}>Show Viewpoints</button><div className="quote">“The best views come by train.”</div></aside>
   <section className="mapWrap"><div className="mapTabs"><button className="selected">Map</button><button>Satellite</button></div><div className="legend"><b>Layers</b><label><input type="checkbox" defaultChecked/> Railway Tracks</label><label><input type="checkbox" defaultChecked/> Viewpoints</label><label><input type="checkbox"/> Stations</label></div><MapContainer center={[22.5,79]} zoom={5} minZoom={4} maxZoom={12} className="map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{selected&&<FlyTo selected={selected}/>}<Polyline positions={railwayLines} pathOptions={{color:'#173e73',weight:3,dashArray:'8 8'}}/>{items.map(x=><Marker key={x.id} position={[x.latitude,x.longitude]} icon={icon} eventHandlers={{click:()=>setSelected(x)}}><Popup><b>{x.name}</b><br/>{x.state}</Popup></Marker>)}</MapContainer><div className="mapControls"><button>⌾</button><button>+</button><button>−</button></div></section>
   <section className="detail"><button className="back">‹ Back to Map</button>{selected?<><div className="detailTitle"><div><h1>{selected.name}</h1><p>📍 {selected.state}</p></div><button className="share">↗</button></div><div className="chips"><span>{selected.category}</span><span>🚆 {selected.route}</span></div><div className="pano"><img src={selected.panorama_url||'https://pannellum.org/images/alma.jpg'}/><div className="panoOverlay"><strong>360°</strong><span>↶ Drag to look around • Scroll to zoom ↷</span></div><button className="full"><Maximize2 size={18}/></button></div><div className="thumbs">{items.slice(0,5).map(x=><img key={x.id} onClick={()=>setSelected(x)} src={x.panorama_url||'https://pannellum.org/images/alma.jpg'}/>)}</div><h3>About this location</h3><p className="desc">{selected.description}</p><div className="facts"><div>🚉<b>Nearest Station</b><span>{selected.station}</span></div><div>🛤️<b>Railway Route</b><span>{selected.route}</span></div><div>📍<b>Coordinates</b><span>{selected.latitude.toFixed(4)}°, {selected.longitude.toFixed(4)}°</span></div><div>📅<b>Experience</b><span>Scenic railway viewpoint</span></div></div><div className="actions"><button><Heart size={18}/> Add to My List</button><button><Navigation size={18}/> Get Directions</button></div></>:<div className="empty">Select a viewpoint on the map.</div>}</section>
  </main>
  <section className="popular"><div className="popHead"><h2>Popular Viewpoints</h2><a>View All →</a></div><div className="cards">{items.map(x=><article key={x.id} onClick={()=>setSelected(x)}><img src={x.panorama_url||'https://pannellum.org/images/alma.jpg'}/><b>{x.name}</b><small>{x.state}</small></article>)}</div></section>
  {loading&&<div className="loading">Loading viewpoints…</div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
