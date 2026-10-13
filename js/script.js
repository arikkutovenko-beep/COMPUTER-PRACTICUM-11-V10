console.log('script.js підключено');

// Початковий масив подорожей
const initialTrips = [
    {
        id: '1',
        destination: 'Париж, Франція', 
        startDay: '15.06.2026', 
        endDay: '22.06.2026', 
        days: 7, 
        budget: 1200, 
        status: '✈️ Заплановано',
        badgeClass: 'badge--planned',
        imgSrc: 'assets/img/paris.jpg',
        imgAlt: 'Вид на Ейфелеву вежу ввечері'
    },
    {
        id: '2',
        destination: 'Рим, Італія', 
        startDay: '10.09.2026', 
        endDay: '18.09.2026', 
        days: 8, 
        budget: 1500, 
        status: '⏳ В процесі бронювання',
        badgeClass: 'badge--in-progress',
        imgSrc: 'assets/img/rome.jpg',
        imgAlt: 'Колізей у Римі під сонячним промінням'
    },
    {
        id: '3',
        destination: 'Барселона, Іспанія', 
        startDay: '05.10.2026', 
        endDay: '12.10.2026', 
        days: 7, 
        budget: 900, 
        status: '✈️ Заплановано',
        badgeClass: 'badge--planned',
        imgSrc: 'assets/img/barcelona.jpg',
        imgAlt: 'Храм Святого Сімейства в Барселоні'
    },
    {
        id: '4',
        destination: 'Відень, Австрія', 
        startDay: '07.10.2026', 
        endDay: '09.10.2026', 
        days: 2, 
        budget: 750, 
        status: '✅ Завершено',
        badgeClass: 'badge--completed',
        imgSrc: 'assets/img/wien.jpg',
        imgAlt: 'Панорама Відня'
    }
];

const costPerDay = trip => Math.round(trip.budget / trip.days);

function processTrips(tripList) {
    console.log('Список подорожей:');
    for (const trip of tripList) {
        let category = trip.budget < 1000 ? 'дешева' : 'дорога';
        const dailyCost = costPerDay(trip);
        console.log(
            `Куди: ${trip.destination} | Тривалість: ${trip.days} днів. ` +
            `Загальний бюджет: $${trip.budget} (${category}) | ` +
            `Витрати на день: ~$${dailyCost}`
        );
    }
}
processTrips(initialTrips);


// ==========================================================================
// ПРАКТИКУМ №8: ВАЛІДАЦІЯ ФОРМИ ТА ДИНАМІЧНИЙ ПЕРЕРАХУНОК
// ==========================================================================

const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const budgetInput = document.querySelector("#budget");
const calculatedDaysVal = document.querySelector("#calculated-days-val");
const dailyBudgetVal = document.querySelector("#daily-budget-val");

function updateTripMetrics() {
    if (!startDateInput || !endDateInput || !budgetInput) return;
    const startVal = startDateInput.value;
    const endVal = endDateInput.value;
    const budgetVal = Number(budgetInput.value);

    if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);

        if (end < start) {
            endDateInput.setCustomValidity("Дата завершення не може бути раніше дати початку!");
            if (calculatedDaysVal) calculatedDaysVal.textContent = "0";
            if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
            return;
        } else {
            endDateInput.setCustomValidity("");
        }

        const diffInMs = end - start;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1; 

        if (calculatedDaysVal) calculatedDaysVal.textContent = diffInDays;

        if (budgetVal > 0) {
            const dailyCost = Math.round(budgetVal / diffInDays);
            if (dailyBudgetVal) dailyBudgetVal.textContent = dailyCost;

            if (dailyCost < 20) {
                budgetInput.setCustomValidity("Бюджет на день занадто малий (менше 20€/день)!");
            } else {
                budgetInput.setCustomValidity("");
            }
        } else {
            if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
            budgetInput.setCustomValidity("");
        }
    } else {
        if (calculatedDaysVal) calculatedDaysVal.textContent = "0";
        if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
    }
}

