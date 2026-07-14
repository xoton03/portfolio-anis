// app.js - Portfolio Application Logic with Supabase Integration

// Supabase Configuration
const SUPABASE_URL = "https://jphzmgscxpejcyjlnspq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaHptZ3NjeHBlamN5amxuc3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDM4ODMsImV4cCI6MjA5MzY3OTg4M30.QfEQRLnv3A05mstkARboKxR2ve3JiwDeubLHwmatZjw";

// Initialize Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Application State
let profileData = null;
let projectsData = [];
let isAdmin = false;

// DOM Elements
const mainView = document.getElementById("main-view");
const projectDetailView = document.getElementById("project-detail-view");
const adminBanner = document.getElementById("admin-banner");
const loginModal = document.getElementById("login-modal");
const projectFormModal = document.getElementById("project-form-modal");
const skillsModal = document.getElementById("skills-modal");
const extraFieldsModal = document.getElementById("extra-fields-modal");
const toast = document.getElementById("toast");

// ON LOAD INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    // 1. Run the entrance splash screen animation
    runSplashScreen();

    // 2. Fetch initial data from Supabase
    fetchProfile();
    fetchProjects();

    // 3. Setup SPA Routing links
    setupRouting();

    // 4. Setup Auth listener
    setupAuth();

    // 5. Setup Forms and Event Listeners
    setupEventListeners();

    // 6. Scroll animation triggers
    setupScrollAnimations();
    
    // Set current year in footer
    document.getElementById("current-year").textContent = new Date().getFullYear();
});

// Splash Screen Animation Logic
function runSplashScreen() {
    const splashText = document.getElementById("splash-text");
    const splashBar = document.getElementById("splash-bar");
    const splashScreen = document.getElementById("splash-screen");

    // 1. Trigger text fade-in and slide-up, and scale the gradient bar
    setTimeout(() => {
        if (splashText) {
            splashText.classList.remove("opacity-0", "translate-y-4");
            splashText.classList.add("opacity-100", "translate-y-0");
        }
        if (splashBar) {
            splashBar.classList.remove("scale-x-0");
            splashBar.classList.add("scale-x-100");
        }
    }, 200);

    // 2. Fade out the splash screen overlay, fade in the main site, and restore scrolling
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add("splash-fade-out");
        }
        const mainViewEl = document.getElementById("main-view");
        if (mainViewEl) {
            mainViewEl.classList.remove("opacity-0");
            mainViewEl.classList.add("opacity-100");
        }
        document.body.classList.remove("overflow-hidden");
    }, 2500);

    // 3. Complete cleanup: remove the splash screen element from the DOM after transition finishes
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.remove();
        }
    }, 3600);
}


// ==================== DATABASE OPERATION FUNCTIONS ====================

// Fetch Profile data
async function fetchProfile() {
    try {
        const { data, error } = await supabaseClient
            .from("portfolio_profile")
            .select("*")
            .single();

        if (error) throw error;
        
        profileData = data;
        renderProfile();
    } catch (err) {
        console.error("Error fetching profile:", err);
        showToast("Erreur lors de la récupération du profil", "error");
    }
}

// Fetch Projects data
async function fetchProjects() {
    try {
        const { data, error } = await supabaseClient
            .from("portfolio_projects")
            .select("*")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;

        projectsData = data;
        renderProjects();
    } catch (err) {
        console.error("Error fetching projects:", err);
        showToast("Erreur lors de la récupération des projets", "error");
    }
}

// Save profile text fields (name, title, bio)
async function saveProfileField(key, value) {
    if (!isAdmin) return;
    try {
        const { error } = await supabaseClient
            .from("portfolio_profile")
            .update({ [key]: value, updated_at: new Date() })
            .eq("id", 1);

        if (error) throw error;
        showToast("Profil mis à jour !", "success");
    } catch (err) {
        console.error("Error updating profile:", err);
        showToast("Erreur lors de la mise à jour du profil", "error");
        fetchProfile(); // reload original data on error
    }
}

