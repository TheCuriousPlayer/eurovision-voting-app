# Eurovision 2023 Vote Calculator - Executable Version

## Files Included

- `calculate_cumulative.exe` - The main executable file
- `calculate_cumulative.ini` - Configuration file
- `run_calculator.bat` - Easy-to-use batch file launcher
- `README.md` - This file

## How to Use

### Option 1: Using the Batch File (Recommended)
1. Double-click `run_calculator.bat`
2. Choose from the menu:
   - Option 1: Run once and exit
   - Option 2: Run continuously (updates every 15 seconds)
   - Option 3: Exit

### Option 2: Direct Executable Usage
- **Run once**: Double-click `calculate_cumulative.exe` or run `calculate_cumulative.exe --once`
- **Run continuously**: Run `calculate_cumulative.exe` without parameters

### Option 3: Command Line Usage
```bash
# Run once and exit
calculate_cumulative.exe --once

# Run continuously (every 15 seconds)
calculate_cumulative.exe
```

## Configuration

Edit `calculate_cumulative.ini` to customize:
- Update interval (default: 15 seconds)
- Enable/disable logging and timestamps
- Number of countries to display
- Points system configuration
- File paths

## Requirements

- The executable must be in the same directory as:
  - `calculate_cumulative.ini` (configuration file)
  - Individual vote JSON files (e.g., `ozgunciziltepe_gmail_com.json`)
- Output file `cumulativevotes.json` will be created automatically

## Features

- ✅ Standalone executable - no Python installation required
- ✅ Configurable via INI file
- ✅ Real-time vote processing
- ✅ Timestamped output
- ✅ Eurovision standard points system (12, 10, 8, 7, 6, 5, 4, 3, 2, 1)
- ✅ Automatic cumulative results generation

## Troubleshooting

1. **Missing configuration**: If `calculate_cumulative.ini` is missing, default values will be used
2. **No votes found**: Ensure individual vote JSON files are in the same directory
3. **Permission errors**: Run as administrator if file access issues occur

## File Size
The executable is approximately 8MB and includes all necessary Python runtime components.
