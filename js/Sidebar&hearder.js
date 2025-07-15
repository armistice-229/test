
        // Utility functions
        const Utils = {
            formatDate: (date) => {
                return date.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });
            },
            
            formatTime: (date) => {
                return date.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            },
            
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        };

        // DOM elements
        const elements = {
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            closeSidebarBtn: document.getElementById('close-sidebar'),
            profileBtn: document.getElementById('profile-btn'),
            profileDropdown: document.getElementById('profile-dropdown'),
            logoutBtn: document.getElementById('logout-btn'),
            currentDate: document.getElementById('current-date'),
            currentTime: document.getElementById('current-time'),
            userName: document.getElementById('user-name'),
            userInitials: document.getElementById('user-initials'),
            dropdownSchoolName: document.getElementById('dropdown-school-name')
        };

        // Mobile menu functionality
        class MobileMenu {
            constructor() {
                this.init();
            }
            
            init() {
                elements.mobileMenuBtn?.addEventListener('click', () => this.open());
                elements.closeSidebarBtn?.addEventListener('click', () => this.close());
                elements.sidebarOverlay?.addEventListener('click', () => this.close());
                
                // Close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen()) {
                        this.close();
                    }
                });
            }
            
            open() {
                elements.sidebar?.classList.add('open');
                elements.sidebarOverlay?.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            close() {
                elements.sidebar?.classList.remove('open');
                elements.sidebarOverlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            isOpen() {
                return elements.sidebar?.classList.contains('open');
            }
        }

        // Profile dropdown functionality
        class ProfileDropdown {
            constructor() {
                this.isOpen = false;
                this.init();
            }
            
            init() {
                elements.profileBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
                
                document.addEventListener('click', (e) => {
                    if (!elements.profileBtn?.contains(e.target) && 
                        !elements.profileDropdown?.contains(e.target)) {
                        this.close();
                    }
                });
                
                // Close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) {
                        this.close();
                    }
                });
            }
            
            toggle() {
                this.isOpen ? this.close() : this.open();
            }
            
            open() {
                elements.profileDropdown?.classList.remove('hidden');
                elements.profileBtn?.setAttribute('aria-expanded', 'true');
                this.isOpen = true;
            }
            
            close() {
                elements.profileDropdown?.classList.add('hidden');
                elements.profileBtn?.setAttribute('aria-expanded', 'false');
                this.isOpen = false;
            }
        }

        // Date and time updater
        class DateTimeUpdater {
            constructor() {
                this.updateDateTime();
                this.startInterval();
            }
            
            updateDateTime() {
                const now = new Date();
                if (elements.currentDate) {
                    elements.currentDate.textContent = Utils.formatDate(now);
                }
                if (elements.currentTime) {
                    elements.currentTime.textContent = Utils.formatTime(now);
                }
            }
            
            startInterval() {
                setInterval(() => this.updateDateTime(), 1000);
            }
        }

        // User data manager
        class UserDataManager {
            constructor() {
                this.loadUserData();
            }
            
            loadUserData() {
                const schoolName = localStorage.getItem('schoolName');
                const userName = localStorage.getItem('userName') || 'Martine Akuavi SOSOUKPE';
                
                if (schoolName) {
                    elements.dropdownSchoolName.textContent = schoolName;
                }
                
                if (elements.userName) {
                    elements.userName.textContent = userName;
                }
                
                // Update user initials
                if (elements.userInitials) {
                    const initials = userName.split(' ')
                        .map(name => name.charAt(0))
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();
                    elements.userInitials.textContent = initials;
                }
            }
            
            logout() {
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    localStorage.clear();
                    window.location.href = 'file:///C:/AcademyFlow4/frontend/login.html';
                }
            }
        }

        // Navigation handler
        class NavigationHandler {
            constructor() {
                this.init();
            }
            
            init() {
                // Add active state to current page
                const currentPath = window.location.pathname;
                document.querySelectorAll('.nav-link').forEach(link => {
                    if (link.href && link.href.includes(currentPath)) {
                        link.classList.add('bg-primary-50', 'text-primary-700', 'border-r-2', 'border-primary-500');
                    }
                });
                
                // Handle navigation clicks
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Optional: Add loading state
                        this.showLoading();
                    });
                });
            }
            
            showLoading() {
                const loadingState = document.getElementById('loading-state');
                const mainContent = document.getElementById('main-content');
                
                if (loadingState && mainContent) {
                    mainContent.classList.add('hidden');
                    loadingState.classList.remove('hidden');
                }
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
                    const token = localStorage.getItem('token');
/*
    if (!token) {
        window.location.href = 'file:///C:/AcademyFlow4/frontend/login.html';
        return;
    }
  */          new MobileMenu();
            new ProfileDropdown();
            new DateTimeUpdater();
            new UserDataManager();
            new NavigationHandler();
            
            // Logout functionality
            elements.logoutBtn?.addEventListener('click', () => {
                new UserDataManager().logout();
            });
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth >= 768) {
                elements.sidebar?.classList.remove('open');
                elements.sidebarOverlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, 250));
// End of file: frontend/js/Sidebar&hearder.js
// This file contains the JavaScript code for the sidebar and header functionality
// It includes mobile menu handling, profile dropdown, date/time updates, user data management, and navigation handling.
// This code is designed to enhance the user experience by providing a responsive and interactive sidebar and header.
// It also includes utility functions for formatting dates and times, and debouncing events.
// This code is part of the AcademyFlow project, version 4.1.0, and is intended for educational management systems.
// The code is structured to be modular, with classes handling specific functionalities, making it easier to maintain and extend.
// The sidebar and header are designed to be user-friendly, with clear navigation options and a responsive design that adapts to different screen sizes.
// The code also ensures accessibility by managing focus and keyboard interactions, allowing users to navigate using both mouse and keyboard.
// The user data manager retrieves user information from local storage, ensuring a personalized experience. 