'use server';

// Main timetable generation function
async function generateTimetable(input) {
    let days = {};
    const periods = parseInt(input.periods);
    const satPeriods = parseInt(input.satPeriods);
    if (satPeriods === 0) {
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    } else {
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }
    const shortBreak = parseInt(input.shortBreak);
    const lunchBreak = parseInt(input.lunchBreak);
    const subjects = input.subjects;
    const frequencies = input.frequencies.map(f => parseInt(f) || 1);
    const labs = input.labs;
    const labFrequencies = input.labFrequencies.map(f => parseInt(f) || 1);
    const teachers = input.teachers;
    const labTeachers = input.labTeachers;
    const teacherAvailability = input.teacherAvailability;

    // Initialize empty timetable
    let timetable = {};
    for (let day of days) {
        timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
    }

    // Shuffle array helper
    function shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // Tracking counts
    let subjectCount = subjects.reduce((acc, subj) => ({ ...acc, [subj]: 0 }), {});
    let labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});
    let dailySubjectCount = {}; // Track subjects per day
    for (let day of days) {
        dailySubjectCount[day] = {};
        for (let subject of subjects) {
            dailySubjectCount[day][subject] = 0;
        }
    }

    // Comprehensive check for subject placement
    function canPlaceSubject(day, period, subject, teacher, attempts) {
        if (period > (day === "Sat" ? satPeriods : periods)) return false;
        if (timetable[day][period - 1] !== null) return false;
        if (!isTeacherAvailable(teacher, day, period)) return false;

        // Check adjacent periods for same subject
        const prev = period > 1 ? timetable[day][period - 2] : null;
        const next = period < timetable[day].length ? timetable[day][period] : null;
        if ((prev && prev.name === subject) || (next && next.name === subject)) return false;

        if (dailySubjectCount[day][subject] >= 2) return false;

        // Check if subject already appears twice this day
        if (attempts > 30) return true;
        let dailyCount = 0;
        for (let i = 0; i < timetable[day].length; i++) {
            if (timetable[day][i]?.name === subject) dailyCount++;
            if (dailyCount >= 2) return false;
        }

        return true;
    }

    // Comprehensive check for lab placement
    function canPlaceLab(day, period, lab, labTeacher, attempts) {
        if (period >= (day === "Sat" ? satPeriods : periods)) return false;
        if (period === shortBreak || period === lunchBreak) return false;
        if (timetable[day][period - 1] !== null || timetable[day][period] !== null) return false;
        if (!isTeacherAvailable(labTeacher, day, period) || !isTeacherAvailable(labTeacher, day, period + 1)) return false;

        // Check adjacent labs
        const prev = period - 2 >= 0 ? timetable[day][period - 2] : null;
        const next = period + 1 < timetable[day].length ? timetable[day][period + 1] : null;
        if ((prev && prev.type === "Lab") || (next && next.type === "Lab")) return false;

        // Check if lab already exists today
        if (timetable[day].some(slot => slot && slot.type === "Lab" && slot.name === lab)) return false;

        // Check adjacent days for same lab (only for first 50 attempts)
        if (attempts < 50) {
            const dayIndex = days.indexOf(day);
            if (dayIndex > 0) {
                const prevDay = days[dayIndex - 1];
                if (timetable[prevDay][period - 1]?.name === lab || timetable[prevDay][period]?.name === lab) return false;
            }
            if (dayIndex < days.length - 1) {
                const nextDay = days[dayIndex + 1];
                if (timetable[nextDay][period - 1]?.name === lab || timetable[nextDay][period]?.name === lab) return false;
            }
        }

        return true;
    }

    // Teacher availability check
    function isTeacherAvailable(teacher, day, period) {
        return teacherAvailability[`${teacher}-${day}-${period}`] === true;
    }

    // Place all labs with retries
    function placeLabs(maxRetries = 10) {
        let retries = 0;

        while (retries < maxRetries) {
            let success = true;

            // Reset counts and timetable for retry
            labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});
            for (let day of days) {
                timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
            }

            // Place each lab
            for (let i = 0; i < labs.length; i++) {
                let lab = labs[i];
                let labTeacher = labTeachers[i];
                let frequency = labFrequencies[i];

                while (labCount[lab] < frequency) {
                    let placed = false;
                    let attempts = 0;

                    while (!placed && attempts < 100) {
                        let day = days[Math.floor(Math.random() * days.length)];
                        let period = Math.floor(Math.random() * (timetable[day].length - 1)) + 1;

                        if (canPlaceLab(day, period, lab, labTeacher, attempts)) {
                            timetable[day][period - 1] = { type: "Lab", name: lab, teacher: labTeacher };
                            timetable[day][period] = { type: "Lab", name: lab, teacher: labTeacher };
                            labCount[lab] += 1;
                            placed = true;
                        }
                        attempts++;
                    }

                    if (!placed) {
                        success = false;
                        break;
                    }
                }

                if (!success) break;
            }

            if (success) return true;
            retries++;
        }

        return false;
    }

    // Place all subjects
    function placeSubjects() {
        let remainingSubjects = [];

        // Create pool of all subject sessions needed
        for (let i = 0; i < subjects.length; i++) {
            let subject = subjects[i];
            let teacher = teachers[i];
            let frequency = frequencies[i];

            for (let j = 0; j < frequency; j++) {
                remainingSubjects.push({ subject, teacher });
            }
        }

        for (let day of days) {
            const dayPeriods = day === "Sat" ? satPeriods : periods;

            // Find all lab periods on this day
            let labPeriods = [];
            for (let p = 1; p <= dayPeriods; p++) {
                if (timetable[day][p - 1]?.type === "Lab") {
                    labPeriods.push(p);
                }
            }

            // For each lab, fill periods before it
            for (let labPeriod of labPeriods) {
                for (let period = 1; period < labPeriod; period++) {
                    if (timetable[day][period - 1] !== null) continue;

                    let attempts = 0;
                    let placed = false;

                    while (attempts < 50 && remainingSubjects.length > 0) {
                        const index = Math.floor(Math.random() * remainingSubjects.length);
                        const { subject, teacher } = remainingSubjects[index];

                        if (canPlaceSubject(day, period, subject, teacher, attempts)) {
                            timetable[day][period - 1] = { type: "Subject", name: subject, teacher };
                            dailySubjectCount[day][subject] += 1;
                            remainingSubjects.splice(index, 1);
                            placed = true;
                            break;
                        }

                        attempts++;
                    }
                }
            }
        }

        // Place remaining subjects in random periods
        for (let period = 1; period <= periods; period++) {
            const shuffledDays = shuffleArray(days);
            for (let day of shuffledDays) {
                if (day === "Sat" && period > satPeriods) continue;
                if (timetable[day][period - 1] !== null) continue;

                let attempts = 0;
                let placed = false;

                while (attempts < 50 && remainingSubjects.length > 0) {
                    const index = Math.floor(Math.random() * remainingSubjects.length);
                    const { subject, teacher } = remainingSubjects[index];

                    if (canPlaceSubject(day, period, subject, teacher, attempts)) {
                        timetable[day][period - 1] = { type: "Subject", name: subject, teacher };
                        dailySubjectCount[day][subject] += 1;
                        remainingSubjects.splice(index, 1);
                        placed = true;
                        break;
                    }

                    attempts++;
                }

                if (!placed) {
                    timetable[day][period - 1] = null;
                }
            }
        }

        if (remainingSubjects.length > 0) {
            console.warn("Some subjects could not be placed:", remainingSubjects);
            throw new Error("Could not place all subjects within the available periods. Consider lowering frequencies or adjusting availability.");
        }
    }

    // Execute placement
    const labsPlaced = placeLabs();
    if (!labsPlaced) {
        throw new Error("Could not place all labs after multiple attempts. Please check teacher availability and constraints.");
    }

    placeSubjects();

    return timetable;
}

export default generateTimetable;