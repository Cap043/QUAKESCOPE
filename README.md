# 🌍 QuakeScope

A comprehensive real-time earthquake monitoring application with advanced analytics built with React, TypeScript, and Leaflet maps. Monitor global seismic activity with live data from the USGS (United States Geological Survey) and gain deep insights through interactive visualizations.

## ✨ Features

### 🗺️ **Interactive Mapping**
- **Real-time Data**: Live earthquake feeds from USGS (hourly, daily, weekly, monthly)
- **Interactive World Map**: Leaflet-based map with dynamic earthquake markers
- **Smart Filtering**: Magnitude-based filtering with real-time updates
- **Marker Clustering**: Intelligent grouping of earthquakes for better performance
- **Professional Markers**: Color-coded magnitude indicators with detailed popups

### 📊 **Advanced Analytics Dashboard**
- **Comprehensive Statistics**: Total earthquakes, strongest quake, average magnitude, depth analysis
- **Magnitude Distribution**: Interactive bar charts showing earthquake frequency by magnitude ranges
- **Depth Analysis**: Detailed donut charts with 5 geological depth categories
- **Trend Analysis**: Time-series line charts showing earthquake patterns over time
- **Regional Insights**: Top active regions with comparative analysis
- **Notable Earthquakes**: Curated list of significant seismic events

### 📱 **Mobile-First Design**
- **Responsive Analytics**: Desktop grid layouts, mobile-optimized stacked views
- **Touch-Optimized Controls**: Mobile dropdown filters with intuitive gestures
- **Adaptive UI**: Smart breakpoints for optimal viewing on any device
- **Swipeable Charts**: Mobile-friendly chart interactions

### 🎨 **Modern User Experience**
- **Dark Mode**: System preference detection with manual toggle
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Professional Design**: Tailwind CSS with backdrop blur, shadows, and modern aesthetics
- **Error Handling**: Graceful error states with retry functionality

### ⚡ **Performance Optimized**
- **Smart Caching**: 2-minute data caching with automatic refresh
- **Memoization**: Optimized React rendering with useMemo and useCallback
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **TypeScript**: Full type safety and modern development experience

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Hooks + Context
- **Data Source**: USGS Earthquake API
- **Date Handling**: React DatePicker

## 📁 Project Structure

```
src/
├── api/
│   ├── usgs.ts           # USGS API integration & data transformation
│   ├── monthlyData.ts    # Extended time range data fetching
│   └── geocode.ts        # Location search functionality
├── components/
│   ├── AppShell.tsx      # Main layout, header & navigation
│   ├── AnalyticsPage.tsx # Comprehensive analytics dashboard
│   ├── Controls.tsx      # Time range & magnitude filters
│   ├── MapView.tsx       # Interactive map container
│   ├── QuakeMarkers.tsx  # Professional earthquake markers
│   ├── QuakeList.tsx     # Sidebar earthquake list
│   ├── Legend.tsx        # Magnitude color legend
│   ├── StatsBar.tsx      # Real-time statistics
│   ├── TrendGraph.tsx    # Time-series visualizations
│   ├── ErrorState.tsx    # Error handling & retry logic
│   ├── Loading.tsx       # Loading states & skeletons
│   └── Icons.tsx         # SVG icon components
├── hooks/
│   └── useEarthquakes.ts # Data fetching, caching & state management
├── lib/
│   ├── types.ts          # TypeScript interfaces & types
│   ├── colors.ts         # Magnitude color utilities
│   ├── format.ts         # Date & data formatting helpers
│   └── urlSharing.ts     # URL state management
├── styles/
│   └── globals.css       # Global styles, Tailwind & animations
└── App.tsx               # Main application orchestration
```

## 🎯 Key Components

### **AppShell**
- Modern header with navigation controls
- Dark mode toggle with system preference detection
- Analytics navigation button
- Responsive layout management

### **AnalyticsPage** 🆕
- **Overview Cards**: Animated statistics with count-up effects
- **Interactive Charts**: Bar, donut, and line charts with hover effects
- **Time Range Controls**: Hour, day, week, month, and custom date ranges
- **Mobile Dropdown**: Collapsible filter system for mobile devices
- **Theme Integration**: Full dark/light mode support
- **Data Insights**: Geological depth analysis and magnitude distributions

### **MapView**
- Interactive Leaflet map with professional styling
- Dynamic tile loading (light/dark themes)
- Marker clustering for performance
- Touch-optimized mobile interactions

### **QuakeMarkers**
- Magnitude-based color coding system
- Interactive popups with comprehensive earthquake data
- Hover states and selection feedback
- Professional marker design

