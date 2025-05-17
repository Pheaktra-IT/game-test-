// src/SlotGame.js
import React, { useState, useEffect } from "react";
import symbolsData from "./data.json";
import { type } from "@testing-library/user-event/dist/type";
import "./styles.css";

const SlotGame = () => {
  const [users] = useState(symbolsData.users);
  const [Typerewards] = useState(symbolsData.Typereward);
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
  const [currentSpinSlots, setCurrentSpinSlots] = useState(6);
  const [showRewards, setShowRewards] = useState(false);
  const [showRewardsButton, setShowRewardsButton] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [spinInterval, setSpinInterval] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isColumnSpinning, setIsColumnSpinning] = useState(false);

  // Initialize slots with placeholder values
  useEffect(() => {
    if (!isInitialized) {
      setSlots(Array(10).fill({ id: 0, name: "Placeholder", phone: "855 XXXXXXXXX" }));
      setIsInitialized(true);
    }
  }, [isInitialized]);

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
        return {
          type: "First Reward",
          columnIndex: 6
        };
      case 1:
        return {
          type: "Second Reward",
          columnIndex: 3
        };
      case 2:
        return {
          type: "Big Reward",
          columnIndex: 1
        };
      default:
        return {
          type: "No Reward",
          columnIndex: 0
        };
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

  // Helper to get number of columns for each spin
  const getSpinColumns = () => {
    switch (spinCount) {
      case 0: return 6;
      case 1: return 3;
      case 2: return 1;
      default: return 0;
    }
  };

  // Spins a single column and stops after a short time
  const spinColumn = (columnIndex) => {
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots];
          newSlots[columnIndex] = users[Math.floor(Math.random() * users.length)];
          return newSlots;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        // Pick the final user for this column
        setSlots((prevSlots) => {
          const newSlots = [...prevSlots];
          newSlots[columnIndex] = users[Math.floor(Math.random() * users.length)];
          return newSlots;
        });
        resolve(columnIndex);
      }, 1200 + Math.random() * 800); // Randomize stop time a bit
    });
  };

  // Spins all columns for the current spin
  const spinAllColumns = async () => {
    const columns = getSpinColumns();
    const spinResults = [];
    for (let i = 0; i < columns; i++) {
      await spinColumn(currentSlot + i);
      // Assign reward
      let reward;
      if (spinCount === 0 && smallRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * smallRewards.length);
        reward = smallRewards[randomIndex];
        setSmallRewards((prev) => prev.filter((_, idx) => idx !== randomIndex));
      } else if (spinCount === 1 && mediumRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * mediumRewards.length);
        reward = mediumRewards[randomIndex];
        setMediumRewards((prev) => prev.filter((_, idx) => idx !== randomIndex));
      } else if (spinCount === 2 && largeRewards.length > 0) {
        const randomIndex = Math.floor(Math.random() * largeRewards.length);
        reward = largeRewards[randomIndex];
        setLargeRewards((prev) => prev.filter((_, idx) => idx !== randomIndex));
      } else {
        reward = { name: "Default Reward" };
      }
      const user = slots[currentSlot + i];
      spinResults.push({ user, reward });
    }
    setCurrentResults(spinResults);
    return spinResults;
  };

  const spin = () => {
    if (isSpinning || spinCount >= 3) return;

    setIsSpinning(true);
    setShowNext(false);
    setShowRewardsButton(false);
    setCurrentResults([]);
    // Spin all columns
    spinAllColumns().then((spinResults) => {
      // Save results
      const rewardType = getRewardType(spinCount + 1);
      const spinRecord = {
        spinNumber: spinCount + 1,
        slots: getSpinColumns(),
        startSlot: currentSlot + 1,
        endSlot: currentSlot + getSpinColumns(),
        results: spinResults,
        rewardType: rewardType,
      };

      setHistory((prev) => [...prev, spinRecord]);
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
      setIsSpinning(false);
    });
  };

  const nextSpin = () => {
    setShowNext(false);
    setStartDisabled(false);
    setCurrentSlot((prev) => prev + getSpinColumns());
    setCurrentResults([]);
    setAllSpins((prev) => [...prev, ...completedSpins]);
    setCompletedSpins([]);
    setCurrentSpinSlots(getSpinColumns());
  };

  const startSpin = async () => {
    if (isSpinning || spinCount >= 3) return;
    setIsSpinning(true);
    setShowNext(false);
    setShowRewardsButton(false);
    setCurrentResults([]);
    // Spin all columns
    const spinResults = await spinAllColumns();
    // Save results
    const rewardType = getRewardType(spinCount + 1);
    const spinRecord = {
      spinNumber: spinCount + 1,
      slots: getSpinColumns(),
      startSlot: currentSlot + 1,
      endSlot: currentSlot + getSpinColumns(),
      results: spinResults,
      rewardType: rewardType,
    };
    setHistory((prev) => [...prev, spinRecord]);
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
    setIsSpinning(false);
  };

  const closeWinnerPopup = () => {
    setShowWinnerPopup(false);
    setCurrentWinner(null);
  };

  const visibleSlots = slots.slice(currentSlot, currentSlot + currentSpinSlots);

  return (
    <>
      {showWinnerPopup && currentWinner && (
        <div className="winner-popup-overlay">
          <div className="winner-popup">
            <div className="winner-header">
              <h2 className="winner-title">Winner!</h2>
              <div className="winner-type">{getSpinSlots().type}</div>
            </div>
            <div className="winner-card">
              <div className="winner-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="winner-details">
                <div className="winner-info">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{currentWinner.user?.name || "Unknown User"}</span>
                </div>
                <div className="winner-info">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{currentWinner.user?.phone || "Unknown Phone"}</span>
                </div>
                <div className="winner-info">
                  <span className="info-label">Reward:</span>
                  <span className="info-value reward-name">{currentWinner.reward?.name || "No reward"}</span>
                </div>
              </div>
            </div>
            <button
              className="close-popup-button"
              onClick={closeWinnerPopup}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <div className="grid">

      </div>
      <div className="slot-game-container">
        {!showRewards ? (
          <>
            <div className="type-reward">
              <h1 className="text-5xl font-bold mb-8 text-center">
                {getSpinSlots().type}
              </h1>
              <div className="reward-types flex justify-around mb-8">
                {(Typerewards || []).map((reward, index) => (
                  <div
                    key={index}
                    className="reward-type"
                    style={{ backgroundColor: reward.color }}
                  >
                    <span className="reward-icon">{reward.icon}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="slots">
              {visibleSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`slot ${isSpinning ? "spinning" : ""}`}
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
                  {/* Remove Stop Spin button since stopSpin is not defined */}
                  {/* 
                  <button
                    className="stop-button bg-red-500 text-white p-2 rounded-md"
                    onClick={stopSpin}
                    disabled={!isSpinning}
                  >
                    Stop Spin
                  </button>
                  */}
                  <div className="start">
                    <button
                      className="start-button"
                      onClick={startSpin}
                      disabled={
                        isSpinning || startDisabled || spinCount >= 3
                      }
                    >
                      Start
                    </button>
                  </div>
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
                  style={{ borderColor: spin.rewardType?.color || "#ccc" }}
                >
                  <div
                    className="reward-header flex"

                  >

                    <h3 className="w-full text-2xl font-semibold  text-center mb-2 mt-2">
                      {spin.rewardType?.type || "Unknown Reward Type"}
                    </h3>
                  </div>
                  <div className="reward-details flex">
                    {(spin.results || []).map((result, index) => (
                      <>
                        <div key={index} className="reward-item">
                          <p className="reward-user">
                            <strong>{result.user?.name || "Unknown User"}</strong>{" "}
                            ({result.user?.phone || "Unknown Phone"})
                            <br />
                            <p>
                              Reward:{" "}
                              {result.reward?.name || "No reward"}
                            </p>
                          </p>
                        </div>
                      </>

                    )) || <p>No results available</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default SlotGame;
