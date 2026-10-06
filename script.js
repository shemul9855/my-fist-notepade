// ======================================
// My Notepad - JavaScript
// ======================================


// ======================================
// Variables
// ======================================

let notes = JSON.parse(
    localStorage.getItem("myNotes")
) || [];

let currentNoteId = null;


// ======================================
// DOM Elements
// ======================================

const newNoteBtn =
    document.getElementById("newNoteBtn");

const saveBtn =
    document.getElementById("saveBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const darkModeBtn =
    document.getElementById("darkModeBtn");

const deleteBtn =
    document.getElementById("deleteBtn");

const searchInput =
    document.getElementById("searchInput");

const notesList =
    document.getElementById("notesList");

const noteTitle =
    document.getElementById("noteTitle");

const noteEditor =
    document.getElementById("noteEditor");

const saveStatus =
    document.getElementById("saveStatus");

const wordCount =
    document.getElementById("wordCount");

const characterCount =
    document.getElementById("characterCount");


// ======================================
// Page Load
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    loadDarkMode();

    renderNotes();

    if (notes.length > 0) {

        openNote(notes[0].id);

    } else {

        createNewNote();

    }

    updateTextCount();

});


// ======================================
// New Note
// ======================================

newNoteBtn.addEventListener(
    "click",
    createNewNote
);


function createNewNote() {

    currentNoteId = null;

    noteTitle.value = "";

    noteEditor.value = "";

    saveStatus.textContent =
        "New note";

    updateTextCount();

    removeActiveNote();

    noteTitle.focus();
}


// ======================================
// Save Note
// ======================================

saveBtn.addEventListener(
    "click",
    saveNote
);


function saveNote() {

    const title =
        noteTitle.value.trim();

    const content =
        noteEditor.value;


    // Empty note check
    if (!title && !content.trim()) {

        alert(
            "দয়া করে কিছু লিখুন!"
        );

        return;
    }


    // New note
    if (currentNoteId === null) {

        const newNote = {

            id: Date.now(),

            title:
                title || "Untitled Note",

            content: content,

            date:
                new Date().toLocaleString()

        };


        notes.unshift(newNote);

        currentNoteId =
            newNote.id;

    }

    // Existing note
    else {

        const note =
            notes.find(
                item =>
                    item.id === currentNoteId
            );


        if (note) {

            note.title =
                title || "Untitled Note";

            note.content =
                content;

            note.date =
                new Date().toLocaleString();

        }

    }


    saveToStorage();

    renderNotes();

    highlightActiveNote();

    saveStatus.textContent =
        "✓ Saved";

}


// ======================================
// LocalStorage
// ======================================

function saveToStorage() {

    localStorage.setItem(
        "myNotes",
        JSON.stringify(notes)
    );

}


// ======================================
// Render Notes
// ======================================

