# 🌍 QuakeScope

A real-time earthquake monitoring application built with React, TypeScript, and Leaflet maps. Monitor global seismic activity with live data from the USGS (United States Geological Survey).

## ✨ Features

- **Real-time Data**: Live earthquake feeds from USGS (hourly, daily, weekly)
- **Interactive World Map**: Leaflet-based map with dynamic earthquake markers
- **Smart Filtering**: Magnitude-based filtering with real-time updates
- **Responsive Design**: Mobile-first approach with view switching
- **Dark Mode**: System preference detection with manual toggle
- **Performance Optimized**: Smart caching, memoization, and error handling
- **TypeScript**: Full type safety and modern development experience

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Maps**: Leaflet + react-leaflet
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Hooks
- **Data Source**: USGS Earthquake API

## 📁 Project Structure

```
src/
├── api/
│   ├── usgs.ts           # USGS API integration
│   └── geocode.ts        # Location search (optional)
├── components/
│   ├── AppShell.tsx      # Main layout & header
│   ├── Controls.tsx      # Time range & magnitude filters
│   ├── MapView.tsx       # Interactive map container
│   ├── QuakeMarkers.tsx  # Earthquake markers & popups
│   ├── QuakeList.tsx     # Sidebar earthquake list
│   ├── Legend.tsx        # Magnitude color legend
│   ├── StatsBar.tsx      # Earthquake statistics
│   ├── ErrorState.tsx    # Error handling & retry
│   ├── Loading.tsx       # Loading states
│   └── Icons.tsx         # SVG icon components
├── hooks/
│   └── useEarthquakes.ts # Data fetching & caching
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── colors.ts         # Magnitude color utilities
│   └── format.ts         # Date & data formatting
├── styles/
│   └── globals.css       # Global styles & Tailwind
└── App.tsx               # Main application component
```

## 🎯 Key Components

### **AppShell**
- Header with dark mode toggle
- Controls for time range and magnitude filtering
- Statistics bar with earthquake counts

### **MapView**
- Interactive Leaflet map
- Dynamic tile loading (light/dark themes)
- Earthquake marker rendering

### **QuakeMarkers**
- Magnitude-based color coding
- Interactive popups with detailed information
- Hover and selection states

### **QuakeList**
- Sidebar earthquake list
- Real-time filtering and sorting
- Mobile-responsive drawer

### **Controls**
- Time range selection (hour/day/week)
- Magnitude slider (0.0 - 8.0+)
- Mobile view toggle

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Cap043/QUAKESCOPE.git
cd quake-scope

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🌐 Data Sources

- **USGS Earthquake Feeds**:
  - Hourly: `all_hour.geojson`
  - Daily: `all_day.geojson`
  - Weekly: `all_week.geojson`

## 🎨 Customization

### Colors
Magnitude-based color coding can be customized in `src/lib/colors.ts`:
- 🟢 Green: < 2.5M (Minor)
- 🟡 Yellow: 2.5-4.4M (Light)
- 🟠 Orange: 4.5-5.9M (Moderate)
- 🔴 Red: ≥ 6.0M (Strong)

### Styling
Global styles and Tailwind configuration in `src/styles/globals.css` and `tailwind.config.js`

## 📱 Responsive Design

- **Desktop**: Side-by-side map and list view
- **Mobile**: Toggle between map and list views
- **Touch-friendly**: Optimized for mobile devices

## 🔧 Development

### Code Quality
- ESLint configuration for code consistency
- TypeScript for type safety
- Prettier for code formatting

### Performance Features
- 2-minute data caching
- React.memo and useCallback optimization
- Lazy loading and code splitting ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **USGS**: Earthquake data and API
- **Leaflet**: Open-source mapping library
- **React Team**: Modern React development
- **Tailwind CSS**: Utility-first CSS framework

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for earthquake monitoring and public safety**
