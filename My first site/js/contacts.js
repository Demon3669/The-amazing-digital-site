/* =========================================== */
/* contacts.js - форма обратной связи (демо)   */
/* =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('contacts.js загружен');
    initCharCounter();
    initFAQ();
    initForm();
});

function initCharCounter() {
    const textarea = document.getElementById('message');
    const counter = document.getElementById('charCount');
    if (!textarea || !counter) return;
    const MAX = 500, WARN = 450;

    function update() {
        const len = textarea.value.length;
        counter.textContent = len;
        counter.classList.remove('near-limit', 'at-limit');
        textarea.classList.remove('limit-reached');
        if (len >= MAX) {
            counter.classList.add('at-limit');
            textarea.classList.add('limit-reached');
        } else if (len >= WARN) {
            counter.classList.add('near-limit');
        }
    }
    update();
    textarea.addEventListener('input', update);

    function showWarning(el) {
        const old = el.parentNode.querySelector('.limit-message');
        if (old) old.remove();
        const warn = document.createElement('div');
        warn.className = 'limit-message';
        warn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Достигнут лимит в 500 символов';
        el.parentNode.appendChild(warn);
        el.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            el.style.animation = '';
            setTimeout(() => warn.remove(), 3000);
        }, 500);
    }

    textarea.addEventListener('paste', function() {
        setTimeout(() => {
            if (this.value.length > MAX) {
                this.value = this.value.substring(0, MAX);
                update();
                showWarning(this);
            }
        }, 0);
    });
    textarea.addEventListener('keydown', function(e) {
        if (this.value.length >= MAX && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && !/^Arrow|Delete|Backspace|Tab|Escape|Enter$/.test(e.key)) {
            e.preventDefault();
            showWarning(this);
        }
    });
}

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        const answer = question.nextElementSibling;
        if (!answer || !answer.classList.contains('faq-answer')) return;
        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                if (q.nextElementSibling?.classList.contains('faq-answer')) {
                    q.nextElementSibling.classList.remove('active');
                }
            });
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

function initForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        resetErrorStyles();

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        // Имитация отправки (демо-режим)
        setTimeout(() => {
            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const message = document.getElementById('message')?.value.trim();
            const agreement = document.getElementById('agreement')?.checked;

            let hasError = false;
            if (!name) { showErrorByField('name', 'Пожалуйста, введите имя'); hasError = true; }
            if (!email) { showErrorByField('email', 'Пожалуйста, введите email'); hasError = true; }
            else if (!/^\S+@\S+\.\S+$/.test(email)) { showErrorByField('email', 'Введите корректный email'); hasError = true; }
            if (!message) { showErrorByField('message', 'Пожалуйста, введите сообщение'); hasError = true; }
            if (!agreement) { showErrorByField('agreement', 'Необходимо согласие на обработку данных'); hasError = true; }

            if (!hasError) {
                showSuccessMessage(form, 'Сообщение успешно отправлено!');
                form.reset();
                const counter = document.getElementById('charCount');
                if (counter) {
                    counter.textContent = '0';
                    counter.classList.remove('near-limit', 'at-limit');
                }
                document.getElementById('message')?.classList.remove('limit-reached');
            }
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 800);
    });
}

function showErrorByField(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const group = input.closest('.form-group, .checkbox-group');
    if (group) {
        const old = group.querySelector('.error-message');
        if (old) old.remove();
        const err = document.createElement('div');
        err.className = 'error-message';
        err.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        group.appendChild(err);
        input.classList.add('error');
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => input.style.animation = '', 500);
    }
}

function showSuccessMessage(form, msg) {
    const old = document.querySelector('.success-message');
    if (old) old.remove();
    const success = document.createElement('div');
    success.className = 'success-message';
    success.innerHTML = `<i class="fas fa-check-circle"></i> <strong>${msg}</strong><p>Спасибо за ваше обращение. Я свяжусь с вами в ближайшее время.</p>`;
    form.parentNode.insertBefore(success, form.nextSibling);
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
        success.style.opacity = '0';
        success.style.transition = 'opacity 0.3s';
        setTimeout(() => success.remove(), 300);
    }, 5000);
}

function resetErrorStyles() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
        el.classList.remove('error');
        el.style.animation = '';
    });
}