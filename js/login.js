    document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-form');
      const loginBtn = document.getElementById('login-btn');
      const spinner = document.getElementById('login-spinner');
      const icon = document.getElementById('login-icon');
      const loginText = document.getElementById('login-text');
      const loginStatus = document.getElementById('login-status');

      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const messageContainer = document.getElementById('message-container');
      const messageContent = document.getElementById('message-content');
      const closeMessage = document.getElementById('close-message');
      const togglePassword = document.getElementById('toggle-password');
      const passwordIcon = document.getElementById('password-icon');
      const capsLockWarning = document.getElementById('caps-lock-warning');
      const loadingScreen = document.getElementById('loading-screen');
      const offlineIndicator = document.getElementById('offline-indicator');
      const demoBtn = document.getElementById('demo-btn');
      const forgotPasswordBtn = document.getElementById('forgot-password');

      // Variables pour la gestion des tentatives
      let loginAttempts = 0;
      const maxAttempts = 7;
      let isBlocked = false;
      let blockTimer = null;

      // Simulate loading completion
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          document.body.classList.add('animate-fade-in');
        }, 300);
      }, 2000);

      // Network status monitoring
      const updateNetworkStatus = () => {
        if (!navigator.onLine) {
          offlineIndicator.classList.remove('hidden');
        } else {
          offlineIndicator.classList.add('hidden');
        }
      };

      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
      updateNetworkStatus();

      // Message handling with auto-hide
      const showMessage = (msg, type = 'error', duration = 5000) => {
        messageContainer.classList.remove('hidden');
        messageContent.innerHTML = `
          <div class="flex items-start space-x-2">
            <i class="ri-${type === 'error' ? 'error-warning' : type === 'success' ? 'check-circle' : type === 'warning' ? 'alert' : 'information'}-line flex-shrink-0 mt-0.5"></i>
            <span class="flex-1">${msg}</span>
          </div>
        `;
        messageContent.className = `message-box message-${type} relative`;
        
        // Auto-hide after duration
        if (duration > 0) {
          setTimeout(() => {
            hideMessage();
          }, duration);
        }

        // Announce to screen readers
        loginStatus.textContent = msg;
      };

      const hideMessage = () => {
        messageContainer.classList.add('hidden');
        messageContent.innerHTML = '';
        loginStatus.textContent = '';
      };

      closeMessage.addEventListener('click', hideMessage);

      // Input validation
      const validateInput = (input) => {
        const value = input.value.trim();
        const type = input.getAttribute('data-validation');
        let isValid = true;
        let errorMsg = '';

        // Clear previous states
        input.classList.remove('error', 'success');
        
        if (type === 'required' && !value) {
          isValid = false;
          errorMsg = 'Ce champ est obligatoire';
        } else if (input.id === 'username' && value) {
          if (!value.startsWith('@acad.')) {
            isValid = false;
            errorMsg = 'Le nom d\'utilisateur doit commencer par @acad.';
          } else if (value.length < 10) {
            isValid = false;
            errorMsg = 'Format invalide. Exemple: @acad.XXX.XXX';
          }
        } 

        // Update input state
        if (value && isValid) {
          input.classList.add('success');
          const iconElement = document.getElementById(input.id + '-icon');
          if (iconElement) {
            iconElement.className = input.id === 'username' ? 'ri-check-line text-green-500' : iconElement.className;
          }
        } else if (!isValid) {
          input.classList.add('error');
          const iconElement = document.getElementById(input.id + '-icon');
          if (iconElement) {
            iconElement.className = 'ri-error-warning-line text-red-500';
          }
        }

        // Show/hide error message
        const errorElement = document.getElementById(input.id + '-error');
        if (errorElement) {
          if (!isValid && value) {
            errorElement.textContent = errorMsg;
            errorElement.classList.remove('hidden');
            errorElement.setAttribute('aria-live', 'polite');
          } else {
            errorElement.classList.add('hidden');
            errorElement.removeAttribute('aria-live');
          }
        }

        return isValid;
      };

      // Real-time validation
      [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
          // Clear error state on input
          if (input.classList.contains('error')) {
            setTimeout(() => validateInput(input), 300);
          }
        });
      });

      // Password toggle
      togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordIcon.className = type === 'password' ? 'ri-eye-line' : 'ri-eye-off-line';
        
        // Refocus input after toggle
        passwordInput.focus();
      });

      // Caps Lock detection
      const detectCapsLock = (event) => {
        if (event.getModifierState && event.getModifierState('CapsLock')) {
          capsLockWarning.style.display = 'block';
        } else {
          capsLockWarning.style.display = 'none';
        }
      };

      passwordInput.addEventListener('keydown', detectCapsLock);
      passwordInput.addEventListener('keyup', detectCapsLock);

      // Block user after failed attempts
      const blockUser = () => {
        isBlocked = true;
        loginBtn.disabled = true;
        showMessage(`Trop de tentatives échouées. Réessayez dans 5 minutes.`, 'Attention', 0);
        
        let timeLeft = 300; // 5 minutes
        blockTimer = setInterval(() => {
          timeLeft--;
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          loginText.textContent = `Bloqué (${minutes}:${seconds.toString().padStart(2, '0')})`;
          
          if (timeLeft <= 0) {
            clearInterval(blockTimer);
            isBlocked = false;
            loginAttempts = 0;
            loginBtn.disabled = false;
            loginText.textContent = 'Se connecter';
            hideMessage();
          }
        }, 1000);
      };

      // Form submission with enhanced security
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isBlocked) {
          showMessage('Connexion temporairement bloquée. Veuillez patienter.', 'warning');
          return;
        }

        hideMessage();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember-me').checked;

 
        

        if (!navigator.onLine) {
          showMessage('Connexion Internet requise pour se connecter.', 'warning');
          return;
        }

        // Update UI for loading state
        loginBtn.disabled = true;
        spinner.classList.remove('hidden');
        icon.classList.add('hidden');
        loginText.textContent = 'Connexion en cours...';
        loginStatus.textContent = 'Connexion en cours, veuillez patienter...';

        try {
          const response = await fetch('http://localhost:5000/api/schools/login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password, rememberMe })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la connexion');
          }

          // Success - reset attempts
          loginAttempts = 0;
          
          // Store authentication data
          if (rememberMe) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('schoolId', data._id);
            localStorage.setItem('schoolName', data.name);
            localStorage.setItem('rememberMe', 'true');
          } else {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('schoolId', data._id);
            sessionStorage.setItem('schoolName', data.name);
          }

          showMessage('Connexion réussie ! Redirection en cours...', 'success', 2000);
          loginText.textContent = 'Connexion réussie !';
          
          // Smooth redirect after success message
          setTimeout(() => {
            window.location.href = 'main.html';
          }, 1500);

        } catch (error) {
          loginAttempts++;
          
          if (loginAttempts >= maxAttempts) {
            blockUser();
          } else {
            const remainingAttempts = maxAttempts - loginAttempts;
            let errorMessage = error.message || 'Une erreur est survenue';
            
            if (remainingAttempts > 0) {
              errorMessage += ` (${remainingAttempts} tentative(s) restante(s))`;
            }
            
            showMessage(errorMessage, 'error');
            
            // Shake animation for failed login
            loginForm.classList.add('animate-shake');
            setTimeout(() => {
              loginForm.classList.remove('animate-shake');
            }, 500);
            
            // Focus username field for retry
            usernameInput.focus();
          }
        } finally {
          if (!isBlocked) {
            loginBtn.disabled = false;
            spinner.classList.add('hidden');
            icon.classList.remove('hidden');
            loginText.textContent = 'Se connecter';
            loginStatus.textContent = '';
          }
        }
      });

      

       

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Enter key on any input focuses next or submits
        if (e.key === 'Enter') {
          const inputs = Array.from(loginForm.querySelectorAll('input'));
          const currentIndex = inputs.indexOf(document.activeElement);
          
          if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
            e.preventDefault();
            inputs[currentIndex + 1].focus();
          }
        }
        
        // Escape key clears messages
        if (e.key === 'Escape') {
          hideMessage();
        }
      });

      // Auto-focus username field
      setTimeout(() => {
        if (usernameInput && !usernameInput.value) {
          usernameInput.focus();
        }
      }, 100);

      // Load saved username if remember me was checked
      const savedRememberMe = localStorage.getItem('rememberMe');
      if (savedRememberMe === 'true') {
        document.getElementById('remember-me').checked = true;
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          // Auto-redirect if valid token exists
          showMessage('Session active détectée. Redirection...', 'info', 2000);
          setTimeout(() => {
            window.location.href = 'main.html';
          }, 2000);
        }
      }


      // Performance monitoring
      const startTime = performance.now();
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        if (loadTime > 3000) {
          console.warn('Page load time exceeded 3 seconds:', loadTime);
        }
      });

      // Security: Clear sensitive data on page unload
      window.addEventListener('beforeunload', () => {
        if (!document.getElementById('remember-me').checked) {
          passwordInput.value = '';
        }
      });

      // Accessibility: Announce form errors to screen readers
      const announceErrors = () => {
        const errors = loginForm.querySelectorAll('.error');
        if (errors.length > 0) {
          loginStatus.textContent = `${errors.length} erreur(s) dans le formulaire`;
        }
      };

      // Monitor form changes for accessibility
      loginForm.addEventListener('change', announceErrors);

      // Service Worker registration for offline support (if available)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Service worker not available, continue normally
        });
      }

      console.log('AcademyFlow Login - Page initialized successfully');
    });
  

