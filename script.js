// window.festivalsData is loaded from data.js
const festivals = window.festivalsData || [];

// Combine date and time to Date object
festivals.forEach(fw => {
  fw.dateTime = new Date(`${fw.dateStr} ${fw.timeStart}:00`).getTime();
});

// Sort by date
festivals.sort((a, b) => a.dateTime - b.dateTime);

const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');
let nextEvent = null;
let intervalId = null;

function renderList() {
  const cardContainer = document.getElementById('festival-list');
  const simpleContainer = document.querySelector('#simple-festival-list tbody');
  
  if(cardContainer) cardContainer.innerHTML = '';
  if(simpleContainer) simpleContainer.innerHTML = '';
  
  const now = new Date().getTime();
  const threeWeeksLater = now + (21 * 24 * 60 * 60 * 1000); // 3 weeks from now
  
  nextEvent = null; // reset

  festivals.forEach(fw => {
    // If the event start time + 2 hours has passed, mark it as finished
    const isFinished = (fw.dateTime + 2 * 60 * 60 * 1000) < now;
    
    // Find the next active event based on current time
    if (!nextEvent && !isFinished) {
      nextEvent = fw;
      setupHero(fw);
    }

    const isEstimatedHtml = fw.isEstimated ? '<span class="estimated-tag">想定(未定)</span>' : '';
    const dateDisplay = `${fw.dateStr.replace('2026/', '')} ${isEstimatedHtml}`;

    // Display logic: Within 3 weeks from now -> Card format, Later -> Simple format
    // UPDATE requested by user: The "nextEvent" (countdown target) should ALWAYS be displayed as a Card!
    if (fw.dateTime <= threeWeeksLater || isFinished || fw === nextEvent) {
      // Show as rich card
      if(cardContainer) {
        const card = document.createElement('div');
        card.className = `glass-panel festival-card ${isFinished ? 'finished' : ''}`;
        card.innerHTML = `
          <h4>${fw.name}</h4>
          <div class="card-info">
            <div class="card-info-row">
              <span class="info-label">開催日</span>
              <span class="info-value">${dateDisplay}</span>
            </div>
            <div class="card-info-row">
              <span class="info-label">時間</span>
              <span class="info-value">${fw.timeStart}〜</span>
            </div>
            <div class="card-info-row">
              <span class="info-label">打上数</span>
              <span class="info-value">${fw.shots}</span>
            </div>
            <div class="card-info-row">
              <span class="info-label">煙火店</span>
              <span class="info-value">${fw.company}</span>
            </div>
          </div>
        `;
        cardContainer.appendChild(card);
      }
    } else {
      // Show as simple table row
      if(simpleContainer) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dateDisplay}</td>
          <td><strong>${fw.name}</strong></td>
          <td>${fw.timeStart}〜</td>
          <td>${fw.shots} <br> <small style="color:rgba(255,255,255,0.6)">${fw.company}</small></td>
        `;
        simpleContainer.appendChild(tr);
      }
    }
  });
  
  // Notice if there are no upcoming events within 3 weeks
  if (cardContainer && cardContainer.children.length === 0) {
     cardContainer.innerHTML = '<p style="text-align:center;width:100%">直近で開催予定の大会はありません。</p>';
  }
  
  // If all events are finished
  if (!nextEvent) {
      document.getElementById('next-festival-name').innerText = "2026年の主要大会は終了しました";
      document.getElementById('next-festival-details').innerHTML = '';
  }
}

function setupHero(fw) {
  const isEstimatedHtml = fw.isEstimated ? '<span class="estimated-tag" style="border-color:#fff;color:#fff;">未定(想定)</span>' : '';
  document.getElementById('next-festival-name').innerHTML = `${fw.name} ${isEstimatedHtml}`;
  const detailsContainer = document.getElementById('next-festival-details');
  detailsContainer.innerHTML = `
    <div class="detail-item">📅 ${fw.dateStr}</div>
    <div class="detail-item">⏰ ${fw.timeStart}〜</div>
    <div class="detail-item">🎆 ${fw.shots}</div>
    <div class="detail-item">🏢 ${fw.company}</div>
  `;
}

function updateCountdown() {
  if (!nextEvent) {
    if(intervalId !== null) clearInterval(intervalId);
    return;
  }
  const now = new Date().getTime();
  const distance = nextEvent.dateTime - now;

  if (distance < 0) {
    // Current event has started/passed, reset countdown logic
    cdDays.innerText = "00";
    cdHours.innerText = "00";
    cdMinutes.innerText = "00";
    cdSeconds.innerText = "00";
    
    // Check if it's over completely (after 2 hours)
    if (distance < -2 * 60 * 60 * 1000) {
        renderList();
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  cdDays.innerText = String(days).padStart(2, '0');
  cdHours.innerText = String(hours).padStart(2, '0');
  cdMinutes.innerText = String(minutes).padStart(2, '0');
  cdSeconds.innerText = String(seconds).padStart(2, '0');
}

// Init
renderList();
if (nextEvent) {
  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);
}
