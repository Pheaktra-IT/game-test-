// src/SlotGame.js
import React, { useState, useEffect } from 'react';
import symbolsData from './data.json';

const SlotGame = () => {
  const [symbols] = useState(symbolsData.symbols);
  const [slots, setSlots] = useState(['855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [spinCount, setSpinCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [startDisabled, setStartDisabled] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [allSpins, setAllSpins] = useState([]);
  const [currentResults, setCurrentResults] = useState([]);
  const [completedSpins, setCompletedSpins] = useState([]);
  const [currentSpinSlots, setCurrentSpinSlots] = useState(6); // Start with 6 slots
  const [showRewards, setShowRewards] = useState(false);
  const [showRewardsButton, setShowRewardsButton] = useState(false);

  const getSpinSlots = () => {
    switch (spinCount) {
      case 0:
        return 6;
      case 1:
        return 3;
      case 2:
        return 1;
      default:
        return 0;
    }
  };

  const getRewardType = (spinNumber) => {
    switch (spinNumber) {
      case 1:
        return {
          type: 'Small Reward',
        };
      case 2:
        return {
          type: 'Medium Reward',
        };
      case 3:
        return {
          type: 'Big Reward'
        };
      default:
        return {
          type: 'Reward'
        };
    }
  };

  const spin = () => {
    if (isSpinning || spinCount >= 3) return;

    setIsSpinning(true);
    setShowNext(false);
    setShowRewardsButton(false);
    const slotsToSpin = currentSpinSlots;
    const spinInterval = setInterval(() => {
      setSlots(prevSlots => {
        const newSlots = [...prevSlots];
        for (let i = currentSlot; i < currentSlot + slotsToSpin; i++) {
          newSlots[i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
        return newSlots;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const newSlots = [...slots];
      const spinResults = [];
      for (let i = currentSlot; i < currentSlot + slotsToSpin; i++) {
        const result = symbols[Math.floor(Math.random() * symbols.length)];
        newSlots[i] = result;
        spinResults.push(result);
      }
      setSlots(newSlots);
      setCurrentResults(spinResults);
      setIsSpinning(false);
      
      const rewardType = getRewardType(spinCount + 1);
      const spinRecord = {
        spinNumber: spinCount + 1,
        slots: slotsToSpin,
        startSlot: currentSlot + 1,
        endSlot: currentSlot + slotsToSpin,
        results: spinResults,
        rewardType: rewardType
      };
      
      setHistory(prev => [...prev, spinRecord]);
      setCompletedSpins(prev => [...prev, spinRecord]);

      const newSpinCount = spinCount + 1;
      setSpinCount(newSpinCount);
      
      if (newSpinCount >= 3) {
        setAllSpins(prev => [...prev, ...completedSpins, spinRecord]);
        setCompletedSpins([]);
        setShowRewardsButton(true);
      } else {
        setShowNext(true);
      }
    }, 3000);
  };

  const nextSpin = () => {
    setShowNext(false);
    setStartDisabled(false);
    setCurrentSlot(prev => prev + currentSpinSlots);
    setCurrentResults([]);
    // Move completed spins to allSpins when clicking Next
    setAllSpins(prev => [...prev, ...completedSpins]);
    setCompletedSpins([]);
    // Update the number of slots for the next spin
    setCurrentSpinSlots(getSpinSlots());
  };

  const startSpin = () => {
    setStartDisabled(true);
    spin();
  };

  const stopSpin = () => {
    setIsSpinning(false);
  };

  const startNewGame = () => {
    setSlots(['855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX', '855 XXXXXXXXX']);
    setHistory([]);
    setSpinCount(0);
    setShowSummary(false);
    setIsSpinning(false);
    setCurrentSlot(0);
    setStartDisabled(false);
    setShowNext(false);
    setAllSpins([]);
    setCurrentResults([]);
    setCompletedSpins([]);
    setCurrentSpinSlots(6);
    setShowRewards(false);
    setShowRewardsButton(false);
  };

  const visibleSlots = slots.slice(currentSlot, currentSlot + currentSpinSlots);

  return (
    <div className="slot-game w-screen ">
      {!showRewards ? (
        <>
          <h1 className='text-4xl font-bold text-center p-2 rounded-md mb-4 '>Game Testing</h1>
          <div className="slots">
            {visibleSlots.map((slot, index) => (
              <div 
                key={index} 
                className={`slot ${isSpinning ? 'spinning' : ''}`}
              >
                {slot}
              </div>
            ))}
          </div>
          {currentResults.length > 0 && !isSpinning && (
            <div className="current-results">
              <h3>Current Spin Results:</h3>
              <div className="results-display">
                {currentResults.map((result, index) => (
                  <span key={index} className="result-item">{result}</span>
                ))}
              </div>
            </div>
          )}
          <div className="buttons">
            {!showSummary && (
              <>
                {!showNext && !showRewardsButton && (
                  <>
                    <button className='stop-button bg-red-500 text-white p-2 rounded-md'
                      onClick={stopSpin}
                      disabled={!isSpinning}
                    >
                      Stop Spin
                    </button>
                   <div className='start'>
                   <button 
                      className="start-button" 
                      onClick={startSpin}
                      disabled={isSpinning || startDisabled || spinCount >= 3}
                    >
                      Start
                    </button>
                   </div>
                  </>
                )}
                {showNext && (
                  <button 
                    className="next-button" 
                    onClick={nextSpin}
                  >
                    Next Spin
                  </button>
                )}
                {showRewardsButton && (
                  <button 
                    className="rewards-button" 
                    onClick={() => setShowRewards(true)}
                  >
                    Show Rewards
                  </button>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="rewards-page">
          <h1 className="text-3xl font-bold mb-8">Game Rewards</h1>
          <div className="rewards-container ">
            {allSpins.map((spin, index) => (
              <div key={index} className="reward-card" style={{ borderColor: spin.rewardType.color }}>
                <div className="reward-header flex" style={{ backgroundColor: spin.rewardType.color }}>
                  <span className="reward-icon flex">{spin.rewardType.icon}</span>
                  <h3 className="text-xl font-semibold mb-4">{spin.rewardType.type}</h3>
                </div>
                <div className="reward-details flex">
                  {spin.results.map((result, index) => (
                    <p key={index}>{result}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="reset-button mt-8" onClick={startNewGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SlotGame;