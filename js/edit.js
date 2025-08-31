import { save as saveToStore, load as loadFromStore } from './store.js';
import { validateSession, updateValidationUI } from './validate.js';

let currentEditingField = '';
let currentModalType = '';

// 미리 정의된 스크롤 민감도 레벨
const SCROLL_SENSITIVITY_LEVELS = {
  VERY_SLOW: 0.2,    // 매우 느림
  SLOW: 0.3,         // 느림 (권장)
  NORMAL: 0.5,       // 기본
  FAST: 0.8,         // 빠름
  VERY_FAST: 1.2     // 매우 빠름
};

// 현재 사용할 민감도 레벨 선택 (여기서 변경하세요!)
let scrollSensitivity = SCROLL_SENSITIVITY_LEVELS.VERY_FAST;

// Scroll sensitivity control functions
export function setScrollSensitivity(value) {
  // Clamp value between 0.1 and 2.0
  scrollSensitivity = Math.max(0.1, Math.min(2.0, value));
  console.log('Scroll sensitivity set to:', scrollSensitivity);
}

export function getScrollSensitivity() {
  return scrollSensitivity;
}

export function increaseScrollSensitivity() {
  const newValue = Math.min(2.0, scrollSensitivity + 0.1);
  setScrollSensitivity(newValue);
  return newValue;
}

export function decreaseScrollSensitivity() {
  const newValue = Math.max(0.1, scrollSensitivity - 0.1);
  setScrollSensitivity(newValue);
  return newValue;
}

export function resetScrollSensitivity() {
  setScrollSensitivity(0.5);
  return 0.5;
}

// Modal functions
export function openTimeModal(fieldId, title) {
  console.log('openTimeModal called with:', fieldId, title);
  currentEditingField = fieldId;
  currentModalType = 'time';
  document.getElementById('timeModalTitle').textContent = title;
  
  // Parse current value (format: "1m 00s")
  const currentValue = document.getElementById(fieldId).textContent;
  const match = currentValue.match(/(\d+)m\s*(\d+)s/);
  let minutes = 1, seconds = 0; // 기본값
  if (match) {
    minutes = parseInt(match[1]);
    seconds = parseInt(match[2]);
  }
  
  const timeModal = document.getElementById('timeModal');
  console.log('timeModal element:', timeModal);
  if (timeModal) {
    timeModal.style.display = 'flex';
    console.log('timeModal display set to flex');
  } else {
    console.error('timeModal element not found');
  }
  
  // Add event listeners for this modal
  addTimePickerEventListenersForModal('timeModal');
  
  // DOM 레이아웃이 준비된 후 초기 선택 스크롤 설정
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const modal = document.getElementById('timeModal');
      setInitialScrollPosition(modal, minutes, seconds);
    });
  });
}

export function openBreathingStartModal(fieldId, title) {
  console.log('openBreathingStartModal called with:', fieldId, title);
  currentEditingField = fieldId;
  currentModalType = 'breathingStart';
  document.getElementById('breathingStartModalTitle').textContent = title;
  
  // Parse current value (format: "2m 00s")
  const currentValue = document.getElementById(fieldId).textContent;
  const match = currentValue.match(/(\d+)m\s*(\d+)s/);
  let minutes = 2, seconds = 0; // 기본값
  if (match) {
    minutes = parseInt(match[1]);
    seconds = parseInt(match[2]);
  }
  
  const breathingStartModal = document.getElementById('breathingStartModal');
  console.log('breathingStartModal element:', breathingStartModal);
  if (breathingStartModal) {
    breathingStartModal.style.display = 'flex';
    console.log('breathingStartModal display set to flex');
  } else {
    console.error('breathingStartModal element not found');
  }
  
  // Add event listeners for this modal
  addTimePickerEventListenersForModal('breathingStartModal');
  
  // DOM 레이아웃이 준비된 후 초기 선택 스크롤 설정
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const modal = document.getElementById('breathingStartModal');
      setInitialScrollPosition(modal, minutes, seconds);
    });
  });
}

