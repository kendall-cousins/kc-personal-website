// ==============================================================
// script.js - shared by every page
// Because every page loads this file, wrap page-specific code in
// a check like:  if (document.getElementById("project-list")) { ... }
// so it only runs on the page that has that element.
// ==============================================================

const projectList = document.getElementById("project-list");

if (projectList) {
    let allProjects = [];        // every project from the JSON file
    let currentCategory = "All"; // which filter button is active
    let searchText = "";         // what's typed in the search box


    // ---------- STEP 1: Load projects.json with fetch() ----------
    fetch("data/projects.json")
        .then(response => response.json())
        .then(projects => {
            allProjects = projects;
            displayProjects(allProjects);
        })
        .catch(error => {
            console.error("Could not load projects:", error);
            projectList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Sorry, the projects couldn't be loaded. Please try again later.
                    </div>
                </div>`;
        });


    // ---------- STEP 2: Build the project cards ----------
    function displayProjects(list) {
        projectList.innerHTML = "";

        if (list.length === 0) {
            projectList.innerHTML = `
                <div class="col-12">
                    <p class="text-muted text-center my-5">No projects match your search.</p>
                </div>`;
            return;
        }

        list.forEach(project => {
            // one badge per technology
            const techBadges = project.technologies
                .map(tech => `<span class="badge bg-secondary me-1 mb-1">${tech}</span>`)
                .join("");

            // date and organization are optional, so only show them if present
            const meta = [project.date, project.organization].filter(Boolean).join(" · ");

            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4 mb-4";
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-primary align-self-start mb-2">${project.category}</span>
                        <h5 class="card-title">${project.title}</h5>
                        ${meta ? `<p class="card-subtitle small text-muted mb-2">${meta}</p>` : ""}
                        <p class="card-text">${project.description}</p>
                        <div class="mt-auto">${techBadges}</div>
                    </div>
                </div>`;

            projectList.appendChild(col);
        });
    }


    // Applies both the category filter and the search box together
    function updateProjects() {
        let filtered = allProjects;

        if (currentCategory !== "All") {
            filtered = filtered.filter(project => project.category === currentCategory);
        }

        if (searchText !== "") {
            filtered = filtered.filter(project => {
                const text = [
                    project.title,
                    project.description,
                    project.organization || "",
                    project.technologies.join(" ")
                ].join(" ").toLowerCase();
                return text.includes(searchText);
            });
        }

        displayProjects(filtered);
    }


    // ---------- STEP 3: Category filter buttons ----------
    const filterButtons = document.querySelectorAll("[data-category]");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentCategory = button.dataset.category;

            // highlight the clicked button
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            updateProjects();
        });
    });


    // ---------- STEP 4: One additional interactive feature ----------
    // Keyword search: filters cards as you type (works with the category buttons)
    const searchInput = document.getElementById("project-search");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchText = searchInput.value.trim().toLowerCase();
            updateProjects();
        });
    }
}

// The Normal / Fun mode toggle lives in js/fun-mode.js
