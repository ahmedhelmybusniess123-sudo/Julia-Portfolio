`use strict`

// add event listener on multiple elements
const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++ ) {
        elements[i] .addEventListener(eventType, callback);
    }
}

// navbar toggle for mobile 
const navbar = document.querySelector("[data-navbar]")
const navTogglers = document.querySelectorAll("[data-nav-toggler]")
const overlay = document.querySelector("[data-overlay]")
const toggleNavbar = function() {
    navbar.classList.toggle("active") 
    overlay.classList.toggle("active") 
    document.body.classList.toggle("nav-active") 
}

addEventOnElements(navTogglers, "click", toggleNavbar)

const navbarLinks = document.querySelectorAll(".navbar-link")
addEventOnElements(navbarLinks, "click", function () {
    if (navbar.classList.contains("active")) toggleNavbar()
})

// Light and dark theme toggle
const themeToggle = document.querySelector("[data-theme-toggle]")
const themeIcon = themeToggle.querySelector("ion-icon")

const updateThemeToggle = function () {
    const isDark = document.documentElement.dataset.theme === "dark"
    const nextTheme = isDark ? "light" : "dark"
    themeIcon.setAttribute("name", isDark ? "sunny-outline" : "moon-outline")
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`)
    themeToggle.setAttribute("aria-pressed", String(isDark))
    themeToggle.setAttribute("title", `Switch to ${nextTheme} mode`)
}

themeToggle.addEventListener("click", function () {
    const isDark = document.documentElement.dataset.theme === "dark"

    if (isDark) {
        delete document.documentElement.dataset.theme
    } else {
        document.documentElement.dataset.theme = "dark"
    }

    try {
        localStorage.setItem("devhelmy-theme", isDark ? "light" : "dark")
    } catch (error) {
        // Theme switching remains available for the current page.
    }

    updateThemeToggle()
})

updateThemeToggle()

// Header + active header when window scroll down to 100px
const header = document.querySelector("[data-header]") 
const backToTop = document.querySelector("[data-back-to-top]")
const heroBanner = document.querySelector(".hero-banner")

const updateScrollControls = function () {
    const scrollY = window.scrollY
    header.classList.toggle("active", scrollY > 100)
    backToTop.classList.toggle("active", scrollY > 300)
}

window.addEventListener("scroll", updateScrollControls, { passive: true })
updateScrollControls()

// Subtle hero image parallax while scrolling
let heroParallaxFrame = null
const updateHeroParallax = function () {
    if (!heroBanner) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        heroBanner.style.setProperty("--hero-parallax", "0px")
        return
    }

    if (heroParallaxFrame !== null) return
    heroParallaxFrame = window.requestAnimationFrame(function () {
        const scrollDistance = Math.min(Math.max(window.scrollY, 0), 700)
        const parallaxOffset = Math.round(scrollDistance * 0.025 * 10) / 10
        heroBanner.style.setProperty("--hero-parallax", `${-parallaxOffset}px`)
        heroParallaxFrame = null
    })
}

window.addEventListener("scroll", updateHeroParallax, { passive: true })
updateHeroParallax()

backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" })
})



// scroll reveal 

const revealElements = document.querySelectorAll("[data-reveal]") 
const revealDelayElements = document.querySelectorAll("[data-reveal-delay]") 

const reveal = function () {
    for (let i = 0, len = revealElements.length; i < len; i++ ) { 
        if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.2) {
            revealElements[i].classList.add("revealed") 
        } 
    }
}

for (let i = 0, len = revealDelayElements.length; i < len; i++ ) {
    revealDelayElements[i].style.transitionDelay = revealDelayElements[i].dataset.revealDelay
}

window.addEventListener("scroll", reveal)  
window.addEventListener("load", reveal)  

// Send contact form messages through the server-side Resend endpoint.
const contactForm = document.querySelector("[data-contact-form]")

if (contactForm) {
    const submitButton = contactForm.querySelector("[type=submit]")
    const submitLabel = contactForm.querySelector("[data-submit-label]")
    const formStatus = contactForm.querySelector("[data-form-status]")
    const initialSubmitLabel = submitLabel.textContent

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault()
        submitButton.disabled = true
        submitLabel.textContent = "Sending..."
        formStatus.textContent = ""
        formStatus.classList.remove("is-success", "is-error")

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(Object.fromEntries(new FormData(contactForm).entries())),
            })
            const result = await response.json().catch(() => ({}))

            if (!response.ok || !result.ok) {
                throw new Error(result.error || "The email service is unavailable. Please try again or email me directly.")
            }

            formStatus.textContent = "Your message has been sent. I’ll get back to you soon."
            formStatus.classList.add("is-success")
            contactForm.reset()
        } catch (error) {
            formStatus.textContent = error.message || "The message could not be sent. Please email me directly."
            formStatus.classList.add("is-error")
        } finally {
            submitButton.disabled = false
            submitLabel.textContent = initialSubmitLabel
        }
    })
}
