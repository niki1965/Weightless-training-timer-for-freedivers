// Validation function
export function validateSession({ breatheSec, holdSec, decreaseSec, rounds }) {
  const errors = {};
  
  // 1) No negative values
  if (breatheSec < 0) errors.breatheSec = 'First breath time cannot be negative.';
  if (holdSec < 0) errors.holdSec = 'Hold time cannot be negative.';
  if (decreaseSec < 0) errors.decreaseSec = 'Decrease seconds cannot be negative.';
  if (rounds < 1 || rounds > 10) errors.rounds = 'Rounds must be between 1 and 10.';

  // 2) Core constraint: Last round's breath time should not become negative
  if (breatheSec - (rounds - 1) * decreaseSec < 0) {
    errors.decreaseSec = 'Decrease amount is too large, making the last round breath time negative.';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

// Parse time string to seconds
export function parseTimeToSeconds(timeStr) {
  if (timeStr.includes('m') && timeStr.includes('s')) {
    // Format: "1m 00s"
    const match = timeStr.match(/(\d+)m\s*(\d+)s/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
  } else if (timeStr.includes('sec')) {
    // Format: "10 sec"
    const match = timeStr.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return 0;
}

// Update validation UI
export function updateValidationUI() {
  // Get current values
  const holdTime = parseTimeToSeconds(document.getElementById('holdTime').textContent);
  const breathStart = parseTimeToSeconds(document.getElementById('breathStart').textContent);
  const decreaseTime = parseTimeToSeconds(document.getElementById('decreaseTime').textContent);
  const totalRounds = parseInt(document.getElementById('totalRounds').textContent);

  // Validate
  const validation = validateSession({
    breatheSec: breathStart,
    holdSec: holdTime,
    decreaseSec: decreaseTime,
    rounds: totalRounds
  });

  // Clear all error states
  const fields = ['holdTime', 'breathStart', 'decreaseTime', 'totalRounds'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');
    if (field && errorDiv) {
      field.classList.remove('error');
      errorDiv.style.display = 'none';
      const errorText = errorDiv.querySelector('.error-text');
      if (errorText) {
        errorText.textContent = '';
      }
    }
  });

  // Show errors if any
  if (!validation.ok) {
    Object.keys(validation.errors).forEach(key => {
      let fieldId;
      switch(key) {
        case 'breatheSec': fieldId = 'breathStart'; break;
        case 'holdSec': fieldId = 'holdTime'; break;
        case 'decreaseSec': fieldId = 'decreaseTime'; break;
        case 'rounds': fieldId = 'totalRounds'; break;
      }
      
      if (fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        if (field && errorDiv) {
          field.classList.add('error');
          errorDiv.style.display = 'block';
          const errorText = errorDiv.querySelector('.error-text');
          if (errorText) {
            errorText.textContent = validation.errors[key];
          }
        }
      }
    });
  }

  // Update save button state
  const saveBtn = document.querySelector('.save-btn');
  if (validation.ok) {
    saveBtn.classList.remove('disabled');
  } else {
    saveBtn.classList.add('disabled');
  }

  return validation.ok;
}