// Submit contact message to Supabase
async function submitContactMessage(name, email, message) {
    try {
        // We attempt to insert message. Note: the table 'portfolio_messages' should exist.
        // If not, we fall back to logging.
        const { error } = await supabaseClient
            .from("portfolio_messages")
            .insert([{ name, email, message }]);

        if (error) throw error;
        showToast("Message envoyé avec succès !", "success");
        document.getElementById("contact-form").reset();
    } catch (err) {
        console.warn("Could not insert message in table (might not exist yet):", err);
        // Fallback: simulate sending message
        showToast("Message simulé avec succès !", "success");
        document.getElementById("contact-form").reset();
    }
}

// Delete Project
async function deleteProject(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
        const { error } = await supabaseClient
            .from("portfolio_projects")
            .delete()
            .eq("id", id);

        if (error) throw error;
        showToast("Projet supprimé !", "success");
        fetchProjects();
        // If we are looking at the deleted project page, go home
        if (!projectDetailView.classList.contains("hidden-view")) {
            showView("home");
        }
    } catch (err) {
        console.error("Error deleting project:", err);
        showToast("Erreur lors de la suppression", "error");
    }
}

// ==================== RENDERING FUNCTIONS ====================

// Render profile information
function renderProfile() {
    if (!profileData) return;

    // Direct text fields
    const nameEl = document.getElementById("profile-name");
    const titleEl = document.getElementById("profile-title");
    const bioEl = document.getElementById("profile-bio");
    const footerLogoEl = document.getElementById("footer-logo");
    
    nameEl.textContent = profileData.name;
    titleEl.textContent = profileData.title;
    bioEl.textContent = profileData.bio;
    footerLogoEl.textContent = profileData.name;

    // Avatar image
    if (profileData.avatar_url) {
        document.getElementById("profile-avatar").src = profileData.avatar_url;
    }

    // Skills
    const skillsContainer = document.getElementById("skills-container");
    skillsContainer.innerHTML = "";
    if (profileData.skills && profileData.skills.length > 0) {
        const colors = ["text-primary", "text-secondary", "text-[#FFCA28]", "text-[#EC4899]", "text-[#A855F7]"];
        const icons = ["code", "terminal", "database", "storage", "architecture", "insights"];
        
        profileData.skills.forEach((skill, index) => {
            const color = colors[index % colors.length];
            const icon = icons[index % icons.length];
            
            const skillSpan = document.createElement("span");
            skillSpan.className = `tech-chip px-4 py-2 rounded-full font-mono text-sm ${color} flex items-center gap-2 border border-white/10`;
            skillSpan.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span> ${skill}`;
            skillsContainer.appendChild(skillSpan);
        });
    } else {
        skillsContainer.innerHTML = `<span class="text-text-muted text-xs">Aucune compétence spécifiée.</span>`;
    }

    // CV Download Link
    const cvLink = document.getElementById("cv-download-link");
    if (profileData.cv_url) {
        cvLink.href = profileData.cv_url;
        cvLink.style.display = "flex";
    } else {
        cvLink.style.display = "none";
    }

    // Social Links
    const githubLink = document.getElementById("profile-github");
    const linkedinLink = document.getElementById("profile-linkedin");
    if (profileData.github_url) githubLink.href = profileData.github_url;
    if (profileData.linkedin_url) linkedinLink.href = profileData.linkedin_url;
}

// Render projects grid
function renderProjects() {
    const grid = document.getElementById("projects-grid");
    grid.innerHTML = "";

    if (projectsData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-text-muted">
                <span class="material-symbols-outlined text-[48px] opacity-20 mb-2">grid_view</span>
                <p>Aucun projet disponible pour le moment.</p>
            </div>
        `;
        return;
    }

    projectsData.forEach(project => {
        const tagsHtml = project.tags.map(tag => 
            `<span class="tech-chip px-2 py-1 rounded text-xs text-text-muted border border-white/5">${tag}</span>`
        ).join("");

        const article = document.createElement("article");
        // Featured project gets larger layout
        const isFeatured = project.featured;
        article.className = `glass-panel rounded-2xl overflow-hidden group flex flex-col hover-glow transition-all duration-300 relative reveal ${isFeatured ? 'md:col-span-2' : ''}`;
        
        article.innerHTML = `
            <!-- Edit Controls Overlay (Visible only to admin) -->
            ${isAdmin ? `
            <div class="absolute top-3 right-3 z-30 flex gap-2">
                <button class="btn-edit-project-card bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition active:scale-90" data-id="${project.id}" title="Modifier">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button class="btn-delete-project-card bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition active:scale-90" data-id="${project.id}" title="Supprimer">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
            ` : ''}

            <!-- Background light highlight -->
            <div class="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500 pointer-events-none"></div>
            
            <div class="${isFeatured ? 'h-64 md:h-80' : 'h-48'} overflow-hidden relative border-b border-white/5 cursor-pointer project-card-click" data-id="${project.id}">
                <div class="absolute inset-0 bg-slate-900/50 z-10 group-hover:bg-slate-900/20 transition-all duration-300"></div>
                <img class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                     src="${project.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'}" 
                     alt="${project.title}">
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold active:scale-95 transition">
                        Voir l'étude de cas
                    </button>
                </div>
            </div>
            
            <div class="p-6 flex flex-col flex-grow relative z-10">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1 block">${project.subtitle || 'Projet'}</span>
                        <h3 class="text-xl font-bold text-white">${project.title}</h3>
                    </div>
                    <div class="flex gap-2 text-text-muted z-20">
                        ${project.demo_url ? `<a class="hover:text-blue-400 transition-colors" href="${project.demo_url}" target="_blank"><span class="material-symbols-outlined text-[20px]">open_in_new</span></a>` : ''}
                        ${project.github_url ? `<a class="hover:text-blue-400 transition-colors" href="${project.github_url}" target="_blank"><span class="material-symbols-outlined text-[20px]">code</span></a>` : ''}
                    </div>
                </div>
                <p class="text-text-muted text-sm mb-6 flex-grow leading-relaxed">
                    ${project.description}
                </p>
                <div class="flex flex-wrap gap-1.5">
                    ${tagsHtml}
                </div>
            </div>
        `;

        grid.appendChild(article);
    });

    // Re-bind actions on cards
    document.querySelectorAll(".project-card-click").forEach(card => {
        card.addEventListener("click", () => {
            const projId = card.getAttribute("data-id");
            showView("project", projId);
        });
    });

    // Re-bind admin actions
    if (isAdmin) {
        document.querySelectorAll(".btn-edit-project-card").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const projId = btn.getAttribute("data-id");
                openProjectForm(projId);
            });
        });
        document.querySelectorAll(".btn-delete-project-card").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const projId = btn.getAttribute("data-id");
                deleteProject(projId);
            });
        });
    }
    
    // Re-initialize scroll animations for dynamically added cards
    setupScrollAnimations();
}

