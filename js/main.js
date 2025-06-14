// Component Loader System
async function loadComponent(componentName, targetId) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${componentName}:`, error);
    }
}

// Load all components when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Load all components
    const components = [
        { name: 'header', target: 'header-component' },
        { name: 'hero', target: 'hero-component' },
        { name: 'deals', target: 'deals-component' },
        { name: 'sms', target: 'sms-component' },
        { name: 'wisdom', target: 'wisdom-component' },
        { name: 'cta', target: 'cta-component' },
        { name: 'footer', target: 'footer-component' }
    ];

    // Load components in parallel
    await Promise.all(
        components.map(comp => loadComponent(comp.name, comp.target))
    );

    // Initialize animations after components are loaded
    initializeAnimations();
    
    // Initialize Kai SMS Demo
    initializeKaiDemo();
    
    // Initialize Floating Messages for SMS Section after components load
    setTimeout(() => {
        initializeFloatingMessages();
    }, 500);
    
    // Load spacing controls (dev mode only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        loadSpacingControls();
    }
});

// Initialize all animations
function initializeAnimations() {
    // Animate savings counter in deals section
    initializeSavingsCounter();
    
    // Initialize wisdom rotation
    initializeWisdomRotation();
    
    // Initialize card hover effects
    initializeCardEffects();
}

// Savings counter animation
function initializeSavingsCounter() {
    const counter = document.getElementById('savings-counter');
    if (!counter) return;
    
    // Set up intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter();
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Find the deals section and observe it
    const dealsSection = document.getElementById('deals-component');
    if (dealsSection) {
        observer.observe(dealsSection);
    }
    
    function animateCounter() {
        const target = 127;
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 40);
    }
}

// Wisdom section rotation
function initializeWisdomRotation() {
    let currentWisdomIndex = 0;
    const progressDots = document.querySelectorAll('.progress-dot');
    
    if (progressDots.length > 0) {
        function updateProgressDots() {
            progressDots.forEach((dot, index) => {
                if (index === currentWisdomIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Update wisdom index every 12 seconds (changed from 4)
        setInterval(() => {
            currentWisdomIndex = (currentWisdomIndex + 1) % 5;
            updateProgressDots();
        }, 12000);
    }
}

// Glass card mouse tracking effects
function initializeCardEffects() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// Load spacing controls for development
async function loadSpacingControls() {
    try {
        const response = await fetch('components/spacing-controls.html');
        const html = await response.text();
        document.getElementById('spacing-controls').innerHTML = html;
    } catch (error) {
        console.log('Spacing controls not loaded (production mode)');
    }
}

// SMS Message Flow Animation
function initializeKaiDemo() {
    const messages = [
        { type: 'user', text: 'Best sunset spot tonight?', delay: 500 },
        { type: 'kai', text: 'Poipu Beach! Low tide at 6:47pm makes epic reflections. Or try the cliffs at Makawehi for something different 🌅', delay: 2000 },
        { type: 'user', text: 'How about poke?', delay: 4000 },
        { type: 'kai', text: 'Koloa Fish Market has the best! Spicy ahi is 🔥 Show them this text for 15% off with Kai', delay: 5500 },
        { type: 'user', text: 'Mahalo! 🤙', delay: 7500 }
    ];
    
    const container = document.getElementById('messageContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Add messages with delays
    messages.forEach(msg => {
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} message-animate`;
            messageDiv.style.opacity = '0';
            
            const bubbleClass = msg.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-white';
                
            messageDiv.innerHTML = `
                <div class="${bubbleClass} rounded-2xl px-4 py-2 max-w-xs">
                    <p class="text-sm">${msg.text}</p>
                </div>
            `;
            
            container.appendChild(messageDiv);
            
            // Trigger animation
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.animation = 'fadeInUp 0.5s ease-out forwards';
            }, 50);
            
            // Auto-scroll
            container.scrollTop = container.scrollHeight;
        }, msg.delay);
    });
    
    // Loop the animation
    setTimeout(() => {
        initializeKaiDemo(); // Restart after all messages
    }, 10000);
}

