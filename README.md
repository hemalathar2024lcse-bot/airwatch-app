# 🌬️ AirWatch - Hyperlocal Air Quality Monitor

A beautiful, real-time air quality monitoring app that helps people protect their health from pollution and wildfire smoke with hyperlocal data.

![AirWatch Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF)

## ✨ Features

- **🎯 Hyperlocal Data**: Uses your precise GPS location for the most accurate air quality readings
- **⚡ Real-time Updates**: Automatically refreshes every 15 minutes
- **📊 Comprehensive Metrics**: 
  - Overall Air Quality Index (AQI)
  - PM2.5 and PM10 particle levels
  - Ozone (O3) levels
  - Nitrogen Dioxide (NO2)
  - Temperature, humidity, and pressure
- **🚨 Health Alerts**: Context-aware recommendations based on current AQI
- **💫 Beautiful UI**: Distinctive design with smooth animations and gradients
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Git installed

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd airwatch-hyperlocal
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

## 🌐 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Easiest)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/airwatch.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

That's it! Your app will be live in ~30 seconds.

### Method 2: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## 🎨 Design Philosophy

AirWatch uses a **dark, futuristic aesthetic** with:
- Custom font pairing: Space Mono (monospace) + Outfit (sans-serif)
- Animated gradient backgrounds
- Glowing neon accents (cyan #00d4ff)
- Glassmorphism effects with backdrop blur
- Smooth micro-interactions and animations
- Color-coded AQI levels for instant visual feedback

## 📊 AQI Scale

| AQI Range | Level | Color | Health Impact |
|-----------|-------|-------|---------------|
| 0-50 | Good | Green | Excellent air quality |
| 51-100 | Moderate | Yellow | Acceptable for most |
| 101-150 | Unhealthy for Sensitive | Orange | Sensitive groups affected |
| 151-200 | Unhealthy | Red | Everyone affected |
| 201-300 | Very Unhealthy | Purple | Health alert |
| 301+ | Hazardous | Maroon | Emergency conditions |

## 🔧 Tech Stack

- **React 18.2** - UI framework
- **Vite 5** - Build tool and dev server
- **Lucide React** - Beautiful icon library
- **WAQI API** - Real-time air quality data
- **CSS3** - Custom animations and glassmorphism

## 🌍 Data Source

Air quality data is provided by the [World Air Quality Index](https://waqi.info/) project, which aggregates data from over 12,000 monitoring stations in 1000+ cities worldwide.

The app uses geolocation to find the nearest monitoring station and provides:
- Real-time AQI values
- Pollutant breakdowns
- Weather conditions
- Health recommendations

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Privacy

AirWatch requests location permissions to provide hyperlocal data. Your location is:
- Only used to fetch air quality data
- Never stored or transmitted to any server
- Processed entirely in your browser

You can deny location access and still use IP-based location (less precise).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- World Air Quality Index Project for free API access
- Lucide for the beautiful icons
- The React and Vite teams for amazing tools

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure location permissions are granted
3. Verify internet connectivity
4. Try refreshing the page

---

**Stay safe, breathe easy! 🌬️**
