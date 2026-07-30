// window.festivalsData is loaded from data.js
const festivals = window.festivalsData || [];

// Combine date and time to Date object
festivals.forEach(fw => {
  fw.dateTime = new Date(`${fw.dateStr} ${fw.timeStart}:00`).getTime();
});

// Sort by date (Chronological order: earliest to latest)
festivals.sort((a, b) => a.dateTime - b.dateTime);

const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');
let nextEvent = null;
let intervalId = null;

// Helper to get website link (uses custom url if exists, otherwise falls back to Google Search)
function getEventLink(fw) {
  if (fw.url) {
    return fw.url;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(fw.name + ' 2026 公式')}`;
}

function renderList() {
  const cardContainer = document.getElementById('festival-list');
  const simpleContainer = document.querySelector('#simple-festival-list tbody');
  
  if(cardContainer) cardContainer.innerHTML = '';
  if(simpleContainer) simpleContainer.innerHTML = '';
  
  const now = new Date().getTime();
  const threeWeeksLater = now + (21 * 24 * 60 * 60 * 1000); // 3 weeks from now
  
  nextEvent = null; // reset

  // 1. Find the next upcoming active event
  for (let i = 0; i < festivals.length; i++) {
    const fw = festivals[i];
    const isFinished = (fw.dateTime + 2 * 60 * 60 * 1000) < now;
    if (!nextEvent && !isFinished) {
      nextEvent = fw;
      break;
    }
  }

  // 2. Find all events happening on the same day as the next event
  const nextDayEvents = [];
  if (nextEvent) {
    festivals.forEach(fw => {
      const isFinished = (fw.dateTime + 2 * 60 * 60 * 1000) < now;
      if (fw.dateStr === nextEvent.dateStr && !isFinished) {
        nextDayEvents.push(fw);
      }
    });
    setupHero(nextDayEvents);
  }

  // 3. Render cards and table rows
  festivals.forEach(fw => {
    const isFinished = (fw.dateTime + 2 * 60 * 60 * 1000) < now;
    const isEstimatedHtml = fw.isEstimated ? '<span class="estimated-tag">想定(未定)</span>' : '';
    const dateDisplay = `${fw.dateStr.replace('2026/', '')} ${isEstimatedHtml}`;
    const eventUrl = getEventLink(fw);

    // Display logic:
    // - Show as Card if:
    //   a) The event is finished (showing as gray card with transparency, per user request)
    //   b) Within 3 weeks
    //   c) It is happening on the next event day
    const isNextDayEvent = nextDayEvents.includes(fw);
    
    if (isFinished || fw.dateTime <= threeWeeksLater || isNextDayEvent) {
      if(cardContainer) {
        const card = document.createElement('div');
        card.className = `glass-panel festival-card ${isFinished ? 'finished' : ''}`;
        card.innerHTML = `
          <h4><a href="${eventUrl}" target="_blank" class="event-link">${fw.name} 🔗</a></h4>
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
      // Show as simple table row for future events (farther than 3 weeks)
      if(simpleContainer) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dateDisplay}</td>
          <td><a href="${eventUrl}" target="_blank" class="event-link"><strong>${fw.name} 🔗</strong></a></td>
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

function setupHero(events) {
  // Combine all event names for that day wrapped in links
  const names = events.map(fw => {
    const eventUrl = getEventLink(fw);
    return `<a href="${eventUrl}" target="_blank" class="event-link hero-link">${fw.name} 🔗</a>`;
  }).join('<br> & <br>');
  
  const hasEstimated = events.some(e => e.isEstimated);
  const isEstimatedHtml = hasEstimated ? '<span class="estimated-tag" style="border-color:#fff;color:#fff;">未定(想定)あり</span>' : '';
  
  document.getElementById('next-festival-name').innerHTML = `${names} ${isEstimatedHtml}`;
  
  // Display details for each event on the same day
  const detailsContainer = document.getElementById('next-festival-details');
  detailsContainer.innerHTML = events.map(fw => {
    const eventUrl = getEventLink(fw);
    return `
      <a href="${eventUrl}" target="_blank" style="text-decoration: none; color: inherit;">
        <div class="hero-detail-card" style="background: rgba(0, 0, 0, 0.3); padding: 12px 20px; border-radius: 12px; margin: 5px; text-align: left; min-width: 250px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: background 0.2s;">
          <div style="font-weight: bold; color: #00e1ff; margin-bottom: 5px;">${fw.name} 🔗</div>
          <div style="font-size: 0.9rem;">📅 ${fw.dateStr}  ⏰ ${fw.timeStart}〜</div>
          <div style="font-size: 0.9rem;">🎆 ${fw.shots}  🏢 ${fw.company}</div>
        </div>
      </a>
    `;
  }).join('');
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