// === Références DOM ===
const forgotPasswordBtn = document.getElementById('forgot-password');
const overlay = document.getElementById('overlay');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const successMessage = document.getElementById('successMessage');
const forgotErrorMessage = document.getElementById('forgotErrorMessage');

const forgotSubmitBtn = document.getElementById('forgot-submit-btn');
const forgotSpinner = document.getElementById('forgot-spinner');
const forgotText = document.getElementById('forgot-text');

// === Ouvrir le popup ===
forgotPasswordBtn.addEventListener('click', () => {
  overlay.classList.remove('hidden');
  successMessage.classList.add('hidden');
  hideForgotError();
});

// === Fermer le popup ===
function closePopup() {
  overlay.classList.add('hidden');
  forgotPasswordForm.reset();
  successMessage.classList.add('hidden');
  hideForgotError();
}

// === Fonctions de message ===
const showForgotError = (msg) => {
  forgotErrorMessage.textContent = msg;
  forgotErrorMessage.classList.remove('hidden');
};

const hideForgotError = () => {
  forgotErrorMessage.textContent = '';
  forgotErrorMessage.classList.add('hidden');
};

// === Envoi du formulaire de récupération de mot de passe ===
forgotPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  hideForgotError();
  successMessage.classList.add('hidden');

  const username = document.getElementById('forgot-username').value.trim();

  if (!username) {
    return showForgotError("Veuillez entrer un nom d'utilisateur.");
  }

  // Désactiver le bouton + afficher spinner
  forgotSubmitBtn.disabled = true;
  forgotText.classList.add('hidden');
  forgotSpinner.classList.remove('hidden');

  try {
    const response = await fetch('http://localhost:5000/api/schools/forgotpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur inconnue");
    }

    // ✅ Succès
    successMessage.classList.remove('hidden');
    forgotPasswordForm.reset();

  } catch (error) {
    showForgotError(error.message);
  } finally {
    // Réactiver le bouton + cacher spinner
    forgotSubmitBtn.disabled = false;
    forgotText.classList.remove('hidden');
    forgotSpinner.classList.add('hidden');
  }
});

