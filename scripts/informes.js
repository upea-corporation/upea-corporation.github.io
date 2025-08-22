document.addEventListener('DOMContentLoaded', () => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const calendarContainer = document.getElementById('calendar-container');
    
    // Objeto para manejar los reportes por fecha, incluyendo su tipo
    const reporteFechas = {
        '2025-5-16': { id: 'report-details-jun-16', type: 'serious' }, // 16 de junio,
        '2025-6-19': { id: 'report-details-jul-19', type: 'serious' }, // 19 de julio,
        '2025-7-5': { id: 'report-details-aug-5', type: 'mixed' },   // 5 de agosto
        '2025-7-16': { id: 'report-details-aug-16', type: 'mission' },   // 16 de agosto
        '2025-7-22': { id: 'report-details-aug-22', type: 'serious' }   // 22 de agosto
    };
    
    let currentMonth = 4; // Mayo es el índice 4
    let currentYear = 2025;

    function renderCalendar(month, year) {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let calendarHTML = `
            <h2>Registro de Informes de Operaciones</h2>
            <p>A continuación, se presenta un calendario con los días en los que se emitieron informes relevantes de UPEA Corporation.</p>
            <p>Los días marcados en color rojo significan informes serios o internos. Los días marcados en color azul significan informes de misiones y actividades. Los días marcados en color amarillo significan informes técnicos y de seguridad. Los días marcados en color morado significan informes mixtos.</p>
            <div id="calendar-header">
                <button id="prev-button"><</button>
                <h3>${months[month]} ${year}</h3>
                <button id="next-button">></button>
            </div>
            <div id="calendar-grid">
        `;

        dayNames.forEach(name => {
            calendarHTML += `<span class="day-name">${name}</span>`;
        });
        
        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const startDay = (year === 2025 && month === 4) ? 26 : 1;

        for (let i = 0; i < startDayIndex; i++) {
            if (year === 2025 && month === 4 && i >= 4) {
                calendarHTML += `<div class="calendar-day empty-day"></div>`;
            } else if (!(year === 2025 && month === 4)) {
                 calendarHTML += `<div class="calendar-day empty-day"></div>`;
            }
        }
        
        for (let i = startDay; i <= daysInMonth; i++) {
            let dayClass = 'calendar-day';
            const dateKey = `${year}-${month}-${i}`;
            if (reporteFechas[dateKey]) {
                const reportType = reporteFechas[dateKey].type;
                dayClass += ` report-day report-day-${reportType}`;
            }
            calendarHTML += `<div class="${dayClass}" data-date="${year}-${month}-${i}">${i}</div>`;
        }

        calendarHTML += `</div>`;
        calendarContainer.innerHTML = calendarHTML;

        // Ocultar todos los detalles de los informes al renderizar el calendario
        document.querySelectorAll('.report-info').forEach(el => el.style.display = 'none');
        
        // Lógica para ocultar el botón de "anterior" antes de mayo de 2025
        const prevButton = document.getElementById('prev-button');
        if (currentYear === 2025 && currentMonth === 4) {
            prevButton.style.visibility = 'hidden';
        } else {
            prevButton.style.visibility = 'visible';
        }

        prevButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        document.getElementById('next-button').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });

        document.querySelectorAll('.report-day').forEach(reportDayElement => {
            reportDayElement.addEventListener('click', (event) => {
                const dateKey = event.target.dataset.date;
                const reportId = reporteFechas[dateKey].id;
                
                // Ocultar todos los reportes
                document.querySelectorAll('.report-info').forEach(el => el.style.display = 'none');
                
                // Mostrar solo el reporte correspondiente
                if (reportId) {
                    const reportElement = document.getElementById(reportId);
                    if (reportElement) {
                        reportElement.style.display = 'block';
                    }
                }
            });
        });
    }

    renderCalendar(currentMonth, currentYear);
});