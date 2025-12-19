// Crystal App - Main Application Logic

class CrystalApp {
    constructor() {
        this.crystals = [];
        this.map = null;
        this.userLocation = null;
        this.markers = [];
        this.currentCrystal = null;
        this.settings = {
            autoCheckLocation: true,
            notificationRadius: 100,
            apiKey: ''
        };
        
        this.init();
    }

    async init() {
        console.log('Crystal App initializing...');
        
        // Load data from localStorage
        this.loadData();
        console.log(`Loaded ${this.crystals.length} crystals from storage`);
        
        // Initialize map
        this.initMap();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Request location permission and check location if enabled
        if (this.settings.autoCheckLocation) {
            await this.checkCurrentLocation();
        }
        
        // Update UI
        this.updateStats();
        this.renderCrystalList();
        console.log('Crystal App initialized successfully');
    }

    loadData() {
        const savedCrystals = localStorage.getItem('crystals');
        if (savedCrystals) {
            this.crystals = JSON.parse(savedCrystals);
        }
        
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            // Update settings UI
            document.getElementById('autoCheckLocation').checked = this.settings.autoCheckLocation;
            document.getElementById('notificationRadius').value = this.settings.notificationRadius;
            document.getElementById('apiKey').value = this.settings.apiKey;
        }
    }

    saveData() {
        localStorage.setItem('crystals', JSON.stringify(this.crystals));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    initMap() {
        this.map = L.map('map').setView([34.0007, -81.0348], 13); // Default to Columbia, SC
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add all crystals to map
        this.updateMapMarkers();

        // Get user location
        this.getUserLocation();
    }

    async getUserLocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation not supported by your browser');
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Center map on user location
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);

            // Add user location marker
            L.marker([this.userLocation.lat, this.userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<div style="background: #6366f1; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(this.map);

        } catch (error) {
            console.error('Error getting location:', error);
            this.showToast('Unable to get your location. Please enable location services.');
        }
    }

    updateMapMarkers() {
        // Clear existing markers
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        // Group crystals by location (within 10 meters)
        const groups = this.groupCrystalsByLocation(this.crystals, 10);

        // Add markers for each group
        groups.forEach(group => {
            const icon = group.crystals.length > 1 ? '💎' : this.getCategoryIcon(group.crystals[0].category);
            const marker = L.marker([group.lat, group.lng], {
                icon: L.divIcon({
                    className: 'crystal-marker',
                    html: `<div style="font-size: 30px; position: relative;">
                        ${icon}
                        ${group.crystals.length > 1 ? `<span style="position: absolute; top: -5px; right: -10px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${group.crystals.length}</span>` : ''}
                    </div>`,
                    iconSize: [40, 40]
                })
            }).addTo(this.map);

            // Create popup content for all crystals in this group
            let popupContent = '';
            if (group.crystals.length === 1) {
                const crystal = group.crystals[0];
                popupContent = `
                    <div class="crystal-popup">
                        <h3>${this.escapeHtml(crystal.name)}</h3>
                        <p><strong>${this.getCategoryName(crystal.category)}</strong></p>
                        ${crystal.notes ? `<p>${this.escapeHtml(crystal.notes.substring(0, 100))}${crystal.notes.length > 100 ? '...' : ''}</p>` : ''}
                        <p><small>${crystal.address ? this.escapeHtml(crystal.address) : 'Address unknown'}</small></p>
                        <button onclick="window.app.showCrystalDetail(window.app.crystals.find(c => c.id === ${crystal.id}))" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">View Details</button>
                    </div>
                `;
            } else {
                popupContent = `
                    <div class="crystal-popup">
                        <h3>${group.crystals.length} Crystals Here</h3>
                        <div style="max-height: 300px; overflow-y: auto;">
                            ${group.crystals.map(crystal => `
                                <div style="padding: 0.75rem; margin: 0.5rem 0; background: #f9fafb; border-radius: 6px; cursor: pointer;" onclick="window.app.showCrystalDetail(window.app.crystals.find(c => c.id === ${crystal.id}))">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <strong>${this.escapeHtml(crystal.name)}</strong>
                                        <span style="font-size: 1.2rem;">${this.getCategoryIcon(crystal.category)}</span>
                                    </div>
                                    ${crystal.notes ? `<p style="margin: 0.25rem 0; font-size: 0.875rem; color: #6b7280;">${this.escapeHtml(crystal.notes.substring(0, 60))}${crystal.notes.length > 60 ? '...' : ''}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            marker.bindPopup(popupContent, { maxWidth: 300 });

            this.markers.push(marker);
        });
    }

    groupCrystalsByLocation(crystals, thresholdMeters = 10) {
        const groups = [];
        const processed = new Set();

        crystals.forEach((crystal, index) => {
            if (processed.has(index)) return;

            const group = {
                lat: crystal.location.lat,
                lng: crystal.location.lng,
                crystals: [crystal]
            };

            // Find all crystals within threshold distance
            crystals.forEach((otherCrystal, otherIndex) => {
                if (index === otherIndex || processed.has(otherIndex)) return;

                const distance = this.calculateDistance(
                    crystal.location.lat,
                    crystal.location.lng,
                    otherCrystal.location.lat,
                    otherCrystal.location.lng
                );

                if (distance <= thresholdMeters) {
                    group.crystals.push(otherCrystal);
                    processed.add(otherIndex);
                }
            });

            processed.add(index);
            groups.push(group);
        });

        return groups;
    }

    getCategoryIcon(category) {
        const icons = {
            restaurant: '🍽️',
            store: '🏪',
            home: '🏠',
            work: '💼',
            other: '📌'
        };
        return icons[category] || '📌';
    }

    getCategoryName(category) {
        const names = {
            restaurant: 'Restaurant',
            store: 'Store',
            home: 'Home',
            work: 'Work',
            other: 'Other'
        };
        return names[category] || 'Other';
    }

    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('hidden');
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
                document.getElementById('navMenu').classList.add('hidden');
            });
        });

        // FAB buttons
        document.getElementById('addCrystalBtn').addEventListener('click', () => this.openCrystalModal());
        document.getElementById('centerMapBtn').addEventListener('click', () => this.centerMapOnUser());
        document.getElementById('checkInBtn').addEventListener('click', () => this.manualCheckIn());

        // Crystal form
        document.getElementById('crystalForm').addEventListener('submit', (e) => this.saveCrystal(e));
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Photo preview
        document.getElementById('crystalPhotos').addEventListener('change', (e) => this.previewPhotos(e));

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.renderCrystalList());
        document.getElementById('categoryFilter').addEventListener('change', () => this.renderCrystalList());

        // Settings
        document.getElementById('autoCheckLocation').addEventListener('change', (e) => {
            this.settings.autoCheckLocation = e.target.checked;
            this.saveData();
        });
        document.getElementById('notificationRadius').addEventListener('change', (e) => {
            this.settings.notificationRadius = parseInt(e.target.value);
            this.saveData();
        });
        document.getElementById('apiKey').addEventListener('change', (e) => {
            this.settings.apiKey = e.target.value;
            this.saveData();
        });

        // Import/Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // AI Insights
        document.getElementById('generateInsightsBtn').addEventListener('click', () => this.generateInsights());

        // Alert dismiss
        document.getElementById('dismissAlert').addEventListener('click', () => {
            document.getElementById('locationAlert').classList.add('hidden');
        });

        // Detail modal actions
        document.getElementById('editCrystalBtn').addEventListener('click', () => this.editCrystal());
        document.getElementById('deleteCrystalBtn').addEventListener('click', () => this.deleteCrystal());
        document.getElementById('navigateBtn').addEventListener('click', () => this.navigateToCrystal());
    }

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        document.getElementById(`${viewName}View`).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        if (viewName === 'map') {
            setTimeout(() => this.map.invalidateSize(), 100);
        }
    }

    async checkCurrentLocation() {
        if (!navigator.geolocation) return;

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000
                });
            });

            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;

            // Check for nearby crystals
            const nearbyCrystals = this.crystals.filter(crystal => {
                const distance = this.calculateDistance(
                    currentLat,
                    currentLng,
                    crystal.location.lat,
                    crystal.location.lng
                );
                return distance <= this.settings.notificationRadius;
            });

            if (nearbyCrystals.length > 0) {
                this.showLocationAlert(nearbyCrystals);
            }

        } catch (error) {
            console.error('Error checking location:', error);
        }
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        // Haversine formula for distance in meters
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    showLocationAlert(crystals) {
        const alert = document.getElementById('locationAlert');
        const message = document.getElementById('alertMessage');
        
        if (crystals.length === 1) {
            message.textContent = `You're at ${crystals[0].name}`;
        } else {
            message.textContent = `${crystals.length} crystals nearby`;
        }

        alert.classList.remove('hidden');

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 10000);
    }

    async manualCheckIn() {
        this.showToast('Checking your location...');
        await this.checkCurrentLocation();
    }

    centerMapOnUser() {
        if (this.userLocation) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 16);
        } else {
            this.getUserLocation();
        }
    }

    async openCrystalModal(crystal = null) {
        this.currentCrystal = crystal;
        const modal = document.getElementById('crystalModal');
        
        if (crystal) {
            document.getElementById('modalTitle').textContent = 'Edit Crystal';
            document.getElementById('crystalName').value = crystal.name;
            document.getElementById('crystalCategory').value = crystal.category;
            document.getElementById('crystalNotes').value = crystal.notes || '';
            document.getElementById('crystalAddress').value = crystal.address || '';
            document.getElementById('crystalCoords').textContent = 
                `${crystal.location.lat.toFixed(6)}, ${crystal.location.lng.toFixed(6)}`;
            
            // Show existing photos
            if (crystal.photos && crystal.photos.length > 0) {
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = crystal.photos.map(photo => 
                    `<img src="${photo}" alt="Crystal photo">`
                ).join('');
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Drop a Crystal';
            document.getElementById('crystalForm').reset();
            document.getElementById('photoPreview').innerHTML = '';
            
            // Get current location
            if (!this.userLocation) {
                await this.getUserLocation();
            }
            
            if (this.userLocation) {
                document.getElementById('crystalCoords').textContent = 
                    `${this.userLocation.lat.toFixed(6)}, ${this.userLocation.lng.toFixed(6)}`;
                
                // Reverse geocode to get address
                this.reverseGeocode(this.userLocation.lat, this.userLocation.lng);
            }
        }
        
        modal.classList.remove('hidden');
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            document.getElementById('crystalAddress').value = data.display_name || 'Address unknown';
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            document.getElementById('crystalAddress').value = 'Address unknown';
        }
    }

    previewPhotos(event) {
        const files = event.target.files;
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    async saveCrystal(event) {
        event.preventDefault();

        const name = document.getElementById('crystalName').value;
        const category = document.getElementById('crystalCategory').value;
        const notes = document.getElementById('crystalNotes').value;
        const address = document.getElementById('crystalAddress').value;
        const photoFiles = document.getElementById('crystalPhotos').files;

        // Convert photos to base64
        const photos = [];
        for (let file of photoFiles) {
            const base64 = await this.fileToBase64(file);
            photos.push(base64);
        }

        const location = this.currentCrystal ? 
            this.currentCrystal.location : 
            { lat: this.userLocation.lat, lng: this.userLocation.lng };

        const crystal = {
            id: this.currentCrystal ? this.currentCrystal.id : Date.now(),
            name,
            category,
            notes,
            address,
            location,
            photos: this.currentCrystal && photos.length === 0 ? 
                this.currentCrystal.photos : photos,
            createdAt: this.currentCrystal ? 
                this.currentCrystal.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentCrystal) {
            // Update existing
            const index = this.crystals.findIndex(c => c.id === this.currentCrystal.id);
            this.crystals[index] = crystal;
            this.showToast('Crystal updated!');
        } else {
            // Add new
            this.crystals.push(crystal);
            this.showToast('Crystal dropped! 💎');
        }

        this.saveData();
        this.updateMapMarkers();
        this.renderCrystalList();
        this.updateStats();
        this.closeModals();
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    renderCrystalList() {
        const listContainer = document.getElementById('crystalList');
        
        // Safety check
        if (!listContainer) {
            console.error('Crystal list container not found');
            return;
        }

        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const categoryFilterValue = categoryFilter ? categoryFilter.value : '';

        let filtered = this.crystals.filter(crystal => {
            const matchesSearch = crystal.name.toLowerCase().includes(searchTerm) ||
                                (crystal.notes && crystal.notes.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilterValue || crystal.category === categoryFilterValue;
            return matchesSearch && matchesCategory;
        });

        // Sort by distance if we have user location
        if (this.userLocation) {
            try {
                filtered = filtered.map(crystal => ({
                    ...crystal,
                    distance: this.calculateDistance(
                        this.userLocation.lat,
                        this.userLocation.lng,
                        crystal.location.lat,
                        crystal.location.lng
                    )
                })).sort((a, b) => a.distance - b.distance);
            } catch (error) {
                console.error('Error calculating distances:', error);
            }
        }

        if (this.crystals.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No crystals yet. Drop your first crystal! 💎</p>';
            return;
        }
        
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No crystals match your search</p>';
            return;
        }

        try {
            listContainer.innerHTML = filtered.map(crystal => `
                <div class="crystal-card" data-id="${crystal.id}">
                    <div class="crystal-header">
                        <div class="crystal-title">${this.escapeHtml(crystal.name)}</div>
                        <div class="crystal-category">${this.getCategoryIcon(crystal.category)}</div>
                    </div>
                    ${crystal.notes ? `<div class="crystal-notes">${this.escapeHtml(crystal.notes)}</div>` : ''}
                    ${crystal.photos && crystal.photos.length > 0 ? `
                        <div class="crystal-photos">
                            ${crystal.photos.slice(0, 3).map(photo => `<img src="${photo}" alt="Crystal photo">`).join('')}
                        </div>
                    ` : ''}
                    <div class="crystal-meta">
                        <span>📍 ${crystal.address ? this.escapeHtml(crystal.address.split(',')[0]) : 'Unknown location'}</span>
                        ${crystal.distance !== undefined ? `<span>🚶 ${this.formatDistance(crystal.distance)}</span>` : ''}
                    </div>
                </div>
            `).join('');

            // Add click listeners
            listContainer.querySelectorAll('.crystal-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = parseInt(card.dataset.id);
                    const crystal = this.crystals.find(c => c.id === id);
                    if (crystal) {
                        this.showCrystalDetail(crystal);
                    }
                });
            });
        } catch (error) {
            console.error('Error rendering crystal list:', error);
            listContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 2rem;">Error loading crystals. Please refresh.</p>';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m away`;
        } else {
            return `${(meters / 1000).toFixed(1)}km away`;
        }
    }

    showCrystalDetail(crystal) {
        this.currentCrystal = crystal;
        const modal = document.getElementById('detailModal');
        
        document.getElementById('detailName').textContent = crystal.name;
        
        let distance = '';
        if (this.userLocation) {
            const dist = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                crystal.location.lat,
                crystal.location.lng
            );
            distance = `<p><strong>Distance:</strong> ${this.formatDistance(dist)}</p>`;
        }

        document.getElementById('detailContent').innerHTML = `
            <p><strong>Category:</strong> ${this.getCategoryIcon(crystal.category)} ${this.getCategoryName(crystal.category)}</p>
            ${crystal.notes ? `<p><strong>Notes:</strong> ${crystal.notes}</p>` : ''}
            <p><strong>Address:</strong> ${crystal.address || 'Unknown'}</p>
            <p><strong>Coordinates:</strong> ${crystal.location.lat.toFixed(6)}, ${crystal.location.lng.toFixed(6)}</p>
            ${distance}
            <p><strong>Created:</strong> ${new Date(crystal.createdAt).toLocaleDateString()}</p>
            ${crystal.photos && crystal.photos.length > 0 ? `
                <div class="crystal-photos" style="margin-top: 1rem;">
                    ${crystal.photos.map(photo => `<img src="${photo}" alt="Crystal photo" style="width: 150px; height: 150px;">`).join('')}
                </div>
            ` : ''}
        `;

        modal.classList.remove('hidden');
    }

    editCrystal() {
        this.closeModals();
        this.openCrystalModal(this.currentCrystal);
    }

    deleteCrystal() {
        if (confirm(`Delete "${this.currentCrystal.name}"?`)) {
            this.crystals = this.crystals.filter(c => c.id !== this.currentCrystal.id);
            this.saveData();
            this.updateMapMarkers();
            this.renderCrystalList();
            this.updateStats();
            this.closeModals();
            this.showToast('Crystal deleted');
        }
    }

    navigateToCrystal() {
        const crystal = this.currentCrystal;
        // Open in Apple Maps or Google Maps
        const url = `https://maps.apple.com/?daddr=${crystal.location.lat},${crystal.location.lng}`;
        window.open(url, '_blank');
    }

    async generateInsights() {
        if (!this.settings.apiKey) {
            alert('Please add your Anthropic API key in Settings to use AI insights.');
            this.switchView('settings');
            return;
        }

        if (this.crystals.length === 0) {
            alert('You need to add some crystals before generating insights!');
            return;
        }

        document.getElementById('insightsLoading').classList.remove('hidden');
        document.getElementById('insightsContent').classList.add('hidden');

        try {
            // Prepare crystal data for AI
            const crystalData = this.crystals.map(c => ({
                name: c.name,
                category: c.category,
                notes: c.notes,
                createdAt: c.createdAt
            }));

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.settings.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Analyze these location memories (Crystals) and provide insights about patterns, habits, and recommendations. Return ONLY valid JSON with this structure:
{
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Crystals data:
${JSON.stringify(crystalData, null, 2)}

Focus on: frequency of visits to categories, types of places, time patterns, and helpful suggestions for new places to remember or visit based on their habits.`
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.content[0].text;
            
            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }
            
            const insights = JSON.parse(jsonMatch[0]);

            // Display insights
            document.getElementById('patternsContent').innerHTML = insights.patterns
                .map(p => `<div class="insight-item">${p}</div>`)
                .join('');

            document.getElementById('recommendationsContent').innerHTML = insights.recommendations
                .map(r => `<div class="insight-item">${r}</div>`)
                .join('');

            document.getElementById('insightsContent').classList.remove('hidden');

        } catch (error) {
            console.error('Error generating insights:', error);
            alert('Error generating insights. Please check your API key and try again.');
        } finally {
            document.getElementById('insightsLoading').classList.add('hidden');
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.crystals, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crystals-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        this.showToast('Crystals exported!');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (confirm(`Import ${imported.length} crystals? This will replace your current data.`)) {
                    this.crystals = imported;
                    this.saveData();
                    this.updateMapMarkers();
                    this.renderCrystalList();
                    this.updateStats();
                    this.showToast('Crystals imported!');
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    updateStats() {
        document.getElementById('totalCrystals').textContent = this.crystals.length;
        
        const dataStr = JSON.stringify(this.crystals);
        const sizeKB = (new Blob([dataStr]).size / 1024).toFixed(2);
        document.getElementById('storageUsed').textContent = `${sizeKB} KB`;
    }

    closeModals() {
        document.getElementById('crystalModal').classList.add('hidden');
        document.getElementById('detailModal').classList.add('hidden');
        this.currentCrystal = null;
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CrystalApp();
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service worker registration failed:', err);
    });
}
