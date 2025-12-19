# 💎 Crystal: The Geo-Memory App

**Never forget a location-specific detail again.**

Crystal is a Progressive Web App (PWA) that helps you remember important details about specific locations. Drop a "Crystal" anywhere with notes and photos, and get automatic reminders when you return to that location.

## ✨ Features

### Core Features
- **Drop Crystals**: Save location-specific memories with text, photos, and categories
- **Automatic Location Detection**: Get notified when you're near saved Crystals
- **Manual Check-In**: Tap to check for nearby Crystals anytime
- **Interactive Map**: Visualize all your Crystals on an interactive map
- **Rich Memories**: Attach multiple photos and detailed notes to each Crystal
- **Smart Categories**: Organize by Restaurant, Store, Home, Work, or Other

### Crystal Pro (AI Features)
- **Pattern Analysis**: Discover habits and trends in your location visits
- **Smart Recommendations**: Get AI-powered suggestions based on your behavior
- **Powered by Claude**: Uses Anthropic's Claude AI for intelligent insights

### Data Management
- **Local Storage**: All data stored securely on your device
- **Export/Import**: Backup and restore your Crystals as JSON
- **Privacy First**: No cloud storage required (unless you choose to sync)

## 📱 Installation on iPad Pro

### Step 1: Host the App
Since this is a web app, you need to host it somewhere accessible. You have several options:

#### Option A: Use a Simple Local Server (Recommended for Testing)
1. Install the "WebDAV Nav" app from the App Store (free)
2. Or use any file hosting service that supports PWAs

#### Option B: Free Hosting Services
1. **GitHub Pages** (Recommended):
   - Create a GitHub account at github.com
   - Create a new repository called "crystal-app"
   - Upload all the Crystal files to the repository
   - Enable GitHub Pages in Settings
   - Your app will be at: `https://[username].github.io/crystal-app`

2. **Netlify Drop**:
   - Go to app.netlify.com/drop
   - Drag the crystal folder onto the page
   - Get an instant URL

3. **Vercel**:
   - Sign up at vercel.com
   - Import the crystal folder
   - Deploy with one click

### Step 2: Install on iPad
Once hosted:

