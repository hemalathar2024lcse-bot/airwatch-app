import { useState, useEffect } from 'react';
import { Wind, MapPin, AlertTriangle, TrendingUp, Clock, Droplets, Eye, Thermometer, Sun, Moon } from 'lucide-react';

function App() {
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError('Please enable location access for hyperlocal data');
          // Fallback to IP-based location
          fetchAirQualityByIP();
        }
      );
    } else {
      fetchAirQualityByIP();
    }
  }, []);

  // Fetch air quality data when location is available
  useEffect(() => {
    if (location) {
      fetchAirQuality(location.lat, location.lon);
      // Refresh every 15 minutes
      const interval = setInterval(() => {
        fetchAirQuality(location.lat, location.lon);
      }, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [location]);

  const fetchAirQuality = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`
      );
      const data = await response.json();
      
      if (data.status === 'ok') {
        setAirData(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Unable to fetch air quality data');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAirQualityByIP = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.waqi.info/feed/here/?token=demo');
      const data = await response.json();
      
      if (data.status === 'ok') {
        setAirData(data.data);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError('Unable to fetch air quality data');
    } finally {
      setLoading(false);
    }
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: '#00e400', emoji: '😊', advice: 'Air quality is excellent. Perfect for outdoor activities!' };
    if (aqi <= 100) return { level: 'Moderate', color: '#ffff00', emoji: '😐', advice: 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#ff7e00', emoji: '😷', advice: 'People with respiratory conditions should reduce prolonged outdoor activities.' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ff0000', emoji: '😨', advice: 'Everyone should reduce outdoor activities. Wear a mask if going outside.' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8f3f97', emoji: '🚨', advice: 'Avoid all outdoor activities. Stay indoors with air purifier.' };
    return { level: 'Hazardous', color: '#7e0023', emoji: '☠️', advice: 'Health emergency! Stay indoors. Seal windows and doors.' };
  };

  const getPollutantInfo = (iaqi) => {
    if (!iaqi) return [];
    
    const pollutants = [];
    
    if (iaqi.pm25) pollutants.push({ 
      name: 'PM2.5', 
      value: iaqi.pm25.v, 
      icon: Droplets,
      description: 'Fine particles that penetrate deep into lungs'
    });
    if (iaqi.pm10) pollutants.push({ 
      name: 'PM10', 
      value: iaqi.pm10.v, 
      icon: Wind,
      description: 'Coarse particles from dust and smoke'
    });
    if (iaqi.o3) pollutants.push({ 
      name: 'Ozone', 
      value: iaqi.o3.v, 
      icon: Sun,
      description: 'Ground-level ozone from vehicle emissions'
    });
    if (iaqi.no2) pollutants.push({ 
      name: 'NO₂', 
      value: iaqi.no2.v, 
      icon: AlertTriangle,
      description: 'Nitrogen dioxide from combustion'
    });
    
    return pollutants;
  };

  if (loading && !airData) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Detecting your location...</p>
        </div>
      </div>
    );
  }

  if (error && !airData) {
    return (
      <div className="app">
        <div className="error-container">
          <AlertTriangle size={64} />
          <h2>Unable to Load Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const aqiInfo = airData ? getAQILevel(airData.aqi) : null;
  const pollutants = airData ? getPollutantInfo(airData.iaqi) : [];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <Wind className="brand-icon" size={32} />
            <h1>AirWatch</h1>
          </div>
          <div className="location-info">
            <MapPin size={18} />
            <span>{airData?.city?.name || 'Loading...'}</span>
          </div>
        </div>
      </header>

      {/* Main AQI Display */}
      <main className="main-content">
        <div className="aqi-hero" style={{ '--aqi-color': aqiInfo?.color }}>
          <div className="aqi-circle">
            <div className="aqi-number">{airData?.aqi}</div>
            <div className="aqi-label">AQI</div>
          </div>
          <div className="aqi-status">
            <span className="aqi-emoji">{aqiInfo?.emoji}</span>
            <h2>{aqiInfo?.level}</h2>
            <p className="aqi-advice">{aqiInfo?.advice}</p>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="last-updated">
            <Clock size={16} />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Pollutants Grid */}
        {pollutants.length > 0 && (
          <section className="pollutants-section">
            <h3>Pollutant Breakdown</h3>
            <div className="pollutants-grid">
              {pollutants.map((pollutant) => (
                <div key={pollutant.name} className="pollutant-card">
                  <div className="pollutant-header">
                    <pollutant.icon size={24} />
                    <div className="pollutant-value">{pollutant.value}</div>
                  </div>
                  <div className="pollutant-name">{pollutant.name}</div>
                  <div className="pollutant-desc">{pollutant.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weather Info */}
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
            </div>
          </section>
        )}

        {/* Health Recommendations */}
        <section className="recommendations-section">
          <h3>Health Recommendations</h3>
          <div className="recommendations">
            {airData?.aqi <= 50 && (
              <>
                <div className="rec-item">✅ Great day for outdoor exercise</div>
                <div className="rec-item">✅ Perfect for children to play outside</div>
                <div className="rec-item">✅ Open windows for fresh air</div>
              </>
            )}
            {airData?.aqi > 50 && airData?.aqi <= 100 && (
              <>
                <div className="rec-item">⚠️ Limit prolonged outdoor exertion</div>
                <div className="rec-item">✅ Generally safe for most people</div>
                <div className="rec-item">⚠️ Sensitive individuals should be cautious</div>
              </>
            )}
            {airData?.aqi > 100 && airData?.aqi <= 150 && (
              <>
                <div className="rec-item">🚨 Wear a mask outdoors</div>
                <div className="rec-item">⚠️ Reduce outdoor activities</div>
                <div className="rec-item">⚠️ Use air purifier indoors</div>
              </>
            )}
            {airData?.aqi > 150 && (
              <>
                <div className="rec-item">🚨 Avoid outdoor activities</div>
                <div className="rec-item">🚨 Stay indoors with air purifier</div>
                <div className="rec-item">🚨 Keep windows and doors closed</div>
                <div className="rec-item">🚨 Consider relocating if possible</div>
              </>
            )}
          </div>
        </section>

        {/* Attribution */}
        <footer className="attribution">
          <p>Data provided by <a href="https://waqi.info/" target="_blank" rel="noopener noreferrer">World Air Quality Index</a></p>
          <p className="disclaimer">Real-time monitoring • Updates every 15 minutes</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
