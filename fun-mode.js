// ==============================================================
// fun-mode.js - Normal / Fun mode (shared by every page)
//
// How it works:
//   - The navbar button (#fun-toggle) turns fun mode on and off.
//   - Fun mode adds the class "fun-mode" to <body>. All fun-mode
//     colors and styles live under body.fun-mode in style.css.
//   - Every time fun mode is turned on, 5 random effects are picked
//     from the EFFECTS list below.
//   - The mode AND the picked effects are saved in sessionStorage, so
//     they stay the same when you switch pages, but every new visit
//     (new tab or window) starts in normal mode.
//   - Everything fun mode adds is tracked, so stopFun() can undo it all.
// ==============================================================

const funToggle = document.getElementById("fun-toggle");

const EFFECTS_PER_CLICK = 5;  // how many effects each click picks
const GIFS_PER_PAGE = 4;      // how many GIFs get scattered around
const LOADING_LOOPS = 3;      // times the fake loading screen restarts before giving up

// Every GIF in the images folder - add new file names here
const GIFS = [
    "Working Kermit The Frog GIF.gif",
    "Suspicious Monkey GIF by MOODMAN.gif",
    "Lizard Hello GIF.gif",
    "Minions Mic Drop GIF.gif",
    "Shaun The Sheep Movie Ok GIF.gif",
    "Happy Season 5 GIF by The Office.gif"
];

// All the effects fun mode can pick from.
// The name on the left is what gets saved; the function on the right turns it on.
const EFFECTS = {
    visitorCounter: visitorCounter,
    underConstruction: underConstruction,
    fakeAwards: fakeAwards,
    contactPopup: contactPopup,
    dodgyClose: dodgyClose,
    hoverLabels: hoverLabels,
    clickMeButton: clickMeButton,
    cookieBanner: cookieBanner,
    mouseDetected: mouseDetected,
    fakeLoading: fakeLoading,
    confirmEverything: confirmEverything,
    cornerNav: cornerNav,
    sidewaysBio: sidewaysBio,
    rotateEveryThirdClick: rotateEveryThirdClick,
    emojiTrail: emojiTrail,
    rhymeButton: rhymeButton,
    navShuffle: navShuffle,
    giantCursor: giantCursor,
    fixMyWebsite: fixMyWebsite
};


// ---------- Tracking (so stopFun can clean up) ----------
let activeEffects = []; // names of the effects that are currently on
let funTimers = [];     // setInterval / setTimeout ids
let funListeners = [];  // [target, type, handler, options] for every event listener
let funUndo = [];       // functions that put changed things back the way they were

// addEventListener, but remembered so stopFun() can remove it
function funListen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    funListeners.push([target, type, handler, options]);
}

// setInterval, but remembered so stopFun() can stop it
function funEvery(ms, callback) {
    const id = setInterval(callback, ms);
    funTimers.push(id);
    return id;
}

// setTimeout, but remembered so stopFun() can cancel it
function funLater(ms, callback) {
    const id = setTimeout(callback, ms);
    funTimers.push(id);
    return id;
}

// Builds an element from an HTML string and adds it to the page.
// It gets the class "fun-layer" so stopFun() can find and remove it.
function addFunElement(html, parent = document.body, atStart = false) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const element = wrapper.firstElementChild;
    element.classList.add("fun-layer");

    if (atStart) {
        parent.prepend(element);
    } else {
        parent.appendChild(element);
    }
    return element;
}


// ---------- Small helpers ----------
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Shuffles an array in place (Fisher-Yates shuffle)
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function mainArea() {
    return document.querySelector("main") || document.body;
}

function navbarHeight() {
    const navbar = document.querySelector(".navbar");
    return navbar ? navbar.offsetHeight : 0;
}

// A row of silly buttons at the top of the page (made the first time it's needed)
function funBar() {
    return document.querySelector(".fun-bar") ||
        addFunElement(`<div class="fun-bar"></div>`, mainArea(), true);
}

// A retro 2004-style footer at the bottom of the page (made the first time it's needed)
function funFooter() {
    return document.querySelector(".fun-footer") ||
        addFunElement(`<div class="fun-footer"></div>`, mainArea());
}


// ==============================================================
// Turning fun mode on and off
// ==============================================================

// Picks `count` random effects that aren't already on
function pickRandomEffects(count, alreadyActive) {
    const available = shuffle(Object.keys(EFFECTS).filter(name => !alreadyActive.includes(name)));
    const picks = available.slice(0, count);

    // The dodging close button needs the Contact pop-up, so make sure it comes along
    const needsPopup = picks.includes("dodgyClose") &&
        !picks.includes("contactPopup") &&
        !alreadyActive.includes("contactPopup");

    if (needsPopup) {
        const swapIndex = picks.findIndex(name => name !== "dodgyClose");
        if (swapIndex === -1) {
            picks.push("contactPopup");
        } else {
            picks[swapIndex] = "contactPopup";
        }
    }

    return picks;
}

