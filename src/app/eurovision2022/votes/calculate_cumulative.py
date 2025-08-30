#!/usr/bin/env python3
"""
Eurovision Cumulative Vote Calculator

This script reads all individual user vote files from the eurovision2023/votes/ directory
and calculates cumulative results, saving them to cumulativevotes.json

Usage: 
  python calculate_cumulative.py          # Run continuously every 15 seconds
  python calculate_cumulative.py --once   # Run once and exit

Features:
- Automatically updates cumulative results every 15 seconds
- Shows real-time vote counts and country rankings
- Timestamped output for monitoring
- Press Ctrl+C to stop the continuous mode
"""

import json
import os
import time
import configparser
from pathlib import Path
from datetime import datetime

def load_config():
    """Load configuration from INI file"""
    config = configparser.ConfigParser()
    config_file = Path("calculate_cumulative.ini")
    
    # Default configuration
    default_config = {
        'update_interval': 15,
        'votes_directory': '.',
        'cumulative_file': 'cumulativevotes.json',
        'enable_logging': True,
        'show_timestamps': True,
        'show_vote_details': True,
        'points_system': [12, 10, 8, 7, 6, 5, 4, 3, 2, 1],
        'max_countries_display': 10,
        'show_zero_points': False,
        'show_header': True,
        'show_separator': True,
        'separator_char': '-',
        'separator_length': 50
    }
    
    if config_file.exists():
        try:
            config.read(config_file)
            
            # Parse settings section
            if 'settings' in config:
                settings = config['settings']
                default_config['update_interval'] = settings.getint('update_interval', 15)
                default_config['votes_directory'] = settings.get('votes_directory', '.')
                default_config['cumulative_file'] = settings.get('cumulative_file', 'cumulativevotes.json')
                default_config['enable_logging'] = settings.getboolean('enable_logging', True)
                default_config['show_timestamps'] = settings.getboolean('show_timestamps', True)
                default_config['show_vote_details'] = settings.getboolean('show_vote_details', True)
                default_config['max_countries_display'] = settings.getint('max_countries_display', 10)
                default_config['show_zero_points'] = settings.getboolean('show_zero_points', False)
                
                # Parse points system
                points_str = settings.get('points_system', '12,10,8,7,6,5,4,3,2,1')
                default_config['points_system'] = [int(x.strip()) for x in points_str.split(',')]
            
            # Parse output section
            if 'output' in config:
                output = config['output']
                default_config['show_header'] = output.getboolean('show_header', True)
                default_config['show_separator'] = output.getboolean('show_separator', True)
                default_config['separator_char'] = output.get('separator_char', '-')
                default_config['separator_length'] = output.getint('separator_length', 50)
                
            if default_config['enable_logging']:
                print(f"Configuration loaded from {config_file}")
                
        except Exception as e:
            print(f"Error loading config file: {e}")
            print("Using default configuration")
    else:
        if default_config['enable_logging']:
            print("No config file found, using default configuration")
    
    return default_config
"""
Eurovision Cumulative Vote Calculator

This script reads all individual user vote files from the votes/ directory
and calculates cumulative results, saving them to cumulativevotes.json

Usage: python calculate_cumulative.py
"""

import json
import os
from pathlib import Path

def calculate_cumulative_votes(config=None):
    if config is None:
        config = load_config()
    
    # Use configuration values
    votes_dir = Path(config['votes_directory'])
    cumulative_file = Path(config['cumulative_file'])
    points = config['points_system']
    
    country_points = {}
    total_votes = 0
    
    # Read all user vote files (exclude cumulativevotes.json and calculate_cumulative.py)
    if votes_dir.exists():
        for vote_file in votes_dir.glob("*.json"):
            # Skip the cumulative results file
            if vote_file.name == config['cumulative_file']:
                continue
                
            try:
                with open(vote_file, 'r', encoding='utf-8') as f:
                    vote_data = json.load(f)
                
                if 'votes' in vote_data and isinstance(vote_data['votes'], list):
                    total_votes += 1
                    
                    # Calculate points for each country in this vote
                    for index, country in enumerate(vote_data['votes'][:len(points)]):  # Use config points length
                        if country and country.strip():
                            if country not in country_points:
                                country_points[country] = 0
                            country_points[country] += points[index]
                    
                    if config['enable_logging'] and config['show_vote_details']:
                        print(f"Processed vote from: {vote_file.name}")
                        
            except Exception as e:
                if config['enable_logging']:
                    print(f"Error processing {vote_file}: {e}")
    
    # Create cumulative results
    cumulative_results = {
        "countryPoints": country_points,
        "totalVotes": total_votes
    }
    
    # Save cumulative results
    with open(cumulative_file, 'w', encoding='utf-8') as f:
        json.dump(cumulative_results, f, indent=2, ensure_ascii=False)
    
    if config['enable_logging']:
        if config['show_timestamps']:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            timestamp_prefix = f"[{current_time}] "
        else:
            timestamp_prefix = ""
            
        print(f"{timestamp_prefix}Cumulative results saved to {cumulative_file}")
        print(f"{timestamp_prefix}Total votes processed: {total_votes}")
        print(f"{timestamp_prefix}Countries with points: {len(country_points)}")
        
        # Show top countries
        if country_points:
            sorted_countries = sorted(country_points.items(), key=lambda x: x[1], reverse=True)
            display_count = min(config['max_countries_display'], len(sorted_countries))
            
            print(f"{timestamp_prefix}Top {display_count} countries:")
            for i, (country, points_total) in enumerate(sorted_countries[:display_count], 1):
                if not config['show_zero_points'] and points_total == 0:
                    break
                print(f"  {i}. {country}: {points_total} points")
    
    return total_votes, len(country_points)

def run_continuous_calculation():
    """Run the cumulative calculation in a continuous loop with configurable intervals."""
    config = load_config()
    update_interval = config['update_interval']
    
    if config['enable_logging']:
        if config['show_timestamps']:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            timestamp_prefix = f"[{current_time}] "
        else:
            timestamp_prefix = ""
        print(f"{timestamp_prefix}Starting Eurovision 2023 cumulative vote calculation...")
        print(f"{timestamp_prefix}Update interval: {update_interval} seconds")
        print(f"{timestamp_prefix}Votes directory: {config['votes_directory']}")
        print(f"{timestamp_prefix}Output file: {config['cumulative_file']}")
        print(f"{timestamp_prefix}Press Ctrl+C to stop")
        print("-" * 50)
    
    try:
        while True:
            # Calculate and save cumulative results
            total_votes, unique_countries = calculate_cumulative_votes(config)
            
            if config['enable_logging']:
                if config['show_timestamps']:
                    timestamp_prefix = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
                else:
                    timestamp_prefix = ""
                print(f"{timestamp_prefix}Waiting {update_interval} seconds for next update...")
                print("-" * 50)
            
            # Wait for the configured interval
            time.sleep(update_interval)
            
    except KeyboardInterrupt:
        if config['enable_logging']:
            if config['show_timestamps']:
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"\n[{current_time}] Calculator stopped by user")
            else:
                print("\nCalculator stopped by user")
            print("Final cumulative results saved.")
    except Exception as e:
        if config['enable_logging']:
            print(f"Error in continuous calculation: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    # Check if user wants to run once or continuously
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        # Run once and exit
        calculate_cumulative_votes()
    else:
        # Run continuously every 15 seconds
        run_continuous_calculation()