function renderNotes(
    searchText = ""
) {

    notesList.innerHTML = "";


    const search =
        searchText
            .trim()
            .toLowerCase();


    const filteredNotes =
        notes.filter(note => {

            return (

                note.title
                    .toLowerCase()
                    .includes(search)

                ||

                note.content
                    .toLowerCase()
                    .includes(search)

            );

        });


    if (filteredNotes.length === 0) {

        notesList.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#9ca3af;
                font-size:13px;
            ">
                No notes found
            </div>
        `;

        return;
    }


    filteredNotes.forEach(note => {

        const noteItem =
            document.createElement("div");


        noteItem.className =
            "note-item";


        noteItem.dataset.id =
            note.id;


        noteItem.innerHTML = `

            <h4 class="note-title">
                ${escapeHTML(note.title)}
            </h4>

            <p class="note-preview">
                ${escapeHTML(
                    getPreview(note.content)
                )}
            </p>

            <small class="note-date">
                ${escapeHTML(note.date)}
            </small>

        `;


        noteItem.addEventListener(
            "click",
            function () {

                openNote(note.id);

            }
        );


        notesList.appendChild(
            noteItem
        );

    });


    highlightActiveNote();

}


// ======================================
// Open Note
// ======================================

function openNote(id) {

    const note =
        notes.find(
            item => item.id === id
        );


    if (!note) return;


    currentNoteId =
        note.id;


    noteTitle.value =
        note.title;


    noteEditor.value =
        note.content;


    saveStatus.textContent =
        "Note opened";


    updateTextCount();

    highlightActiveNote();

}


// ======================================
// Delete Note
// ======================================

deleteBtn.addEventListener(
    "click",
    deleteNote
);


function deleteNote() {

    if (currentNoteId === null) {

        alert(
            "Delete করার মতো কোনো note নেই!"
        );

        return;
    }


    const confirmDelete =
        confirm(
            "আপনি কি এই note টি delete করতে চান?"
        );


    if (!confirmDelete) return;


    notes =
        notes.filter(
            note =>
                note.id !== currentNoteId
        );


    saveToStorage();


    currentNoteId = null;


    if (notes.length > 0) {

        openNote(
            notes[0].id
        );

    }

    else {

        createNewNote();

    }


    renderNotes();


    saveStatus.textContent =
        "Note deleted";

}


// ======================================
// Search Notes
// ======================================

searchInput.addEventListener(
    "input",
    function () {

        renderNotes(
            searchInput.value
        );

    }
);


// ======================================
// Auto Save
// ======================================

noteEditor.addEventListener(
    "input",
    function () {

        updateTextCount();

        autoSave();

    }
);


noteTitle.addEventListener(
    "input",
    function () {

        autoSave();

    }
);


let autoSaveTimer;


function autoSave() {

    if (currentNoteId === null) {

        saveStatus.textContent =
            "Unsaved";

        return;
    }


    clearTimeout(
        autoSaveTimer
    );


    saveStatus.textContent =
        "Saving...";


    autoSaveTimer =
        setTimeout(
            function () {

                const note =
                    notes.find(
                        item =>
                            item.id ===
                            currentNoteId
                    );


                if (!note) return;


                note.title =
                    noteTitle.value.trim()
                    ||
                    "Untitled Note";


                note.content =
                    noteEditor.value;


                note.date =
                    new Date()
                        .toLocaleString();


                saveToStorage();

                renderNotes();


                saveStatus.textContent =
                    "✓ Auto saved";


            },
            700
        );

}


// ======================================
// Word & Character Count
// ======================================

function updateTextCount() {

    const text =
        noteEditor.value;


    const characters =
        text.length;


    let words = 0;


    if (text.trim() !== "") {

        words =
            text.trim()
                .split(/\s+/)
                .length;

    }


    wordCount.textContent =
        words;


    characterCount.textContent =
        characters;

}


// ======================================
// Download Note
// ======================================

downloadBtn.addEventListener(
    "click",
    downloadNote
);


function downloadNote() {

    const title =
        noteTitle.value.trim()
        ||
        "My Note";


    const content =
        noteEditor.value;


    if (!content.trim()) {

        alert(
            "Download করার মতো কোনো লেখা নেই!"
        );

        return;
    }


    const fileContent =
        title +
        "\n\n" +
        content;


    const blob =
        new Blob(
            [fileContent],
            {
                type:
                    "text/plain;charset=utf-8"
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
        cleanFileName(title)
        +
        ".txt";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ======================================
// Dark Mode
// ======================================

darkModeBtn.addEventListener(
    "click",
    toggleDarkMode
);


function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "darkMode",
        isDark
    );


    updateDarkModeButton();

}


function loadDarkMode() {

    const darkMode =
        localStorage.getItem(
            "darkMode"
        );


    if (darkMode === "true") {

        document.body.classList.add(
            "dark"
        );

    }


    updateDarkModeButton();

}


function updateDarkModeButton() {

    const isDark =
        document.body.classList.contains(
            "dark"
        );


    darkModeBtn.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


// ======================================
// Highlight Active Note
// ======================================

function highlightActiveNote() {

    const items =
        document.querySelectorAll(
            ".note-item"
        );


    items.forEach(item => {

        const id =
            Number(
                item.dataset.id
            );


        if (
            id === currentNoteId
        ) {

            item.classList.add(
                "active"
            );

        }

        else {

            item.classList.remove(
                "active"
            );

        }

    });

}


// ======================================
// Remove Active Note
// ======================================

function removeActiveNote() {

    const items =
        document.querySelectorAll(
            ".note-item"
        );


    items.forEach(item => {

        item.classList.remove(
            "active"
        );

    });

}


// ======================================
// Get Note Preview
// ======================================

function getPreview(text) {

    if (!text) {

        return "No content";

    }


    return text
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100);

}


// ======================================
// Clean File Name
// ======================================

function cleanFileName(name) {

    return name
        .replace(
            /[<>:"/\\|?*]/g,
            ""
        )
        .trim();

}


// ======================================
// Security
// Prevent HTML Injection
// ======================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