// Turns on each effect in the list and saves the full list
function addEffects(names) {
    names.forEach(name => {
        if (EFFECTS[name] && !activeEffects.includes(name)) {
            activeEffects.push(name);
            EFFECTS[name]();
        }
    });
    sessionStorage.setItem("funEffects", JSON.stringify(activeEffects));
}

function startFun(effectNames) {
    document.body.classList.add("fun-mode");
    funToggle.textContent = "😐 Normal Mode";
    sessionStorage.setItem("mode", "fun");

    addGifs();
    addEffects(effectNames);
}

function stopFun() {
    // stop timers and remove listeners
    funTimers.forEach(id => clearTimeout(id)); // clearTimeout also stops intervals
    funListeners.forEach(([target, type, handler, options]) => {
        target.removeEventListener(type, handler, options);
    });

    // put back anything that was changed (newest change first)
    funUndo.reverse().forEach(undo => undo());

    // remove everything fun mode added, plus every fun-* class on <body>
    document.querySelectorAll(".fun-layer").forEach(element => element.remove());
    [...document.body.classList]
        .filter(name => name.startsWith("fun-"))
        .forEach(name => document.body.classList.remove(name));

    activeEffects = [];
    funTimers = [];
    funListeners = [];
    funUndo = [];

    funToggle.textContent = "🎉 Fun Mode";
    sessionStorage.setItem("mode", "normal");
    sessionStorage.removeItem("funEffects");
}

// Reads the effects saved from the last click (so every page matches)
function loadSavedEffects() {
    try {
        const saved = JSON.parse(sessionStorage.getItem("funEffects")) || [];
        return saved.filter(name => name in EFFECTS);
    } catch (error) {
        return [];
    }
}

// Only run fun mode on pages that have the toggle, so there's always a way out
// Clear out the old localStorage version, which stayed in fun mode forever
localStorage.removeItem("mode");
localStorage.removeItem("funEffects");

if (funToggle) {
    if (sessionStorage.getItem("mode") === "fun") {
        const saved = loadSavedEffects();
        startFun(saved.length > 0 ? saved : pickRandomEffects(EFFECTS_PER_CLICK, []));
    }

    funToggle.addEventListener("click", () => {
        if (document.body.classList.contains("fun-mode")) {
            stopFun();
        } else {
            startFun(pickRandomEffects(EFFECTS_PER_CLICK, [])); // new random mix every click
        }
    });
}


// ==============================================================
// GIFs (always on in fun mode)
// Scatters a few random GIFs around the page.
// ==============================================================
function addGifs() {
    const pageHeight = document.body.scrollHeight;
    const gifWidth = 130;

    shuffle([...GIFS]).slice(0, GIFS_PER_PAGE).forEach(fileName => {
        const gif = addFunElement(`<img class="fun-gif" alt="" src="${encodeURI("images/" + fileName)}">`);
        gif.style.left = randomBetween(0, window.innerWidth - gifWidth - 20) + "px";
        gif.style.top = randomBetween(navbarHeight(), Math.max(pageHeight - gifWidth, 200)) + "px";
    });
}


// ==============================================================
// THE EFFECTS
// Each function turns on one effect. Anything it adds to the page
// uses addFunElement / funListen / funEvery / funUndo so it gets
// cleaned up automatically.
// ==============================================================

// ---------- A fake visitor counter ----------
function visitorCounter() {
    const counter = addFunElement(`<p class="fun-counter"></p>`, funFooter());
    let visitors = 8492103 + randomBetween(0, 5000);

    function update() {
        counter.textContent = `YOU ARE VISITOR #${visitors.toLocaleString()}`;
    }

    update();
    funEvery(1500, () => {
        visitors += randomBetween(1, 40); // it keeps climbing, very popular site
        update();
    });
}


// ---------- A blinking "UNDER CONSTRUCTION" banner ----------
function underConstruction() {
    addFunElement(`
        <div class="fun-construction">
            <span>🚧 UNDER CONSTRUCTION 🚧</span>
        </div>`, mainArea(), true);
}


// ---------- Fake awards ----------
function fakeAwards() {
    addFunElement(`
        <div class="fun-awards">
            <div class="fun-award">🏆 BEST PERSONAL WEBSITE — 2004</div>
            <div class="fun-award">🥇 MOST PIXELS — 2007</div>
            <div class="fun-award">⭐ WEBMASTER'S CHOICE — 1999</div>
            <div class="fun-award">🏅 TOP 10 SITES MY MOM VISITED</div>
        </div>`, funFooter());
}


