'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaBell, FaCog, FaVolumeDown } from 'react-icons/fa';
import { BreathingCircle } from './BreathingCircle';
import { QuoteDisplay } from './QuoteDisplay';

export function MeditationTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedTime, setSelectedTime] = useState(5);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showBreakMessage, setShowBreakMessage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    showDesktopNotification: false,
    playSound: true,
    vibrate: true,
    customMessage: 'Time for a mindful break! 🌿',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume at 50%
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Initialize audio elements on component mount
  useEffect(() => {
    audioRef.current = new Audio('/ambient-meditation.mp3');
    bellRef.current = new Audio('/meditation-bell.mp3');
    
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (bellRef.current) {
        bellRef.current.pause();
        bellRef.current = null;
      }
    };
  }, []);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  const showNotification = () => {
    if (notificationsEnabled) {
      // Desktop notification
      if (notificationSettings.showDesktopNotification) {
        const notification = new Notification('Meditation Complete', {
          body: notificationSettings.customMessage,
          icon: '/meditation-icon.png',
          silent: true,
        });
        setTimeout(() => notification.close(), 5000);
      }

      // Vibration
      if (notificationSettings.vibrate && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Stop ambient music if playing
      if (isMusicPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
      // Play bell sound and show notifications
      if (bellRef.current) {
        bellRef.current.play().catch((error) => {
          console.log('Bell sound not available:', error);
          if ('vibrate' in navigator) {
            navigator.vibrate(200);
          }
        });
        // Stop bell sound after 5 seconds
        setTimeout(() => {
          if (bellRef.current) {
            bellRef.current.pause();
            bellRef.current.currentTime = 0;
          }
        }, 5000);
      }
      showNotification();
      setShowBreakMessage(true);
      setTimeout(() => setShowBreakMessage(false), 5000);
    }

    return () => {
      clearInterval(interval);
      // Clean up bell sound if component unmounts during playing
      if (bellRef.current) {
        bellRef.current.pause();
        bellRef.current.currentTime = 0;
      }
    };
  }, [isActive, timeLeft, isMusicPlaying, isPaused, notificationsEnabled]);

  const startMeditation = () => {
    if (selectedTime <= 0) return;
    setTimeLeft(selectedTime * 60);
    setIsActive(true);
    setIsPaused(false);
    setShowBreakMessage(false);
  };

  const pauseMeditation = () => {
    setIsPaused(!isPaused);
  };

  const stopMeditation = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(0);
    setShowBreakMessage(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isActive) return; // Prevent changing time while active
    setSelectedTime(value);
    
    // Update slider background
    if (sliderRef.current) {
      const percentage = ((value - 1) / (60 - 1)) * 100;
      sliderRef.current.style.background = `linear-gradient(to right, rgb(255 255 255 / 0.3) ${percentage}%, rgb(255 255 255 / 0.1) ${percentage}%)`;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute size={20} />;
    if (volume < 0.5) return <FaVolumeDown size={20} />;
    return <FaVolumeUp size={20} />;
  };

  return (
    <div className="relative flex flex-col items-center gap-8 p-12 rounded-3xl bg-gradient-to-br from-purple-50/10 to-blue-50/10 backdrop-blur-lg shadow-xl border border-white/10 max-w-md w-full transition-all duration-500 hover:shadow-2xl">
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl p-8 z-50 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between text-white/80">
              Desktop Notifications
              <input
                type="checkbox"
                checked={notificationSettings.showDesktopNotification}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  showDesktopNotification: e.target.checked
                }))}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-white/80">
              Sound
              <input
                type="checkbox"
                checked={notificationSettings.playSound}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  playSound: e.target.checked
                }))}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-white/80">
              Vibration
              <input
                type="checkbox"
                checked={notificationSettings.vibrate}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  vibrate: e.target.checked
                }))}
                className="w-4 h-4"
              />
            </label>

            <div className="space-y-2">
              <label className="block text-white/80">Custom Message</label>
              <input
                type="text"
                value={notificationSettings.customMessage}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  customMessage: e.target.value
                }))}
                className="w-full px-3 py-2 bg-white/10 rounded-lg text-white border border-white/20 focus:outline-none focus:border-white/40"
                placeholder="Enter custom message..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Move notification controls to top right */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!notificationsEnabled ? (
          <button
            onClick={requestNotificationPermission}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white relative group"
            aria-label="Enable notifications"
          >
            <FaBell size={16} />
            <span className="absolute -top-8 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Enable notifications
            </span>
          </button>
        ) : (
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white relative group"
            aria-label="Notification settings"
          >
            <FaCog size={16} />
            <span className="absolute -top-8 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Notification settings
            </span>
          </button>
        )}
      </div>

      {/* Break Message */}
      {showBreakMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white/90 animate-fade-in">
          Time for a mindful break! 🌿
        </div>
      )}

      {/* Replace the static quote with QuoteDisplay */}
      <QuoteDisplay />

      {/* Add Breathing Circle when meditation is active */}
      {isActive && <BreathingCircle />}

      {/* Timer Display */}
      <div className="text-7xl font-light tracking-wider text-white/90 transition-all duration-300 transform hover:scale-105">
        {formatTime(timeLeft)}
      </div>
      
      {/* Timer Selection */}
      <div className="w-full space-y-6">
        {/* Quick Select Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {[5, 10, 15, 20].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setSelectedTime(mins);
                if (sliderRef.current) {
                  const percentage = ((mins - 1) / (60 - 1)) * 100;
                  sliderRef.current.value = mins.toString();
                  sliderRef.current.style.background = `linear-gradient(to right, rgb(255 255 255 / 0.3) ${percentage}%, rgb(255 255 255 / 0.1) ${percentage}%)`;
                }
              }}
              className={`px-5 py-2.5 rounded-full transition-all duration-300 ${
                selectedTime === mins 
                  ? 'bg-white/20 text-white shadow-lg scale-105' 
                  : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Custom Slider */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-white/80 text-sm px-1">
            <span>{selectedTime} minutes</span>
            <span>60 min</span>
          </div>
          <div className="relative w-full">
            <input
              ref={sliderRef}
              type="range"
              min="1"
              max="60"
              value={selectedTime}
              onChange={handleTimeChange}
              className="w-full h-2 rounded-full appearance-none cursor-pointer
                bg-white/10 
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-110
                
                [&::-moz-range-thumb]:appearance-none
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:hover:scale-110"
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6 items-center mt-4">
        {/* Volume Control */}
        <div className="relative group">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white relative"
            aria-label="Volume control"
          >
            {getVolumeIcon()}
          </button>

          {/* Volume Slider */}
          <div 
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 rounded-lg p-3 transition-all duration-300
              ${showVolumeSlider ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform translate-y-2'}
            `}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-110
                
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:hover:scale-110"
            />
            <div className="text-white/80 text-xs text-center mt-1">
              {Math.round(volume * 100)}%
            </div>
          </div>
        </div>

        {/* Music Toggle Button */}
        <button
          onClick={toggleMusic}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white relative group"
          aria-label="Toggle background music"
        >
          {isMusicPlaying ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isMusicPlaying ? 'Mute sound' : 'Play sound'}
          </span>
        </button>

        {!isActive ? (
          <button
            onClick={startMeditation}
            className="p-6 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white group"
          >
            <FaPlay size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={pauseMeditation}
              className="p-6 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white group"
            >
              {isPaused ? (
                <FaPlay size={24} className="group-hover:scale-110 transition-transform" />
              ) : (
                <FaPause size={24} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
            <button
              onClick={stopMeditation}
              className="p-6 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white group"
            >
              <FaStop size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isActive && (
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className={`bg-white/30 h-full rounded-full transition-all duration-300 ${isPaused ? 'opacity-50' : ''}`}
            style={{ width: `${Math.min((timeLeft / (selectedTime * 60)) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
} 