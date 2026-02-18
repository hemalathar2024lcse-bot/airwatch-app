import { useState, useEffect, useCallback } from 'react';
import { Wind, MapPin, AlertTriangle, TrendingUp, Clock, Droplets, Thermometer, Sun, Search, RefreshCw } from 'lucide-react';

const API_TOKEN = '7e57f03fa95322b75dc2cce9062121f0176158b2';
const API_BASE = 'https://api.waqi.info/feed';
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const FETCH_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The API may be blocked in your network or region. Try using a VPN.');
    }
    throw err;
  }
}

function App() {
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationMethod, setLocationMethod] = useState('detecting');
  const [searchCity, setSearchCity] = useState('');

  // ─── Core fetch by lat/lon ────────────────────────────────────────────────
  const fetchAirQuality = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      const url = `${API_BASE}/geo:${lat};${lon}/?token=${API_TOKEN}`;
      const res = await fetchWithTimeout(url);
      const data = await res.json();

      if (data.status === 'ok') {
        setAirData(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(`API error: ${data.data || 'Unknown error. Try searching a city manually.'}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch air quality data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch by city name ───────────────────────────────────────────────────
  const fetchAirQualityByCity = useCallback(async (cityName) => {
    if (!cityName.trim()) return;
    try {
      setLoading(true);
      setLocationMethod('manual');
      const url = `${API_BASE}/${encodeURIComponent(cityName.trim())}/?token=${API_TOKEN}`;
      const res = await fetchWithTimeout(url);
      const data = await res.json();

      if (data.status === 'ok') {
        setAirData(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(`Could not find air quality data for "${cityName}". Try "City, Country" format.`);
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── IP-based fallback ────────────────────────────────────────────────────
  const fetchAirQualityByIP = useCallback(async () => {
    try {
      setLoading(true);

      // Try ipapi.co first
      let lat, lon;
      try {
        const ipRes = await fetchWithTimeout('https://ipapi.co/json/', 6000);
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          lat = ipData.latitude;
          lon = ipData.longitude;
        }
      } catch {
        // ipapi.co failed — silently fall through
      }

      if (lat && lon) {
        await fetchAirQuality(lat, lon);
      } else {
        // Last resort: fallback to a default city instead of using /here
        // which can return wrong location on Vercel's servers
        await fetchAirQualityByCity('Coimbatore, India');
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch air quality data. Please search for a city manually.');
    } finally {
      setLoading(false);
    }
  }, [fetchAirQuality]);

  // ─── Geolocation on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMethod('ip');
      fetchAirQualityByIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLocation(coords);
        setLocationMethod('gps');
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        setLocationMethod('ip');
        fetchAirQualityByIP();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchAirQualityByIP]);

  // ─── Auto-refresh when GPS coords available ───────────────────────────────
  useEffect(() => {
    if (!location) return;
    fetchAirQuality(location.lat, location.lon);
    const interval = setInterval(() => {
      fetchAirQuality(location.lat, location.lon);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [location, fetchAirQuality]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getAQILevel = (aqi) => {
    if (aqi <= 50)  return { level: 'Good',                    color: '#00e400', advice: 'Air quality is excellent. Perfect for all outdoor activities!' };
    if (aqi <= 100) return { level: 'Moderate',                color: '#ffff00', advice: 'Air quality is acceptable. Sensitive individuals should limit prolonged exertion.' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#ff7e00', advice: 'People with respiratory conditions should reduce outdoor activities.' };
    if (aqi <= 200) return { level: 'Unhealthy',               color: '#ff0000', advice: 'Everyone should reduce outdoor activities. Wear a mask if going outside.' };
    if (aqi <= 300) return { level: 'Very Unhealthy',          color: '#8f3f97', advice: 'Avoid all outdoor activities. Stay indoors with an air purifier.' };
    return            { level: 'Hazardous',                    color: '#7e0023', advice: 'Health emergency! Stay indoors. Seal windows and doors.' };
  };

  const getPollutants = (iaqi) => {
    if (!iaqi) return [];
    return [
      iaqi.pm25 && { name: 'PM2.5',  value: iaqi.pm25.v, icon: Droplets,      desc: 'Fine particles — penetrate deep into lungs' },
      iaqi.pm10 && { name: 'PM10',   value: iaqi.pm10.v, icon: Wind,           desc: 'Coarse particles from dust and smoke' },
      iaqi.o3   && { name: 'Ozone',  value: iaqi.o3.v,   icon: Sun,            desc: 'Ground-level ozone from vehicle emissions' },
      iaqi.no2  && { name: 'NO₂',    value: iaqi.no2.v,  icon: AlertTriangle,  desc: 'Nitrogen dioxide from combustion' },
      iaqi.so2  && { name: 'SO₂',    value: iaqi.so2.v,  icon: AlertTriangle,  desc: 'Sulfur dioxide from industrial sources' },
      iaqi.co   && { name: 'CO',     value: iaqi.co.v,   icon: Wind,           desc: 'Carbon monoxide from incomplete combustion' },
    ].filter(Boolean);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') fetchAirQualityByCity(searchCity);
  };

  const handleRetry = () => {
    setError(null);
    if (location) fetchAirQuality(location.lat, location.lon);
    else fetchAirQualityByIP();
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading && !airData) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">
            {locationMethod === 'detecting' ? 'Detecting your location…' : 'Fetching air quality data…'}
          </p>
        </div>
      </div>
    );
  }

  // ─── Hard error (no data at all) ──────────────────────────────────────────
  if (error && !airData) {
    return (
      <div className="app">
        <div className="error-container">
          <AlertTriangle size={64} color="#ff4444" />
          <h2>Unable to Load Data</h2>
          <p className="error-msg">{error}</p>

          {/* Still allow manual search even in error state */}
          <div className="search-bar error-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Try searching a city…"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={handleSearchKey}
              className="search-input"
            />
            <button onClick={() => fetchAirQualityByCity(searchCity)} className="search-btn">
              Search
            </button>
          </div>

          <button onClick={handleRetry} className="retry-btn">
            <RefreshCw size={16} /> Retry Auto-detect
          </button>
        </div>
      </div>
    );
  }

  const aqiInfo   = airData ? getAQILevel(airData.aqi)       : null;
  const pollutants = airData ? getPollutants(airData.iaqi)   : [];

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <Wind className="brand-icon" size={32} />
            <h1>AirWatch</h1>
          </div>
          <div className="location-info">
            <MapPin size={18} />
            <span>{airData?.city?.name || 'Unknown location'}</span>
            {locationMethod === 'ip'     && <span className="location-badge">(IP-based)</span>}
            {locationMethod === 'gps'    && <span className="location-badge">(GPS)</span>}
            {locationMethod === 'manual' && <span className="location-badge">(Manual)</span>}
          </div>
        </div>

        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search city (e.g. Mumbai, India)"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={handleSearchKey}
            className="search-input"
          />
          <button onClick={() => fetchAirQualityByCity(searchCity)} className="search-btn">
            Search
          </button>
        </div>

        {/* Non-blocking soft error banner (when we have data but something minor went wrong) */}
        {error && airData && (
          <div className="soft-error-banner">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
      </header>

      <main className="main-content">
        {/* Hero AQI */}
        <div className="aqi-hero" style={{ '--aqi-color': aqiInfo?.color }}>
          <div className="aqi-circle">
            <div className="aqi-number">{airData?.aqi}</div>
            <div className="aqi-label">AQI</div>
          </div>
          <div className="aqi-status">
            <h2 style={{ color: aqiInfo?.color }}>{aqiInfo?.level}</h2>
            <p className="aqi-advice">{aqiInfo?.advice}</p>
          </div>
        </div>

        {lastUpdated && (
          <div className="last-updated">
            <Clock size={16} />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            {loading && <span className="refreshing"> · Refreshing…</span>}
          </div>
        )}

        {/* Pollutants */}
        {pollutants.length > 0 && (
          <section className="pollutants-section">
            <h3>Pollutant Breakdown</h3>
            <div className="pollutants-grid">
              {pollutants.map((p) => (
                <div key={p.name} className="pollutant-card">
                  <div className="pollutant-header">
                    <p.icon size={24} />
                    <div className="pollutant-value">{p.value}</div>
                  </div>
                  <div className="pollutant-name">{p.name}</div>
                  <div className="pollutant-desc">{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather */}
        {airData?.iaqi && (
          <section className="weather-section">
            <h3>Environmental Conditions</h3>
            <div className="weather-grid">
              {airData.iaqi.t && (
                <div className="weather-card">
                  <Thermometer size={20} />
                  <span className="weather-value">{airData.iaqi.t.v}°C</span>
                  <span className="weather-label">Temperature</span>
                </div>
              )}
              {airData.iaqi.h && (
                <div className="weather-card">
                  <Droplets size={20} />
                  <span className="weather-value">{airData.iaqi.h.v}%</span>
                  <span className="weather-label">Humidity</span>
                </div>
              )}
              {airData.iaqi.p && (
                <div className="weather-card">
                  <TrendingUp size={20} />
                  <span className="weather-value">{airData.iaqi.p.v} hPa</span>
                  <span className="weather-label">Pressure</span>
                </div>
              )}
              {airData.iaqi.w && (
                <div className="weather-card">
                  <Wind size={20} />
                  <span className="weather-value">{airData.iaqi.w.v} m/s</span>
                  <span className="weather-label">Wind</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Health Recommendations */}
        <section className="recommendations-section">
          <h3>Health Recommendations</h3>
          <div className="recommendations">
            {airData?.aqi <= 50 && (
              <>
                <div className="rec-item">Great day for outdoor exercise</div>
                <div className="rec-item">Perfect for children to play outside</div>
                <div className="rec-item">Open windows for fresh air</div>
              </>
            )}
            {airData?.aqi > 50 && airData?.aqi <= 100 && (
              <>
                <div className="rec-item">Limit prolonged outdoor exertion</div>
                <div className="rec-item">Generally safe for most people</div>
                <div className="rec-item">Sensitive individuals should be cautious</div>
              </>
            )}
            {airData?.aqi > 100 && airData?.aqi <= 150 && (
              <>
                <div className="rec-item">Wear a mask outdoors</div>
                <div className="rec-item">Reduce time spent outside</div>
                <div className="rec-item">Use an air purifier indoors</div>
              </>
            )}
            {airData?.aqi > 150 && airData?.aqi <= 200 && (
              <>
                <div className="rec-item">Wear N95 mask if going outside</div>
                <div className="rec-item">Everyone should reduce outdoor activities</div>
                <div className="rec-item">Run air purifier continuously indoors</div>
                <div className="rec-item">Keep windows closed</div>
              </>
            )}
            {airData?.aqi > 200 && (
              <>
                <div className="rec-item">Avoid all outdoor activities</div>
                <div className="rec-item">Stay indoors with air purifier running</div>
                <div className="rec-item">Seal windows and doors</div>
                <div className="rec-item">Seek medical advice if experiencing symptoms</div>
              </>
            )}
          </div>
        </section>

        <footer className="attribution">
          <p>Data provided by{' '}
            <a href="https://waqi.info/" target="_blank" rel="noopener noreferrer">
              World Air Quality Index
            </a>
          </p>
          <p className="disclaimer">Real-time monitoring · Updates every 15 minutes</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
