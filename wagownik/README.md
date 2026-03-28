# Wagownik

**Your MacBook is now a kitchen scale. Seriously.**

Wagownik is a macOS companion app for our AI cooking guide that turns your MacBook's Force Touch trackpad into a real, working kitchen scale. No extra hardware needed -- just open the app, place your ingredient, and get an instant gram-accurate reading right alongside your recipe.

https://github.com/user-attachments/assets/7eaf9e0b-3dec-4829-b868-f54a8fd53a84

## Why Wagownik?

Following a recipe and need exactly 15g of butter? Measuring spices for a complex curry? Wagownik lets you weigh ingredients on the fly without leaving your laptop -- perfectly integrated with our AI cooking guide so you can measure, adjust, and cook with confidence.

### Key Features

- **Instant ingredient weighing** -- place ingredients directly on your trackpad and get real-time gram readings
- **Seamless cooking workflow** -- designed as a companion to our AI cooking guide, so measurements flow naturally into your recipe steps
- **No extra hardware** -- your MacBook trackpad *is* the scale
- **Precision-calibrated** -- validated against professional digital scales for kitchen-grade accuracy
- **Beautiful native UI** -- a clean, distraction-free SwiftUI interface that stays out of your way while you cook

## How to Use

1. Open Wagownik alongside your recipe
2. Rest a finger on the trackpad
3. Place your ingredient on the trackpad while keeping finger contact
4. Read the weight -- that's it!

## How It Works

Wagownik taps into the Force Touch pressure sensors built into every modern MacBook trackpad using a custom fork of the [Open Multi-Touch Support library](https://github.com/krishkrosh/OpenMultitouchSupport) by [Takuto Nakamura](https://github.com/Kyome22). The raw sensor data maps directly to grams, giving you reliable weight readings without any external devices.

## Requirements

- **macOS 13.0+** (Ventura or later)
- **MacBook with Force Touch trackpad** (2015 or newer MacBook Pro, 2016 or newer MacBook)

## Installation

### Option 1: Download DMG (Recommended)

1. Go to the [Releases](https://github.com/krishkrosh/TrackWeight/releases) page
2. Download the latest DMG file
3. Open the DMG and drag the app to your Applications folder
4. Run the application (you may need to allow it in System Preferences > Security & Privacy)

### Option 2: Homebrew
```bash
brew install --cask krishkrosh/apps/trackweight --force
```

### Option 3: Build from Source

1. Clone this repository
2. Open `TrackWeight.xcodeproj` in Xcode
3. Build and run the application

## Calibration

Weight calculations have been rigorously validated:
1. MacBook trackpad placed on a professional digital scale
2. Known weights applied while maintaining finger contact
3. Pressure readings compared and calibrated against reference measurements
4. Accuracy verified across the full range of typical kitchen ingredient weights

The sensor data from MultitouchSupport maps directly to grams -- no conversion needed.

## Technical Details

Built with:
- **SwiftUI** for a polished, native user interface
- **Combine** for reactive, real-time data flow
- **Open Multi-Touch Support library** for direct trackpad sensor access

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
