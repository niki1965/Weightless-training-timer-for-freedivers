# Weightless - CO₂ Training Timer

A mindful CO₂ training timer designed to support safe practice.

## Features

- **Lottie Animation**: Main avatar now uses Lottie animations for smooth, lightweight animations
- CO₂ training timer with customizable rounds
- Progressive web app (PWA) support
- Responsive design
- Sound controls

## Lottie Animation Setup

### 1. Animation File
Place your Lottie animation JSON file in the `animations/` directory:
```
animations/avatar-animation.json
```

### 2. File Requirements
- **Format**: JSON (exported from After Effects with Bodymovin plugin)
- **Size**: Recommended under 100KB for optimal performance
- **Dimensions**: Should match the avatar container (59.2px × 59.61px)

### 3. Animation Control
The following functions are available for controlling the Lottie animation:

```javascript
// Play animation
playLottieAnimation();

// Pause animation
pauseLottieAnimation();

// Stop animation
stopLottieAnimation();

// Set animation speed (1.0 = normal speed)
setLottieSpeed(1.5);

// Go to specific frame and play
goToAndPlay(30);
```

### 4. Fallback
If the Lottie animation fails to load, the system automatically falls back to the original SVG image.

## Performance Benefits

- **File Size**: JSON files are typically 10-50KB vs GIF (500KB+) or MP4 (1MB+)
- **Quality**: Vector-based, scalable to any resolution
- **Performance**: GPU-accelerated rendering
- **Control**: Full programmatic control over playback

## Design

Based on Figma designs with:
- Gradient background (pink to blue)
- Glassmorphism session panels
- Weightless logo (downloaded from Figma)
- Pretendard font family
- Exact color matching from design specs

## File Structure

```
Project_Main/
├── index.html          # Main HTML structure
├── style.css           # Complete styling matching Figma design
├── script.js           # Interactive functionality
├── images/
│   └── weightless-logo.svg  # Weightless logo
└── README.md           # This file
```

## Usage

1. Open `index.html` in a web browser
2. Click the chevron button to expand/collapse the session panel
3. View the detailed training schedule in table format
4. Use the edit and start training buttons (functionality to be implemented)

## Design Specifications

- **Colors**: 
  - Primary: #0F1F6C (dark blue)
  - Background: Linear gradient from pink to blue
  - Text: #F7FAFC (light)
  - Accent: #B7BCD3 (muted)

- **Typography**: Pretendard font family
- **Layout**: 393px × 852px mobile design
- **Effects**: Backdrop blur (12px) on glassmorphism elements

## Browser Compatibility

- Modern browsers with CSS backdrop-filter support
- Mobile-optimized layout
- SVG graphics for crisp scaling

## Development

The application is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.
