(function(){
    const data = window.updatesData || [];
    
    // Determine if a date is in Central European Summer Time (CEST)
    function isDaylightSavingTime(isoDate) {
        const date = new Date(isoDate + 'T12:00:00');
        const year = date.getFullYear();
        
        // Last Sunday of March
        let marLast = new Date(year, 2, 31);
        marLast.setDate(31 - marLast.getDay());
        
        // Last Sunday of October
        let octLast = new Date(year, 9, 31);
        octLast.setDate(31 - octLast.getDay());
        
        return date >= marLast && date < octLast;
    }
    
    // Group by date (multiple entries per day possible)
    const updatesByDate = {};
    data.forEach(entry => {
      if (!updatesByDate[entry.isoDate]) updatesByDate[entry.isoDate] = [];
      updatesByDate[entry.isoDate].push(entry);
    });
    
    const datesWithUpdates = Object.keys(updatesByDate).sort();
    if (datesWithUpdates.length === 0) return;
    
    // Determine full date range with updates
    const minDate = new Date(datesWithUpdates[0] + 'T00:00:00');
    const maxDate = new Date(datesWithUpdates[datesWithUpdates.length-1] + 'T00:00:00');
    
    let currentYear = minDate.getFullYear();
    let currentMonth = minDate.getMonth();
    
    const calendarApp = document.getElementById('calendar-app');
    
    function renderCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      // Adjust so week starts on Monday (1) instead of Sunday (0)
      let startDayOfWeek = firstDay.getDay(); // 0 = Sunday
      startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; // Now 0 = Monday, 6 = Sunday
      
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      
      let html = `
        <div class="calendar-header">
          <h3>${monthNames[currentMonth]} ${currentYear}</h3>
          <div class="calendar-nav">
            <button id="prevMonthBtn" ${(currentYear === minDate.getFullYear() && currentMonth <= minDate.getMonth()) ? 'disabled' : ''}>← Previous month</button>
            <button id="nextMonthBtn" ${(currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth()) ? 'disabled' : ''}>Next month →</button>
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
      
      // Previous month filler days
      for (let i = 0; i < startDayOfWeek; i++) {
        html += `<div class="calendar-day other-month"></div>`;
      }
      
      // Today's date in YYYY-MM-DD local format
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        // Build ISO date manually to avoid UTC issues
        const iso = currentYear + '-' + 
                    String(currentMonth + 1).padStart(2, '0') + '-' + 
                    String(d).padStart(2, '0');
        const hasUpdates = updatesByDate.hasOwnProperty(iso);
        const isToday = (iso === todayStr);
        
        let classes = 'calendar-day';
        if (hasUpdates) classes += ' has-updates';
        if (isToday) classes += ' today';
        
        html += `<div class="${classes}" data-date="${iso}">${d}</div>`;
      }
      
      html += '</div>';
      calendarApp.innerHTML = html;
      
      // Event listeners
      document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
        if (currentMonth === 0) {
          currentYear--;
          currentMonth = 11;
        } else {
          currentMonth--;
        }
        renderCalendar();
      });
      
      document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
        if (currentMonth === 11) {
          currentYear++;
          currentMonth = 0;
        } else {
          currentMonth++;
        }
        renderCalendar();
      });
      
      document.querySelectorAll('.calendar-day.has-updates').forEach(day => {
        day.addEventListener('click', (e) => {
          const date = day.dataset.date;
          showUpdatesModal(date);
        });
      });
    }
    
    function showUpdatesModal(isoDate) {
      const entries = updatesByDate[isoDate] || [];
      if (entries.length === 0) return;
      
      const [year, month, day] = isoDate.split('-');
      // U.S. date format: MM/DD/YYYY
      const displayDate = `${month}/${day}/${year}`;
      const tzSuffix = isDaylightSavingTime(isoDate) ? ' UTC+2' : '';
      
      let modalHtml = `
        <div class="updates-modal" id="updatesModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Updates on ${displayDate}</h3>
              <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
      `;
      
      entries.forEach(entry => {
        modalHtml += `
          <div class="update-entry">
            <div class="update-time">${entry.time}${tzSuffix}</div>
            <ul class="update-list">
              ${entry.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        
        modalHtml += `</div>`;
      });
      
      modalHtml += `
            </div>
          </div>
        </div>
      `;
      
      const oldModal = document.getElementById('updatesModal');
      if (oldModal) oldModal.remove();
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // Block background scrolling
      document.body.classList.add('modal-open');
      
      const modal = document.getElementById('updatesModal');
      const closeBtn = modal.querySelector('.modal-close');
      
      const closeModal = () => {
        modal.remove();
        document.body.classList.remove('modal-open');
      };
      
      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
    
    renderCalendar();
})();