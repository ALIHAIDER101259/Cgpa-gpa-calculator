
// ======================================
// 1. GRADE POINTS
// ======================================

const gradePoints = {
    "A+": 4.0,
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "F": 0.0
};


// ======================================
// 2. HTML ELEMENTS
// ======================================

const subjectList = document.getElementById("subjectList");

const addSubjectBtn = document.getElementById("addSubject");

const calculateGpaBtn = document.getElementById("calculateGpa");

const calculateCgpaBtn = document.getElementById("calculateCgpa");

const gpaResult = document.getElementById("gpaResult");

const cgpaResult = document.getElementById("cgpaResult");

const totalCredits = document.getElementById("totalCredits");

const creditsInline = document.getElementById("creditsInline");

const subjectCount = document.getElementById("subjectCount");

const subjectBadge = document.getElementById("subjectBadge");

const gpaProgress = document.getElementById("gpaProgress");

const cgpaProgress = document.getElementById("cgpaProgress");

const gpaMessage = document.getElementById("gpaMessage");

const cgpaMessage = document.getElementById("cgpaMessage");

const themeToggle = document.getElementById("themeToggle");


// ======================================
// 3. CALCULATOR STATE
// ======================================

let currentGpa = null;

let currentCredits = 0;

let currentGradePoints = 0;

const storageKey = "gradeFlowData";


// ======================================
// 4. CREATE GRADE OPTIONS
// ======================================

function createGradeOptions(selectedGrade = "A") {

    return Object.keys(gradePoints)
        .map(function (grade) {

            return `
                <option value="${grade}"
                    ${grade === selectedGrade ? "selected" : ""}>
                    ${grade}
                </option>
            `;

        })
        .join("");

}


// ======================================
// 5. ADD SUBJECT
// ======================================

function addSubject(name = "", credits = 3, grade = "A") {

    const row = document.createElement("tr");

    row.innerHTML = `
        <td class="row-number"></td>

        <td>
            <input
                type="text"
                class="subject-name"
                maxlength="100"
                placeholder="Subject name"
                aria-label="Subject name"
            >
        </td>

        <td>
            <input
                type="number"
                class="subject-credits"
                min="1"
                max="40"
                step="1"
                aria-label="Credit hours"
            >
        </td>

        <td>
            <select
                class="subject-grade"
                aria-label="Grade">
                ${createGradeOptions(grade)}
            </select>
        </td>

        <td>
            <span class="grade-points">
                ${gradePoints[grade].toFixed(1)}
            </span>
        </td>

        <td>
            <button
                type="button"
                class="delete-btn"
                aria-label="Delete subject"
                title="Delete subject">
                ×
            </button>
        </td>
    `;

    subjectList.appendChild(row);

    row.querySelector(".subject-name").value = name;

    row.querySelector(".subject-credits").value = credits;


    // Listen for subject changes

    row.querySelectorAll("input, select").forEach(function (field) {

        field.addEventListener("input", handleSubjectChange);

        field.addEventListener("change", handleSubjectChange);

    });


    // Delete subject

    row.querySelector(".delete-btn").addEventListener("click", function () {

        row.remove();

        handleSubjectChange();

    });


    updateSubjectSummary();

}


// ======================================
// 6. GET SUBJECT ROWS
// ======================================

function getRows() {

    return [...subjectList.querySelectorAll("tr")];

}


// ======================================
// 7. UPDATE SUBJECT SUMMARY
// ======================================

function updateSubjectSummary() {

    const rows = getRows();

    let credits = 0;

    rows.forEach(function (row, index) {

        row.querySelector(".row-number").textContent = index + 1;

        const input = row.querySelector(".subject-credits");

        const value = Number(input.value);

        if (
            input.value.trim() !== "" &&
            Number.isInteger(value) &&
            value >= 1 &&
            value <= 40
        ) {

            credits += value;

        }

    });

    totalCredits.textContent = credits;

    creditsInline.textContent = credits;

    subjectCount.textContent = rows.length;

    subjectBadge.textContent =
        `${rows.length} Subject${rows.length === 1 ? "" : "s"}`;

}


// ======================================
// 8. SHOW MESSAGE
// ======================================

function showMessage(element, message, type = "") {

    element.textContent = message;

    element.className = `message ${type}`.trim();

}


// ======================================
// 9. HANDLE SUBJECT CHANGES
// ======================================

function handleSubjectChange(event) {

    if (
        event &&
        event.target.classList.contains("subject-grade")
    ) {

        const row = event.target.closest("tr");

        const grade = event.target.value;

        row.querySelector(".grade-points").textContent =
            gradePoints[grade].toFixed(1);

    }


    updateSubjectSummary();


    // Previous results are no longer current

    currentGpa = null;

    currentCredits = 0;

    currentGradePoints = 0;


    gpaResult.textContent = "0.00";

    cgpaResult.textContent = "0.00";

    gpaProgress.style.width = "0%";

    cgpaProgress.style.width = "0%";


    showMessage(
        gpaMessage,
        "Subjects changed. Calculate GPA again."
    );

    showMessage(
        cgpaMessage,
        "Recalculate to update your CGPA."
    );


    renderGradeDistribution();

    saveData();

}


