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
  const breatheTimeEl = document.getElementById('breathe-time');
  const holdTimeEl = document.getElementById('hold-time');

  // Debug: Check if all required elements exist
  console.log('DOM Elements check:');
  console.log('countdownEl:', countdownEl);
  console.log('currentRoundEl:', currentRoundEl);
  console.log('totalRoundEl:', totalRoundEl);
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
  function initializeRunningPanel() {
    console.log('Initializing running panel...');
    
    // Update round display
    if (currentRoundEl) {
      currentRoundEl.textContent = currentRound;
      console.log('Updated current round to:', currentRound);
    }
    
    // Get first round data and set initial display
    const roundData = trainingData[currentRound - 1];
    let breatheTime = roundData.breathe;
    let holdTime = roundData.hold;
    
    console.log('First round data:', roundData);
    
    // Set initial time displays
    if (breatheTimeEl) {
      breatheTimeEl.textContent = formatTime(breatheTime);
      breatheTimeEl.classList.remove('breathe-warning');
    }
    if (holdTimeEl) {
      holdTimeEl.textContent = formatTime(holdTime);
      holdTimeEl.classList.remove('hold-decreasing');
    }
  }

  function startTraining() {
    console.log('Starting training...');
    isTraining = true;
    currentRound = 1;
    
    // Update total round display for running panel
    if (totalRoundEl) {
      totalRoundEl.textContent = `/${trainingData.length}`;
      console.log('Total rounds:', trainingData.length);
    } else {
      console.error('totalRoundEl is null!');
    }
    
    // Hide start screen panels and show training screen
    console.log('Hiding start screen panels...');
    collapsedPanel.style.display = 'none';
    expandedPanel.style.display = 'none';
    
    // Show training screen with ready info and running panel
    console.log('Showing training screen...');
    trainingScreen.style.display = 'block';
    readyInfo.style.display = 'flex';
    runningPanel.style.display = 'flex';
    
    // Set initial message for first round
    const readyText = document.querySelector('.ready-text');
    if (readyText) {
      readyText.textContent = 'Round 1 starts soon.';
    }
    
    // Trigger avatar float-up animation when ready-info appears
    const mainAvatar = document.querySelector('.main-avatar');
    if (mainAvatar) {
      mainAvatar.classList.add('float-up');
    }
    
    // Initialize running panel with first round data
    initializeRunningPanel();
    
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
        // Countdown 완료 후 바로 breathe 타이머 시작
        startRound();
      }
    }, 1000);
  }

  function startRound() {
    console.log('Starting round:', currentRound);
    
    // Hide ready info but keep running panel visible
    console.log('Hiding ready info...');
    readyInfo.style.display = 'none';
    
    // Update round display
    if (currentRoundEl) {
      currentRoundEl.textContent = currentRound;
      console.log('Updated current round to:', currentRound);
    }
    
    // Get current round data and start breathe phase
    const roundData = trainingData[currentRound - 1];
    console.log('Round data:', roundData);
    
    // Start breathe phase
    startBreathePhase(roundData.breathe);
  }

  function startBreathePhase(duration) {
    console.log('Starting breathe phase with duration:', duration);
    currentBreatheTime = duration;
    if (breatheTimeEl) {
      breatheTimeEl.textContent = formatTime(currentBreatheTime);
      // Remove warning class from breathe time
      breatheTimeEl.classList.remove('breathe-warning');
    }
    
    // Set hold time to fixed value for this round
    const roundData = trainingData[currentRound - 1];
    if (holdTimeEl) {
      holdTimeEl.textContent = formatTime(roundData.hold);
      // Remove any warning classes
      holdTimeEl.classList.remove('hold-decreasing');
    }
    
    // Show "Breathe gently. The round has begun." message for rounds 2 and above
    if (currentRound >= 2) {
      showBreatheGentlyMessage();
    }
    
    // Trigger avatar bounce-down animation when breathe timer starts
    const mainAvatar = document.querySelector('.main-avatar');
    if (mainAvatar) {
      mainAvatar.classList.remove('float-up');
      mainAvatar.classList.add('bounce-down');
    }
    
    breatheInterval = setInterval(() => {
      currentBreatheTime--;
      if (breatheTimeEl) {
        breatheTimeEl.textContent = formatTime(currentBreatheTime);
      }
      console.log('Breathe time remaining:', currentBreatheTime);
      
      // Show "Get ready to hold." message and countdown 3 seconds before breathe ends
      if (currentBreatheTime === 3) {
        showGetReadyToHold();
      }
      
      if (currentBreatheTime <= 0) {
        clearInterval(breatheInterval);
        startHoldPhase(trainingData[currentRound - 1].hold);
      }
    }, 1000);
  }

  function showBreatheGentlyMessage() {
    console.log('Showing "Breathe gently. The round has begun." message');
    
    // Show ready info with "Breathe gently. The round has begun." message
    readyInfo.style.display = 'flex';
    
    // Update the ready text
    const readyText = document.querySelector('.ready-text');
    if (readyText) {
      readyText.textContent = 'Breathe gently. The round has begun.';
    }
    
    // Hide countdown for this message
    if (countdownEl) {
      countdownEl.style.display = 'none';
    }
    
    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      readyInfo.style.display = 'none';
      // Show countdown again for future use
      if (countdownEl) {
        countdownEl.style.display = 'block';
      }
    }, 3000);
  }

  function showGetReadyToBreathe() {
    console.log('Showing "Get ready to breathe." message');
    
    // Show ready info with "Get ready to breathe." message
    readyInfo.style.display = 'flex';
    
    // Update the ready text based on whether this is the final round
    const readyText = document.querySelector('.ready-text');
    if (readyText) {
      if (currentRound >= trainingData.length) {
        // This is the final round
        readyText.textContent = 'The final round is closing.';
      } else {
        // This is not the final round
        readyText.textContent = 'Get ready to breathe.';
      }
    }
    
    // Show countdown for this message
    if (countdownEl) {
      countdownEl.style.display = 'block';
    }
    
    // Start 3-second countdown
    let count = 3;
    if (countdownEl) {
      countdownEl.textContent = count;
    }
    
    // Clear any existing countdown interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
      count--;
      if (countdownEl) {
        countdownEl.textContent = count;
      }
      console.log('Get ready to breathe countdown:', count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        // Countdown will continue to 0, then next round will start automatically
      }
    }, 1000);
  }

  function showGetReadyToHold() {
    console.log('Showing "Get ready to hold." message');
    
    // Show ready info with "Get ready to hold." message
    readyInfo.style.display = 'flex';
    
    // Update the ready text
    const readyText = document.querySelector('.ready-text');
    if (readyText) {
      readyText.textContent = 'Get ready to hold.';
    }
    
    // Show countdown for this message
    if (countdownEl) {
      countdownEl.style.display = 'block';
    }
    
    // Start 3-second countdown
    let count = 3;
    if (countdownEl) {
      countdownEl.textContent = count;
    }
    
    // Clear any existing countdown interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
      count--;
      if (countdownEl) {
        countdownEl.textContent = count;
      }
      console.log('Get ready countdown:', count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        // Countdown will continue to 0, then hold phase will start automatically
      }
    }, 1000);
  }

  function startHoldPhase(duration) {
    // Hide ready info when hold phase starts
    readyInfo.style.display = 'none';
    
    currentHoldTime = duration;
    if (holdTimeEl) {
      holdTimeEl.textContent = formatTime(currentHoldTime);
      // Add hold-decreasing class when hold phase starts (hold time is decreasing)
      holdTimeEl.classList.add('hold-decreasing');
      console.log('Hold phase started - added hold-decreasing class');
    }
    if (breatheTimeEl) {
      // Add breathe-warning class when hold phase starts (breathe time is paused)
      breatheTimeEl.classList.add('breathe-warning');
      console.log('Hold phase started - added breathe-warning class');
    }
    
    holdInterval = setInterval(() => {
      currentHoldTime--;
      if (holdTimeEl) {
        holdTimeEl.textContent = formatTime(currentHoldTime);
        // Keep the hold-decreasing class throughout the hold phase
      }
      
      // Show "Get ready to breathe." message 3 seconds before hold ends
      if (currentHoldTime === 3) {
        showGetReadyToBreathe();
      }
      
      if (currentHoldTime <= 0) {
        clearInterval(holdInterval);
        // Remove decreasing class when hold phase ends
        if (holdTimeEl) {
          holdTimeEl.classList.remove('hold-decreasing');
        }
        // Remove warning class from breathe time
        if (breatheTimeEl) {
          breatheTimeEl.classList.remove('breathe-warning');
        }
        nextRound();
      }
    }, 1000);
  }

  function nextRound() {
    currentRound++;
    
    // Hide ready info when moving to next round
    readyInfo.style.display = 'none';
    
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
      // If we're in the "Get ready to hold." phase (breathe time <= 3), show the message
      if (currentBreatheTime <= 3) {
        showGetReadyToHold();
      }
      startBreathePhase(currentBreatheTime);
    } else if (currentHoldTime > 0) {
      // If we're in the "Get ready to breathe." phase (hold time <= 3), show the message
      if (currentHoldTime <= 3) {
        showGetReadyToBreathe();
      }
      // Add classes when resuming hold phase
      if (holdTimeEl) {
        holdTimeEl.classList.add('hold-decreasing');
      }
      if (breatheTimeEl) {
        breatheTimeEl.classList.add('breathe-warning');
      }
      startHoldPhase(currentHoldTime);
    }
  }

  function stopTraining() {
    console.log('Stopping training...');
    
    // Don't allow stopping if completion screen is active
    if (window.completionScreenActive) {
      console.log('Cannot stop training while completion screen is active');
      return;
    }
    
    isTraining = false;
    isPaused = false;
    
    // Clear all intervals
    if (countdownInterval) clearInterval(countdownInterval);
    if (breatheInterval) clearInterval(breatheInterval);
    if (holdInterval) clearInterval(holdInterval);
    
    // Reset hold time styling
    if (holdTimeEl) {
      holdTimeEl.classList.remove('hold-decreasing');
    }
    // Reset breathe time styling
    if (breatheTimeEl) {
      breatheTimeEl.classList.remove('breathe-warning');
    }
    
    // Reset avatar animations
    const mainAvatar = document.querySelector('.main-avatar');
    if (mainAvatar) {
      mainAvatar.classList.remove('float-up', 'bounce-down');
    }
    
    // Hide training screen and show start screen
    console.log('Hiding training screen and showing start screen...');
    trainingScreen.style.display = 'none';
    runningPanel.style.display = 'none';
    readyInfo.style.display = 'none';
    
    // Show start screen (collapsed panel)
    collapsedPanel.style.display = 'flex';
    
    // Reset pause button
    pauseBtn.textContent = 'Pause';
    
    // Reset countdown display
    if (countdownEl) {
      countdownEl.style.display = 'block';
      countdownEl.textContent = '3';
    }
    
    // Reset ready text
    const readyText = document.querySelector('.ready-text');
    if (readyText) {
      readyText.textContent = 'Round 1 starts soon.';
    }
  }

  function completeTraining() {
    console.log('Training completed!');
    isTraining = false;
    
    // Hide training screen and show completion screen
    trainingScreen.style.display = 'none';
    showCompletionScreen();
  }

  function showCompletionScreen() {
    const completionScreen = document.getElementById('completion-screen');
    const completionDate = document.getElementById('completion-date');
    const completionTime = document.getElementById('completion-time');
    const completionTableBody = document.getElementById('completion-table-body');
    
    // Set current date and time
    const now = new Date();
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    
    completionDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    completionTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    
    // Populate completion table with training data
    completionTableBody.innerHTML = '';
    trainingData.forEach((round, index) => {
      const row = document.createElement('div');
      row.className = 'completion-table-row';
      row.innerHTML = `
        <div class="completion-table-cell">${index + 1}</div>
        <div class="completion-table-cell">${formatTime(round.breathe)}</div>
        <div class="completion-table-cell">${formatTime(round.hold)}</div>
      `;
      completionTableBody.appendChild(row);
    });
    
    // Adjust download image area height based on number of rows
    const downloadImageArea = document.querySelector('.download-image-area');
    const tableRows = completionTableBody.querySelectorAll('.completion-table-row');
    
    // Calculate total height needed
    const headerHeight = 130; // Completion header height
    const tableHeaderHeight = 40; // Table header height
    const rowHeight = 35; // Approximate row height
    const totalHeight = headerHeight + tableHeaderHeight + (tableRows.length * rowHeight);
    
    // Set minimum and maximum heights for the entire download image area
    const minHeight = 350;
    const maxHeight = 600;
    const adjustedHeight = Math.max(minHeight, Math.min(maxHeight, totalHeight));
    
    if (downloadImageArea) {
      downloadImageArea.style.height = `${adjustedHeight}px`;
    }
    
    // Show completion screen
    completionScreen.style.display = 'flex';
    
    // Prevent any automatic navigation or screen changes
    // Set a flag to indicate completion screen is active
    window.completionScreenActive = true;
    
    // Add event listeners for completion screen buttons (remove existing ones first)
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const saveAsImageBtn = document.getElementById('save-as-image-btn');
    
    // Remove existing event listeners
    backToStartBtn.replaceWith(backToStartBtn.cloneNode(true));
    saveAsImageBtn.replaceWith(saveAsImageBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newBackToStartBtn = document.getElementById('back-to-start-btn');
    const newSaveAsImageBtn = document.getElementById('save-as-image-btn');
    
    newBackToStartBtn.addEventListener('click', function() {
      hideCompletionScreen();
      showMainScreen();
    });
    
    newSaveAsImageBtn.addEventListener('click', function() {
      saveCompletionAsImage();
    });
    
    // Prevent clicks on overlay from closing the screen
    const overlay = document.querySelector('.completion-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        e.stopPropagation();
        // Do nothing - prevent closing
      });
    }
    
    // Prevent escape key from closing the screen
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && window.completionScreenActive) {
        e.preventDefault();
        e.stopPropagation();
        // Do nothing - prevent closing
      }
    });
  }

  function hideCompletionScreen() {
    const completionScreen = document.getElementById('completion-screen');
    completionScreen.style.display = 'none';
    
    // Clear the completion screen active flag
    window.completionScreenActive = false;
  }

  function showMainScreen() {
    // Show start screen (collapsed panel)
    collapsedPanel.style.display = 'flex';
    
    // Reset avatar animations
    const mainAvatar = document.querySelector('.main-avatar');
    if (mainAvatar) {
      mainAvatar.classList.remove('float-up', 'bounce-down');
    }
    
    // Reset ready text and countdown
    const readyText = document.querySelector('.ready-text');
    const countdown = document.getElementById('countdown');
    if (readyText) {
      readyText.textContent = 'Round 1 starts soon.';
    }
    if (countdown) {
      countdown.textContent = '3';
      countdown.style.color = '#E9DCC7';
      countdown.style.display = 'block';
    }
  }

  function saveCompletionAsImage() {
    const downloadArea = document.querySelector('.download-image-area');
    
    // Use html2canvas to capture the download area as an image
    if (typeof html2canvas !== 'undefined') {
      html2canvas(downloadArea, {
        backgroundColor: '#0F1F6C',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `weightless-training-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      });
    } else {
      // Fallback: try to use the browser's native screenshot API
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' } })
          .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0);
              stream.getTracks().forEach(track => track.stop());
              
              canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `weightless-training-${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }, 'image/png');
            };
            video.play();
          })
          .catch(err => {
            console.error('Error capturing screen:', err);
            alert('Unable to save image. Please try taking a screenshot manually.');
          });
      } else {
        alert('Unable to save image. Please try taking a screenshot manually.');
      }
    }
  }


};