// Render project detail page
function renderProjectDetail(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) {
        showToast("Projet introuvable", "error");
        showView("home");
        return;
    }

    // Set text elements
    document.getElementById("project-detail-title").textContent = project.title;
    document.getElementById("project-detail-subtitle").textContent = project.subtitle || "Case Study";
    document.getElementById("project-detail-image").src = project.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800';
    
    // Links
    const demoLink = document.getElementById("project-detail-demo-link");
    const gitLink = document.getElementById("project-detail-github-link");

    if (project.demo_url) {
        demoLink.href = project.demo_url;
        demoLink.style.display = "flex";
    } else {
        demoLink.style.display = "none";
    }

    if (project.github_url) {
        gitLink.href = project.github_url;
        gitLink.style.display = "flex";
    } else {
        gitLink.style.display = "none";
    }

    // Tags
    const tagsContainer = document.getElementById("project-detail-tags");
    tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="tech-chip px-3 py-1.5 rounded-full text-xs text-blue-400 font-mono border border-blue-500/20 bg-blue-500/5">${tag}</span>`
    ).join("");

    // Markdown content parsing with marked.js
    const contentContainer = document.getElementById("project-detail-content");
    if (typeof marked !== 'undefined') {
        contentContainer.innerHTML = marked.parse(project.content);
    } else {
        // Fallback in case marked script hasn't loaded
        contentContainer.innerHTML = `<pre class="whitespace-pre-wrap">${project.content}</pre>`;
    }
}

// ==================== SPA ROUTING ====================

function setupRouting() {
    // Navigation link clicks
    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                // Scroll to anchors locally if on home view
                if (!projectDetailView.classList.contains("hidden-view")) {
                    e.preventDefault();
                    showView("home");
                    setTimeout(() => {
                        const targetEl = document.querySelector(targetId);
                        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            }
        });
    });

    // Back to Home button click
    document.getElementById("btn-back-home").addEventListener("click", () => {
        showView("home");
    });
}

function showView(viewName, projectId = null) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    if (viewName === "project") {
        renderProjectDetail(projectId);
        
        mainView.classList.add("hidden-view");
        projectDetailView.classList.remove("hidden-view");
        
        // Push state for browser history back support
        history.pushState({ view: "project", projectId }, "", `#project-${projectId}`);
    } else {
        projectDetailView.classList.add("hidden-view");
        mainView.classList.remove("hidden-view");
        
        // Reset URL
        history.pushState({ view: "home" }, "", "index.html");
    }
}