if (startDateInput) startDateInput.addEventListener("input", updateTripMetrics);
if (endDateInput) endDateInput.addEventListener("input", updateTripMetrics);
if (budgetInput) budgetInput.addEventListener("input", updateTripMetrics);


// ==========================================================================
// ПРАКТИКУМ №9: REST COUNTRIES API ІНТЕГРАЦІЯ
// ==========================================================================

const REST_COUNTRIES_API_URL = 'https://restcountries.com/v3.1/name/';

const apiControlsWrapper = document.createElement('div');
apiControlsWrapper.className = 'api-controls-container';
apiControlsWrapper.style.cssText = 'margin: 15px 0; padding: 15px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;';

apiControlsWrapper.innerHTML = `
    <h3 style="margin-top: 0; color: #0056b3;">Пошук інформації про країну (REST Countries API)</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
        <input type="text" id="api-country-input" placeholder="Введіть назву країни англійською (наприклад: France, Ukraine, Japan)" style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <button type="button" id="api-fetch-btn" style="padding: 8px 15px; background-color: #008080; color: white; border: none; border-radius: 4px; cursor: pointer;">Завантажити країну</button>
        <button type="button" id="api-refresh-btn" style="padding: 8px 15px; background-color: #008080; color: white; border: none; border-radius: 4px; cursor: pointer;">Оновити</button>
    </div>
    <div id="api-loading-state" style="display: none; color: #0056b3; font-weight: bold; margin: 5px 0;">
        ⏳ Завантаження даних з сервера...
    </div>
    <div id="api-error-display" style="display: none; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin: 5px 0;">
    </div>
`;

const tripsSectionContainer = document.querySelector('#trips');
const cardsDiv = document.querySelector('#cards');
if (tripsSectionContainer && cardsDiv) {
    tripsSectionContainer.insertBefore(apiControlsWrapper, cardsDiv);
}

const apiCountryInput = apiControlsWrapper.querySelector('#api-country-input');
const apiFetchBtn = apiControlsWrapper.querySelector('#api-fetch-btn');
const apiRefreshBtn = apiControlsWrapper.querySelector('#api-refresh-btn');
const apiLoadingState = apiControlsWrapper.querySelector('#api-loading-state');
const apiErrorDisplay = apiControlsWrapper.querySelector('#api-error-display');

function setApiLoading(isLoading) {
    if (isLoading) {
        if (apiLoadingState) apiLoadingState.style.display = 'block';
        if (apiFetchBtn) apiFetchBtn.disabled = true;
        if (apiRefreshBtn) apiRefreshBtn.disabled = true;
        clearApiError();
    } else {
        if (apiLoadingState) apiLoadingState.style.display = 'none';
        if (apiFetchBtn) apiFetchBtn.disabled = false;
        if (apiRefreshBtn) apiRefreshBtn.disabled = false;
    }
}

function displayApiError(message) {
    if (apiErrorDisplay) {
        apiErrorDisplay.textContent = message;
        apiErrorDisplay.style.display = 'block';
    }
}

function clearApiError() {
    if (apiErrorDisplay) {
        apiErrorDisplay.textContent = '';
        apiErrorDisplay.style.display = 'none';
    }
}


// ==========================================================================
// ПРАКТИКУМ №10: ДЕКЛАРАТИВНІ КОМПОНЕНТИ ТА РЕАКТИВНИЙ СТАН VUE 3
// ==========================================================================

const TripCard = {
    props: {
        id: [String, Number],
        destination: String,
        days: Number,
        budget: Number,
        startDay: String,
        endDay: String,
        status: String,
        badgeClass: String,
        imgSrc: String,
        imgAlt: String,
        isApiData: Boolean,
        capital: String,
        population: Number
    },
    emits: ['select-trip', 'delete-trip'],
    computed: {
        costPerDay() {
            if (!this.days || this.days <= 0) return 0;
            return Math.round(this.budget / this.days);
        }
    },
    template: `
        <article class="card" :class="budget ? (budget < 1000 ? 'budget' : 'expensive') : ''" @click="$emit('select-trip')">
            <h3>{{ destination }}</h3>
            <img v-if="imgSrc" :src="imgSrc" :alt="imgAlt || destination">
            
            <p v-if="isApiData">
                Столиця: <strong>{{ capital }}</strong><br>
                Населення: <strong>{{ population ? population.toLocaleString('uk-UA') : 0 }}</strong> осіб
            </p>
            <p v-else>
                Дати: {{ startDay }} – {{ endDay }} ({{ days }} днів, €{{ budget }})<br>
                <small>Витрати на день: ~€{{ costPerDay }}</small>
            </p>

            <span class="badge" :class="badgeClass">{{ status }}</span>
            <button type="button" class="btn-delete" style="margin-top: 8px; background-color: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;" @click.stop="$emit('delete-trip')">Видалити</button>
        </article>
    `
};