// ======================================
// 10. VALIDATE SUBJECT DATA
// ======================================

function getSubjectData() {

    const rows = getRows();

    if (rows.length === 0) {

        return {
            error: "Please add at least one subject."
        };

    }


    let totalCredits = 0;

    let totalGradePoints = 0;


    for (const row of rows) {

        const name =
            row.querySelector(".subject-name").value.trim();

        const creditsInput =
            row.querySelector(".subject-credits");

        const credits = Number(creditsInput.value);

        const grade =
            row.querySelector(".subject-grade").value;


        if (!name) {

            return {
                error: "Please enter every subject name."
            };

        }


        if (
            creditsInput.value.trim() === "" ||
            !Number.isInteger(credits) ||
            credits < 1 ||
            credits > 40
        ) {

            return {
                error: `Enter valid credit hours for ${name}.`
            };

        }


        totalCredits += credits;

        totalGradePoints += credits * gradePoints[grade];

    }


    return {
        totalCredits: totalCredits,
        totalGradePoints: totalGradePoints,
        gpa: totalGradePoints / totalCredits
    };

}


// ======================================
// 11. ANIMATE RESULT NUMBER
// ======================================

function animateNumber(element, target) {

    const start = Number(element.textContent) || 0;

    const duration = 550;

    const startTime = performance.now();


    function update(now) {

        const progress = Math.min(
            (now - startTime) / duration,
            1
        );

        const eased = 1 - Math.pow(1 - progress, 3);

        const value = start + (target - start) * eased;

        element.textContent = value.toFixed(2);


        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }


    requestAnimationFrame(update);

}


// ======================================
// 12. CALCULATE GPA
// ======================================

function calculateGPA() {

    const data = getSubjectData();


    if (data.error) {

        showMessage(gpaMessage, data.error, "error");

        return;

    }


    currentGpa = data.gpa;

    currentCredits = data.totalCredits;

    currentGradePoints = data.totalGradePoints;


    animateNumber(gpaResult, currentGpa);


    gpaProgress.style.width =
        `${currentGpa / 4 * 100}%`;


    showMessage(
        gpaMessage,
        `GPA calculated successfully! Total grade points: ${currentGradePoints.toFixed(2)}.`,
        "success"
    );


    updateMotivation(currentGpa);

    renderGradeDistribution();

    saveData();


    // Update CGPA if previous semester data is entered

    calculateCGPA(true);

}


// ======================================
// 13. CALCULATE CGPA
// ======================================

function calculateCGPA(silent = false) {

    const previousCgpaInput =
        document.getElementById("previousCgpa");

    const previousCreditsInput =
        document.getElementById("previousCredits");


    const previousCgpa =
        Number(previousCgpaInput.value);

    const previousCredits =
        Number(previousCreditsInput.value);


    if (
        previousCgpaInput.value.trim() === "" ||
        previousCreditsInput.value.trim() === ""
    ) {

        if (!silent) {

            showMessage(
                cgpaMessage,
                "Enter previous CGPA and completed credit hours.",
                "error"
            );

        }

        return;

    }


    if (
        !Number.isFinite(previousCgpa) ||
        previousCgpa < 0 ||
        previousCgpa > 4
    ) {

        showMessage(
            cgpaMessage,
            "Previous CGPA must be between 0.00 and 4.00.",
            "error"
        );

        return;

    }


    if (
        !Number.isInteger(previousCredits) ||
        previousCredits < 0 ||
        previousCredits > 1000
    ) {

        showMessage(
            cgpaMessage,
            "Previous credits must be a whole number from 0 to 1000.",
            "error"
        );

        return;

    }


    if (previousCredits === 0 && previousCgpa !== 0) {

        showMessage(
            cgpaMessage,
            "Previous CGPA must be 0 when previous credits are 0.",
            "error"
        );

        return;

    }


    if (currentGpa === null || currentCredits === 0) {

        if (!silent) {

            showMessage(
                cgpaMessage,
                "Calculate your semester GPA first.",
                "error"
            );

        }

        return;

    }


    const totalCredits =
        previousCredits + currentCredits;


    const previousGradePoints =
        previousCgpa * previousCredits;


    const overallGradePoints =
        previousGradePoints + currentGradePoints;


    const overallCgpa =
        overallGradePoints / totalCredits;


    animateNumber(cgpaResult, overallCgpa);


    cgpaProgress.style.width =
        `${overallCgpa / 4 * 100}%`;


    showMessage(
        cgpaMessage,
        `CGPA calculated using ${totalCredits} total credit hours.`,
        "success"
    );


    saveData();

}


// ======================================
// 14. MOTIVATIONAL MESSAGES
// ======================================

