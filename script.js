document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const mainMenu = document.getElementById('main-menu');
    const exerciseScreen = document.getElementById('exercise-screen');
    const exerciseTitle = document.getElementById('exercise-title');
    const exerciseArea = document.getElementById('exercise-area');
    const exerciseFooterText = document.getElementById('exercise-footer-text');
    const backBtn = document.getElementById('back-btn');
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    // --- Estado Global ---
    let timerInterval = null;
    let exerciseInterval = null;
    // CAMBIO 3: Variable para la cuenta regresiva
    let totalSeconds = 60; 
    let isPaused = false;
    let currentExercise = null;

    // --- Configuración de Ejercicios ---
    const exercises = {
        focus: {
            name: 'Enfoque Lejano-Cercano',
            footerText: 'Recuerda parpadear con normalidad y no mover la cabeza.',
            setup: () => exerciseArea.innerHTML = '<div id="focus-dot"></div><p id="instruction">Presiona Iniciar para comenzar</p>',
            start: () => {
                let isNear = true;
                const runCycle = () => {
                    if (isPaused) return;
                    const dot = document.getElementById('focus-dot');
                    const instruction = document.getElementById('instruction');
                    if (isNear) {
                        dot.className = 'far';
                        instruction.textContent = 'Enfoca en el punto lejano...';
                    } else {
                        dot.className = 'near';
                        instruction.textContent = 'Ahora, enfoca en el punto cercano...';
                    }
                    isNear = !isNear;
                };
                runCycle();
                exerciseInterval = setInterval(runCycle, 4000);
            }
        },
        figure8: {
            name: 'Seguimiento en 8',
            footerText: 'Sigue el punto solo con los ojos. Mantén la cabeza quieta.',
            setup: () => exerciseArea.innerHTML = '<div id="figure8-dot"></div>',
            start: () => {
                const dot = document.getElementById('figure8-dot');
                dot.style.animationPlayState = 'running';
            },
            pause: () => {
                const dot = document.getElementById('figure8-dot');
                dot.style.animationPlayState = isPaused ? 'running' : 'paused';
            },
            reset: () => {
                const dot = document.getElementById('figure8-dot');
                dot.style.animation = 'none';
                setTimeout(() => dot.style.animation = '', 10);
            }
        },
        palming: {
            name: 'Relajación con Palmeo',
            footerText: 'Cubre tus ojos suavemente. Siente el calor y relaja tu mirada.',
            setup: () => exerciseArea.innerHTML = '<div class="palming-content"><p>Respira hondo...</p><p>Relaja tu cuerpo y tu mente.</p></div>',
            start: () => {
                exerciseArea.style.background = '#000';
                exerciseArea.style.borderColor = '#000';
            },
            reset: () => {
                exerciseArea.style.background = '';
                exerciseArea.style.borderColor = '';
            }
        },
        blinking: {
            name: 'Parpadeo Consciente',
            footerText: 'Parpadea lenta y completamente cada vez que el círculo pulse.',
            setup: () => exerciseArea.innerHTML = '<div id="blinking-guide">Parpadea</div>',
            start: () => {
                const guide = document.getElementById('blinking-guide');
                guide.classList.add('active');
            },
            reset: () => {
                const guide = document.getElementById('blinking-guide');
                guide.classList.remove('active');
            }
        }
    };

    // --- Funciones de Navegación y Control ---
    const showScreen = (screen) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    };

    const loadExercise = (exerciseId) => {
        reset(); // Resetea todo antes de cargar
        currentExercise = exercises[exerciseId];
        exerciseTitle.textContent = currentExercise.name;
        exerciseFooterText.textContent = currentExercise.footerText;
        currentExercise.setup();
        showScreen(exerciseScreen);
    };

    const goBack = () => {
        reset();
        showScreen(mainMenu);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // CAMBIO 3: Lógica de cuenta regresiva
    const updateTimer = () => {
        totalSeconds--;
        timerDisplay.textContent = formatTime(totalSeconds);

        if (totalSeconds <= 0) {
            // El ejercicio ha terminado
            clearInterval(timerInterval);
            clearInterval(exerciseInterval);
            timerInterval = null;
            exerciseInterval = null;
            
            startBtn.disabled = true;
            pauseBtn.disabled = true;

            // Mensaje de finalización
            exerciseArea.innerHTML = '<div class="palming-content"><h2>¡Tiempo!</h2><p>Ejercicio completado.</p></div>';
            
            if (currentExercise && currentExercise.reset) {
                currentExercise.reset();
            }
        }
    };

    const start = () => {
        if (timerInterval) return;
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Pausar';
        
        timerInterval = setInterval(updateTimer, 1000);
        if (currentExercise && currentExercise.start) {
            currentExercise.start();
        }
    };

    const pause = () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Reanudar' : 'Pausar';

        if (isPaused) {
            clearInterval(timerInterval);
            timerInterval = null;
        } else {
            timerInterval = setInterval(updateTimer, 1000);
        }

        if (currentExercise && currentExercise.pause) {
            currentExercise.pause();
        }
    };

    const reset = () => {
        clearInterval(timerInterval);
        clearInterval(exerciseInterval);
        timerInterval = null;
        exerciseInterval = null;
        
        // CAMBIO 3: Reinicia el contador a 60 segundos
        totalSeconds = 60; 
        timerDisplay.textContent = formatTime(totalSeconds);
        
        isPaused = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Pausar';

        if (currentExercise && currentExercise.reset) {
            currentExercise.reset();
        }
        // Vuelve a cargar el contenido inicial del ejercicio si se está en la pantalla de ejercicio
        if (exerciseScreen.classList.contains('active')) {
            currentExercise.setup();
        }
    };

    // --- Event Listeners ---
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.addEventListener('click', () => {
            const exerciseId = card.dataset.exercise;
            loadExercise(exerciseId);
        });
    });
    backBtn.addEventListener('click', goBack);
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
});