export function openSecondsModal(fieldId, title) {
  currentEditingField = fieldId;
  currentModalType = 'seconds';
  document.getElementById('secondsModalTitle').textContent = title;
  
  // Parse current value
  const currentValue = document.getElementById(fieldId).textContent;
  const match = currentValue.match(/(\d+)/);
  let seconds = 10; // 기본값
  if (match) {
    seconds = parseInt(match[1]);
  }
  
  document.getElementById('secondsModal').style.display = 'flex';
  
  // Add event listeners for this modal
  addTimePickerEventListenersForModal('secondsModal');
  
  // DOM 레이아웃이 준비된 후 초기 선택 스크롤 설정
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const modal = document.getElementById('secondsModal');
      setInitialScrollPositionSingle(modal, seconds, false);
    });
  });
}

export function openRoundsModal(fieldId, title) {
  currentEditingField = fieldId;
  currentModalType = 'rounds';
  document.getElementById('roundsModalTitle').textContent = title;
  
  // Parse current value
  const currentValue = document.getElementById(fieldId).textContent;
  let rounds = 8; // 기본값
  if (currentValue && !isNaN(parseInt(currentValue))) {
    rounds = parseInt(currentValue);
  }
  
  document.getElementById('roundsModal').style.display = 'flex';
  
  // Add event listeners for this modal
  addTimePickerEventListenersForModal('roundsModal');
  
  // DOM 레이아웃이 준비된 후 초기 선택 스크롤 설정
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const modal = document.getElementById('roundsModal');
      setInitialScrollPositionSingle(modal, rounds, true);
    });
  });
}

export function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// 기존 피커 선택 함수들은 새로운 유틸리티로 대체됨

// 새로운 피커 선택 값 획득 함수들 (getClosestIndex와 유틸리티 사용)
function getTimePickerSelection(modalId) {
  const modal = document.getElementById(modalId);
  
  const minutesArea = modal.querySelector('.minutes-area');
  const secondsArea = modal.querySelector('.seconds-area');
  
  let selectedMinutes = 0;
  let selectedSeconds = 0;
  
  if (minutesArea) {
    const minutesIndex = getClosestIndex(minutesArea);
    const minutesItems = minutesArea.querySelectorAll('.time-picker-item:not(.picker-spacer)');
    if (minutesItems[minutesIndex]) {
      selectedMinutes = parseInt(minutesItems[minutesIndex].dataset.value) || 0;
    }
  }
  
  if (secondsArea) {
    const secondsIndex = getClosestIndex(secondsArea);
    const secondsItems = secondsArea.querySelectorAll('.time-picker-item:not(.picker-spacer)');
    if (secondsItems[secondsIndex]) {
      selectedSeconds = parseInt(secondsItems[secondsIndex].dataset.value) || 0;
    }
  }
  
  return { minutes: selectedMinutes, seconds: selectedSeconds };
}

function getSecondsPickerSelection(modalId) {
  const modal = document.getElementById(modalId);
  const pickerArea = modal.querySelector('.single-picker-area');
  
  if (!pickerArea) return 10;
  
  const index = getClosestIndex(pickerArea);
  const items = pickerArea.querySelectorAll('.time-picker-item:not(.picker-spacer)');
  
  if (items[index]) {
    return parseInt(items[index].dataset.value) || 10;
  }
  
  return 10;
}

function getRoundsPickerSelection(modalId) {
  const modal = document.getElementById(modalId);
  const pickerArea = modal.querySelector('.single-picker-area');
  
  if (!pickerArea) return 8;
  
  const index = getClosestIndex(pickerArea);
  const items = pickerArea.querySelectorAll('.rounds-picker-item:not(.picker-spacer)');
  
  if (items[index]) {
    return parseInt(items[index].dataset.value) || 8;
  }
  
  return 8;
}

