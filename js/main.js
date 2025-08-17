// Enhanced component loader for Alohakia website
class ComponentLoader {
    constructor() {
        this.components = [
            { name: 'hero_refined', target: 'hero-component' },
            { name: 'deals_refined', target: 'deals-component' },
            { name: 'test_adventure1', target: 'adventures-component' },
            { name: 'test_audio1', target: 'audio-component' },
            { name: 'test_goods', target: 'goods-component' }
        ];
        this.loadedComponents = new Set();
    }

    async loadComponent(componentName, targetId) {
        try {
            const response = await fetch(`/components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${componentName}: ${response.status}`);
            }
            
            const html = await response.text();
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.innerHTML = html;
                
                // Execute any scripts in the loaded component
                const scripts = targetElement.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.head.appendChild(newScript);
                });

                this.loadedComponents.add(componentName);
                console.log(`✅ Loaded component: ${componentName}`);
                
                // Trigger component-specific initialization
                this.initializeComponent(componentName);
            }
        } catch (error) {
            console.error(`❌ Error loading component ${componentName}:`, error);
        }
    }

    initializeComponent(componentName) {
        // Component-specific initialization logic
        switch(componentName) {
            case 'hero_refined':
                this.initializeChat();
                break;
            case 'deals_refined':
                this.initializeDeals();
                break;
            case 'test_adventure1':
                this.initializeAdventures();
                break;
            case 'test_audio1':
                this.initializeAudio();
                break;
            case 'test_goods':
                this.initializeGoods();
                break;
        }
    }

    initializeChat() {
        // Kai chat functionality
        if (typeof handleChatEnter === 'undefined') {
            window.handleChatEnter = (event) => {
                if (event.key === 'Enter') {
                    sendToKai();
                }
            };
        }

        if (typeof sendToKai === 'undefined') {
            window.sendToKai = () => {
                const input = document.getElementById('chatInput') || document.getElementById('kaiChatInput');
                if (input && input.value.trim()) {
                    // Add message to chat (placeholder for now)
                    console.log('Sending to Kai:', input.value);
                    input.value = '';
                }
            };
        }
    }

    initializeDeals() {
        // Horizontal scroll and filtering for deals
        const scrollContainer = document.querySelector('.horizontal-scroll');
        if (scrollContainer) {
            // Add smooth scrolling behavior
            scrollContainer.style.scrollBehavior = 'smooth';
        }
    }

    initializeAdventures() {
        // Adventure card flip animations
        const adventureCards = document.querySelectorAll('.adventure-card');
        adventureCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });
    }

    initializeAudio() {
        // Audio guide functionality
        console.log('Audio component initialized');
    }

    initializeGoods() {
        // Goods/shop functionality
        console.log('Goods component initialized');
    }

    async loadAllComponents() {
        console.log('🚀 Loading Alohakia components...');
        
        for (const component of this.components) {
            await this.loadComponent(component.name, component.target);
        }
        
        console.log('✅ All components loaded!');
        this.initializeGlobalFeatures();
    }

    initializeGlobalFeatures() {
        // Global features like theme toggle, smooth scrolling, etc.
        this.initializeThemeToggle();
        this.initializeScrollBehavior();
    }

    initializeThemeToggle() {
        // Theme toggle for Hawaii sun viewing
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            });

            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            }
        }
    }

    initializeScrollBehavior() {
        // Smooth horizontal scrolling for all sections
        const scrollSections = document.querySelectorAll('.horizontal-scroll');
        scrollSections.forEach(section => {
            section.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    section.scrollLeft += e.deltaY;
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAllComponents();
});

// Global utilities
window.ComponentLoader = ComponentLoader;