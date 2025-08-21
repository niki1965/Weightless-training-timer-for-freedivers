import { save as saveToStore, load as loadFromStore } from './store.js';
import { validateSession, updateValidationUI } from './validate.js';

let currentEditingField = '';

// Modal functions
export function openTimeModal(fieldId, title) {
  currentEditingField = fieldId;
  document.getElementById('timeModalTitle').textContent = title;
  
  // Parse current value (format: "1m 00s")
  const currentValue = document.getElementById(fieldId).textContent;
  const match = currentValue.match(/(\d+)m\s*(\d+)s/);
  if (match) {
    document.getElementById('timeMinutes').value = parseInt(match[1]);
    document.getElementById('timeSeconds').value = parseInt(match[2]);
  }
  
  document.getElementById('timeModal').style.display = 'flex';
}

export function openSecondsModal(fieldId, title) {
  currentEditingField = fieldId;
  document.getElementById('secondsModalTitle').textContent = title;
  
  // Parse current value
  const currentValue = document.getElementById(fieldId).textContent;
  const match = currentValue.match(/(\d+)/);
  if (match) {
    document.getElementById('secondsInput').value = parseInt(match[1]);
  }
  
  document.getElementById('secondsModal').style.display = 'flex';
}

export function openRoundsModal(fieldId, title) {
  currentEditingField = fieldId;
  document.getElementById('roundsModalTitle').textContent = title;
  
  // Parse current value
  const currentValue = document.getElementById(fieldId).textContent;
  document.getElementById('roundsInput').value = parseInt(currentValue);
  
  document.getElementById('roundsModal').style.display = 'flex';
}

