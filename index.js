
const STORAGE_KEYS = {
    fits: "fits",
    loadouts: "loadouts",
    legacy: "legacyFits",
    migrated: "fitvaultLegacyMigrated"
};


/* =========================================================
   STATE
   ========================================================= */

let fits = loadArray(STORAGE_KEYS.fits);
let loadouts = loadArray(STORAGE_KEYS.loadouts);
let legacyFits = loadArray(STORAGE_KEYS.legacy);

let mode = "fits";

let searchText = "";
let selectedCategory = "all";
let sortMode = "newest";

let editingIndex = null;
let contextIndex = null;

let toastTimer = null;


/* =========================================================
   HELPERS
   ========================================================= */

function loadArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}


function saveData() {
    localStorage.setItem(
        STORAGE_KEYS.fits,
        JSON.stringify(fits)
    );

    localStorage.setItem(
        STORAGE_KEYS.loadouts,
        JSON.stringify(loadouts)
    );

    localStorage.setItem(
        STORAGE_KEYS.legacy,
        JSON.stringify(legacyFits)
    );
}


function getCurrentList() {
    if (mode === "fits") {
        return fits;
    }

    if (mode === "loadouts") {
        return loadouts;
    }

    return legacyFits;
}


function setCurrentList(list) {
    if (mode === "fits") {
        fits = list;
    } else if (mode === "loadouts") {
        loadouts = list;
    } else {
        legacyFits = list;
    }
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normaliseItem(item) {
    return {
        name: String(item?.name ?? "Unnamed Fit"),
        category: String(item?.category ?? "Unsorted"),
        tags: Array.isArray(item?.tags)
            ? item.tags.map(String)
            : [],
        cmd: String(item?.cmd ?? ""),
        color: String(item?.color ?? ""),
        createdAt: Number(item?.createdAt ?? Date.now())
    };
}


function cleanCommand(command) {
    return String(command ?? "")
        .replace(/\r/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join(" | ")
        .replace(/\s*\|\s*/g, " | ")
        .trim();
}


/* =========================================================
   DOM
   ========================================================= */

const fitsContainer =
    document.getElementById("fits");

const categoriesContainer =
    document.getElementById("categories");

const searchInput =
    document.getElementById("search");

const fitsCount =
    document.getElementById("fitsCount");

const loadoutsCount =
    document.getElementById("loadoutsCount");

const legacyCount =
    document.getElementById("legacyCount");

const pageEyebrow =
    document.getElementById("pageEyebrow");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");

const addTopButton =
    document.getElementById("addTopButton");

const resultCount =
    document.getElementById("resultCount");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyDescription =
    document.getElementById("emptyDescription");

const emptyAddButton =
    document.getElementById("emptyAddButton");

const editorModal =
    document.getElementById("editorModal");

const modalTitle =
    document.getElementById("modalTitle");

const closeModalButton =
    document.getElementById("closeModal");

const cancelEditButton =
    document.getElementById("cancelEdit");

const saveButton =
    document.getElementById("saveBtn");

const nameInput =
    document.getElementById("name");

const categoryInput =
    document.getElementById("category");

const tagsInput =
    document.getElementById("tags");

const commandInput =
    document.getElementById("cmd");

const commandPreview =
    document.getElementById("commandPreview");

const categoryFilterButton =
    document.getElementById("categoryFilterButton");

const categoryFilterText =
    document.getElementById("categoryFilterText");

const categoryMenu =
    document.getElementById("categoryMenu");

const categoryMenuItems =
    document.getElementById("categoryMenuItems");

const sortButton =
    document.getElementById("sortButton");

const sortText =
    document.getElementById("sortText");

const sortMenu =
    document.getElementById("sortMenu");

const activeFilter =
    document.getElementById("activeFilter");

const activeFilterText =
    document.getElementById("activeFilterText");

const clearFilterButton =
    document.getElementById("clearFilter");

const contextMenu =
    document.getElementById("contextMenu");

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");

const legacyBanner =
    document.getElementById("legacyBanner");

const refreshButton =
    document.getElementById("refreshBtn");

const importButton =
    document.getElementById("importBtn");

const exportButton =
    document.getElementById("exportBtn");

const importFile =
    document.getElementById("importFile");

const categorySuggestions =
    document.getElementById("categorySuggestions");


/* =========================================================
   NAVIGATION
   ========================================================= */

function switchMode(newMode) {

    mode = newMode;

    selectedCategory = "all";

    closeMenus();

    updateNavigation();

    render();
}


function updateNavigation() {

    document
        .getElementById("navFits")
        .classList.toggle(
            "active",
            mode === "fits"
        );

    document
        .getElementById("navLoadouts")
        .classList.toggle(
            "active",
            mode === "loadouts"
        );

    document
        .getElementById("navLegacy")
        .classList.toggle(
            "active",
            mode === "legacy"
        );


    fitsCount.textContent = fits.length;

    loadoutsCount.textContent = loadouts.length;

    legacyCount.textContent = legacyFits.length;


    if (mode === "fits") {

        pageEyebrow.textContent =
            "YOUR LIBRARY";

        pageTitle.textContent =
            "Fits";

        pageDescription.textContent =
            "Organise and manage your outfits.";

        addTopButton.textContent =
            "＋  New Fit";

        emptyTitle.textContent =
            "No fits yet";

        emptyDescription.textContent =
            "Create your first fit to start building your library.";

        emptyAddButton.textContent =
            "＋ Create Fit";

        legacyBanner.classList.remove("visible");

    } else if (mode === "loadouts") {

        pageEyebrow.textContent =
            "LOADOUT LIBRARY";

        pageTitle.textContent =
            "Loadouts";

        pageDescription.textContent =
            "Keep your reusable command loadouts organised.";

        addTopButton.textContent =
            "＋  New Loadout";

        emptyTitle.textContent =
            "No loadouts yet";

        emptyDescription.textContent =
            "Create a loadout to quickly reuse a collection of commands.";

        emptyAddButton.textContent =
            "＋ Create Loadout";

        legacyBanner.classList.remove("visible");

    } else {

        pageEyebrow.textContent =
            "LEGACY LIBRARY";

        pageTitle.textContent =
            "Legacy Fits";

        pageDescription.textContent =
            "Fits imported from the original organizer.";

        addTopButton.textContent =
            "＋  New Legacy Fit";

        emptyTitle.textContent =
            "No legacy fits";

        emptyDescription.textContent =
            "No outfits from the original organizer have been imported.";

        emptyAddButton.textContent =
            "＋ Add Legacy Fit";

        if (legacyFits.length > 0) {
            legacyBanner.classList.add("visible");
        } else {
            legacyBanner.classList.remove("visible");
        }
    }
}


/* =========================================================
   FILTERING
   ========================================================= */

function getFilteredItems() {

    const list = getCurrentList();

    const query =
        searchText
            .trim()
            .toLowerCase();


    let results = list
        .map((item, index) => ({
            item: normaliseItem(item),
            index
        }))
        .filter(({ item }) => {

            if (
                selectedCategory !== "all" &&
                item.category !== selectedCategory
            ) {
                return false;
            }

            if (!query) {
                return true;
            }

            const searchable = [
                item.name,
                item.category,
                item.tags.join(" "),
                item.cmd
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);
        });


    results.sort((a, b) => {

        if (sortMode === "name") {
            return a.item.name
                .localeCompare(
                    b.item.name,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
        }

        if (sortMode === "name-desc") {
            return b.item.name
                .localeCompare(
                    a.item.name,
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
        }

        if (sortMode === "oldest") {
            return (
                (a.item.createdAt || 0) -
                (b.item.createdAt || 0)
            );
        }

        return (
            (b.item.createdAt || 0) -
            (a.item.createdAt || 0)
        );
    });


    return results;
}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

    updateNavigation();

    renderCategories();

    renderCategorySuggestions();

    renderResults();

    updateToolbar();
}


function renderResults() {

    const results =
        getFilteredItems();

    fitsContainer.innerHTML = "";

    resultCount.textContent =
        results.length;


    if (results.length === 0) {

        emptyState.classList.add("visible");

        fitsContainer.style.display = "none";

        return;
    }


    emptyState.classList.remove("visible");

    fitsContainer.style.display = "grid";


    results.forEach(({ item, index }) => {

        const card =
            createCard(item, index);

        fitsContainer.appendChild(card);
    });
}


/* =========================================================
   CARD CREATION
   ========================================================= */

function createCard(item, index) {

    const card =
        document.createElement("article");

    card.className = "card";

    if (item.color) {
        card.dataset.color =
            item.color;
    }


    const tagsHTML =
        item.tags
            .map(tag =>
                `<span>${escapeHTML(tag)}</span>`
            )
            .join("");


    const command =
        item.cmd ||
        "No command entered";


    card.innerHTML = `

        <div class="card-header">

            <div class="card-title-area">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <div class="meta">
                    ${escapeHTML(item.category)}
                </div>

            </div>

        </div>

        <button
            class="edit-icon"
            title="More options"
            type="button"
        >
            ⋮
        </button>

        <div class="tags">
            ${tagsHTML}
        </div>

        <code>
            ${escapeHTML(command)}
        </code>

        <button
            class="copy-btn"
            type="button"
        >
            Copy Command
        </button>
    `;


    const menuButton =
        card.querySelector(".edit-icon");

    const copyButton =
        card.querySelector(".copy-btn");


    copyButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            copyCommand(item.cmd);
        }
    );


    menuButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openContextMenu(
                event,
                index
            );
        }
    );


    card.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

            openContextMenu(
                event,
                index
            );
        }
    );


    return card;
}