function updateMotivation(gpa) {

    const title = document.getElementById("motivationTitle");

    const text = document.getElementById("motivationText");


    if (gpa >= 3.7) {

        title.textContent = "Outstanding Performance! 🏆";

        text.textContent =
            "Excellent work! Keep up your academic momentum.";

    } else if (gpa >= 3.3) {

        title.textContent = "Great Progress! 🌟";

        text.textContent =
            "You're building a strong academic record.";

    } else if (gpa >= 3.0) {

        title.textContent = "Good Work! 💪";

        text.textContent =
            "Stay consistent and keep aiming higher.";

    } else if (gpa >= 2.0) {

        title.textContent = "Keep Improving! 📚";

        text.textContent =
            "A steady study plan can help you improve.";

    } else {

        title.textContent = "One Step at a Time ❤️";

        text.textContent =
            "Use this result as a starting point for growth.";

    }

}


// ======================================
// 15. GRADE DISTRIBUTION
// ======================================

function renderGradeDistribution() {

    const rows = getRows();

    const container =
        document.getElementById("gradeDistribution");


    const counts = {};


    rows.forEach(function (row) {

        const grade =
            row.querySelector(".subject-grade").value;

        counts[grade] = (counts[grade] || 0) + 1;

    });


    const entries = Object.entries(counts).sort(
        (a, b) => gradePoints[b[0]] - gradePoints[a[0]]
    );


    if (entries.length === 0) {

        container.innerHTML = `
            <p class="empty-state">
                Add subjects to see your grade distribution.
            </p>
        `;

        return;

    }


    const maxCount = Math.max(
        ...entries.map(entry => entry[1])
    );


    container.innerHTML = entries.map(function (entry) {

        const grade = entry[0];

        const count = entry[1];

        const width = count / maxCount * 100;


        return `
            <div class="distribution-row">

                <strong>${grade}</strong>

                <div class="distribution-track">

                    <div
                        class="distribution-fill"
                        style="width: ${width}%">
                    </div>

                </div>

                <span>${count}</span>

            </div>
        `;

    }).join("");

}


// ======================================
// 16. SAVE DATA TO BROWSER
// ======================================

function saveData() {

    const data = {

        subjects: getRows().map(function (row) {

            return {

                name: row.querySelector(".subject-name").value,

                credits: row.querySelector(".subject-credits").value,

                grade: row.querySelector(".subject-grade").value

            };

        }),

        previousCgpa:
            document.getElementById("previousCgpa").value,

        previousCredits:
            document.getElementById("previousCredits").value,

        darkMode:
            document.body.classList.contains("dark")

    };


    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify(data)
        );

    } catch (error) {

        // Calculator still works if storage is unavailable.

    }

}


// ======================================
// 17. LOAD SAVED DATA
// ======================================

function loadData() {

    let data;


    try {

        data = JSON.parse(
            localStorage.getItem(storageKey) || "null"
        );

    } catch (error) {

        data = null;

    }


    if (!data) {

        addSubject("Calculus", 3, "A-");

        addSubject("Database Systems", 3, "A");

        addSubject("Computer Networks", 3, "B+");

        addSubject("Human Computer Interaction", 3, "A-");

        addSubject("English", 2, "B+");

        return;

    }


    if (data.darkMode) {

        document.body.classList.add("dark");

        themeToggle.textContent = "☀ Light Mode";

    }


    (data.subjects || []).forEach(function (subject) {

        const grade = gradePoints[subject.grade] !== undefined
            ? subject.grade
            : "A";

        addSubject(
            subject.name || "",
            subject.credits || 3,
            grade
        );

    });


    document.getElementById("previousCgpa").value =
        data.previousCgpa || "";

    document.getElementById("previousCredits").value =
        data.previousCredits || "";

}


// ======================================
// 18. BUTTON EVENTS
// ======================================

addSubjectBtn.addEventListener("click", function () {

    addSubject("", 3, "A");

    saveData();

    const lastRow = getRows().at(-1);

    lastRow.querySelector(".subject-name").focus();

});


calculateGpaBtn.addEventListener(
    "click",
    calculateGPA
);


calculateCgpaBtn.addEventListener(
    "click",
    function () {

        calculateCGPA(false);

    }
);


// ======================================
// 19. CGPA INPUT EVENTS
// ======================================

["previousCgpa", "previousCredits"].forEach(function (id) {

    document.getElementById(id).addEventListener(
        "input",
        function () {

            cgpaResult.textContent = "0.00";

            cgpaProgress.style.width = "0%";

            showMessage(
                cgpaMessage,
                "Recalculate CGPA to update your result."
            );

            saveData();

        }
    );

});


// ======================================
// 20. DARK MODE
// ======================================

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark");


    if (document.body.classList.contains("dark")) {

        themeToggle.textContent = "☀ Light Mode";

    } else {

        themeToggle.textContent = "🌙 Dark Mode";

    }


    saveData();

});


// ======================================
// 21. START THE APPLICATION
// ======================================

loadData();

updateSubjectSummary();

renderGradeDistribution();

calculateGPA();
