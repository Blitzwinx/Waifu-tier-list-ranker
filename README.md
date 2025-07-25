# Waifu Tier List Maker

A fully interactive tier list maker application that uses head-to-head comparisons and the Elo rating system to rank characters. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- **Head-to-Head Comparisons**: Present users with two characters at a time for direct comparison
- **Elo Rating System**: Automatically calculate and update character rankings based on user selections
- **Real-Time Updates**: Dynamic tier list that updates as users make choices
- **Multiple Tier Lists**: Support for different games/shows with separate ranking systems

### User Interface
- **Clean Design**: Modern, flat design with white background and colorful tier accents
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Visual Hierarchy**: Clear typography and spacing for optimal user experience

### Admin Features
- **Character Management**: Add, edit, and remove characters with ease
- **Image Management**: Simple URL-based image system with fallback images
- **Tier List Management**: Create and manage multiple tier lists
- **Real-Time Editing**: Live updates to character names and images

### Technical Implementation
- **Supabase Integration**: Full database integration for data persistence
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Modular Architecture**: Clean separation of concerns across multiple components
- **Scalable Design**: Built to handle 10-20+ characters per tier list

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js@latest
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Click the "Connect to Supabase" button in Bolt's top-right corner
   - Follow the setup instructions to connect your project

4. **Run database migrations**
   - The database schema will be automatically created when you connect to Supabase
   - Sample data (tier lists and characters) will be populated automatically

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser to the provided local URL
   - Start creating tier lists and ranking characters!

## Usage Guide

### For Users
1. **Select a Tier List**: Choose from available tier lists on the home page
2. **Make Comparisons**: Click on your preferred character in head-to-head matchups
3. **View Results**: Check the tier list to see current rankings
4. **Continue Ranking**: Make more comparisons to refine the rankings

### For Admins
1. **Access Admin Panel**: Click the "Admin Panel" button on the home page
2. **Manage Tier Lists**: Create, edit, or delete tier lists
3. **Manage Characters**: Add, edit, or remove characters from tier lists
4. **Update Images**: Use image URLs to set character portraits

## Technical Details

### Database Schema
- **tier_lists**: Stores tier list information (name, description)
- **characters**: Stores character data (name, image, Elo rating, comparison count)
- **comparisons**: Records all comparison results for analytics

### Elo Rating System
- Default starting rating: 1400
- K-factor: 32 (standard for new players)
- Tier thresholds:
  - S-Tier: 1800+
  - A-Tier: 1600-1799
  - B-Tier: 1400-1599
  - C-Tier: 1200-1399
  - D-Tier: 1000-1199
  - F-Tier: Below 1000

### File Structure
```
src/
├── components/          # React components
│   ├── TierListSelector.tsx
│   ├── ComparisonView.tsx
│   ├── TierListDisplay.tsx
│   └── AdminPanel.tsx
├── lib/                # External service integrations
│   └── supabase.ts
├── services/           # Business logic
│   └── tierListService.ts
├── utils/              # Utility functions
│   └── eloRating.ts
└── App.tsx            # Main application component
```

## Customization

### Adding New Characters
1. Go to Admin Panel
2. Select a tier list
3. Click "Add Character"
4. Enter name and image URL
5. Character starts with 1400 Elo rating

### Creating New Tier Lists
1. Go to Admin Panel
2. Click "Add Tier List"
3. Enter name and description
4. Add characters to populate the list

### Image Management
- Use direct image URLs (HTTPS recommended)
- Supported formats: JPG, PNG, WebP
- Fallback images provided automatically
- Image dimensions are automatically cropped to fit

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure Supabase environment variables are set correctly
2. **Image Loading**: Check that image URLs are accessible and use HTTPS
3. **Performance**: Large tier lists (50+ characters) may need optimization

### Support
- Check browser console for error messages
- Verify Supabase connection in the project settings
- Ensure database migrations have run successfully

## License

This project is open source and available under the MIT License.