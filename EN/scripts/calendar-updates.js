(function(){
  const data = window.updatesData || [];
  
  const SHOW_UTC_IN_WINTER = true;
  
  function getTimezoneSuffix(isoDate) {
      const [year, month, day] = isoDate.split('-').map(Number);
      const dateUTC = Date.UTC(year, month-1, day, 12, 0, 0);
      let marLast = new Date(Date.UTC(year, 2, 31));
      while (marLast.getUTCDay() !== 0) marLast.setUTCDate(marLast.getUTCDate() - 1);
      let octLast = new Date(Date.UTC(year, 9, 31));
      while (octLast.getUTCDay() !== 0) octLast.setUTCDate(octLast.getUTCDate() - 1);
      const dstStart = marLast.getTime() + 3600000;
      const dstEnd   = octLast.getTime() + 3600000;
      const isDST = (dateUTC >= dstStart && dateUTC < dstEnd);
      if (isDST) return ' UTC+2';
      return SHOW_UTC_IN_WINTER ? ' UTC+1' : '';
  }
  
  // Agrupar por fecha
  const updatesByDate = {};
  data.forEach(entry => {
      if (!updatesByDate[entry.isoDate]) updatesByDate[entry.isoDate] = [];
      updatesByDate[entry.isoDate].push(entry);
  });
  
  const datesWithUpdates = Object.keys(updatesByDate).sort();
  if (datesWithUpdates.length === 0) return;
  
  const minDate = new Date(datesWithUpdates[0] + 'T00:00:00');
  const maxDate = new Date(datesWithUpdates[datesWithUpdates.length-1] + 'T00:00:00');
  const latestIso = datesWithUpdates[datesWithUpdates.length-1]; // fecha más reciente

  // ── Mostrar siempre el mes de la última actualización al cargar ──
  let currentYear  = maxDate.getFullYear();
  let currentMonth = maxDate.getMonth();
  
  const calendarApp = document.getElementById('calendar-app');
  
  // ── Mensaje "hace X tiempo" ──
  function buildTimeSinceMessage() {
      const [ly, lm, ld] = latestIso.split('-').map(Number);
      const lastUpdate = new Date(ly, lm-1, ld);
      const now = new Date();
      
      // Diferencia en días completos (ignorando horas)
      const nowMidnight  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffMs   = nowMidnight - lastUpdate;
      const diffDays = Math.floor(diffMs / 86400000);
      
      const [dd, mm, yyyy] = [
          String(ld).padStart(2,'0'),
          String(lm).padStart(2,'0'),
          String(ly)
      ];
      const displayDate = `${dd}/${mm}/${yyyy}`;
      
      // Obtener la hora de la última entrada de ese día
      const lastEntries = updatesByDate[latestIso];
      const lastTime = lastEntries[lastEntries.length - 1].time || '';
      const tzSuffix = getTimezoneSuffix(latestIso);
      const timeStr  = lastTime ? ` a las ${lastTime}${tzSuffix}` : '';
      
      let timeAgo;
      if (diffDays === 0) {
          timeAgo = 'today';
      } else if (diffDays === 1) {
          timeAgo = '1 day ago';
      } else if (diffDays < 7) {
          timeAgo = `${diffDays} days ago`;
      } else if (diffDays < 14) {
          timeAgo = '1 week ago';
      } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          timeAgo = `${weeks} weeks ago`;
      } else if (diffDays < 60) {
          timeAgo = '1 month ago';
      } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          timeAgo = `${months} months ago`;
      } else if (diffDays < 730) {
          timeAgo = '1 year ago';
      } else {
          const years = Math.floor(diffDays / 365);
          timeAgo = `${years} years ago`;
      }
      
      return `Last Update: <strong>${displayDate}${timeStr}</strong> — <span style="color:#79c0ff">${timeAgo}</span>`;
  }
  
  function renderCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay  = new Date(currentYear, currentMonth + 1, 0);
      
      let startDayOfWeek = firstDay.getDay();
      startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;
      
      const monthNames =
        ['January','February','March','April','May','June','July','August','September','October','November','December'];
      
      const isPrevDisabled = (currentYear === minDate.getFullYear() && currentMonth <= minDate.getMonth());
      const isNextDisabled = (currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth());
      
      let html = `
          <div class="calendar-header">
              <h3>${monthNames[currentMonth]} ${currentYear}</h3>
              <div class="calendar-nav">
                  <button id="prevMonthBtn" ${isPrevDisabled ? 'disabled' : ''}>← Previous month</button>
                  <button id="nextMonthBtn" ${isNextDisabled ? 'disabled' : ''}> Next month →</button>
              </div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-weekday">Mon</div>
            <div class="calendar-weekday">Tue</div>
            <div class="calendar-weekday">Wed</div>
            <div class="calendar-weekday">Thu</div>
            <div class="calendar-weekday">Fri</div>
            <div class="calendar-weekday">Sat</div>
            <div class="calendar-weekday">Sun</div>
      `;
      
      for (let i = 0; i < startDayOfWeek; i++) {
          html += `<div class="calendar-day other-month"></div>`;
      }
      
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
          const iso = currentYear + '-' +
                      String(currentMonth+1).padStart(2,'0') + '-' +
                      String(d).padStart(2,'0');
          const hasUpdates = updatesByDate.hasOwnProperty(iso);
          const isLatest   = (iso === latestIso);
          
          let classes = 'calendar-day';
          if (hasUpdates) classes += ' has-updates';
          if (isLatest)   classes += ' latest-update';
          
          html += `<div class="${classes}" data-date="${iso}">${d}</div>`;
      }
      
      html += '</div>';

      // Mensaje de última actualización
      html += `<p class="calendar-last-update">${buildTimeSinceMessage()}</p>`;
      
      calendarApp.innerHTML = html;
      
      document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
          if (currentMonth === 0) { currentYear--; currentMonth = 11; }
          else { currentMonth--; }
          renderCalendar();
      });
      
      document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
          if (currentMonth === 11) { currentYear++; currentMonth = 0; }
          else { currentMonth++; }
          renderCalendar();
      });
      
      document.querySelectorAll('.calendar-day.has-updates').forEach(day => {
          day.addEventListener('click', () => showUpdatesModal(day.dataset.date));
      });
  }
  
  function showUpdatesModal(isoDate) {
      const entries = updatesByDate[isoDate] || [];
      if (entries.length === 0) return;
      
      const [year, month, day] = isoDate.split('-');
      const displayDate = `${day}/${month}/${year}`;
      
      let modalHtml = `
          <div class="updates-modal" id="updatesModal">
              <div class="modal-content">
                  <div class="modal-header">
                      <h3>Updates of ${displayDate}</h3>
                      <button class="modal-close">&times;</button>
                  </div>
                  <div class="modal-body">
      `;
      
      entries.forEach(entry => {
          const tzSuffix = getTimezoneSuffix(isoDate);
          modalHtml += `
              <div class="update-entry">
                  <div class="update-time">${entry.time}${tzSuffix}</div>
                  <ul class="update-list">
                      ${entry.items.map(item => `<li>${item}</li>`).join('')}
                  </ul>
              </div>
          `;
      });
      
      modalHtml += `</div></div></div>`;
      
      const oldModal = document.getElementById('updatesModal');
      if (oldModal) oldModal.remove();
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      document.body.classList.add('modal-open');
      
      const modal    = document.getElementById('updatesModal');
      const closeBtn = modal.querySelector('.modal-close');
      const closeModal = () => { modal.remove(); document.body.classList.remove('modal-open'); };
      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  
  renderCalendar();
})();