/* =========================================================
   CATEGORIES
   ========================================================= */

function getCategories() {

    const categories =
        new Map();

    getCurrentList().forEach(item => {

        const category =
            normaliseItem(item).category ||
            "Unsorted";

        categories.set(
            category,
            (categories.get(category) || 0) + 1
        );
    });


    return [...categories.entries()]
        .sort((a, b) =>
            a[0].localeCompare(
                b[0],
                undefined,
                {
                    sensitivity: "base"
                }
            )
        );
}


function renderCategories() {

    const categories =
        getCategories();

    categoriesContainer.innerHTML = "";


    if (categories.length === 0) {

        categoriesContainer.innerHTML =
            `<div class="category-empty">
                No categories yet
            </div>`;

        return;
    }


    categories.forEach(
        ([category, count]) => {

            const button =
                document.createElement("button");

            button.className =
                "category-item";

            if (
                selectedCategory === category
            ) {
                button.classList.add("active");
            }


            button.innerHTML = `

                <span class="category-dot"></span>

                <span class="category-name">
                    ${escapeHTML(category)}
                </span>

                <span class="category-count">
                    ${count}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectedCategory =
                        category;

                    closeMenus();

                    render();
                }
            );


            categoriesContainer.appendChild(
                button
            );
        }
    );
}


function renderCategorySuggestions() {

    categorySuggestions.innerHTML = "";

    getCategories().forEach(
        ([category]) => {

            const option =
                document.createElement("option");

            option.value =
                category;

            categorySuggestions.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   TOOLBAR
   ========================================================= */

function updateToolbar() {

    if (selectedCategory === "all") {

        categoryFilterText.textContent =
            "All Categories";

    } else {

        categoryFilterText.textContent =
            selectedCategory;
    }


    const sortNames = {
        newest: "Newest",
        oldest: "Oldest",
        name: "Name A–Z",
        "name-desc": "Name Z–A"
    };


    sortText.textContent =
        sortNames[sortMode] ||
        "Newest";


    if (
        selectedCategory !== "all"
    ) {

        activeFilter.classList.remove(
            "hidden"
        );

        activeFilterText.textContent =
            selectedCategory;

    } else {

        activeFilter.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   CATEGORY MENU
   ========================================================= */

function buildCategoryMenu() {

    categoryMenuItems.innerHTML = "";


    getCategories().forEach(
        ([category]) => {

            const button =
                document.createElement("button");

            button.textContent =
                category;

            button.dataset.category =
                category;

            categoryMenuItems.appendChild(
                button
            );
        }
    );
}


function openCategoryMenu() {

    buildCategoryMenu();

    categoryMenu.classList.toggle(
        "open"
    );

    sortMenu.classList.remove(
        "open"
    );
}


/* =========================================================
   SORT MENU
   ========================================================= */

function openSortMenu() {

    sortMenu.classList.toggle(
        "open"
    );

    categoryMenu.classList.remove(
        "open"
    );
}


/* =========================================================
   CLOSE MENUS
   ========================================================= */

function closeMenus() {

    categoryMenu.classList.remove(
        "open"
    );

    sortMenu.classList.remove(
        "open"
    );

    closeContextMenu();
}


/* =========================================================
   EDITOR
   ========================================================= */

function openEditor(index = null) {

    editingIndex =
        index;

    const isEditing =
        index !== null;


    modalTitle.textContent =
        isEditing
            ? `Edit ${mode === "loadouts"
                ? "Loadout"
                : "Fit"}`
            : `Create ${mode === "loadouts"
                ? "Loadout"
                : mode === "legacy"
                    ? "Legacy Fit"
                    : "Fit"}`;


    saveButton.textContent =
        isEditing
            ? "Save Changes"
            : mode === "loadouts"
                ? "Save Loadout"
                : "Save Fit";


    if (isEditing) {

        const item =
            normaliseItem(
                getCurrentList()[index]
            );


        nameInput.value =
            item.name;

        categoryInput.value =
            item.category;

        tagsInput.value =
            item.tags.join(", ");

        commandInput.value =
            item.cmd;

    } else {

        nameInput.value = "";

        categoryInput.value = "";

        tagsInput.value = "";

        commandInput.value = "";
    }


    updateCommandPreview();

    editorModal.classList.add(
        "open"
    );


    setTimeout(() => {

        nameInput.focus();

    }, 50);
}


function closeEditor() {

    editingIndex =
        null;

    editorModal.classList.remove(
        "open"
    );
}


/* =========================================================
   SAVE ITEM
   ========================================================= */

function saveItem() {

    const name =
        nameInput.value.trim();

    const category =
        categoryInput.value.trim() ||
        "Unsorted";

    const tags =
        tagsInput.value
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);

    const cmd =
        cleanCommand(
            commandInput.value
        );


    if (!name) {

        showToast(
            "Please enter a name"
        );

        nameInput.focus();

        return;
    }


    const list =
        getCurrentList();


    if (
        editingIndex !== null
    ) {

        const old =
            normaliseItem(
                list[editingIndex]
            );


        list[editingIndex] = {

            name,
            category,
            tags,
            cmd,

            color:
                old.color,

            createdAt:
                old.createdAt ||
                Date.now()
        };


        showToast(
            "Item updated"
        );

    } else {

        list.push({

            name,
            category,
            tags,
            cmd,

            color: "",

            createdAt:
                Date.now()
        });


        showToast(
            mode === "loadouts"
                ? "Loadout created"
                : "Fit created"
        );
    }


    setCurrentList(list);

    saveData();

    closeEditor();

    render();
}


/* =========================================================
   COMMAND PREVIEW
   ========================================================= */

function updateCommandPreview() {

    const command =
        cleanCommand(
            commandInput.value
        );


    commandPreview.textContent =
        command ||
        "No command entered";
}


/* =========================================================
   CONTEXT MENU
   ========================================================= */

function openContextMenu(
    event,
    index
) {

    contextIndex =
        index;


    contextMenu.classList.add(
        "open"
    );


    let x =
        event.clientX;

    let y =
        event.clientY;


    const menuWidth =
        contextMenu.offsetWidth;

    const menuHeight =
        contextMenu.offsetHeight;


    if (
        x + menuWidth >
        window.innerWidth - 8
    ) {
        x =
            window.innerWidth -
            menuWidth -
            8;
    }


    if (
        y + menuHeight >
        window.innerHeight - 8
    ) {
        y =
            window.innerHeight -
            menuHeight -
            8;
    }


    contextMenu.style.left =
        `${Math.max(8, x)}px`;

    contextMenu.style.top =
        `${Math.max(8, y)}px`;


    categoryMenu.classList.remove(
        "open"
    );

    sortMenu.classList.remove(
        "open"
    );
}


function closeContextMenu() {

    contextIndex =
        null;

    contextMenu.classList.remove(
        "open"
    );
}


/* =========================================================
   CONTEXT ACTIONS
   ========================================================= */

function handleContextAction(action) {

    if (
        contextIndex === null
    ) {
        return;
    }


    const index =
        contextIndex;

    const list =
        getCurrentList();


    if (!list[index]) {

        closeContextMenu();

        return;
    }


    if (action === "edit") {

        closeContextMenu();

        openEditor(index);

        return;
    }


    if (action === "copy") {

        copyCommand(
            normaliseItem(
                list[index]
            ).cmd
        );

        closeContextMenu();

        return;
    }


    const colours = [
        "red",
        "blue",
        "green",
        "purple",
        "orange"
    ];


    if (
        colours.includes(action)
    ) {

        list[index].color =
            action;

        saveData();

        closeContextMenu();

        render();

        showToast(
            "Colour updated"
        );

        return;
    }


    if (
        action === "clear-colour"
    ) {

        list[index].color =
            "";

        saveData();

        closeContextMenu();

        render();

        showToast(
            "Colour cleared"
        );

        return;
    }


    if (
        action === "delete"
    ) {

        const item =
            normaliseItem(
                list[index]
            );


        const confirmed =
            confirm(
                `Delete "${item.name}"?`
            );


        if (confirmed) {

            list.splice(
                index,
                1
            );

            setCurrentList(list);

            saveData();

            render();

            showToast(
                "Item deleted"
            );
        }


        closeContextMenu();
    }
}


/* =========================================================
   COPY
   ========================================================= */

async function copyCommand(command) {

    const text =
        cleanCommand(command);


    if (!text) {

        showToast(
            "No command to copy"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );

        showToast(
            "Command copied"
        );

    } catch {

        const textarea =
            document.createElement("textarea");

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();

        showToast(
            "Command copied"
        );
    }
}


/* =========================================================
   DELETE / LEGACY
   ========================================================= */

function deleteCurrentItem(index) {

    const list =
        getCurrentList();

    const item =
        normaliseItem(
            list[index]
        );


    if (
        !confirm(
            `Delete "${item.name}"?`
        )
    ) {
        return;
    }


    list.splice(
        index,
        1
    );

    setCurrentList(list);

    saveData();

    render();

    showToast(
        "Item deleted"
    );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    toastText.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);
}


/* =========================================================
   IMPORT
   ========================================================= */

function importData(file) {

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = event => {

        try {

            const data =
                JSON.parse(
                    event.target.result
                );


            let importedFits = [];
            let importedLoadouts = [];
            let importedLegacy = [];


            /*
             * Supports:
             *
             * {
             *   fits: [],
             *   loadouts: [],
             *   legacyFits: []
             * }
             *
             * and the older:
             *
             * {
             *   "Outfit Name": {
             *      assets: [...]
             *   }
             * }
             */


            if (
                Array.isArray(data.fits)
            ) {

                importedFits =
                    data.fits.map(
                        normaliseItem
                    );
            }


            if (
                Array.isArray(data.loadouts)
            ) {

                importedLoadouts =
                    data.loadouts.map(
                        normaliseItem
                    );
            }


            if (
                Array.isArray(data.legacyFits)
            ) {

                importedLegacy =
                    data.legacyFits.map(
                        normaliseItem
                    );
            }


            /*
             * Detect old outfits.json format.
             */

            if (
                !Array.isArray(data) &&
                !data.fits &&
                !data.loadouts &&
                !data.legacyFits
            ) {

                importedLegacy =
                    convertOldOutfitsJSON(
                        data
                    );
            }


            const total =
                importedFits.length +
                importedLoadouts.length +
                importedLegacy.length;


            if (total === 0) {

                showToast(
                    "No compatible data found"
                );

                return;
            }


            const replace =
                confirm(
                    "Replace your current library with the imported data?\n\n" +
                    "Press Cancel to add the imported items instead."
                );


            if (replace) {

                fits =
                    importedFits;

                loadouts =
                    importedLoadouts;

                legacyFits =
                    importedLegacy;

            } else {

                fits.push(
                    ...importedFits
                );

                loadouts.push(
                    ...importedLoadouts
                );

                legacyFits.push(
                    ...importedLegacy
                );
            }


            saveData();

            render();

            showToast(
                `${total} item${total === 1 ? "" : "s"} imported`
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Invalid JSON file"
            );
        }
    };


    reader.readAsText(file);
}


/* =========================================================
   OLD OUTFITS.JSON CONVERTER
   ========================================================= */

function convertOldOutfitsJSON(data) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return [];
    }


    const result = [];


    Object.entries(data).forEach(
        ([name, outfit]) => {

            if (
                !outfit ||
                typeof outfit !== "object"
            ) {
                return;
            }


            const assets =
                Array.isArray(
                    outfit.assets
                )
                    ? outfit.assets
                    : [];


            const commands =
                assets
                    .map(asset => {

                        const id =
                            asset?.id;

                        const type =
                            String(
                                asset?.type ||
                                ""
                            ).toLowerCase();


                        if (
                            !id ||
                            !type
                        ) {
                            return "";
                        }


                        /*
                         * Old organizer used:
                         *
                         * !hat ID
                         * !shirt ID
                         * !pants ID
                         */


                        let commandType =
                            type;


                        if (
                            type ===
                            "accessory"
                        ) {
                            commandType =
                                "hat";
                        }


                        return (
                            `!${commandType} ${id}`
                        );
                    })
                    .filter(Boolean);


            result.push({

                name,

                category:
                    outfit.category ||
                    "Imported",

                tags:
                    Array.isArray(
                        outfit.tags
                    )
                        ? outfit.tags
                        : ["legacy"],

                cmd:
                    commands.join(
                        " | "
                    ),

                color:
                    outfit.color ||
                    "",

                createdAt:
                    Date.now()
            });
        }
    );


    return result;
}


/* =========================================================
   EXPORT
   ========================================================= */

function exportData() {

    const data = {

        version: 2,

        exportedAt:
            new Date().toISOString(),

        fits,

        loadouts,

        legacyFits
    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        "fitvault-backup.json";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Library exported"
    );
}


/* =========================================================
   AUTOMATIC LEGACY MIGRATION
   ========================================================= */

/*
 * Browsers cannot normally read an arbitrary outfits.json
 * sitting beside index.html without a server.
 *
 * We therefore try to fetch it when running through a
 * local/web server.
 *
 * If it cannot be found, nothing breaks.
 */

async function tryLegacyMigration() {

    if (
        localStorage.getItem(
            STORAGE_KEYS.migrated
        ) === "true"
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                "outfits.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const converted =
            convertOldOutfitsJSON(
                data
            );


        if (
            converted.length === 0
        ) {

            localStorage.setItem(
                STORAGE_KEYS.migrated,
                "true"
            );

            return;
        }


        /*
         * Don't duplicate outfits if migration
         * has already partially happened.
         */

        const existingNames =
            new Set(
                legacyFits.map(
                    item =>
                        normaliseItem(
                            item
                        ).name.toLowerCase()
                )
            );


        const newItems =
            converted.filter(
                item =>
                    !existingNames.has(
                        item.name.toLowerCase()
                    )
            );


        legacyFits.push(
            ...newItems
        );


        saveData();


        localStorage.setItem(
            STORAGE_KEYS.migrated,
            "true"
        );


        if (
            newItems.length > 0
        ) {

            showToast(
                `${newItems.length} legacy fit${newItems.length === 1 ? "" : "s"} imported`
            );

            render();
        }

    } catch {

        /*
         * outfits.json isn't available.
         *
         * This is normal when opening the HTML directly
         * with file://.
         *
         * The user can still use Import Data manually.
         */
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */


/* Navigation */

document
    .getElementById("navFits")
    .addEventListener(
        "click",
        () => switchMode("fits")
    );


document
    .getElementById("navLoadouts")
    .addEventListener(
        "click",
        () => switchMode("loadouts")
    );


document
    .getElementById("navLegacy")
    .addEventListener(
        "click",
        () => switchMode("legacy")
    );


/* Add */

addTopButton.addEventListener(
    "click",
    () => openEditor()
);


emptyAddButton.addEventListener(
    "click",
    () => openEditor()
);


/* Search */

searchInput.addEventListener(
    "input",
    () => {

        searchText =
            searchInput.value;

        renderResults();

        updateToolbar();
    }
);


/* Category filter */

categoryFilterButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        openCategoryMenu();
    }
);


categoryMenu.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const category =
            button.dataset.category;


        if (category) {

            selectedCategory =
                category;

            categoryMenu.classList.remove(
                "open"
            );

            render();
        }
    }
);


/* Sort */

sortButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        openSortMenu();
    }
);


sortMenu.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const sort =
            button.dataset.sort;


        if (sort) {

            sortMode =
                sort;

            sortMenu.classList.remove(
                "open"
            );

            render();
        }
    }
);


/* Clear category */

clearFilterButton.addEventListener(
    "click",
    () => {

        selectedCategory =
            "all";

        render();
    }
);


/* Modal */

closeModalButton.addEventListener(
    "click",
    closeEditor
);


cancelEditButton.addEventListener(
    "click",
    closeEditor
);


saveButton.addEventListener(
    "click",
    saveItem
);


/* Live command preview */

commandInput.addEventListener(
    "input",
    updateCommandPreview
);


/* Import */

importButton.addEventListener(
    "click",
    () => {

        importFile.value = "";

        importFile.click();
    }
);


importFile.addEventListener(
    "change",
    () => {

        importData(
            importFile.files[0]
        );
    }
);


/* Export */

exportButton.addEventListener(
    "click",
    exportData
);


/* Refresh */

refreshButton.addEventListener(
    "click",
    () => {

        render();

        showToast(
            "Library refreshed"
        );
    }
);


/* Context menu */

contextMenu.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        if (action) {
            handleContextAction(
                action
            );
        }
    }
);


/* Close floating menus */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".floating-menu"
            ) &&
            !event.target.closest(
                ".filter-button"
            )
        ) {

            categoryMenu.classList.remove(
                "open"
            );

            sortMenu.classList.remove(
                "open"
            );
        }


        if (
            !event.target.closest(
                ".context-menu"
            ) &&
            !event.target.closest(
                ".edit-icon"
            )
        ) {

            closeContextMenu();
        }
    }
);


/* Close modal by clicking backdrop */

editorModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editorModal
        ) {
            closeEditor();
        }
    }
);


/* Escape */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            if (
                editorModal.classList.contains(
                    "open"
                )
            ) {

                closeEditor();

            } else {

                closeMenus();
            }
        }
    }
);


/* "/" focuses search */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "/" ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {
            return;
        }


        const tag =
            document.activeElement?.tagName;


        if (
            tag === "INPUT" ||
            tag === "TEXTAREA"
        ) {
            return;
        }


        event.preventDefault();

        searchInput.focus();
    }
);


/* Ctrl/Cmd + N */

document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() === "n"
        ) {

            event.preventDefault();

            openEditor();
        }
    }
);


/* =========================================================
   INITIALISE
   ========================================================= */

fits =
    fits.map(
        normaliseItem
    );

loadouts =
    loadouts.map(
        normaliseItem
    );

legacyFits =
    legacyFits.map(
        normaliseItem
    );


saveData();

updateNavigation();

render();

tryLegacyMigration();
