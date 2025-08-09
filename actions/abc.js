'use server';

async function generateTimetable(input) {
    // console.log("Generating timetable with input:", input);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const periods = parseInt(input.periods);
    const satPeriods = parseInt(input.satPeriods);
    const shortBreak = parseInt(input.shortBreak);
    const lunchBreak = parseInt(input.lunchBreak);
    const subjects = input.subjects;
    const frequencies = input.frequencies.map(f => parseInt(f) || 1);
    const labs = input.labs;
    const labFrequencies = input.labFrequencies.map(f => parseInt(f) || 1);
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
    function canPlaceLab(period, day) {
        if (period === shortBreak || period === lunchBreak) {
            return false;
        }
        if (period >= (day === "Sat" ? satPeriods : periods)) {
            return false; // Can't place lab if it would extend beyond the day's periods
        }
        return true;
    }

    // Function to place labs with maximum retries
    function placeLabs(maxRetries = 10) {
        let retries = 0;

        while (retries < maxRetries) {
            let success = true;

            // Reset counts for each attempt
            labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});
            for (let day of days) {
                timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
            }

            // Try to place all labs
            for (let i = 0; i < labs.length; i++) {
                let lab = labs[i];
                let labTeacher = labTeachers[i];
                let frequency = labFrequencies[i];

                while (labCount[lab] < frequency) {
                    let placed = false;
                    let attempts = 0;

                    // Try to place this lab instance
                    while (!placed && attempts < 100) {
                        let day = days[Math.floor(Math.random() * days.length)];
                        let period = Math.floor(Math.random() * (timetable[day].length - 1)) + 1;

                        if (canPlaceLab(period, day) &&
                            isTeacherAvailable(labTeacher, day, period) &&
                            isTeacherAvailable(labTeacher, day, period + 1) &&
                            timetable[day][period - 1] === null &&
                            timetable[day][period] === null) {

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

    // Try to place labs with a maximum of 10 retries
    const labsPlaced = placeLabs();
    if (!labsPlaced) {
        throw new Error("Could not place all labs after multiple attempts. Please check teacher availability and constraints.");
    }

    // Function to place subjects period-wise
    function placeSubjects() {
        let remainingSubjects = [];

        // Fill up a pool with each subject according to its frequency
        for (let i = 0; i < subjects.length; i++) {
            let subject = subjects[i];
            let teacher = teachers[i];
            let frequency = frequencies[i];

            for (let j = 0; j < frequency; j++) {
                remainingSubjects.push({ subject, teacher });
            }
        }

        // Loop through each period for each day
        for (let period = 1; period <= periods; period++) {
            for (let day of days) {
                if (day === "Sat" && period > satPeriods) continue; 
                console

                if (timetable[day][period - 1] !== null) continue; // Already occupied (by lab)

                let attempts = 0;
                let placed = false;

                while (attempts < 50 && remainingSubjects.length > 0) {
                    const index = Math.floor(Math.random() * remainingSubjects.length);
                    const { subject, teacher } = remainingSubjects[index];

                    if (isTeacherAvailable(teacher, day, period)) {
                        timetable[day][period - 1] = { type: "Subject", name: subject, teacher };
                        remainingSubjects.splice(index, 1);
                        placed = true;
                        break;
                    }

                    attempts++;
                }

                // If not placed after attempts, just leave the slot empty and move on
            }
        }

        if (remainingSubjects.length > 0) {
            console.warn("Some subjects could not be placed:", remainingSubjects);
            // Optionally, you can throw an error or handle it differently
            throw new Error("Could not place all subjects within the available periods. Consider lowering frequencies or adjusting availability.");
        }
    }



    // Place subjects
    placeSubjects();

    // console.log("Timetable generation complete",timetable);
    return timetable;
}

export default generateTimetable;

// 'use server';

// async function generateTimetable(input) {
//     const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const periods = parseInt(input.periods);
//     const satPeriods = parseInt(input.satPeriods);
//     const shortBreak = parseInt(input.shortBreak);
//     const lunchBreak = parseInt(input.lunchBreak);
//     const subjects = input.subjects;
//     const frequencies = input.frequencies.map(Number);
//     const labs = input.labs;
//     const labFrequencies = input.labFrequencies.map(Number);
//     const teachers = input.teachers;
//     const labTeachers = input.labTeachers;
//     const teacherAvailability = input.teacherAvailability;

//     // Initialize the timetable
//     let timetable = {};
//     for (let day of days) {
//         timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
//     }

//     // Tracking structures
//     let subjectCount = subjects.reduce((acc, subj) => ({ ...acc, [subj]: 0 }), {});
//     let labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});

//     // Helper function to check if a teacher is available
//     function isTeacherAvailable(teacher, day, period) {
//         return teacherAvailability[`${teacher}-${day}-${period}`] === true;
//     }

//     // Helper function to check if a lab can be placed
//     function canPlaceLab(period) {
//         if (period === shortBreak) {
//             return false; // Lab cannot start at the period before the short break
//         }
//         if (period === lunchBreak) {
//             return false; // Lab cannot start at the period before the lunch break
//         }
//         return true;
//     }

//     // Function to place labs
//     function placeLabs() {
//         for (let i = 0; i < labs.length; i++) {
//             let lab = labs[i];
//             let labTeacher = labTeachers[i];
//             let frequency = labFrequencies[i];

//             while (labCount[lab] < frequency) {
//                 let placed = false;
//                 let attempts = 0;
//                 while (!placed && attempts < 100) { // Avoid infinite loops
//                     let day = days[Math.floor(Math.random() * days.length)];
//                     let period = Math.floor(Math.random() * (timetable[day].length - 1)) + 1; // Periods start from 1

//                     if (canPlaceLab(period) && isTeacherAvailable(labTeacher, day, period) && isTeacherAvailable(labTeacher, day, period + 1)) {
//                         timetable[day][period - 1] = { type: "Lab", name: lab, teacher: labTeacher };
//                         timetable[day][period] = { type: "Lab", name: lab, teacher: labTeacher };
//                         labCount[lab] += 1;
//                         placed = true;
//                     }
//                     attempts++;
//                 }
//                 if (!placed) {
//                     // console.warn(`Could not place lab ${lab} after 100 attempts.`);
//                     return false; // Lab placement failed
//                 }
//             }
//         }
//         return true; // All labs placed successfully
//     }

//     // Retry lab placement until all labs are placed
//     let labsPlaced = false;
//     while (!labsPlaced) {
//         labsPlaced = placeLabs();
//         if (!labsPlaced) {
//             // Reset lab counts and timetable for retry
//             labCount = labs.reduce((acc, lab) => ({ ...acc, [lab]: 0 }), {});
//             for (let day of days) {
//                 timetable[day] = new Array(day === "Sat" ? satPeriods : periods).fill(null);
//             }
//         }
//     }

//     // Function to place subjects period-wise
//     function placeSubjects() {
//         for (let period = 1; period <= periods; period++) {
//             for (let i = 0; i < subjects.length; i++) {
//                 let subject = subjects[i];
//                 let teacher = teachers[i];
//                 let frequency = frequencies[i];

//                 while (subjectCount[subject] < frequency) {
//                     let placed = false;
//                     let attempts = 0;
//                     while (!placed && attempts < 100) {
//                         let day = days[Math.floor(Math.random() * days.length)];

//                         if (timetable[day][period - 1] === null && isTeacherAvailable(teacher, day, period)) {
//                             timetable[day][period - 1] = { type: "Subject", name: subject, teacher: teacher };
//                             subjectCount[subject] += 1;
//                             placed = true;
//                         }
//                         attempts++;
//                     }
//                     if (!placed) {
//                         console.log(`Could not place subject ${subject} in period ${period} after 100 attempts.`);
//                         break;
//                     }
//                 }
//             }
//         }
//     }

//     // Place subjects
//     placeSubjects();

//     console.log("Complete");

//     return timetable;
// }

// export default generateTimetable;