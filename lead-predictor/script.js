document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const revenueInput = document.getElementById('revenue');
    const aovInput = document.getElementById('aov');
    const leadRateInput = document.getElementById('lead-rate');
    const prospectRateInput = document.getElementById('prospect-rate');

    // Displays
    const leadRateVal = document.getElementById('lead-rate-val');
    const prospectRateVal = document.getElementById('prospect-rate-val');

    const valProspects = document.getElementById('val-prospects');
    const valLeads = document.getElementById('val-leads');
    const valCustomers = document.getElementById('val-customers');

    const pctLeads = document.getElementById('pct-leads');
    const pctCustomers = document.getElementById('pct-customers');

    const barLeads = document.getElementById('bar-leads');
    const barCustomers = document.getElementById('bar-customers');

    // Chart
    const barsContainer = document.getElementById('bars-container');
    const xAxisLabelsContainer = document.getElementById('x-axis-labels');
    const tooltip = document.getElementById('chart-tooltip');
    
    // Translations
    const translations = {
        en: {
            language: "Language",
            currency: "Currency",
            campaignStart: "Campaign Start",
            campaignEnd: "Campaign End",
            totalRevenue: "Total Revenue",
            avgOrderValue: "Avg. Order Value",
            leadResponseRate: "Lead Response Rate",
            prospectResponseRate: "Prospect Response Rate",
            prospects: "Prospects",
            leads: "Leads",
            customers: "Customers",
            people: " people",
            month: "Month"
        },
        bg: {
            language: "Език",
            currency: "Валута",
            campaignStart: "Начало кампания",
            campaignEnd: "Край кампания",
            totalRevenue: "Общи приходи",
            avgOrderValue: "Ср. стойност на поръчка",
            leadResponseRate: "Отговори от лийдове",
            prospectResponseRate: "Отговори от потенциални",
            prospects: "Потенциални клиенти",
            leads: "Лийдове",
            customers: "Клиенти",
            people: " души",
            month: "Месец"
        },
        de: {
            language: "Sprache",
            currency: "Währung",
            campaignStart: "Kampagnenstart",
            campaignEnd: "Kampagnenende",
            totalRevenue: "Gesamtumsatz",
            avgOrderValue: "Durchschn. Bestellwert",
            leadResponseRate: "Lead-Antwortrate",
            prospectResponseRate: "Interessenten-Antwortrate",
            prospects: "Interessenten",
            leads: "Leads",
            customers: "Kunden",
            people: " Personen",
            month: "Monat"
        },
        fr: {
            language: "Langue",
            currency: "Devise",
            campaignStart: "Début de campagne",
            campaignEnd: "Fin de campagne",
            totalRevenue: "Revenu total",
            avgOrderValue: "Valeur de comm. moy.",
            leadResponseRate: "Taux réponse leads",
            prospectResponseRate: "Taux réponse prospects",
            prospects: "Prospects",
            leads: "Leads",
            customers: "Clients",
            people: " personnes",
            month: "Mois"
        }
    };
    
    let currentLang = 'en';

    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        const dict = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });
        updateXAxis();
    });

    const currencySelect = document.getElementById('currency-select');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    
    currencySelect.addEventListener('change', (e) => {
        const symbol = e.target.value;
        currencySymbols.forEach(el => {
            el.textContent = symbol;
        });
    });

    // Config
    const MONTHS = 6;
    let maxChartValue = 120; // Will be dynamically adjusted

    function formatNumber(num) {
        return Math.round(num);
    }

    function calculate() {
        const revenue = parseFloat(revenueInput.value) || 0;
        const aov = parseFloat(aovInput.value) || 1;
        const leadRate = parseFloat(leadRateInput.value) || 0;
        const prospectRate = parseFloat(prospectRateInput.value) || 0;

        // Math
        // customers = revenue / aov
        const customers = Math.round(revenue / aov);
        
        // Clients * 100 / Percentage of responses from leads = Leads
        let leads = 0;
        if (leadRate > 0) leads = Math.round((customers * 100) / leadRate);

        // Leads * 100 / Percentage of responses from prospects = Prospects
        let prospects = 0;
        if (prospectRate > 0) prospects = Math.round((leads * 100) / prospectRate);

        // Update Slider text
        leadRateVal.textContent = leadRate.toFixed(2);
        prospectRateVal.textContent = prospectRate.toFixed(2);

        // Update Right sidebar cards
        valProspects.textContent = formatNumber(prospects);
        valLeads.textContent = formatNumber(leads);
        valCustomers.textContent = formatNumber(customers);

        // Percentages relative to Prospects
        let leadPct = prospects > 0 ? (leads / prospects) * 100 : 0;
        let custPct = prospects > 0 ? (customers / prospects) * 100 : 0;

        pctLeads.textContent = Math.round(leadPct) + '%';
        pctCustomers.textContent = Math.round(custPct) + '%';

        barLeads.style.width = Math.min(100, leadPct) + '%';
        barCustomers.style.width = Math.min(100, custPct) + '%';

        updateChart(prospects, leads, customers);
    }

    function updateChart(totalProspects, totalLeads, totalCustomers) {
        barsContainer.innerHTML = '';
        
        // Determine scale: Find the nearest interval for the max value
        maxChartValue = Math.max(totalProspects, 10); // Minimum 10
        // Round up to nearest nice number (e.g., if 125 -> 140)
        const step = Math.pow(10, Math.floor(Math.log10(maxChartValue)));
        maxChartValue = Math.ceil(maxChartValue / step) * step;
        if (maxChartValue < totalProspects) maxChartValue += step;

        updateXAxis();

        // Create 6 months of data, assuming linear growth ending at total
        for (let i = 1; i <= MONTHS; i++) {
            const row = document.createElement('div');
            row.className = 'bar-row';

            const mProspects = (totalProspects / MONTHS) * i;
            const mLeads = (totalLeads / MONTHS) * i;
            const mCustomers = (totalCustomers / MONTHS) * i;

            const wp = (mProspects / maxChartValue) * 100;
            const wl = (mLeads / maxChartValue) * 100;
            const wc = (mCustomers / maxChartValue) * 100;

            row.innerHTML = `
                <div class="bar pros" style="width: ${wp}%"></div>
                <div class="bar lead" style="width: ${wl}%"></div>
                <div class="bar cust" style="width: ${wc}%"></div>
            `;

            row.addEventListener('mousemove', (e) => {
                tooltip.style.left = e.pageX + 15 + 'px';
                tooltip.style.top = e.pageY - 30 + 'px';
                tooltip.classList.add('visible');
                
                document.getElementById('tt-month-num').textContent = i;
                document.getElementById('tt-prospects').textContent = formatNumber(mProspects);
                document.getElementById('tt-leads').textContent = formatNumber(mLeads);
                document.getElementById('tt-customers').textContent = formatNumber(mCustomers);
            });

            row.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            barsContainer.appendChild(row);
        }
    }

    function updateXAxis() {
        const sections = 6;
        xAxisLabelsContainer.innerHTML = '';
        const gridLinesContainer = document.querySelector('.grid-lines');
        gridLinesContainer.innerHTML = '';

        const peopleText = translations[currentLang].people;

        for (let i = 0; i <= sections; i++) {
            const val = (maxChartValue / sections) * i;
            const span = document.createElement('span');
            span.textContent = formatNumber(val) + (i === sections || val === 0 ? peopleText : '');
            xAxisLabelsContainer.appendChild(span);

            const line = document.createElement('div');
            line.className = 'line';
            gridLinesContainer.appendChild(line);
        }
    }

    // Event Listeners
    [revenueInput, aovInput, leadRateInput, prospectRateInput].forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();
});
