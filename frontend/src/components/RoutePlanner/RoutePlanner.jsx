import React from 'react';
import './RoutePlanner.css';

export default function RoutePlanner({ 
  selectedForRoute, getOptimizedRoute, openRouteLeg, 
  clickedLegs, setClickedLegs, setSelectedForRoute 
}) {
  if (selectedForRoute.length === 0) return null;

  const fullRoute = getOptimizedRoute();
  const legs = [];
  for (let i = 0; i < fullRoute.length; i += 9) {
    legs.push(fullRoute.slice(i, i + 9));
  }

  return (
    <div className="route-planner-bar">
      <div className="route-selection-info">
        {selectedForRoute.length} seleccionado{selectedForRoute.length !== 1 ? 's' : ''}
      </div>
      
      <div className="route-legs-list">
        {legs.length === 1 ? (
          <button 
            className="btn-route-main"
            onClick={() => openRouteLeg(legs[0])}
          >
            🚀 Armar Ruta
          </button>
        ) : (
          legs.map((leg, idx) => {
            const isEnabled = idx === 0 || clickedLegs.includes(idx - 1);
            return (
              <button 
                key={idx}
                className={`btn-route-leg ${isEnabled ? 'enabled' : 'disabled'}`}
                disabled={!isEnabled}
                onClick={() => {
                  openRouteLeg(leg);
                  setClickedLegs(prev => [...new Set([...prev, idx])]);
                }}
              >
                Tramo {idx + 1} ({leg.length})
              </button>
            );
          })
        )}
      </div>

      <button 
        className="btn-route-close"
        onClick={() => setSelectedForRoute([])}
      >✕</button>
    </div>
  );
}