export function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Save functions
export function saveTime() {
  const minutes = document.getElementById('timeMinutes').value;
  const seconds = document.getElementById('timeSeconds').value;
  const formattedTime = `${minutes}m ${seconds.padStart(2, '0')}s`;
  
  document.getElementById(currentEditingField).textContent = formattedTime;
  closeModal('timeModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

export function saveSeconds() {
  const seconds = document.getElementById('secondsInput').value;
  const formattedSeconds = `${seconds} sec`;
  
  document.getElementById(currentEditingField).textContent = formattedSeconds;
  closeModal('secondsModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

export function saveRounds() {
  const rounds = document.getElementById('roundsInput').value;
  
  document.getElementById(currentEditingField).textContent = rounds;
  closeModal('roundsModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

// Validation function
function validateCurrentSettings() {
  // Get values from input fields
  const holdTime = document.getElementById('holdTime').textContent;
  const breathStart = document.getElementById('breathStart').textContent;
  const decreaseTime = document.getElementById('decreaseTime').textContent;
  const totalRounds = document.getElementById('totalRounds').textContent;
  
  // Parse the values
  const holdMatch = holdTime.match(/(\d+)m\s*(\d+)s/);
  const breathMatch = breathStart.match(/(\d+)m\s*(\d+)s/);
  const decreaseMatch = decreaseTime.match(/(\d+)/);
  const rounds = parseInt(totalRounds);
  
  if (!holdMatch || !breathMatch || !decreaseMatch) {
    console.error('Invalid input format');
    return { ok: false, errors: {} };
  }
  
  const holdSec = parseInt(holdMatch[1]) * 60 + parseInt(holdMatch[2]);
  const breatheSec = parseInt(breathMatch[1]) * 60 + parseInt(breathMatch[2]);
  const decreaseSec = parseInt(decreaseMatch[1]);
  
  // Validate the configuration
  const validation = validateSession({ breatheSec, holdSec, decreaseSec, rounds });
  
  // Clear all error states
  clearAllErrors();
  
  // Show errors if any
  if (!validation.ok) {
    showValidationErrors(validation.errors);
  }
  
  return validation;
}

// Clear all error messages
function clearAllErrors() {
  const errorAreas = ['holdTimeError', 'breathStartError', 'decreaseTimeError', 'totalRoundsError'];
  const editLines = ['holdTime', 'breathStart', 'decreaseTime', 'totalRounds'];
  
  errorAreas.forEach(id => {
    const errorArea = document.getElementById(id);
    if (errorArea) {
      errorArea.classList.remove('show');
    }
  });
  
  editLines.forEach(id => {
    const editLine = document.getElementById(id).closest('.edit-line');
    if (editLine) {
      editLine.classList.remove('error');
    }
  });
}

// Show validation errors
function showValidationErrors(errors) {
  Object.keys(errors).forEach(key => {
    let fieldId;
    switch(key) {
      case 'breatheSec': fieldId = 'breathStart'; break;
      case 'holdSec': fieldId = 'holdTime'; break;
      case 'decreaseSec': fieldId = 'decreaseTime'; break;
      case 'rounds': fieldId = 'totalRounds'; break;
    }
    
    if (fieldId) {
      const editLine = document.getElementById(fieldId).closest('.edit-line');
      const errorArea = document.getElementById(fieldId + 'Error');
      const errorText = errorArea.querySelector('.error-text');
      
      if (editLine && errorArea && errorText) {
        editLine.classList.add('error');
        errorText.textContent = errors[key];
        errorArea.classList.add('show');
      }
    }
  });
}

export async function saveSettings() {
  // Validate current settings
  const validation = validateCurrentSettings();
  
  if (!validation.ok) {
    console.log('유효성 검사 실패:', validation.errors);
    return;
  }
  
  // Get values from input fields
  const holdTime = document.getElementById('holdTime').textContent;
  const breathStart = document.getElementById('breathStart').textContent;
  const decreaseTime = document.getElementById('decreaseTime').textContent;
  const totalRounds = document.getElementById('totalRounds').textContent;
  
  // Parse the values
  const holdMatch = holdTime.match(/(\d+)m\s*(\d+)s/);
  const breathMatch = breathStart.match(/(\d+)m\s*(\d+)s/);
  const decreaseMatch = decreaseTime.match(/(\d+)/);
  const rounds = parseInt(totalRounds);
  
  const holdSec = parseInt(holdMatch[1]) * 60 + parseInt(holdMatch[2]);
  const breatheSec = parseInt(breathMatch[1]) * 60 + parseInt(breathMatch[2]);
  const decreaseSec = parseInt(decreaseMatch[1]);
  
  // Save to store
  const config = {
    breatheSec,
    holdSec,
    decreaseSec,
    rounds
  };
  
  saveToStore(config);
  console.log('Settings saved:', config);
  
  // Navigate to main page
  window.location.href = '/';
}

// Event listeners
export function initializeEditPage() {
  // Load current configuration and populate fields
  const config = loadFromStore();
  console.log('Loading config for edit page:', config);
  
  // Populate input fields with current values
  const holdMinutes = Math.floor(config.holdSec / 60);
  const holdSeconds = config.holdSec % 60;
  document.getElementById('holdTime').textContent = `${holdMinutes}m ${holdSeconds.toString().padStart(2, '0')}s`;
  
  const breatheMinutes = Math.floor(config.breatheSec / 60);
  const breatheSeconds = config.breatheSec % 60;
  document.getElementById('breathStart').textContent = `${breatheMinutes}m ${breatheSeconds.toString().padStart(2, '0')}s`;
  
  document.getElementById('decreaseTime').textContent = `${config.decreaseSec} sec`;
  document.getElementById('totalRounds').textContent = config.rounds;
  
  // Close modal when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.style.display = 'none';
    }
  });

  // Handle Enter key in modals
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const activeModal = document.querySelector('.modal-overlay[style*="flex"]');
      if (activeModal) {
        if (activeModal.id === 'timeModal') {
          saveTime();
        } else if (activeModal.id === 'secondsModal') {
          saveSeconds();
        } else if (activeModal.id === 'roundsModal') {
          saveRounds();
        }
      }
    }
  });

  // Run initial validation
  validateCurrentSettings();
  
  // Initial setup complete
  console.log('Edit page initialized');
}