### **Controls**
- Time range selection (hour/day/week/month/custom)
- Magnitude slider with visual feedback (0.0 - 8.0+)
- Mobile-responsive design patterns

## 📊 Analytics Features

### **Data Visualizations**
- **Magnitude Distribution**: 1-unit intervals (0-1M, 1-2M, ..., 7M+)
- **Depth Categories**: 
  - <15km (Very Shallow) - Emerald
  - 15-30km (Shallow) - Green
  - 30-70km (Moderate) - Blue
  - 70-150km (Intermediate) - Amber
  - 150km+ (Deep) - Red
- **Trend Analysis**: Time-series with earthquake counts and average magnitudes
- **Regional Activity**: Top 5 most active regions with comparative data

### **Interactive Elements**
- **Animated Charts**: Smooth entry animations and hover effects
- **Responsive Tooltips**: Detailed information on hover
- **Mobile Gestures**: Touch-friendly interactions
- **Real-time Updates**: Live data synchronization

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
  - Monthly: `all_month.geojson`
  - Custom Ranges: USGS Query API

## 🎨 Customization

### Color Schemes
Magnitude-based color coding in `src/lib/colors.ts`:
- 🟢 Green: < 2.5M (Minor)
- 🟡 Yellow: 2.5-4.4M (Light)
- 🟠 Orange: 4.5-5.9M (Moderate)
- 🔴 Red: ≥ 6.0M (Strong)

### Depth Categories
Geological depth analysis in analytics:
- Very Shallow: <15km (Emerald)
- Shallow: 15-30km (Green)
- Moderate: 30-70km (Blue)
- Intermediate: 70-150km (Amber)
- Deep: 150km+ (Red)

### Styling
- Global styles: `src/styles/globals.css`
- Tailwind config: `tailwind.config.js`
- Component-level styling with Tailwind utilities

## 📱 Responsive Design

### Desktop Experience
- **Dual-pane layout**: Map and analytics side by side
- **Full controls**: All filters and options visible
- **Grid layouts**: Organized card and chart arrangements
- **Hover interactions**: Rich mouse-over effects

### Mobile Experience
- **Collapsible filters**: Dropdown system for space efficiency
- **Stacked layouts**: Vertical arrangement of components
- **Touch optimization**: Finger-friendly buttons and gestures
- **Swipeable elements**: Mobile-native interaction patterns

## 🔧 Development

### Code Quality
- **ESLint**: Comprehensive linting rules
- **TypeScript**: Strict type checking
- **Prettier**: Consistent code formatting
- **Component Architecture**: Modular, reusable components

### Performance Features
- **Data Caching**: 2-minute intelligent caching system
- **React Optimization**: memo, useCallback, useMemo
- **Bundle Splitting**: Optimized chunk sizes
- **Lazy Loading**: Dynamic imports for code splitting

### Analytics Implementation
- **Independent Data Fetching**: Analytics page manages its own data
- **Error Boundaries**: Graceful error handling
- **Animation Performance**: Optimized Framer Motion usage
- **Chart Optimization**: Efficient Recharts configuration

## 🎯 Usage Guide

### Navigation
1. **Main Map**: Default view with interactive earthquake map
2. **Analytics Button**: Click to access comprehensive analytics dashboard
3. **Theme Toggle**: Switch between light and dark modes
4. **Filter Controls**: Adjust time ranges and magnitude thresholds

### Analytics Dashboard
1. **Overview Cards**: Quick statistics with animated counters
2. **Time Range Selection**: Choose from predefined ranges or custom dates
3. **Chart Interactions**: Hover for detailed tooltips and data
4. **Mobile Filters**: Use dropdown on mobile devices for space efficiency
5. **Notable Earthquakes**: Click "View on Map" to navigate to specific events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling
- Include animations for user interactions
- Test on both desktop and mobile devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **USGS**: Comprehensive earthquake data and reliable API
- **Leaflet**: Powerful open-source mapping library
- **React Team**: Modern React development ecosystem
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library
- **Framer Motion**: Production-ready motion library

## 🆕 Recent Updates

- ✅ **Analytics Dashboard**: Complete data visualization suite
- ✅ **Mobile Optimization**: Responsive filter dropdowns
- ✅ **Enhanced Depth Analysis**: 5-category geological classification
- ✅ **Custom Date Ranges**: Flexible time period selection
- ✅ **Animation System**: Smooth transitions and interactions
- ✅ **Error Handling**: Robust error states with retry functionality

## 📞 Support

For questions, bug reports, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Contact sworjjomoypathak2602@gmail.com for referance

---

**Built with ❤️ by CAP for displaying react skills in OA of Aganitha AI**

*Empowering communities with real-time seismic insights through modern web technology*