/**
 * DigiSenior — navegação: scroll spy (Intersection Observer), menu mobile, âncoras
 */
(function () {
    "use strict";

    var HEADER_OFFSET = 88;

    /** IDs das seções que aparecem no menu (ordem = ordem na página) */
    var SECTION_IDS = ["inicio", "problema", "impacto", "solucao", "equipe"];

    var navLinks = document.querySelectorAll(".nav-link[data-section]");
    var sections = SECTION_IDS.map(function (id) {
        return document.getElementById(id);
    }).filter(Boolean);

    var hamburger = document.getElementById("hamburger-btn");
    var hamburgerIconLabel = document.getElementById("hamburger-icon-label");
    var mobileBackdrop = document.getElementById("mobile-menu-backdrop");
    var mobilePanel = document.getElementById("mobile-menu-panel");
    var mobileNavLinks = document.querySelectorAll("#mobile-menu-panel .nav-link");

    /**
     * Atualiza a classe .active nos links cujo data-section corresponde ao id.
     */
    function setActiveSection(activeId) {
        navLinks.forEach(function (link) {
            var sid = link.getAttribute("data-section");
            var isActive = sid === activeId;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    /**
     * Scroll spy: considera “ativa” a seção com maior área visível na faixa abaixo do header.
     */
    function updateScrollSpy() {
        var viewportH = window.innerHeight;
        var topLimit = HEADER_OFFSET;
        var bestId = "inicio";
        var bestScore = -1;

        sections.forEach(function (section) {
            var rect = section.getBoundingClientRect();
            var visibleTop = Math.max(rect.top, topLimit);
            var visibleBottom = Math.min(rect.bottom, viewportH);
            var visible = Math.max(0, visibleBottom - visibleTop);
            var score = visible / Math.max(rect.height, 1);

            if (visible > bestScore) {
                bestScore = visible;
                bestId = section.id;
            }
        });

        if (window.scrollY < 120) {
            bestId = "inicio";
        }

        setActiveSection(bestId);
    }

    var scrollSpyTicking = false;
    function onScrollOrResize() {
        if (!scrollSpyTicking) {
            window.requestAnimationFrame(function () {
                updateScrollSpy();
                scrollSpyTicking = false;
            });
            scrollSpyTicking = true;
        }
    }

    /** Intersection Observer como reforço quando seções entram/saem do viewport */
    function initIntersectionObserver() {
        if (!("IntersectionObserver" in window) || sections.length === 0) {
            window.addEventListener("scroll", onScrollOrResize, { passive: true });
            window.addEventListener("resize", onScrollOrResize);
            updateScrollSpy();
            return;
        }

        var observer = new IntersectionObserver(
            function () {
                updateScrollSpy();
            },
            {
                root: null,
                rootMargin: "-" + HEADER_OFFSET + "px 0px -45% 0px",
                threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
            }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        updateScrollSpy();
    }

    /**
     * Menu mobile: abrir / fechar.
     * Ícone ☰ / × via texto (evita falhas de sobreposição/CSS com dois spans).
     */
    function setHamburgerIcon(open) {
        if (!hamburgerIconLabel) return;
        hamburgerIconLabel.textContent = open ? "\u00D7" : "\u2630";
    }

    function setMobileMenuOpen(open) {
        if (!hamburger || !mobileBackdrop || !mobilePanel) return;

        hamburger.classList.toggle("is-open", open);
        setHamburgerIcon(open);
        hamburger.setAttribute("aria-expanded", open ? "true" : "false");
        hamburger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        mobileBackdrop.classList.toggle("is-open", open);
        mobilePanel.classList.toggle("is-open", open);
        mobileBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
        mobilePanel.setAttribute("aria-hidden", open ? "false" : "true");
        document.body.style.overflow = open ? "hidden" : "";
    }

    function initMobileMenu() {
        if (!hamburger) return;

        hamburger.addEventListener("click", function () {
            var open = !mobilePanel.classList.contains("is-open");
            setMobileMenuOpen(open);
        });

        if (mobileBackdrop) {
            mobileBackdrop.addEventListener("click", function () {
                setMobileMenuOpen(false);
            });
        }

        function closeMenuOnAnchorClick() {
            setMobileMenuOpen(false);
        }

        mobileNavLinks.forEach(function (link) {
            link.addEventListener("click", closeMenuOnAnchorClick);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && mobilePanel && mobilePanel.classList.contains("is-open")) {
                setMobileMenuOpen(false);
            }
        });
    }

    /** Garante fechamento do menu ao seguir âncoras (scroll nativo já é suave via CSS) */
    function initCtaAnchorHelpers() {
        document.querySelectorAll('a[href="#cta-final"]').forEach(function (el) {
            el.addEventListener("click", function () {
                if (mobilePanel && mobilePanel.classList.contains("is-open")) {
                    setMobileMenuOpen(false);
                }
            });
        });
    }

    function init() {
        setHamburgerIcon(false);
        initIntersectionObserver();
        initMobileMenu();
        initCtaAnchorHelpers();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
