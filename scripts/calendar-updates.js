(function(){
    const data = window.updatesData || [];
    
    // Determina si una fecha está en horario de verano de Europa Central (CEST)
    function isDaylightSavingTime(isoDate) {
        const date = new Date(isoDate + 'T12:00:00');
        const year = date.getFullYear();
        
        // Último domingo de marzo
        let marLast = new Date(year, 2, 31);
        marLast.setDate(31 - marLast.getDay());
        
        // Último domingo de octubre
        let octLast = new Date(year, 9, 31);
        octLast.setDate(31 - octLast.getDay());
        
        return date >= marLast && date < octLast;
    }
    
    // Agrupar por fecha (puede haber varias entradas el mismo día)
    const updatesByDate = {};
    data.forEach(entry => {
      if (!updatesByDate[entry.isoDate]) updatesByDate[entry.isoDate] = [];
      updatesByDate[entry.isoDate].push(entry);
    });
    
    const datesWithUpdates = Object.keys(updatesByDate).sort();
    if (datesWithUpdates.length === 0) return;
    
    // Determinar rango completo de fechas con actualizaciones
    const minDate = new Date(datesWithUpdates[0] + 'T00:00:00');
    const maxDate = new Date(datesWithUpdates[datesWithUpdates.length-1] + 'T00:00:00');
    
    let currentYear = minDate.getFullYear();
    let currentMonth = minDate.getMonth();
    
    const calendarApp = document.getElementById('calendar-app');
    
    function renderCalendar() {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      // Ajuste para que la semana comience en Lunes (1) en lugar de Domingo (0)
      let startDayOfWeek = firstDay.getDay(); // 0 = Domingo
      startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; // Ahora 0 = Lunes, 6 = Domingo
      
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
      
      // Días del mes anterior (relleno)
      for (let i = 0; i < startDayOfWeek; i++) {
        html += `<div class="calendar-day other-month"></div>`;
      }
      
      // Obtener la fecha actual en formato YYYY-MM-DD local
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      
      for (let d = 1; d <= lastDay.getDate(); d++) {
        // Construir fecha ISO manualmente SIN usar Date para evitar UTC
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
      const displayDate = `${day}/${month}/${year}`;
      const tzSuffix = isDaylightSavingTime(isoDate) ? ' UTC+2' : '';
      
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
      
      // Bloquear scroll del fondo
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