// Save functions
export function saveTime() {
  const { minutes, seconds } = getTimePickerSelection('timeModal');
  const formattedTime = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  
  document.getElementById(currentEditingField).textContent = formattedTime;
  closeModal('timeModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

export function saveBreathingStart() {
  const { minutes, seconds } = getTimePickerSelection('breathingStartModal');
  const formattedTime = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  
  document.getElementById(currentEditingField).textContent = formattedTime;
  closeModal('breathingStartModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

export function saveSeconds() {
  const seconds = getSecondsPickerSelection('secondsModal');
  const formattedSeconds = `${seconds} sec`;
  
  document.getElementById(currentEditingField).textContent = formattedSeconds;
  closeModal('secondsModal');
  
  // Trigger validation after saving
  setTimeout(() => {
    validateCurrentSettings();
  }, 100);
}

export function saveRounds() {
  const rounds = getRoundsPickerSelection('roundsModal');
  
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
  window.location.href = '../index.html';
}

// Event listeners
export function initializeEditPage() {
  // Load current configuration and populate fields
  const config = loadFromStore();
  console.log('Loading config for edit page:', config);
  
  // Populate input fields with current values
  // For hold time and breathing start, clamp minutes to 0-3 range
  let holdMinutes = Math.floor(config.holdSec / 60);
  let holdSeconds = config.holdSec % 60;
  
  // If holdMinutes exceeds 3, adjust to maximum allowed
  if (holdMinutes > 3) {
    holdMinutes = 3;
    holdSeconds = 55; // Set to maximum seconds within 3 minutes
  }
  
  document.getElementById('holdTime').textContent = `${holdMinutes}m ${holdSeconds.toString().padStart(2, '0')}s`;
  
  let breatheMinutes = Math.floor(config.breatheSec / 60);
  let breatheSeconds = config.breatheSec % 60;
  
  // If breatheMinutes exceeds 3, adjust to maximum allowed
  if (breatheMinutes > 3) {
    breatheMinutes = 3;
    breatheSeconds = 55; // Set to maximum seconds within 3 minutes
  }
  
  document.getElementById('breathStart').textContent = `${breatheMinutes}m ${breatheSeconds.toString().padStart(2, '0')}s`;
  
  document.getElementById('decreaseTime').textContent = `${config.decreaseSec} sec`;
  document.getElementById('totalRounds').textContent = config.rounds;
  
  // Add event listeners for time picker items
  addTimePickerEventListeners();
  
  // Add event listeners to all existing modals
  ['timeModal', 'breathingStartModal', 'secondsModal', 'roundsModal'].forEach(modalId => {
    addTimePickerEventListenersForModal(modalId);
  });
  
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
        } else if (activeModal.id === 'breathingStartModal') {
          saveBreathingStart();
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

// Add event listeners for time picker items
function addTimePickerEventListeners() {
  // Add scroll event listeners for time pickers
  document.querySelectorAll('.minutes-area, .seconds-area, .single-picker-area').forEach(area => {
    area.addEventListener('scroll', function() {
      updateSelectionVisual(this);
    });
  });

  // 기존 클릭 이벤트 리스너는 제거 - 새로운 터치/클릭 시스템 사용
  // 각 피커 영역은 initPickerArea에서 초기화됨
}

// Add event listeners for a specific modal
function addTimePickerEventListenersForModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.log('Modal not found:', modalId);
    return;
  }

  console.log('Adding event listeners for modal:', modalId);

  // 피커 영역들을 새로운 유틸리티로 초기화
  const scrollAreas = modal.querySelectorAll('.minutes-area, .seconds-area, .single-picker-area');
  console.log('Found scroll areas:', scrollAreas.length);
  
  scrollAreas.forEach((area, index) => {
    console.log(`Area ${index}:`, area.className, 'scrollHeight:', area.scrollHeight, 'clientHeight:', area.clientHeight);
    
    // 새로운 피커 유틸리티로 초기화
    initPickerArea(area);
  });

  // picker:change 이벤트 리스너 추가
  scrollAreas.forEach((area) => {
    area.addEventListener('picker:change', function(e) {
      console.log('Picker changed:', e.detail);
      // 스냅 완료 후 검증 수행 (모달이 열려있을 때만)
      const modalElement = document.getElementById(modalId);
      if (modalElement && modalElement.style.display === 'flex') {
        setTimeout(() => {
          validateCurrentSettings();
        }, 150);
      }
    });
  });

  // 기존 클릭 이벤트 리스너는 제거 - 새로운 터치/클릭 시스템 사용
  // 각 피커 영역은 initPickerArea에서 초기화됨
}

// 기존 스크롤 이벤트 핸들러는 새로운 유틸리티에 통합됨

// 네이티브 스크롤 사용으로 제거됨 - handleWheelEvent

// ===== 피커 유틸리티 함수들 =====

// 초기 스크롤 위치 설정 (타임 피커용, 스페이서 제외)
function setInitialScrollPosition(modal, minutes, seconds) {
  const minutesArea = modal.querySelector('.minutes-area');
  const secondsArea = modal.querySelector('.seconds-area');
  
  if (minutesArea) {
    const minutesItems = minutesArea.querySelectorAll('.time-picker-item:not(.picker-spacer)');
    minutesItems.forEach((item, index) => {
      if (parseInt(item.dataset.value) === minutes) {
        item.scrollIntoView({ block: 'center', behavior: 'auto' });
        return;
      }
    });
  }
  
  if (secondsArea) {
    const secondsItems = secondsArea.querySelectorAll('.time-picker-item:not(.picker-spacer)');
    let closestIndex = 0;
    let minDiff = Infinity;
    
    secondsItems.forEach((item, index) => {
      const itemSeconds = parseInt(item.dataset.value);
      const diff = Math.abs(itemSeconds - seconds);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });
    
    if (secondsItems[closestIndex]) {
      secondsItems[closestIndex].scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }
}

// 초기 스크롤 위치 설정 (단일 피커용, 스페이서 제외)
function setInitialScrollPositionSingle(modal, value, isRounds = false) {
  const pickerArea = modal.querySelector('.single-picker-area');
  if (!pickerArea) return;
  
  const items = pickerArea.querySelectorAll(isRounds ? '.rounds-picker-item:not(.picker-spacer)' : '.time-picker-item:not(.picker-spacer)');
  items.forEach((item, index) => {
    if (parseInt(item.dataset.value) === value) {
      item.scrollIntoView({ block: 'center', behavior: 'auto' });
      return;
    }
  });
}

// 피커 영역 초기화
function initPickerArea(areaEl) {
  if (!areaEl) return;
  
  console.log('Initializing picker area:', areaEl.className);
  
  // 스크롤 이벤트 리스너 추가 (디바운스 적용)
  let scrollTimeout;
  areaEl.removeEventListener('scroll', handleScrollWithDebounce);
  areaEl.addEventListener('scroll', handleScrollWithDebounce, { passive: true });
  
  function handleScrollWithDebounce() {
    updateSelectionVisual(areaEl);
    
    // 스크롤 멈춤 감지 (디바운스 100ms)
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      snapToClosest(areaEl);
    }, 100);
  }
  
  // 터치/마우스 인터랙션 제어 변수들
  let isDragging = false;
  let startY = 0;
  let startTime = 0;
  let hasMoved = false;
  const DRAG_THRESHOLD = 10; // 픽셀 이동 임계값
  const CLICK_THRESHOLD = 200; // 클릭으로 간주할 시간 임계값 (ms)
  
  // 포인터 다운 이벤트
  areaEl.addEventListener('pointerdown', function(e) {
    isDragging = false;
    hasMoved = false;
    startY = e.clientY;
    startTime = Date.now();
    
    // 드래그 상태 표시
    areaEl.setAttribute('data-dragging', 'true');
  }, { passive: true });
  
  // 포인터 무브 이벤트 (드래그 감지)
  areaEl.addEventListener('pointermove', function(e) {
    if (startY !== 0) {
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaY > DRAG_THRESHOLD) {
        hasMoved = true;
        isDragging = true;
      }
    }
  }, { passive: true });
  
  // 포인터 업 이벤트
  areaEl.addEventListener('pointerup', function(e) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 드래그 상태 제거
    areaEl.removeAttribute('data-dragging');
    
    // 클릭으로 간주할 조건: 짧은 시간 + 이동 거리 적음
    if (duration < CLICK_THRESHOLD && !hasMoved) {
      // 클릭 이벤트 처리
      handleDirectClick(e, areaEl);
    } else if (isDragging) {
      // 드래그 후 스냅
      setTimeout(() => snapToClosest(areaEl), 50);
    }
    
    // 상태 초기화
    isDragging = false;
    startY = 0;
    startTime = 0;
    hasMoved = false;
  }, { passive: true });
  
  // 포인터 캔슬 이벤트
  areaEl.addEventListener('pointercancel', function(e) {
    areaEl.removeAttribute('data-dragging');
    isDragging = false;
    startY = 0;
    startTime = 0;
    hasMoved = false;
    
    if (isDragging) {
      setTimeout(() => snapToClosest(areaEl), 50);
    }
  }, { passive: true });
}

