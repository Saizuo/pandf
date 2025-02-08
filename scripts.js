const API_URL = 'https://api.coingecko.com/api/v3';

async function fetchMemeCoinsByCategory() {
    const response = await fetch(`${API_URL}/coins/markets?vs_currency=usd&category=pump-fun&order=price_desc&per_page=50&sparkline=false`);
    const data = await response.json();
    globalCoins = data.sort((a, b) => b.current_price - a.current_price);
    return globalCoins;
}

function formatPrice(price) {
    if (price < 0.01) {
        return `${price.toFixed(8)}`;
    }
    return `${price.toLocaleString()}`;
}

function renderTopPerformers(coins) {
    const topThree = coins.slice(0, 3);
    const topPerformersContainer = document.querySelector('.top-performers');
    
    topPerformersContainer.innerHTML = topThree.map((coin, index) => `
        <div class="top-coin ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'}" onclick="window.open('https://www.coingecko.com/en/coins/${coin.id}', '_blank')">
            <img src="${coin.image}" alt="${coin.name}">
            <div class="coin-info">
                <h2>${coin.name}</h2>
                <p class="price">${formatPrice(coin.current_price)}</p>
                <p class="change ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}">
                    ${coin.price_change_percentage_24h.toFixed(2)}%
                </p>
                <p class="market-cap">MC: ${formatPrice(coin.market_cap / 1000000)}M</p>
            </div>
        </div>
    `).join('');
}

function renderCoinGrid(coins) {
    const remainingCoins = coins.slice(3);
    const coinGridContainer = document.querySelector('.coin-grid');
    
    coinGridContainer.innerHTML = remainingCoins.map(coin => `
        <div class="coin-card" onclick="window.open('https://www.coingecko.com/en/coins/${coin.id}', '_blank')">
            <div class="coin-card-content">
                <img src="${coin.image}" alt="${coin.name}">
                <div class="coin-details">
                    <h3>${coin.name}</h3>
                    <p class="symbol">${coin.symbol.toUpperCase()}</p>
                    <p class="price">${formatPrice(coin.current_price)}</p>
                    <p class="change ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}">
                        ${coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

async function initializeApp() {
    try {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading';
        loadingElement.innerHTML = 'Loading coins...';
        document.body.appendChild(loadingElement);

        const coins = await fetchMemeCoinsByCategory();
        renderTopPerformers(coins);
        renderCoinGrid(coins);
        updateTickerContent(coins);
        
        setInterval(async () => {
            const updatedCoins = await fetchMemeCoinsByCategory();
            renderTopPerformers(updatedCoins);
            renderCoinGrid(updatedCoins);
            updateTickerContent(updatedCoins);
        }, 30000);

        document.body.removeChild(loadingElement);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateTickerContent(coins) {
    const tickerContent = coins.map(coin => `
        <li>
            <span class="company">${coin.symbol.toUpperCase()}</span>
            <span class="price">${formatPrice(coin.current_price)}</span>
            <span class="${coin.price_change_percentage_24h > 0 ? 'plus' : 'minus'}">
                <span class="change">${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
            </span>
        </li>
    `).join('');

    document.getElementById('ticker-content').innerHTML = tickerContent;
    document.getElementById('ticker-content-clone').innerHTML = tickerContent;
}

document.addEventListener('DOMContentLoaded', initializeApp);

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        const button = document.querySelector('.copy-button');
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Copy CA';
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.log('Copy failed', err);
    }
}