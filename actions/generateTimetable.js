'use server';

async function generateTimetable(input) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const periods = parseInt(input.periods);
    const satPeriods = parseInt(input.satPeriods);
    const shortBreak = parseInt(input.shortBreak);
    const lunchBreak = parseInt(input.lunchBreak);
    const subjects = input.subjects;
    const frequencies = input.frequencies.map(Number);
    const labs = input.labs;
    const labFrequencies = input.labFrequencies.map(Number);
    const teachers = input.teachers;
    const labTeachers = input.labTeachers;
    const teacherAvailability = input.teacherAvailability;

    // Initialize the timetable
    let timetable = {};
    for (let day of days) {
        timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
    }

    // Tracking structures
    let subjectCount = subjects.reduce((acc, subj) => ({ ...acc, [subj]: 0 }), {});
    let labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});

    // Helper function to check if a teacher is available
    function isTeacherAvailable(teacher, day, period) {
        return teacherAvailability[`${teacher}-${day}-${period}`] === true;
    }

    // Helper function to check if a lab can be placed
    function canPlaceLab(period) {
        if (period === shortBreak) {
            return false; // Lab cannot start at the period before the short break
        }
        if (period === lunchBreak) {
            return false; // Lab cannot start at the period before the lunch break
        }
        return true;
    }

    // Function to place labs
    function placeLabs() {
        for (let i = 0; i < labs.length; i++) {
            let lab = labs[i];
            let labTeacher = labTeachers[i];
            let frequency = labFrequencies[i];

            while (labCount[lab] < frequency) {
                let placed = false;
                let attempts = 0;
                while (!placed && attempts < 100) { // Avoid infinite loops
                    let day = days[Math.floor(Math.random() * days.length)];
                    let period = Math.floor(Math.random() * (timetable[day].length - 1)) + 1; // Periods start from 1

                    if (canPlaceLab(period) && isTeacherAvailable(labTeacher, day, period) && isTeacherAvailable(labTeacher, day, period + 1)) {
                        timetable[day][period - 1] = { type: "Lab", name: lab, teacher: labTeacher };
                        timetable[day][period] = { type: "Lab", name: lab, teacher: labTeacher };
                        labCount[lab] += 1;
                        placed = true;
                    }
                    attempts++;
                }
                if (!placed) {
                    // console.warn(`Could not place lab ${lab} after 100 attempts.`);
                    return false; // Lab placement failed
                }
            }
        }
        return true; // All labs placed successfully
    }

    // Retry lab placement until all labs are placed
    let labsPlaced = false;
    while (!labsPlaced) {
        labsPlaced = placeLabs();
        if (!labsPlaced) {
            // Reset lab counts and timetable for retry
            labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});
            for (let day of days) {
                timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
            }
        }
    }

    // Function to place subjects period-wise
    function placeSubjects() {
        for (let period = 1; period <= periods; period++) {
            for (let i = 0; i < subjects.length; i++) {
                let subject = subjects[i];
                let teacher = teachers[i];
                let frequency = frequencies[i];

                while (subjectCount[subject] < frequency) {
                    let placed = false;
                    let attempts = 0;
                    while (!placed && attempts < 100) {
                        let day = days[Math.floor(Math.random() * days.length)];

                        if (timetable[day][period - 1] === null && isTeacherAvailable(teacher, day, period)) {
                            timetable[day][period - 1] = { type: "Subject", name: subject, teacher: teacher };
                            subjectCount[subject] += 1;
                            placed = true;
                        }
                        attempts++;
                    }
                    if (!placed) {
                        console.log(`Could not place subject ${subject} in period ${period} after 100 attempts.`);
                        break;
                    }
                }
            }
        }
    }

    // Place subjects
    placeSubjects();

    return timetable;
}

export default generateTimetable;