// 영역 중앙과 가장 가까운 아이템 인덱스 반환 (스페이서 제외)
function getClosestIndex(areaEl) {
  if (!areaEl) return 0;
  
  const items = areaEl.querySelectorAll('.time-picker-item:not(.picker-spacer), .rounds-picker-item:not(.picker-spacer)');
  if (items.length === 0) return 0;
  
  const center = areaEl.scrollTop + (areaEl.clientHeight / 2);
  let closestIndex = 0;
  let minDistance = Infinity;
  
  items.forEach((item, index) => {
    const itemTop = item.offsetTop;
    const itemCenter = itemTop + (item.clientHeight / 2);
    const distance = Math.abs(itemCenter - center);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  
  return closestIndex;
}

// 특정 인덱스의 아이템을 중앙으로 스크롤 (스페이서 제외)
function scrollToIndex(areaEl, index, smooth = true) {
  if (!areaEl) return;
  
  const items = areaEl.querySelectorAll('.time-picker-item:not(.picker-spacer), .rounds-picker-item:not(.picker-spacer)');
  if (index < 0 || index >= items.length) return;
  
  const targetItem = items[index];
  targetItem.scrollIntoView({
    block: 'center',
    behavior: smooth ? 'smooth' : 'auto'
  });
}

// 가장 가까운 아이템으로 스냅하고 picker:change 이벤트 발행 (스페이서 제외)
function snapToClosest(areaEl) {
  if (!areaEl) return;
  
  const closestIndex = getClosestIndex(areaEl);
  const items = areaEl.querySelectorAll('.time-picker-item:not(.picker-spacer), .rounds-picker-item:not(.picker-spacer)');
  
  if (items[closestIndex]) {
    // 부드럽게 스냅
    scrollToIndex(areaEl, closestIndex, true);
    
    // 커스텀 이벤트 발행
    const changeEvent = new CustomEvent('picker:change', {
      detail: {
        area: areaEl,
        index: closestIndex,
        value: items[closestIndex].dataset.value,
        item: items[closestIndex]
      }
    });
    areaEl.dispatchEvent(changeEvent);
  }
}

// 직접 클릭 처리 함수 (터치/마우스 이벤트용)
function handleDirectClick(e, pickerArea) {
  if (!pickerArea) return;
  
  // 클릭된 위치에서 가장 가까운 아이템 찾기
  const rect = pickerArea.getBoundingClientRect();
  const clickY = e.clientY - rect.top + pickerArea.scrollTop;
  
  const items = pickerArea.querySelectorAll('.time-picker-item:not(.picker-spacer), .rounds-picker-item:not(.picker-spacer)');
  let closestItem = null;
  let minDistance = Infinity;
  
  items.forEach((item) => {
    const itemTop = item.offsetTop;
    const itemCenter = itemTop + (item.clientHeight / 2);
    const distance = Math.abs(itemCenter - clickY);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }
  });
  
  if (closestItem) {
    console.log('Direct click on item:', closestItem.textContent);
    
    // 클릭된 아이템을 중앙으로 스크롤
    const itemTop = closestItem.offsetTop;
    const containerHeight = pickerArea.clientHeight;
    const scrollTop = itemTop - (containerHeight / 2) + (closestItem.clientHeight / 2);
    
    pickerArea.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    // 시각적 선택 업데이트
    setTimeout(() => {
      updateSelectionVisual(pickerArea);
      
      // picker:change 이벤트 발행
      const changeEvent = new CustomEvent('picker:change', {
        detail: {
          area: pickerArea,
          value: closestItem.dataset.value,
          item: closestItem
        }
      });
      pickerArea.dispatchEvent(changeEvent);
    }, 200);
  }
}

// 기존 클릭 이벤트 핸들러는 제거됨 - 새로운 터치/클릭 시스템 사용

// 개선된 선택 상태 시각적 업데이트 (실시간)
function updateSelectionVisual(pickerArea) {
  if (!pickerArea) return;
  
  // Clear all selected classes (스페이서 제외)
  const allItems = pickerArea.querySelectorAll('.time-picker-item:not(.picker-spacer), .rounds-picker-item:not(.picker-spacer)');
  allItems.forEach(item => {
    item.classList.remove('selected');
  });
  
  // Find the item closest to center
  const closestIndex = getClosestIndex(pickerArea);
  if (allItems[closestIndex]) {
    allItems[closestIndex].classList.add('selected');
  }
}
