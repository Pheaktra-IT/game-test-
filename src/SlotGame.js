// src/SlotGame.js
import React, { useState, useEffect } from "react";
import symbolsData from "./data.json";

const SlotGame = () => {
  const [users] = useState(symbolsData.users);
  const [Typerewards] = useState(symbolsData.Typereward); // Correct key
  const [smallRewards, setSmallRewards] = useState(
    symbolsData["Type-reward"]["Small-Reward"]
  );
  const [mediumRewards, setMediumRewards] = useState(
    symbolsData["Type-reward"]["Medium-Reward"]
  );
  const [largeRewards, setLargeRewards] = useState(
    symbolsData["Type-reward"]["Large-Reward"]
  );
  const [slots, setSlots] = useState(
    Array(10).fill({ id: 0, name: "Placeholder", phone: "855 XXXXXXXXX" })
  );
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

  // Load history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("slotGameHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("slotGameHistory", JSON.stringify(history));
  }, [history]);

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
          type: "Small Reward",
        };
      case 2:
        return {
          type: "Medium Reward",
        };
      case 3:
        return {
          type: "Big Reward",
        };
      default:
        return {
          type: "Reward",
        };
    }
  };

  const spinColumn = (columnIndex) => {
    return new Promise((resolve) => {
      const spinInterval = setInterval(() => {
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots];
          newSlots[columnIndex] =
            users[Math.floor(Math.random() * users.length)]; // Assign a random user
          return newSlots;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(spinInterval);
        const result = users[Math.floor(Math.random() * users.length)];
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots];
          newSlots[columnIndex] = result; // Assign the final user
          return newSlots;
        });
        resolve(result);
      }, 3000); // Duration for each column to spin
    });
  };

  const spinAllColumns = async () => {
    const spinResults = [];

    for (let i = currentSlot; i < currentSlot + currentSpinSlots; i++) {
      const result = await spinColumn(i); // Wait for the current column to finish spinning
      spinResults.push(result);

      // Assign a random reward based on the spin count
      let reward;
      if (spinCount === 0 && smallRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * smallRewards.length);
        reward = smallRewards[randomIndex]; // Get a random small reward
        setSmallRewards((prev) => prev.filter((_, idx) => idx !== randomIndex)); // Remove the assigned reward
      } else if (spinCount === 1 && mediumRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediumRewards.length);
        reward = mediumRewards[randomIndex]; // Get a random medium reward
        setMediumRewards((prev) => prev.filter((_, idx) => idx !== randomIndex)); // Remove the assigned reward
      } else if (spinCount === 2 && largeRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * largeRewards.length);
        reward = largeRewards[randomIndex]; // Get a random large reward
        setLargeRewards((prev) => prev.filter((_, idx) => idx !== randomIndex)); // Remove the assigned reward
      } else {
        reward = { name: "No reward available" }; // Fallback reward if no rewards are left
      }

      // Update the current results state to show only the current column's reward
      setCurrentResults([{ user: result, reward }]);

      // Introduce a delay before spinning the next column
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
    }

    return spinResults;
  };

  const spin = () => {
    if (isSpinning || spinCount >= 3) return;

    setIsSpinning(true);
    setShowNext(false);
    setShowRewardsButton(false);

    spinAllColumns().then((spinResults) => {
      setCurrentResults(spinResults);
      setIsSpinning(false);

      const rewardType = getRewardType(spinCount + 1);
      const spinRecord = {
        spinNumber: spinCount + 1,
        slots: currentSpinSlots,
        startSlot: currentSlot + 1,
        endSlot: currentSlot + currentSpinSlots,
        results: spinResults || [], // Ensure results is always an array
        rewardType: rewardType,
      };

      setHistory((prev) => [...prev, spinRecord]); // Save spin record to history
      setCompletedSpins((prev) => [...prev, spinRecord]);

      const newSpinCount = spinCount + 1;
      setSpinCount(newSpinCount);

      if (newSpinCount >= 3) {
        setAllSpins((prev) => [...prev, ...completedSpins, spinRecord]);
        setCompletedSpins([]);
        setShowRewardsButton(true);
      } else {
        setShowNext(true);
      }
    });
  };

  const nextSpin = () => {
    setShowNext(false);
    setStartDisabled(false);
    setCurrentSlot((prev) => prev + currentSpinSlots);
    setCurrentResults([]);
    // Move completed spins to allSpins when clicking Next
    setAllSpins((prev) => [...prev, ...completedSpins]);
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
    setSlots([
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
      "855 XXXXXXXXX",
    ]);
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
    localStorage.removeItem("slotGameHistory"); // Clear local storage
  };

  const visibleSlots = slots.slice(currentSlot, currentSlot + currentSpinSlots);

  return (
    <div className="slot-game w-screen ">
      {!showRewards ? (
        <>
          <div className="type-reward ">
            <h1 className="text-5xl font-bold mb-8 text-center">
              Spin the Wheel
            </h1>
            {/* Rewards Section */}
            <div className="rewards">
              {currentResults.length > 0 && (
                <div className="reward-card">
                  <p className="reward-text">
                    Congratulation You Won:{currentResults[0].reward?.name}
                  </p>
                </div>
              )}
            </div>
            <div className="reward-types flex justify-around mb-8">
              {(Typerewards || []).map((reward, index) => (
                <div
                  key={index}
                  className="reward-type"
                  style={{ backgroundColor: reward.color }}
                >
                  <span className="reward-icon">{reward.icon}</span>
                  <p className="text-white">
                    Congratulation!You won:{reward.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="slots">
            {visibleSlots.map((slot, index) => (
              <div 
                key={index} 
                className={`slot ${isSpinning ? 'spinning' : ''}`}
              >
                <div className="slot-content">
                  <p className="slot-icon text-sm">{slot.name}</p>
                  {slot.phone}
                </div>
              </div>
            ))}
          </div>

          <div className="buttons">
            {!showSummary && (
              <>
                {!showNext && !showRewardsButton && (
                  <>
                    <button
                      className="stop-button bg-red-500 text-white p-2 rounded-md"
                      onClick={stopSpin}
                      disabled={!isSpinning}
                    >
                      Stop Spin
                    </button>
                    <div className="start">
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
                  <button className="next-button" onClick={nextSpin}>
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
          <h1 className="text-5xl font-bold ">Game Rewards</h1>
          <div className="rewards-container">
            {(allSpins || []).map((spin, index) => (
              <div
                key={index}
                className="reward-card"
                style={{ borderColor: spin.rewardType.color }}
              >
                <div
                  className="reward-header flex"
                  style={{ backgroundColor: spin.rewardType.color }}
                >
                  <span className="reward-icon flex">
                    {spin.rewardType.icon}
                  </span>
                  <h3 className="text-xl font-semibold mb-8">
                    {spin.rewardType.type}
                  </h3>
                </div>
                <div className="reward-details flex">
                  {spin.results?.map((result, index) => (
                    <p key={index}>
                      {result.user.name} ({result.user.phone}) -{" "}
                      {result.reward?.name || "No reward"}
                    </p>
                  )) || <p>No results available</p>}
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
