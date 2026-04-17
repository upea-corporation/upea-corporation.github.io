(function(){
  const data = window.updatesData || [];
  
  // Configuración: si quieres mostrar " UTC+1" en invierno o solo la hora sin nada
  const SHOW_UTC_IN_WINTER = true;  // false = solo muestra "+2" en verano, nada en invierno
  
  // Determina el sufijo horario según la fecha (UTC+2 en verano, UTC+1 en invierno)
  function getTimezoneSuffix(isoDate) {
      const [year, month, day] = isoDate.split('-').map(Number);
      // Fecha a las 12:00 UTC (para evitar problemas con horas límite)
      const dateUTC = Date.UTC(year, month-1, day, 12, 0, 0);
      
      // Último domingo de marzo (mes 2 = marzo)
      let marLast = new Date(Date.UTC(year, 2, 31));
      while (marLast.getUTCDay() !== 0) { // 0 = domingo
          marLast.setUTCDate(marLast.getUTCDate() - 1);
      }
      // Último domingo de octubre (mes 9 = octubre)
      let octLast = new Date(Date.UTC(year, 9, 31));
      while (octLast.getUTCDay() !== 0) {
          octLast.setUTCDate(octLast.getUTCDate() - 1);
      }
      
      // El cambio ocurre a las 01:00 UTC:
      // - Horario de verano comienza el último domingo de marzo a las 01:00 UTC
      // - Termina el último domingo de octubre a las 01:00 UTC
      const dstStart = marLast.getTime() + 3600000; // 01:00 UTC
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
  
  let currentYear = minDate.getFullYear();
  let currentMonth = minDate.getMonth();
  
  const calendarApp = document.getElementById('calendar-app');
  
  function renderCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      let startDayOfWeek = firstDay.getDay();
      startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;
      
      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      
      let html = `
          <div class="calendar-header">
              <h3>${monthNames[currentMonth]} ${currentYear}</h3>
              <div class="calendar-nav">
                  <button id="prevMonthBtn" ${(currentYear === minDate.getFullYear() && currentMonth <= minDate.getMonth()) ? 'disabled' : ''}>← Mes anterior</button>
                  <button id="nextMonthBtn" ${(currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth()) ? 'disabled' : ''}>Mes siguiente →</button>
              </div>
          </div>
          <div class="calendar-grid">
              <div class="calendar-weekday">Lun</div>
              <div class="calendar-weekday">Mar</div>
              <div class="calendar-weekday">Mié</div>
              <div class="calendar-weekday">Jue</div>
              <div class="calendar-weekday">Vie</div>
              <div class="calendar-weekday">Sáb</div>
              <div class="calendar-weekday">Dom</div>
      `;
      
      for (let i = 0; i < startDayOfWeek; i++) {
          html += `<div class="calendar-day other-month"></div>`;
      }
      
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
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
      const displayDate = `${day}/${month}/${year}`;
      
      let modalHtml = `
          <div class="updates-modal" id="updatesModal">
              <div class="modal-content">
                  <div class="modal-header">
                      <h3>Actualizaciones del ${displayDate}</h3>
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
      
      modalHtml += `
                  </div>
              </div>
          </div>
      `;
      
      const oldModal = document.getElementById('updatesModal');
      if (oldModal) oldModal.remove();
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
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