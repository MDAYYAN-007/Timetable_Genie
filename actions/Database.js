// "use server";
// import { query } from '@/actions/db';

// const deleteAll = async () => {
//     try {
//         await query(`
//             DELETE FROM timetables;
//             DELETE FROM generated_timetables;
//             DELETE FROM timetable_users;
//             DELETE FROM timetable_formdata;
//             `);
//         console.log("All tables have been deleted");
//         return true;
//     } catch (error) {
//         console.error(error);
//     }
// }

// export default deleteAll;

// "use server";
// import { query } from '@/actions/db';

// const getAllData = async () => {
//     try {
//         const [timetables, generatedTimetables, users, formData] = await Promise.all([
//             query(`SELECT * FROM timetables`),
//             query(`SELECT * FROM generated_timetables`),
//             query(`SELECT * FROM timetable_users`),
//             query(`SELECT * FROM timetable_formdata`)
//         ]);
        
//         console.log("All data:", {
//             timetables: timetables.rows,
//             generatedTimetables: generatedTimetables.rows,
//             users: users.rows,
//             formData: formData.rows
//         });
        
//         return {
//             timetables: timetables.rows,
//             generatedTimetables: generatedTimetables.rows,
//             users: users.rows,
//             formData: formData.rows
//         };
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         throw error;
//     }
// }

// export default getAllData;