1. **Open Safari** on your iPad Pro (must use Safari, not Chrome)
2. Navigate to your Crystal app URL
3. Tap the **Share button** (square with arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "Crystal" and tap **Add**
6. The Crystal app icon will appear on your home screen

### Step 3: Enable Permissions
When you first open Crystal:

1. **Location Permission**: Tap "Allow" when prompted for location access
2. **Notification Permission**: Tap "Allow" to get alerts when near Crystals
3. **Camera Permission**: Granted when you first try to add a photo

## 🚀 Quick Start Guide

### Creating Your First Crystal

1. **Open the app** from your home screen
2. **Allow location access** when prompted
3. Tap the **"+ Drop Crystal"** button (blue button at bottom right)
4. Fill in:
   - **Location Name**: e.g., "Joe's Pizza"
   - **Category**: Choose from Restaurant, Store, Home, Work, or Other
   - **Memory/Notes**: e.g., "Get the pepperoni - amazing crust!"
   - **Photos**: Tap to add pictures of menus, items, etc.
5. Tap **"Save Crystal"**

Your Crystal is now saved! When you return to this location, you'll get a notification.

### Using the Map

- **Blue dot**: Your current location
- **Emoji markers**: Your Crystals (categorized by icon)
- **Tap any marker**: View details about that Crystal
- **📍 Button**: Center map on your current location
- **✓ Check In Button**: Manually check for nearby Crystals

### List View

- **Search**: Find Crystals by name or notes
- **Filter**: Show only specific categories
- **Distance**: See how far each Crystal is from you
- **Tap any Crystal**: View full details

### AI Insights (Crystal Pro)

1. Go to **Settings** (☰ menu → ⚙️ Settings)
2. Add your **Anthropic API Key**:
   - Get a free key at [console.anthropic.com](https://console.anthropic.com)
   - Free tier includes $5 credit
3. Navigate to **AI Insights** view
4. Tap **"✨ Generate Insights"**
5. View your patterns and recommendations

## 🔧 Settings & Configuration

### Location Settings
- **Auto-check location on app open**: Automatically check for nearby Crystals when you open the app
- **Notification radius**: How close you need to be (10-1000 meters)

### Data Management
- **Export Crystals**: Download all your data as JSON backup
- **Import Crystals**: Restore from a backup file

## 💡 Tips & Tricks

### Best Practices
1. **Be specific in notes**: "Try the carbonara" is better than "good food"
2. **Use photos liberally**: Menu items, product labels, parking spots
3. **Set appropriate radius**: 50-100m for stores, 10-20m for parking spots
4. **Categories matter**: They make filtering easier later

### Use Cases

**Restaurants**
- Favorite dishes and what to avoid
- Dietary restrictions to mention
- Photos of menus

**Stores**
- Product locations in large stores
- Part numbers and measurements
- Seasonal availability notes

**Home Improvement**
- Paint colors with photos
- Measurements you always forget
- Photos of how things should look

**Parking**
- Where you parked at the airport
- Best parking spots at venues
- Parking meter numbers

**Medical/Professional**
- Office suite numbers
- Specific entrance instructions
- Photos of confusing buildings

## 🔒 Privacy & Data

- **All data stored locally** on your device
- **No account required**
- **No cloud sync** (unless you explicitly export/import)
- **Photos stored as base64** in browser storage
- **API key stored locally** (never transmitted except to Anthropic for AI features)

## 🐛 Troubleshooting

### Location Not Working
- Ensure Safari has location permission: Settings → Safari → Location
- Make sure Location Services is enabled: Settings → Privacy → Location Services
- Try the manual "Check In" button

### Notifications Not Appearing
- Background location is limited on iOS PWAs
- Use manual check-in or open app when arriving at locations
- For truly automatic notifications, a native app would be needed

### App Not Installing
- Must use Safari (not Chrome or other browsers)
- Ensure you're on a secure connection (HTTPS)
- Clear Safari cache and try again

### Photos Not Saving
- Check available storage space
- Reduce photo file sizes if needed
- Try one photo at a time initially

### AI Insights Not Working
- Verify API key is correct in Settings
- Ensure you have API credits at console.anthropic.com
- Check browser console for error messages

## 📊 Storage Information

- **Typical Crystal**: ~5-10 KB without photos
- **With 1 photo**: ~100-500 KB
- **Browser storage limit**: ~50 MB on iOS Safari
- **Recommended**: Keep to 100-200 Crystals with photos

## 🔄 Updates

This PWA updates automatically when you reload. To force an update:
1. Close the app completely
2. Reopen from home screen
3. Pull down to refresh (if implemented)

## 🆘 Support

### Need Help?
- Check the troubleshooting section above
- Review your browser's developer console for errors
- Ensure all files are properly uploaded to your host

### Want to Contribute?
This is a custom build - feel free to modify the code to add features!

## 📝 Technical Details

### Built With
- Vanilla JavaScript (no framework dependencies)
- Leaflet.js for maps
- LocalStorage API for data persistence
- Geolocation API for location tracking
- File API for photo handling
- Anthropic Claude API for AI insights

### File Structure
```
crystal/
├── index.html          # Main app structure
├── styles.css          # All styling
├── app.js             # Application logic
├── manifest.json      # PWA configuration
├── sw.js              # Service worker
├── icon-192.svg       # App icon (small)
├── icon-512.svg       # App icon (large)
└── README.md          # This file
```

### Browser Compatibility
- ✅ Safari on iOS 14+
- ✅ Safari on iPadOS 14+
- ⚠️ Limited features in Chrome/Firefox on iOS
- ❌ Not optimized for desktop browsers

## 🎯 Roadmap

Potential future enhancements:
- [ ] Cloud sync option
- [ ] Sharing Crystals with others
- [ ] Crystal templates for common use cases
- [ ] Voice notes
- [ ] Better background location (requires native app)
- [ ] Widget support
- [ ] Apple Watch companion

## 📄 License

This is a custom build created for personal use. Feel free to modify and adapt for your needs.

## 🙏 Acknowledgments

- Map tiles: OpenStreetMap contributors
- Icons: Emoji via system fonts
- AI: Anthropic Claude
- Geocoding: Nominatim / OpenStreetMap

---

**Version 1.0.0** - Built for iPad Pro
Last updated: December 2025

Happy Crystal dropping! 💎