// ---------- "Contact" opens an "Are you sure?" pop-up ----------
function contactPopup() {
    funListen(document, "click", event => {
        const link = event.target.closest('a[href="contact.html"]');
        if (!link) return;

        event.preventDefault();
        showContactPopup(link.href);
    });
}

function showContactPopup(destination) {
    const backdrop = addFunElement(`
        <div class="fun-popup-backdrop">
            <div class="fun-popup">
                <button class="fun-popup-close" type="button" aria-label="Close">×</button>
                <h2 class="h3">Are you sure?</h2>
                <p>You're about to visit the Contact page. This is a big decision.</p>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                    <button class="btn btn-success fun-popup-yes" type="button">Yes, I'm sure</button>
                    <button class="btn btn-danger fun-popup-no" type="button">No, take me back</button>
                </div>
            </div>
        </div>`);

    const closeButton = backdrop.querySelector(".fun-popup-close");

    backdrop.querySelector(".fun-popup-yes").addEventListener("click", () => {
        window.location.href = destination;
    });
    backdrop.querySelector(".fun-popup-no").addEventListener("click", () => backdrop.remove());
    closeButton.addEventListener("click", () => backdrop.remove());

    // The close button moves away when the mouse gets close (see dodgyClose below)
    if (activeEffects.includes("dodgyClose")) {
        backdrop.addEventListener("mousemove", event => {
            const box = closeButton.getBoundingClientRect();
            const distance = Math.hypot(
                event.clientX - (box.left + box.width / 2),
                event.clientY - (box.top + box.height / 2)
            );

            if (distance < 50) {
                closeButton.style.transform =
                    `translate(${randomBetween(-120, 0)}px, ${randomBetween(0, 60)}px)`;
            }
        });
    }
}


// ---------- The pop-up's close button dodges the mouse ----------
// Nothing to set up here: showContactPopup() checks whether this effect
// is on. pickRandomEffects() makes sure contactPopup comes with it.
function dodgyClose() {}


// ---------- Buttons change labels when hovered ----------
const HOVER_LABELS = [
    "Nope", "Not This One", "Self Destruct", "Free iPod", "Do NOT",
    "Order Pizza", "Launch Rocket", "Unsubscribe", "Download RAM", "???"
];

function hoverLabels() {
    funListen(document, "mouseover", event => {
        const button = event.target.closest(".btn, .nav-link");
        if (!button || button.id === "fun-toggle" || button.closest(".fun-layer")) return;
        if (button.dataset.funLabel) return; // already swapped

        button.dataset.funLabel = button.innerHTML; // remember the real label
        button.textContent = randomItem(HOVER_LABELS);
    });

    funListen(document, "mouseout", event => {
        const button = event.target.closest("[data-fun-label]");
        if (!button || button.contains(event.relatedTarget)) return;
        restoreLabel(button);
    });

    funUndo.push(() => document.querySelectorAll("[data-fun-label]").forEach(restoreLabel));
}

function restoreLabel(button) {
    button.innerHTML = button.dataset.funLabel;
    delete button.dataset.funLabel;
}


// ---------- "Click Me" turns into "Don't Click Me" ----------
function clickMeButton() {
    const labels = ["Click Me", "Don't Click Me", "I Said DON'T", "Okay Fine, Click Me"];
    let index = 0;

    const button = addFunElement(
        `<button class="btn btn-lg btn-warning fw-bold" type="button">${labels[0]}</button>`,
        funBar()
    );

    button.addEventListener("click", () => {
        index = (index + 1) % labels.length;
        button.textContent = labels[index];
    });
}


// ---------- A cookie banner with 17 increasingly ridiculous questions ----------
const COOKIE_QUESTIONS = [
    "This website uses cookies. Do you accept?",
    "Do you also accept functional cookies?",
    "How about analytics cookies?",
    "And marketing cookies?",
    "Can we remember your favorite color?",
    "Can we guess your favorite color?",
    "Do you accept that it's purple?",
    "Are cookies technically a type of cracker?",
    "Will you accept cookies from strangers on the internet?",
    "Is a hot dog a sandwich?",
    "Do you consent to being asked for consent?",
    "May we share your data with a very nosy pigeon?",
    "Is it okay if the pigeon tells its friends?",
    "Do you accept that this banner may never end?",
    "Are you still reading these?",
    "Can we have a real cookie? Like, the food?",
    "Last one, we promise: do you accept cookies?"
];

