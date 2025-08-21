document.addEventListener('DOMContentLoaded', function() {
  // Import store functions
  import('./store.js').then(({ load }) => {
    // Load saved configuration
    const config = load();
    console.log('Loaded config:', config);
    
    // Generate training data based on configuration
    const trainingData = generateTrainingData(config);
    
    // Update UI with loaded data
    updateUIWithConfig(config, trainingData);
    
    // Initialize the rest of the functionality
    initializeMainPage(trainingData);
  });
});

function generateTrainingData(config) {
  const { breatheSec, holdSec, decreaseSec, rounds } = config;
  const trainingData = [];
  
  for (let i = 0; i < rounds; i++) {
    const currentBreatheSec = Math.max(breatheSec - (i * decreaseSec), 10); // Minimum 10 seconds
    trainingData.push({
      breathe: currentBreatheSec,
      hold: holdSec
    });
  }
  
  return trainingData;
}

function updateUIWithConfig(config, trainingData) {
  const { breatheSec, holdSec, decreaseSec, rounds } = config;
  
  // Update collapsed panel
  updateCollapsedPanel(config, trainingData);
  
  // Update expanded panel
  updateExpandedPanel(config, trainingData);
}

function updateCollapsedPanel(config, trainingData) {
  const { rounds, decreaseSec } = config;
  
  console.log('Updating collapsed panel with config:', config);
  console.log('Training data:', trainingData);
  
  // Update round count
  const roundCountElements = document.querySelectorAll('.round-count');
  roundCountElements.forEach(el => {
    el.textContent = `${rounds} Round`;
  });
  
  // Update round time
  const roundTimeElements = document.querySelectorAll('.round-time');
  roundTimeElements.forEach(el => {
    el.textContent = `-${decreaseSec}s per round`;
  });
  
  // Update time data (show first round values)
  const firstRound = trainingData[0];
  console.log('First round data:', firstRound);
  
  const timeElements = document.querySelectorAll('.time-item .time');
  timeElements.forEach((el, index) => {
    if (index === 0) { // Breathe time
      el.textContent = formatTime(firstRound.breathe);
      console.log(`Updated breathe time to: ${formatTime(firstRound.breathe)}`);
    } else if (index === 1) { // Hold time
      el.textContent = formatTime(firstRound.hold);
      console.log(`Updated hold time to: ${formatTime(firstRound.hold)}`);
    } else if (index === 2) { // Total time
      const totalTimeFormatted = formatTotalTime(calculateTotalTime(trainingData));
      el.textContent = totalTimeFormatted;
      console.log(`Updated total time to: ${totalTimeFormatted}`);
    }
  });
}

function calculateTotalTime(trainingData) {
  let totalSeconds = 0;
  trainingData.forEach(round => {
    totalSeconds += round.breathe + round.hold;
  });
  return totalSeconds;
}

function updateExpandedPanel(config, trainingData) {
  const { rounds, decreaseSec } = config;
  
  // Update round count and time
  const roundCountElements = document.querySelectorAll('#session-panel-expanded .round-count');
  roundCountElements.forEach(el => {
    el.textContent = `${rounds} Round`;
  });
  
  const roundTimeElements = document.querySelectorAll('#session-panel-expanded .round-time');
  roundTimeElements.forEach(el => {
    el.textContent = `-${decreaseSec}s per round`;
  });
  
  // Update table
  updateTable(trainingData);
  
  // Update total time
  updateTotalTime(trainingData);
}

function updateTotalTime(trainingData) {
  // Calculate total time by summing all breathe and hold times
  const totalSeconds = calculateTotalTime(trainingData);
  
  // Format total time
  const totalTimeFormatted = formatTotalTime(totalSeconds);
  
  // Update the display
  const totalTimeDisplay = document.getElementById('total-time-display');
  if (totalTimeDisplay) {
    totalTimeDisplay.textContent = totalTimeFormatted;
  }
}

function formatTotalTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function updateTable(trainingData) {
  const table = document.querySelector('#session-panel-expanded .table');
  
  // Clear existing rows (except header)
  const existingRows = table.querySelectorAll('.table-row');
  existingRows.forEach(row => row.remove());
  
  // Add new rows
  trainingData.forEach((round, index) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div class="cell">${index + 1}</div>
      <div class="cell">${formatTime(round.breathe)}</div>
      <div class="cell">${formatTime(round.hold)}</div>
    `;
    table.appendChild(row);
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function initializeMainPage(trainingData) {
  // DOM Elements
  const collapsedPanel = document.getElementById('session-panel-collapsed');
  const expandedPanel = document.getElementById('session-panel-expanded');
  const trainingScreen = document.getElementById('training-screen');
  const readyInfo = document.getElementById('ready-info');
  const runningPanel = document.getElementById('running-panel');
  
  const expandBtn = document.getElementById('expand-btn');
  const collapseBtn = document.getElementById('collapse-btn');
  const startBtns = document.querySelectorAll('.start-btn');
  const stopBtn = document.querySelector('.stop-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  
  const countdownEl = document.getElementById('countdown');
  const currentRoundEl = document.getElementById('current-round');
  const totalRoundEl = document.getElementById('total-round');
  const timeLeftEl = document.getElementById('time-left');
  const breatheTimeEl = document.getElementById('breathe-time');
  const holdTimeEl = document.getElementById('hold-time');

  // Debug: Check if all required elements exist
  console.log('DOM Elements check:');
  console.log('countdownEl:', countdownEl);
  console.log('currentRoundEl:', currentRoundEl);
  console.log('totalRoundEl:', totalRoundEl);
  console.log('timeLeftEl:', timeLeftEl);
  console.log('breatheTimeEl:', breatheTimeEl);
  console.log('holdTimeEl:', holdTimeEl);

  // Training state
  let isTraining = false;
  let isPaused = false;
  let currentRound = 1;
  let countdownInterval;
  let breatheInterval;
  let holdInterval;
  let currentBreatheTime = 0;
  let currentHoldTime = 0;

  // Expand/Collapse functionality
  expandBtn.addEventListener('click', function() {
    collapsedPanel.style.display = 'none';
    expandedPanel.style.display = 'flex';
  });

  collapseBtn.addEventListener('click', function() {
    expandedPanel.style.display = 'none';
    collapsedPanel.style.display = 'flex';
  });

  // Start Training functionality
  startBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      startTraining();
    });
  });

  // Stop Training functionality
  stopBtn.addEventListener('click', function() {
    stopTraining();
  });

  // Pause Training functionality
  pauseBtn.addEventListener('click', function() {
    if (isPaused) {
      resumeTraining();
    } else {
      pauseTraining();
    }
  });

  // Header buttons
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const editBtns = document.querySelectorAll('.edit-btn');
  
  console.log('Found edit buttons:', editBtns.length);

  let isSoundOn = true;

  // Only add event listener if hamburger button exists
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function() {
      console.log('Hamburger menu clicked');
    });
  }

  soundBtn.addEventListener('click', function() {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
      soundIcon.src = 'icn/SoundOn.svg';
      soundIcon.alt = 'Sound On';
    } else {
      soundIcon.src = 'icn/SoundOff.svg';
      soundIcon.alt = 'Sound Off';
    }
    console.log('Sound toggled:', isSoundOn ? 'On' : 'Off');
  });

  editBtns.forEach((btn, index) => {
    console.log(`Adding click listener to edit button ${index + 1}`);
    btn.addEventListener('click', function() {
      console.log('Edit clicked');
      window.location.href = '/pages/edit.html';
    });
  });

  // Training Functions
  function startTraining() {
    console.log('Starting training...');
    isTraining = true;
    currentRound = 1;
    
    // Update total round display
    if (totalRoundEl) {
      totalRoundEl.textContent = `/${trainingData.length}`;
      console.log('Total rounds:', trainingData.length);
    } else {
      console.error('totalRoundEl is null!');
    }
    
    // Hide all panels and show training screen
    collapsedPanel.style.display = 'none';
    expandedPanel.style.display = 'none';
    trainingScreen.style.display = 'block';
    readyInfo.style.display = 'flex';
    runningPanel.style.display = 'none';
    
    // Start 3-second countdown
    startCountdown();
  }

  function startCountdown() {
    console.log('Starting countdown...');
    let count = 3;
    if (countdownEl) {
      countdownEl.textContent = count;
    }
    
    countdownInterval = setInterval(() => {
      count--;
      if (countdownEl) {
        countdownEl.textContent = count;
      }
      console.log('Countdown:', count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        startRound();
      }
    }, 1000);
  }

  function startRound() {
    console.log('Starting round:', currentRound);
    // Hide ready info and show running panel
    readyInfo.style.display = 'none';
    runningPanel.style.display = 'flex';
    
    // Update round display
    if (currentRoundEl) {
      currentRoundEl.textContent = currentRound;
    }
    
    // Get current round data
    const roundData = trainingData[currentRound - 1];
    let breatheTime = roundData.breathe;
    let holdTime = roundData.hold;
    
    console.log('Round data:', roundData);
    
    // Update time left
    updateTimeLeft();
    
    // Start breathe phase
    startBreathePhase(breatheTime);
  }

  function startBreathePhase(duration) {
    console.log('Starting breathe phase with duration:', duration);
    currentBreatheTime = duration;
    if (breatheTimeEl) {
      breatheTimeEl.textContent = formatTime(currentBreatheTime);
    }
    
    breatheInterval = setInterval(() => {
      currentBreatheTime--;
      if (breatheTimeEl) {
        breatheTimeEl.textContent = formatTime(currentBreatheTime);
      }
      console.log('Breathe time remaining:', currentBreatheTime);
      
      // Update time left every second
      updateTimeLeft();
      
      if (currentBreatheTime <= 0) {
        clearInterval(breatheInterval);
        startHoldPhase(trainingData[currentRound - 1].hold);
      }
    }, 1000);
  }

  function startHoldPhase(duration) {
    currentHoldTime = duration;
    if (holdTimeEl) {
      holdTimeEl.textContent = formatTime(currentHoldTime);
    }
    
    holdInterval = setInterval(() => {
      currentHoldTime--;
      if (holdTimeEl) {
        holdTimeEl.textContent = formatTime(currentHoldTime);
      }
      
      // Update time left every second
      updateTimeLeft();
      
      if (currentHoldTime <= 0) {
        clearInterval(holdInterval);
        nextRound();
      }
    }, 1000);
  }

  function nextRound() {
    currentRound++;
    
    if (currentRound <= trainingData.length) {
      // Start next round
      startRound();
    } else {
      // Training complete
      completeTraining();
    }
  }

  function pauseTraining() {
    isPaused = true;
    pauseBtn.textContent = 'Resume';
    
    // Clear intervals
    if (countdownInterval) clearInterval(countdownInterval);
    if (breatheInterval) clearInterval(breatheInterval);
    if (holdInterval) clearInterval(holdInterval);
  }

  function resumeTraining() {
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    
    // Resume current phase based on which timer is active
    if (currentBreatheTime > 0) {
      startBreathePhase(currentBreatheTime);
    } else if (currentHoldTime > 0) {
      startHoldPhase(currentHoldTime);
    }
  }

  function stopTraining() {
    isTraining = false;
    isPaused = false;
    
    // Clear all intervals
    if (countdownInterval) clearInterval(countdownInterval);
    if (breatheInterval) clearInterval(breatheInterval);
    if (holdInterval) clearInterval(holdInterval);
    
    // Reset to main screen
    trainingScreen.style.display = 'none';
    collapsedPanel.style.display = 'flex';
    
    // Reset pause button
    pauseBtn.textContent = 'Pause';
  }

  function completeTraining() {
    isTraining = false;
    
    // Show completion message
    readyInfo.style.display = 'flex';
    runningPanel.style.display = 'none';
    
    const readyText = document.querySelector('.ready-text');
    const countdown = document.getElementById('countdown');
    
    readyText.textContent = 'Training Complete!';
    countdown.textContent = '✓';
    countdown.style.color = '#4CAF50';
    
    // Auto return to main screen after 3 seconds
    setTimeout(() => {
      trainingScreen.style.display = 'none';
      collapsedPanel.style.display = 'flex';
      
      // Reset
      readyText.textContent = 'Round 1 starts soon.';
      countdown.textContent = '3';
      countdown.style.color = '#E9DCC7';
    }, 3000);
  }

  function updateTimeLeft() {
    let totalSeconds = 0;
    
    // Calculate remaining time for all rounds
    for (let i = currentRound - 1; i < trainingData.length; i++) {
      totalSeconds += trainingData[i].breathe + trainingData[i].hold;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (timeLeftEl) {
      timeLeftEl.textContent = `${minutes}m ${seconds}s left`;
    }
  }
};