const app = Vue.createApp({
    components: {
        TripCard
    },
    data() {
        return {
            trips: [],
            selectedTrip: null
        };
    },
    methods: {
        selectTrip(trip) {
            this.selectedTrip = trip;
        },
        async addTripFromForm(newTrip) {
            await saveItemDB(newTrip);
            await this.loadTripsFromDB();
        },
        async addTripFromApi(apiTrip) {
            await saveItemDB(apiTrip);
            await this.loadTripsFromDB();
        },
        async deleteTrip(id) {
            if (!confirm('Видалити цей пункт маршруту?')) return;
            try {
                await deleteItemDB(id);
                if (this.selectedTrip && this.selectedTrip.id === id) {
                    this.selectedTrip = null;
                }
                await this.loadTripsFromDB();
            } catch (error) {
                console.error('Помилка видалення з IndexedDB:', error);
            }
        },
        async loadTripsFromDB() {
            try {
                const items = await getAllItemsDB();
                // Сценарій варіанта 10: сортування масиву за датою початку
                items.sort((a, b) => {
                    if (!a.startDay || !b.startDay) return 0;
                    const dateA = a.startDay.split('.').reverse().join('-');
                    const dateB = b.startDay.split('.').reverse().join('-');
                    return new Date(dateA) - new Date(dateB);
                });
                this.trips = items;
            } catch (error) {
                console.error('Крок 11: Помилка завантаження з IndexedDB:', error);
            }
        }
    },
    async mounted() {
        // Крок 8 & 9: Виконання міграції та перевід рендеру на IndexedDB
        await migrateFromLocalStorageIfNeeded();
        await this.loadTripsFromDB();
    }
});

const vm = app.mount('#app');


// Опрацювання форми додавання з інтеграцією Vue та IndexedDB
const travelForm = document.querySelector('#travel-form');
const destinationInput = document.querySelector('#destination');

if (travelForm) {
    travelForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const startParts = startDateInput.value.split('-');
        const endParts = endDateInput.value.split('-');

        const formattedStart = `${startParts[2]}.${startParts[1]}.${startParts[0]}`;
        const formattedEnd = `${endParts[2]}.${endParts[1]}.${endParts[0]}`;

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const newTrip = {
            id: Date.now().toString(),
            destination: destinationInput.value.trim(),
            startDay: formattedStart,
            endDay: formattedEnd,
            days: daysCount,
            budget: Number(budgetInput.value),
            status: '✈️ Заплановано',
            badgeClass: 'badge--planned',
            imgSrc: 'assets/img/barcelona.jpg',
            imgAlt: destinationInput.value.trim()
        };

        // Крок 3: Синхронне збереження в localStorage (перший етап практикуму)
        const currentLsData = loadFromLocalStorage();
        saveToLocalStorage([...currentLsData, newTrip]);

        // Крок 7 & 9: Асинхронне збереження в IndexedDB та оновлення стану Vue
        await vm.addTripFromForm(newTrip);

        travelForm.reset();
        if (calculatedDaysVal) calculatedDaysVal.textContent = '0';
        if (dailyBudgetVal) dailyBudgetVal.textContent = '0';
    });
}