// Handle Browser Back/Forward buttons
window.addEventListener("popstate", (e) => {
    if (e.state && e.state.view === "project") {
        showView("project", e.state.projectId);
    } else {
        showView("home");
    }
});

// ==================== AUTHENTICATION LOGIC ====================

function setupAuth() {
    // Check initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        toggleAdminState(!!session);
    });

    // Listen to Auth Changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        toggleAdminState(!!session);
    });
}

function toggleAdminState(adminActive) {
    isAdmin = adminActive;

    // Toggle Admin Banner & Buttons
    if (isAdmin) {
        adminBanner.classList.remove("hidden");
        document.getElementById("btn-add-project").classList.remove("hidden");
        document.getElementById("btn-edit-skills").classList.remove("hidden");
        document.getElementById("btn-edit-cv").classList.remove("hidden");
        document.getElementById("btn-edit-avatar").classList.remove("hidden");
        document.body.classList.add("pt-10"); // shift body down for admin banner
    } else {
        adminBanner.classList.add("hidden");
        document.getElementById("btn-add-project").classList.add("hidden");
        document.getElementById("btn-edit-skills").classList.add("hidden");
        document.getElementById("btn-edit-cv").classList.add("hidden");
        document.getElementById("btn-edit-avatar").classList.add("hidden");
        document.body.classList.remove("pt-10");
    }

    // Toggle Contenteditable fields
    document.querySelectorAll(".editable-field").forEach(field => {
        if (isAdmin) {
            field.setAttribute("contenteditable", "true");
            field.classList.add("editable-active");
            
            // Event listener for in-place updates on blur
            field.onblur = () => {
                const key = field.getAttribute("data-key");
                const value = field.textContent.trim();
                if (profileData && profileData[key] !== value) {
                    saveProfileField(key, value);
                }
            };
        } else {
            field.removeAttribute("contenteditable");
            field.classList.remove("editable-active");
            field.onblur = null;
        }
    });

    // Re-render project cards to draw/hide edit tools
    renderProjects();
}

// ==================== EVENT LISTENERS SETUP ====================

