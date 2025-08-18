'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ResultsData } from '@/types/votes';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const countryToCode: { [key: string]: string } = {
  'Albania': 'AL',
  'Andorra': 'AD',
  'Armenia': 'AM',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Bosnia & Herzegovina': 'BA',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Cyprus': 'CY',
  'Czechia': 'CZ',
  'Denmark': 'DK',
  'Estonia': 'EE',
  'Finland': 'FI',
  'France': 'FR',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Greece': 'GR',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Moldova': 'MD',
  'Monaco': 'MC',
  'Montenegro': 'ME',
  'Morocco': 'MA',
  'Netherlands': 'NL',
  'North Macedonia': 'MK',
  'Norway': 'NO',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Russia': 'RU',
  'San Marino': 'SM',
  'Serbia': 'RS',
  'Serbia Montenegro': 'RM',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Türkiye': 'TR',
  'Ukraine': 'UA',
  'United Kingdom': 'GB',
  'Yugoslavia': 'YU'
};

interface DragResult {
  draggableId: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export default function Eurovision2023Test() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(Array(10).fill(''));
  const [updateTrigger, setUpdateTrigger] = useState(0); // Force re-render trigger
  const [showResults, setShowResults] = useState(false); // Toggle for showing results with points

  useEffect(() => {
    fetchResults();
    // We want this to run only once on mount, fetchResults is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update results whenever selectedCountries changes
  useEffect(() => {
    if (results && !loading && selectedCountries.length === 10) {
      console.log('useEffect triggered, calling updateResults');
      updateResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries]);

  const updateResults = async () => {
    if (!results) return;

    console.log('Updating results with selectedCountries:', selectedCountries);

    // Start with base points (all countries at 0)
    const allCountries = Object.keys(countryToCode);
    const basePoints: { [country: string]: number } = {};
    
    // Initialize all countries to 0
    allCountries.forEach(country => {
      basePoints[country] = 0;
    });

    console.log('Starting with zero points for all countries');

    // Add points for each vote from the original data (excluding current user)
    // We'll simulate this by taking total votes - 1 and calculate points
    // For now, let's just use the current logic but ensure no negative points
    
    // Start with current points
    Object.keys(results.countryPoints).forEach(country => {
      basePoints[country] = Math.max(0, results.countryPoints[country] || 0);
    });

    // Remove user's previous vote points if they exist
    if (results.userVote?.votes) {
      results.userVote.votes.forEach((country, index) => {
        const pointsToRemove = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index];
        basePoints[country] = Math.max(0, (basePoints[country] || 0) - pointsToRemove);
        console.log(`Removed ${pointsToRemove} points from ${country}, now has ${basePoints[country]}`);
      });
    }

    console.log('Points after removing user votes:', basePoints);

    // Add new vote points based on their actual slot positions
    selectedCountries.forEach((country, slotIndex) => {
      if (country && country.trim() !== '') { // Only process non-empty slots
        const pointsToAdd = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][slotIndex];
        basePoints[country] = (basePoints[country] || 0) + pointsToAdd;
        console.log(`Added ${pointsToAdd} points to ${country} (slot ${slotIndex + 1}), now has ${basePoints[country]}`);
      } else if (slotIndex < 10) {
        console.log(`Slot ${slotIndex + 1} is empty`);
      }
    });

    console.log('Final points after adding new votes:', basePoints);

    // Create updated user vote with the full 10-element array (including empty slots)
    const updatedUserVote = {
      userId: results.userVote?.userId || 'temp',
      userName: results.userVote?.userName || 'temp',
      userEmail: results.userVote?.userEmail || 'temp',
      votes: selectedCountries, // Send the full array with empty strings
      timestamp: new Date(),
    };

    // Create completely new results object
    const newResults = {
      ...results,
      countryPoints: basePoints,
      userVote: updatedUserVote,
      totalVotes: results.totalVotes
    };

    console.log('New results:', newResults.countryPoints);
    setResults(newResults);
    setUpdateTrigger(prev => prev + 1); // Force re-render

    // Save to database (optional - don't block UI if it fails)
    try {
      // Send the exact selectedCountries array to preserve slot positions
      // This maintains empty strings in their exact positions
      console.log('Sending votes to API (preserving slot positions):', selectedCountries);
      
      const response = await fetch('/api/votes/2023', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          votes: selectedCountries // Send the full array with empty strings in exact positions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('Failed to save votes to server:', response.status, errorData);
      } else {
        console.log('Votes saved successfully');
      }
    } catch (error) {
      console.warn('Error saving votes to server, but continuing with local updates:', error);
    }
  };

  const handleDragEnd = (result: DragResult) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    const country = result.draggableId;

    const newSelectedCountries = [...selectedCountries];

    if ((sourceId === 'results' || sourceId === 'results2') && destinationId.startsWith('slot-')) {
      const slotIndex = parseInt(destinationId.split('-')[1]);
      
      // Remove the country from its current position if it exists elsewhere
      const existingIndex = newSelectedCountries.indexOf(country);
      if (existingIndex !== -1) {
        newSelectedCountries[existingIndex] = '';
      }
      
      // Place the country in the new slot
      newSelectedCountries[slotIndex] = country;
    } else if (sourceId.startsWith('slot-') && destinationId.startsWith('slot-')) {
      const sourceIndex = parseInt(sourceId.split('-')[1]);
      const destIndex = parseInt(destinationId.split('-')[1]);
      
      // Swap the countries between slots
      const temp = newSelectedCountries[destIndex];
      newSelectedCountries[destIndex] = newSelectedCountries[sourceIndex];
      newSelectedCountries[sourceIndex] = temp;
    }

    // Update the state - useEffect will handle the results update
    setSelectedCountries(newSelectedCountries);
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/votes/2023');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        
        // Load user's show results preference
        const savedShowResults = localStorage.getItem('eurovision2023_showResults');
        if (savedShowResults !== null) {
          setShowResults(JSON.parse(savedShowResults));
        }
        
        // Only set selectedCountries on initial load
        if (loading && data.userVote?.votes) {
          // Create an array of 10 elements with empty strings
          const newSelectedCountries = Array(10).fill('');
          
          // Fill in the votes at their correct positions
          data.userVote.votes.forEach((country: string, index: number) => {
            newSelectedCountries[index] = country;
          });
          
          setSelectedCountries(newSelectedCountries);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowResults = () => {
    const newShowResults = !showResults;
    setShowResults(newShowResults);
    localStorage.setItem('eurovision2023_showResults', JSON.stringify(newShowResults));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  if (!results) {
    return <div className="flex items-center justify-center min-h-screen">Error loading results</div>;
  }

  // Get all countries from the countryToCode mapping
  const allCountries = Object.keys(countryToCode);
  
  // Create array of all countries with their points (including 0 points)
  // Sort alphabetically when results are hidden, by points when shown
  const sortedCountries = showResults 
    ? allCountries
        .map(country => [country, results.countryPoints[country] || 0])
        .sort(([, pointsA], [, pointsB]) => (pointsB as number) - (pointsA as number) || 0)
    : allCountries
        .map(country => [country, results.countryPoints[country] || 0])
        .sort(([countryA], [countryB]) => countryA.localeCompare(countryB));

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-white mb-8">
            Eurovision 2023 Results
          </h1>
          
          <div className="flex flex-wrap gap-8">
            {/* Your Vote Section */}
            <div className="w-full lg:w-[420px]">
              <div className="bg-[#2c3e50] rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Your Vote</h2>
                <div className="grid gap-0">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <Droppable 
                      key={`slot-${index}`} 
                      droppableId={`slot-${index}`}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`${
                            snapshot.isDraggingOver ? 'bg-[#243342] border-2 border-dashed border-[#4a5d6e]' : ''
                          } min-h-[60px] rounded w-full max-w-[380px]`}
                        >
                          <div className={`flex items-center justify-between w-full max-w-full ${selectedCountries[index] ? 'bg-[#34495e]' : 'bg-[#2a3846] border-2 border-dashed border-[#34495e]'} p-3 rounded`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                              <span className={`font-bold flex-shrink-0 ${selectedCountries[index] ? 'text-white' : 'text-gray-500'}`}>
                                {index + 1}.
                              </span>
                              {selectedCountries[index] ? (
                                <>
                                  <Image 
                                    src={`/flags/${selectedCountries[index].replace('&', 'and')}_${countryToCode[selectedCountries[index]]}.png`}
                                    alt={`${selectedCountries[index]} flag`}
                                    width={24}
                                    height={16}
                                    className="object-cover rounded flex-shrink-0"
                                  />
                                  <span className="text-white truncate">{selectedCountries[index]}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-4 bg-[#34495e] rounded opacity-30 flex-shrink-0" />
                                  <span className="text-gray-500 truncate">Drag a country here</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`font-bold ${selectedCountries[index] ? 'text-white' : 'text-gray-500'}`}>
                                {[12, 10, 8, 7, 6, 5, 4, 3, 2, 1][index]} points
                              </span>
                              {selectedCountries[index] && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newSelectedCountries = [...selectedCountries];
                                    newSelectedCountries[index] = '';
                                    setSelectedCountries(newSelectedCountries);
                                  }}
                                  className="bg-[#e74c3c] hover:bg-[#c0392b] text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-400 text-center">
                  Drag countries from the results list to vote (max 10)
                </div>
                <button
                  onClick={toggleShowResults}
                  className={`mt-4 w-full py-2 px-4 rounded font-medium transition-colors ${
                    showResults 
                      ? 'bg-[#e74c3c] hover:bg-[#c0392b] text-white' 
                      : 'bg-[#3498db] hover:bg-[#2980b9] text-white'
                  }`}
                >
                  {showResults ? 'Hide Results' : 'Show Results'}
                </button>
              </div>
            </div>

            {/* Overall Results Section - Split into 2 columns */}
            <div className="flex-1">
              <div className="bg-[#2c3e50] rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {showResults 
                    ? `Overall Results (${results.totalVotes} votes)` 
                    : 'Countries (Alphabetical)'
                  }
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* First Column - Higher Rankings */}
                  <div className="space-y-2">
                    <Droppable droppableId="results">
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-1"
                        >
                          {sortedCountries.slice(0, Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                            <Draggable key={country} draggableId={country} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps} 
                                  className={`flex items-center justify-between ${
                                    showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                                  } p-1 rounded ${
                                    snapshot.isDragging ? 'opacity-50' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${
                                      showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {index + 1}.
                                    </span>
                                    <Image 
                                      src={`/flags/${country.replace('&', 'and')}_${countryToCode[country]}.png`}
                                      alt={`${country} flag`}
                                      width={24}
                                      height={16}
                                      className={`object-cover rounded ${
                                        showResults && points === 0 ? 'opacity-60' : ''
                                      }`}
                                    />
                                    <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                      {country}
                                    </span>
                                    {selectedCountries.includes(country) && (
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        (#{selectedCountries.indexOf(country) + 1})
                                      </span>
                                    )}
                                  </div>
                                  {showResults && (
                                    <span className={`font-bold ml-2 whitespace-nowrap ${
                                      points > 0 ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {points} points
                                    </span>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Second Column - Lower Rankings */}
                  <div className="space-y-2">
                    <Droppable droppableId="results2">
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-1"
                        >
                          {sortedCountries.slice(Math.ceil(sortedCountries.length / 2)).map(([country, points], index) => (
                            <Draggable key={country} draggableId={country} index={index + Math.ceil(sortedCountries.length / 2)}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between ${
                                    showResults && points > 0 ? 'bg-[#34495e]' : 'bg-[#2a3846]'
                                  } p-1 rounded ${
                                    snapshot.isDragging ? 'opacity-50' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${
                                      showResults && points > 0 ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {index + Math.ceil(sortedCountries.length / 2) + 1}.
                                    </span>
                                    <Image 
                                      src={`/flags/${country.replace('&', 'and')}_${countryToCode[country]}.png`}
                                      alt={`${country} flag`}
                                      width={24}
                                      height={16}
                                      className={`object-cover rounded ${
                                        showResults && points === 0 ? 'opacity-60' : ''
                                      }`}
                                    />
                                    <span className={showResults && points > 0 ? 'text-white' : 'text-gray-400'}>
                                      {country}
                                    </span>
                                    {selectedCountries.includes(country) && (
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        (#{selectedCountries.indexOf(country) + 1})
                                      </span>
                                    )}
                                  </div>
                                  {showResults && (
                                    <span className={`font-bold ml-2 whitespace-nowrap ${
                                      points > 0 ? 'text-white' : 'text-gray-400'
                                    }`}>
                                      {points} points
                                    </span>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