function cookieBanner() {
    const banner = addFunElement(`
        <div class="fun-cookie" role="dialog" aria-label="Cookie preferences">
            <p class="fun-cookie-count small mb-1"></p>
            <p class="fun-cookie-question fw-bold mb-2"></p>
            <button class="btn btn-sm btn-success me-2" type="button">Yes</button>
            <button class="btn btn-sm btn-outline-light" type="button">No</button>
        </div>`);

    const count = banner.querySelector(".fun-cookie-count");
    const question = banner.querySelector(".fun-cookie-question");
    let index = 0;

    function showQuestion() {
        count.textContent = `🍪 Cookie preference ${index + 1} of ${COOKIE_QUESTIONS.length}`;
        question.textContent = COOKIE_QUESTIONS[index];
    }

    // Yes and No do exactly the same thing
    banner.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => {
            index++;
            if (index < COOKIE_QUESTIONS.length) {
                showQuestion();
            } else {
                banner.innerHTML = `<p class="fw-bold mb-0">Thank you! Your preferences have been saved and ignored. 🍪</p>`;
                funLater(3000, () => banner.remove());
            }
        });
    });

    showQuestion();
}


// ---------- "Your mouse has been detected." ----------
function mouseDetected() {
    let alreadyAlerted = false;

    funListen(document, "mousemove", () => {
        if (alreadyAlerted) return;
        alreadyAlerted = true;
        alert("⚠️ Your mouse has been detected.");
    });
}


// ---------- A loading screen that reaches 99% and starts over ----------
// It sits under the navbar, so the Normal Mode button still works.
function fakeLoading() {
    const screen = addFunElement(`
        <div class="fun-loading">
            <h2 class="h4">Loading awesomeness...</h2>
            <div class="progress" role="progressbar" aria-label="Loading">
                <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
            </div>
            <p class="fun-loading-text mb-0">0%</p>
        </div>`);
    screen.style.top = navbarHeight() + "px";

    const bar = screen.querySelector(".progress-bar");
    const text = screen.querySelector(".fun-loading-text");
    let percent = 0;
    let stuckTicks = 0; // how long it's been sitting at 99%
    let loops = 0;

    const timer = funEvery(120, () => {
        if (percent < 99) {
            percent = Math.min(99, percent + randomBetween(1, 6));
            bar.style.width = percent + "%";
            text.textContent = percent + "%";
            return;
        }

        stuckTicks++;
        if (stuckTicks === 5) text.textContent = "99%... almost there...";
        if (stuckTicks < 15) return;

        // Start over
        loops++;
        stuckTicks = 0;
        percent = 0;
        bar.style.width = "0%";
        text.textContent = "Just kidding. Starting over 🙃";

        if (loops === LOADING_LOOPS) {
            clearInterval(timer);
            text.textContent = "Loading failed successfully.";
            funLater(1500, () => screen.remove());
        }
    });
}


// ---------- A confirmation dialog for absolutely everything ----------
const CONFIRM_MESSAGES = [
    "Are you sure you want to click that?",
    "Really click there?",
    "This action cannot be undone. Continue?",
    "Are you SURE sure?",
    "Clicking is a big commitment. Proceed?"
];

function confirmEverything() {
    // "true" = capture phase, so this runs before any other click handler
    funListen(document, "click", event => {
        // always let people escape (the hamburger is the only way to reach the toggle on phones)
        if (event.target.closest("#fun-toggle, .navbar-toggler")) return;

        if (!confirm(randomItem(CONFIRM_MESSAGES))) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
}


// ---------- Navigation buttons in the four corners ----------
function cornerNav() {
    const corners = [
        ["nw", "index.html", "Home"],
        ["ne", "skills.html", "Skills"],
        ["sw", "experience.html", "Experience"],
        ["se", "projects.html", "Projects"]
    ];

    corners.forEach(([corner, href, label]) => {
        const link = addFunElement(
            `<a class="btn btn-warning fw-bold fun-corner fun-corner-${corner}" href="${href}">${label}</a>`
        );
        // the top corners sit just under the navbar
        if (corner === "nw" || corner === "ne") {
            link.style.top = navbarHeight() + 12 + "px";
        }
    });

    // Hide the normal navbar links (Contact stays, all alone)
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
        if (link.getAttribute("href") === "contact.html") return;

        const item = link.closest("li");
        item.style.display = "none";
        funUndo.push(() => item.style.display = "");
    });
}


// ---------- Scroll sideways to read the biography ----------
// The CSS for body.fun-sideways puts every paragraph on one long line.
function sidewaysBio() {
    document.body.classList.add("fun-sideways");
}