function setupEventListeners() {
    // --- Login Modal Triggers ---
    document.getElementById("btn-admin-login-trigger").addEventListener("click", () => {
        if (isAdmin) {
            // Already logged in, logout on click
            if (confirm("Voulez-vous vous déconnecter ?")) {
                supabaseClient.auth.signOut().then(() => {
                    showToast("Déconnexion réussie !", "success");
                });
            }
        } else {
            loginModal.classList.remove("hidden");
        }
    });

    document.getElementById("btn-close-login").addEventListener("click", () => {
        loginModal.classList.add("hidden");
    });

    // Close modal on click outside
    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) loginModal.classList.add("hidden");
    });

    // Form connection submission
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const errorMsgEl = document.getElementById("login-error-msg");
        const submitBtn = document.getElementById("btn-login-submit");

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Connexion...`;
        errorMsgEl.classList.add("hidden");

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            showToast("Connexion réussie !", "success");
            loginModal.classList.add("hidden");
            document.getElementById("login-form").reset();
        } catch (err) {
            console.error("Login error:", err);
            errorMsgEl.textContent = err.message || "Erreur de connexion.";
            errorMsgEl.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Se connecter";
        }
    });

    // Logout
    document.getElementById("btn-logout").addEventListener("click", () => {
        supabaseClient.auth.signOut().then(() => {
            showToast("Déconnecté.", "success");
        });
    });

    // --- Contact Form ---
    document.getElementById("contact-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        submitContactMessage(name, email, message);
    });

    // --- Project Add/Edit Modals ---
    document.getElementById("btn-add-project").addEventListener("click", () => openProjectForm());
    document.getElementById("btn-add-project-banner").addEventListener("click", () => openProjectForm());
    document.getElementById("btn-close-project-modal").addEventListener("click", () => projectFormModal.classList.add("hidden"));

    document.getElementById("project-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = document.getElementById("form-project-id").value;
        const title = document.getElementById("form-project-title").value.trim();
        const subtitle = document.getElementById("form-project-subtitle").value.trim();
        const description = document.getElementById("form-project-desc").value.trim();
        const content = document.getElementById("form-project-content").value.trim();
        const image_url = document.getElementById("form-project-image").value.trim();
        const tagsStr = document.getElementById("form-project-tags").value.trim();
        const demo_url = document.getElementById("form-project-demo").value.trim();
        const github_url = document.getElementById("form-project-github").value.trim();
        const featured = document.getElementById("form-project-featured").checked;

        const tags = tagsStr.split(",").map(t => t.trim()).filter(t => t.length > 0);
        
        const projectObj = {
            title,
            subtitle,
            description,
            content,
            image_url,
            tags,
            demo_url: demo_url || null,
            github_url: github_url || null,
            featured,
            updated_at: new Date()
        };

        const submitBtn = document.getElementById("btn-project-form-submit");
        submitBtn.disabled = true;

        try {
            if (id) {
                // Update
                const { error } = await supabaseClient
                    .from("portfolio_projects")
                    .update(projectObj)
                    .eq("id", id);
                if (error) throw error;
                showToast("Projet mis à jour !", "success");
            } else {
                // Insert
                const { error } = await supabaseClient
                    .from("portfolio_projects")
                    .insert([projectObj]);
                if (error) throw error;
                showToast("Nouveau projet créé !", "success");
            }

            projectFormModal.classList.add("hidden");
            fetchProjects();
        } catch (err) {
            console.error("Save project error:", err);
            showToast("Erreur lors de la sauvegarde", "error");
        } finally {
            submitBtn.disabled = false;
        }
    });

    // --- Skills Edit Modal ---
    document.getElementById("btn-edit-skills").addEventListener("click", () => {
        if (!profileData) return;
        document.getElementById("form-skills-list").value = profileData.skills.join("\n");
        skillsModal.classList.remove("hidden");
    });
    
    document.getElementById("btn-close-skills").addEventListener("click", () => skillsModal.classList.add("hidden"));
    
    document.getElementById("skills-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const skillsText = document.getElementById("form-skills-list").value.trim();
        const skills = skillsText.split("\n").map(s => s.trim()).filter(s => s.length > 0);

        try {
            const { error } = await supabaseClient
                .from("portfolio_profile")
                .update({ skills, updated_at: new Date() })
                .eq("id", 1);

            if (error) throw error;
            showToast("Compétences sauvegardées !", "success");
            skillsModal.classList.add("hidden");
            fetchProfile();
        } catch (err) {
            console.error("Save skills error:", err);
            showToast("Erreur lors de l'enregistrement", "error");
        }
    });

    // --- Extra Fields Modals (Resume, avatar, networks) ---
    const triggerExtraForm = () => {
        if (!profileData) return;
        document.getElementById("form-extra-avatar").value = profileData.avatar_url || "";
        document.getElementById("form-extra-cv").value = profileData.cv_url || "";
        document.getElementById("form-extra-github").value = profileData.github_url || "";
        document.getElementById("form-extra-linkedin").value = profileData.linkedin_url || "";
        extraFieldsModal.classList.remove("hidden");
    };

    document.getElementById("btn-edit-cv").addEventListener("click", triggerExtraForm);
    document.getElementById("btn-edit-avatar").addEventListener("click", triggerExtraForm);
    document.getElementById("btn-close-extra").addEventListener("click", () => extraFieldsModal.classList.add("hidden"));

    document.getElementById("extra-fields-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const avatar_url = document.getElementById("form-extra-avatar").value.trim();
        const cv_url = document.getElementById("form-extra-cv").value.trim();
        const github_url = document.getElementById("form-extra-github").value.trim();
        const linkedin_url = document.getElementById("form-extra-linkedin").value.trim();

        try {
            const { error } = await supabaseClient
                .from("portfolio_profile")
                .update({
                    avatar_url: avatar_url || null,
                    cv_url: cv_url || null,
                    github_url: github_url || null,
                    linkedin_url: linkedin_url || null,
                    updated_at: new Date()
                })
                .eq("id", 1);

            if (error) throw error;
            showToast("Données enregistrées !", "success");
            extraFieldsModal.classList.add("hidden");
            fetchProfile();
        } catch (err) {
            console.error("Save extra fields error:", err);
            showToast("Erreur lors de l'enregistrement", "error");
        }
    });
}

// Open project modal for edit or create
function openProjectForm(projectId = null) {
    const form = document.getElementById("project-form");
    form.reset();
    document.getElementById("form-project-id").value = "";

    if (projectId) {
        // Mode Edit
        const project = projectsData.find(p => p.id === projectId);
        if (!project) return;
        
        document.getElementById("project-modal-title").textContent = "Modifier le Projet";
        document.getElementById("form-project-id").value = project.id;
        document.getElementById("form-project-title").value = project.title;
        document.getElementById("form-project-subtitle").value = project.subtitle || "";
        document.getElementById("form-project-desc").value = project.description;
        document.getElementById("form-project-content").value = project.content;
        document.getElementById("form-project-image").value = project.image_url || "";
        document.getElementById("form-project-tags").value = project.tags.join(", ");
        document.getElementById("form-project-demo").value = project.demo_url || "";
        document.getElementById("form-project-github").value = project.github_url || "";
        document.getElementById("form-project-featured").checked = !!project.featured;
    } else {
        // Mode Create
        document.getElementById("project-modal-title").textContent = "Ajouter un Projet";
    }

    projectFormModal.classList.remove("hidden");
}

// ==================== VISUAL EFFECTS & ANIMATIONS ====================

// Scroll reveal observer
function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    // Apply observer on all reveal classes
    document.querySelectorAll(".reveal").forEach(el => {
        revealObserver.observe(el);
    });
}

// Show feedback toasts
function showToast(message, type = "success") {
    const iconEl = document.getElementById("toast-icon");
    const msgEl = document.getElementById("toast-message");
    
    msgEl.textContent = message;
    
    if (type === "success") {
        iconEl.textContent = "check_circle";
        iconEl.className = "material-symbols-outlined text-emerald-400";
    } else {
        iconEl.textContent = "error";
        iconEl.className = "material-symbols-outlined text-red-500";
    }

    // Slide up
    toast.className = "fixed bottom-5 right-5 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300 z-50 text-sm";
    
    // Clear after 3 seconds
    setTimeout(() => {
        toast.className = "fixed bottom-5 right-5 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300 z-50 text-sm";
    }, 3000);
}
