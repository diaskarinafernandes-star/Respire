document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Glassmorphism no Scroll
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Menu Mobile
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fechar menu ao clicar em um link
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // 3. Intersection Observer para Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. FAQ Accordion Animado
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const content = header.nextElementSibling;
            
            // Fecha todos os outros (opcional, remova se quiser múltiplos abertos)
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle atual
            header.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 5. Gerenciamento de Cookies (LocalStorage Seguro)
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        cookieBanner.classList.remove('show');
        trackEvent('cookie_consent_given');
    });

    // 6. Função de Rastreamento (trackEvent)
    window.trackEvent = function(eventName, eventData = {}) {
        const consent = localStorage.getItem('cookiesAccepted');
        if (consent === 'true') {
            console.log(`[Analytics] Event tracked: ${eventName}`, eventData);
            // Aqui você injetaria: gtag('event', eventName, eventData);
            // ou dataLayer.push({ event: eventName, ...eventData });
        }
    };

    // 7. Rascunho de Formulário no LocalStorage
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');

    // Carregar rascunho
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_draft_${input.name}`);
        if (savedValue) input.value = savedValue;

        // Salvar ao digitar
        input.addEventListener('input', (e) => {
            localStorage.setItem(`form_draft_${e.target.name}`, e.target.value);
        });
    });

    // Limpar rascunho no envio
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulação de envio
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            form.reset();
            inputs.forEach(input => {
                localStorage.removeItem(`form_draft_${input.name}`);
            });
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            trackEvent('form_submitted', { source: 'contact_form' });
        }, 1500);
    });

    // 8. WhatsApp Contextual (Atualiza mensagem baseada na seção visitada)
    const whatsappBtn = document.getElementById('whatsapp-float');
    let lastSection = 'geral';

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lastSection = entry.target.id || 'geral';
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });

    whatsappBtn.addEventListener('mouseenter', () => {
        const messages = {
            'servicos': 'Olá, vi os serviços no site e gostaria de saber mais sobre os valores e disponibilidade.',
            'faq': 'Olá, tenho uma dúvida que não está no FAQ do site. Podem me ajudar?',
            'geral': 'Olá, visitei o site e gostaria de orientação sobre meu diagnóstico.'
        };
        const msg = encodeURIComponent(messages[lastSection] || messages['geral']);
        whatsappBtn.href = `https://wa.me/55(17)99113-1286 ?text=${msg}`;
    });
});