// Завантаження API з інтеграцією в IndexedDB
async function loadCountryData() {
    const searchQuery = apiCountryInput ? apiCountryInput.value.trim() : '';

    if (!searchQuery) {
        displayApiError('Будь ласка, введіть назву країни англійською мовою.');
        return;
    }

    setApiLoading(true);

    try {
        const response = await fetch(`${REST_COUNTRIES_API_URL}${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Країну не знайдено, перевірте написання.');
            }
            throw new Error(`Сервер відповів кодом ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Країну не знайдено, перевірте написання.');
        }

        const country = data[0];

        const countryCardData = {
            id: Date.now().toString(),
            destination: country.name?.common || searchQuery,
            capital: (country.capital && country.capital.length > 0) ? country.capital[0] : 'Не вказано',
            population: country.population ? country.population : 0,
            imgSrc: country.flags?.png || country.flags?.svg || '',
            imgAlt: `Прапор ${country.name?.common || searchQuery}`,
            status: '🌐 Дані з API',
            badgeClass: 'badge--planned',
            isApiData: true
        };

        await vm.addTripFromApi(countryCardData);

    } catch (error) {
        console.error('Помилка під час виконання fetch-запиту:', error);
        displayApiError(error.message);
    } finally {
        setApiLoading(false);
    }
}

if (apiFetchBtn) apiFetchBtn.addEventListener('click', loadCountryData);
if (apiRefreshBtn) apiRefreshBtn.addEventListener('click', loadCountryData);

if (apiCountryInput) {
    apiCountryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadCountryData();
        }
    });
}



// ======================= ПРАКТИЧНА РОБОТА 11 =======================

// Конфігурація для IndexedDB та localStorage
const DB_NAME = 'TravelPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tripStops'; // objectStore для 10 варіанта (keyPath: "id")
const LS_KEY = 'legacy_trip_stops'; // Ключ для збереження в localStorage
const MIGRATED_KEY = 'migrated_to_indexeddb'; // Прапорець одноразової міграції


/**
 * Крок 2: Синхронне збереження масиву об'єктів у localStorage.
 * Включає перетворення в рядок через JSON.stringify.
 */
function saveToLocalStorage(items) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Помилка збереження в localStorage:', error);
    }
}

/**
 * Крок 2: Читання даних із localStorage.
 * Використовує try/catch та JSON.parse для захисту від пошкоджених даних.
 */
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}


/**
 * Крок 5 & 6: Відкриття асинхронної бази даних IndexedDB через Promise.
 * Створення objectStore відбувається виключно у події onupgradeneeded.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            return reject(new Error('Крок 11: IndexedDB не підтримується у вашому браузері'));
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Викликається лише при першому створенні БД або зміні версії
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}


/**
 * Крок 7: CRUD-операція створення/оновлення запису в IndexedDB (put).
 * Використовує транзакцію 'readwrite'.
 */
async function saveItemDB(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Крок 7: CRUD-операція читання всіх записів із IndexedDB (getAll).
 * Використовує транзакцію 'readonly'.
 */
async function getAllItemsDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Крок 7: CRUD-операція видалення запису з IndexedDB (delete).
 * Використовує транзакцію 'readwrite'.
 */
async function deleteItemDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}


/**
 * Крок 8: Одноразова міграція наявних даних із localStorage у IndexedDB.
 * Перевіряє наявність прапорця migrated_to_indexeddb у localStorage.
 */
async function migrateFromLocalStorageIfNeeded() {
    const isMigrated = localStorage.getItem(MIGRATED_KEY);
    if (isMigrated) return; // Вихід, якщо міграція вже відбулася раніше

    // Заповнюємо початкові дані в localStorage, якщо вони ще порожні (для першого запуску)
    let legacyData = loadFromLocalStorage();
    if (legacyData.length === 0) {
        legacyData = initialTrips;
        saveToLocalStorage(legacyData);
    }

    console.log('Початок одноразової міграції даних із localStorage у IndexedDB...');
    for (const item of legacyData) {
        await saveItemDB(item);
    }
    console.log('Міграцію успішно завершено.');

    // Встановлюємо прапорець, щоб міграція не повторювалася при наступних завантаженнях
    localStorage.setItem(MIGRATED_KEY, 'true');
}