// ---------- Every third click rotates the page 2 degrees ----------
function rotateEveryThirdClick() {
    let clicks = 0;
    let rotation = 0;

    document.body.classList.add("fun-rotating");

    funListen(document, "click", () => {
        clicks++;
        if (clicks % 3 === 0) {
            rotation += 2;
            document.body.style.setProperty("--fun-rotate", rotation + "deg");
        }
    });

    funUndo.push(() => document.body.style.removeProperty("--fun-rotate"));
}


// ---------- Emojis follow the cursor ----------
const TRAIL_EMOJIS = ["✨", "🎉", "💖", "🌈", "⭐", "🦄", "🍕", "🔥"];

function emojiTrail() {
    let lastTime = 0;

    funListen(document, "mousemove", event => {
        const now = Date.now();
        if (now - lastTime < 40) return; // limit how many get made
        lastTime = now;

        const emoji = addFunElement(`<span class="fun-trail">${randomItem(TRAIL_EMOJIS)}</span>`);
        emoji.style.left = event.clientX + "px";
        emoji.style.top = event.clientY + "px";
        setTimeout(() => emoji.remove(), 1000);
    });
}


// ---------- A random button that makes all the text rhyme ----------
// Every bit of text gets a rhyming ending, so the whole page rhymes with "-ay".
const RHYME_ENDINGS = [
    ", hip hip hooray!", ", every single day.", ", come what may.", ", or so they say.",
    ", okay?", ", in a big way!", ", like a cabaret.", ", and that's all I'll say.",
    ", anyway.", ", on full display!"
];

function rhymeButton() {
    const originals = new Map(); // text node → its original words

    const button = addFunElement(
        `<button class="btn btn-info fw-bold fun-rhyme-button" type="button">🎤 Make It Rhyme</button>`
    );
    button.style.left = randomBetween(5, 70) + "vw";
    button.style.top = randomBetween(20, 80) + "vh";

    button.addEventListener("click", () => {
        const walker = document.createTreeWalker(mainArea(), NodeFilter.SHOW_TEXT);

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement.closest(".fun-layer, script, style")) continue;

            const original = originals.has(node) ? originals.get(node) : node.nodeValue;
            if (!/[a-z]/i.test(original)) continue; // skip blank space

            originals.set(node, original);
            const trailingSpace = original.match(/\s*$/)[0];
            const words = original.replace(/[\s.!?,;:]*$/, "");
            node.nodeValue = words + randomItem(RHYME_ENDINGS) + trailingSpace;
        }
    });

    funUndo.push(() => originals.forEach((text, node) => node.nodeValue = text));
}


// ---------- The navigation rearranges itself every few seconds ----------
function navShuffle() {
    const navList = document.querySelector(".navbar-nav");
    if (!navList) return;

    const originalOrder = [...navList.children];
    const toggleItem = funToggle.closest("li");

    funEvery(2500, () => {
        // Shuffle the links in front of the toggle, but never move the toggle itself:
        // moving it mid-click makes the browser drop the click.
        const items = shuffle(originalOrder.filter(item => item !== toggleItem));
        items.forEach(item => navList.insertBefore(item, toggleItem));
    });

    funUndo.push(() => originalOrder.forEach(item => navList.appendChild(item)));
}


// ---------- The cursor occasionally turns into a giant emoji ----------
const GIANT_CURSORS = ["🖐️", "👆", "🦆", "🍌", "🐸", "👀"];

function giantCursor() {
    const cursor = addFunElement(`<div class="fun-giant-cursor"></div>`);

    funListen(document, "mousemove", event => {
        cursor.style.left = event.clientX + "px";
        cursor.style.top = event.clientY + "px";
    });

    funEvery(4000, () => {
        if (Math.random() < 0.5) return; // only sometimes

        cursor.textContent = randomItem(GIANT_CURSORS);
        cursor.classList.add("is-visible");
        document.body.classList.add("fun-hide-cursor");

        funLater(2500, () => {
            cursor.classList.remove("is-visible");
            document.body.classList.remove("fun-hide-cursor");
        });
    });
}


// ---------- "Fix My Website" makes everything worse ----------
function fixMyWebsite() {
    const button = addFunElement(
        `<button class="btn btn-lg btn-danger fw-bold" type="button">🔧 Fix My Website</button>`,
        funBar()
    );

    button.addEventListener("click", () => {
        const moreEffects = pickRandomEffects(EFFECTS_PER_CLICK, activeEffects);

        if (moreEffects.length === 0) {
            button.textContent = "✅ Website Is Perfect Now";
            return;
        }
        addEffects(moreEffects);
    });
}