// Chat Messages Animation for SMS Section
function initializeFloatingMessages() {
    console.log('Starting initializeFloatingMessages...');
    
    const conversations = [
        [
            { type: 'user', text: 'hey kai! first time on kauai', delay: 500 },
            { type: 'kai', text: 'Aloha! Welcome to paradise! 🌺 How long are you here for?', delay: 1500 },
            { type: 'user', text: 'a week! what should I do first?', delay: 2500 },
            { type: 'kai', text: 'Start with Poipu Beach tomorrow morning! Perfect for first timers. Monk seals might be chilling on the sand 🦭', delay: 3500 },
            { type: 'kai', text: 'Btw, Puka Dog nearby has amazing Hawaiian hot dogs. Show them this text for 10% off!', delay: 5000 }
        ],
        [
            { type: 'user', text: 'best sunset spot tonight?', delay: 500 },
            { type: 'kai', text: 'Checking conditions...', delay: 1200 },
            { type: 'kai', text: 'Hanalei Bay! 6:47pm sunset. The pier gives epic views. Get there by 6:30 🌅', delay: 2000 },
            { type: 'user', text: 'any food nearby?', delay: 3500 },
            { type: 'kai', text: 'Bar Acuda for tapas or Chicken in a Barrel for BBQ. Both are 🔥', delay: 4500 }
        ],
        [
            { type: 'user', text: 'secret beach recommendations?', delay: 500 },
            { type: 'kai', text: "Okay, you didn't hear this from me... 🤫", delay: 1500 },
            { type: 'kai', text: "Mahaulepu Trail past Shipwreck Beach. Park at the end, walk 20 mins east. You'll know when you see it", delay: 2500 },
            { type: 'user', text: '🤙 mahalo!!', delay: 4000 },
            { type: 'kai', text: 'Stay safe out there! Low tide is at 2pm today, perfect timing 🌊', delay: 5000 }
        ]
    ];
    
    const container = document.getElementById('chatContainer');
    console.log('Container found:', container);
    
    if (!container) {
        console.error('Chat container not found! Will retry in 1 second...');
        setTimeout(() => initializeFloatingMessages(), 1000);
        return;
    }
    
    // Add a test message immediately to verify it's working
    const testDiv = document.createElement('div');
    testDiv.className = 'message kai';
    testDiv.innerHTML = '<div class="bubble">Loading conversations...</div>';
    container.appendChild(testDiv);
    
    setTimeout(() => {
        container.innerHTML = ''; // Clear test message
        startConversations();
    }, 1000);
    
    let convIndex = 0;
    
    function startConversations() {
        showConversation();
    }
    
    function showConversation() {
        console.log('Showing conversation', convIndex);
        const conversation = conversations[convIndex % conversations.length];
        container.innerHTML = ''; // Clear previous messages
        
        conversation.forEach((msg, i) => {
            setTimeout(() => {
                // Show typing indicator for Kai messages
                if (msg.type === 'kai' && i > 0) {
                    const typingDiv = document.createElement('div');
                    typingDiv.className = 'message kai';
                    typingDiv.style.opacity = '1';
                    typingDiv.innerHTML = `
                        <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    `;
                    container.appendChild(typingDiv);
                    container.scrollTop = container.scrollHeight;
                    
                    // Fade out typing indicator then replace with message
                    setTimeout(() => {
                        typingDiv.querySelector('.typing-indicator').classList.add('fade-out');
                        setTimeout(() => {
                            container.removeChild(typingDiv);
                            addMessage(msg);
                        }, 300);
                    }, 1200);
                } else {
                    addMessage(msg);
                }
            }, msg.delay);
        });
        
        // Move to next conversation after this one completes
        const totalDelay = conversation[conversation.length - 1].delay + 3000;
        setTimeout(() => {
            convIndex++;
            showConversation();
        }, totalDelay);
    }
    
    function addMessage(msg) {
        console.log('Adding message:', msg.text);
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}`;
        messageDiv.innerHTML = `<div class="bubble">${msg.text}</div>`;
        container.appendChild(messageDiv);
        
        // Smooth scroll to bottom
        setTimeout(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
    }
}