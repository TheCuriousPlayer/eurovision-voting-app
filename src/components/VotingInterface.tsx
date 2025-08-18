'use client'; // Template for dev

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';

const points = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

// Map of country names to their ISO codes for flags
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

const countries = [
  'Albania', 'Andorra', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia & Herzegovina', 'Bulgaria',
  'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia',
  'Finland', 'France', 'Georgia', 'Germany', 'Greece',
  'Hungary', 'Iceland', 'Ireland', 'Israel', 'Italy',
  'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova',
  'Monaco', 'Montenegro', 'Morocco', 'Netherlands', 'North Macedonia',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Russia',
  'San Marino', 'Serbia', 'Serbia Montenegro', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Switzerland', 'Türkiye', 'Ukraine',
  'United Kingdom', 'Yugoslavia'
];

export default function VotingInterface() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>(countries);

  const handleDragEnd = (result: { destination?: { droppableId: string; index: number }; source: { droppableId: string; index: number } }): void => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    // Moving within the same list (reordering)
    if (sourceId === destinationId) {
      if (sourceId === 'selected') {
        const newSelectedCountries = Array.from(selectedCountries);
        const [movedCountry] = newSelectedCountries.splice(sourceIndex, 1);
        newSelectedCountries.splice(destinationIndex, 0, movedCountry);
        setSelectedCountries(newSelectedCountries);
      }
    } 
    // Moving between lists
    else {
      if (sourceId === 'available' && destinationId === 'selected') {
        const country = availableCountries[sourceIndex];
        const newSelectedCountries = Array.from(selectedCountries);
        
        if (selectedCountries.length >= 10) {
          // Remove the last country and add it back to available countries
          const removedCountry = newSelectedCountries.pop();
          if (removedCountry) {
            setAvailableCountries([...availableCountries.filter((_, index) => index !== sourceIndex), removedCountry]);
          }
        }
        
        // Insert the new country at the drop position
        newSelectedCountries.splice(destinationIndex, 0, country);
        setSelectedCountries(newSelectedCountries);
        setAvailableCountries(availableCountries.filter((_, index) => index !== sourceIndex));
      } else if (sourceId === 'selected' && destinationId === 'available') {
        const country = selectedCountries[sourceIndex];
        const newAvailableCountries = Array.from(availableCountries);
        newAvailableCountries.splice(destinationIndex, 0, country);
        setAvailableCountries(newAvailableCountries);
        setSelectedCountries(selectedCountries.filter((_, index) => index !== sourceIndex));
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 h">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8 w-full relative">
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            <h2 className="text-2xl font-bold mb-4 sticky top-0 bg-black z-10">Available Countries (2023)</h2>
            <Droppable
              droppableId="available"
              isDropDisabled={false}
              isCombineEnabled={false}
              type="country"
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-[#0b1724] p-4 rounded-lg min-h-[400px] ${
                    snapshot.isDraggingOver ? 'bg-[#102235]' : ''
                  }`}
                >
                  {availableCountries.map((country, index) => (
                    <Draggable
                      key={country}
                      draggableId={country}
                      index={index}
                      isDragDisabled={false}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-1 mb-1 rounded shadow-sm cursor-move ${
                            snapshot.isDragging 
                              ? 'shadow-md bg-[#4a90e2] text-white' 
                              : 'bg-[#2c3e50] text-white hover:bg-[#34495e]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${countryToCode[country]}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className="object-cover rounded"
                            />
                            {country}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className="flex-1 sticky top-4 self-start" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            <h2 className="text-2xl font-bold mb-4">Your Votes</h2>
            <Droppable
              droppableId="selected"
              isDropDisabled={false}
              isCombineEnabled={false}
              type="country"
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-[#0b1724] p-4 rounded-lg min-h-[400px] ${
                    snapshot.isDraggingOver ? 'bg-[#102235]' : ''
                  }`}
                >
                  {selectedCountries.map((country, index) => (
                    <Draggable
                      key={country}
                      draggableId={country}
                      index={index}
                      isDragDisabled={false}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex justify-between items-center p-1 mb-1 rounded shadow-sm cursor-move ${
                            snapshot.isDragging 
                              ? 'shadow-md bg-[#2ecc71] text-white' 
                              : 'bg-[#16a085] text-white hover:bg-[#1abc9c]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Image 
                              src={`/flags/${country.replace('&', 'and')}_${countryToCode[country]}.png`}
                              alt={`${country} flag`}
                              width={24}
                              height={16}
                              className="object-cover rounded"
                            />
                            {country}
                          </div>
                          <span className="font-bold text-white">
                            {points[index] || 0} points
                          </span>
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
      </DragDropContext>
    </div>
  );
}
