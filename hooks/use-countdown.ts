"use client";
import { useState, useEffect, useRef } from "react";

export const COUNTDOWN_DURATION = 60;
const STORAGE_KEYS = {
  startTime: "countdownStartTime",
  isNewClicked: "isNewClicked",
};

const useCountdown = () => {
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [isNewClicked, setIsNewClicked] = useState(false);
  const hasInitialized = useRef(false); 

  useEffect(() => {
    const savedClicked = localStorage.getItem(STORAGE_KEYS.isNewClicked);
    const savedStart = localStorage.getItem(STORAGE_KEYS.startTime);

    if (savedClicked === "true" && savedStart) {
      const startTime = parseInt(savedStart, 10);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = COUNTDOWN_DURATION - elapsed;

      if (remaining > 0) {
        setCountdown(remaining);
        setIsNewClicked(true);
      } else {
        localStorage.removeItem(STORAGE_KEYS.startTime);
        localStorage.removeItem(STORAGE_KEYS.isNewClicked);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isNewClicked) {
      if (!hasInitialized.current) {
        const alreadyExists = localStorage.getItem(STORAGE_KEYS.startTime);
        if (!alreadyExists) {
          localStorage.setItem(STORAGE_KEYS.startTime, Date.now().toString());
          localStorage.setItem(STORAGE_KEYS.isNewClicked, "true");
        }
        hasInitialized.current = true;
      }

      intervalId = setInterval(() => {
        const startTime = parseInt(localStorage.getItem(STORAGE_KEYS.startTime) || "0", 10);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = COUNTDOWN_DURATION - elapsed;

        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          clearInterval(intervalId);
          localStorage.removeItem(STORAGE_KEYS.startTime);
          localStorage.removeItem(STORAGE_KEYS.isNewClicked);
          setIsNewClicked(false);
          setCountdown(COUNTDOWN_DURATION);
          hasInitialized.current = false;
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isNewClicked]);

  return { isNewClicked, setIsNewClicked, countdown };
};

export default useCountdown;
