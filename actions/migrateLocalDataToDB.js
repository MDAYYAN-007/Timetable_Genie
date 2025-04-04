'use server';
// import extractLocalData from "./extractLocalData";
import renameTimetable from "./renameTimetable";
import storeFormData from "./storeFromData";
import storeGeneratedTimetables from "./storeGeneratedTimetables";
import storeTimeTable from "./storeTimetables";

const migrateLocalDataToDB = async (userId,userEmail) => {
    try {
        // const { formData, timetables, generatedTimetables } = extractLocalData();

        for (const timetable of timetables) {
          if (timetable.id && timetable.name) {
            await storeTimeTable(timetable.id, timetable.name, userId);
            console.log(`Migrated timetable: ${timetable.name}`);
            await renameTimetable(timetable.name, timetable.id);
          }
        }

        for (const form of formData) {
          if (form.id && form.data) {
            await storeFormData(form.id, form.data);
            console.log(`Migrated form data for ID: ${form.id}`);
          }
        }
    
        for (const generated of generatedTimetables) {
          if (generated.id && generated.timetable && generated.tt_no) {
            await storeGeneratedTimetables(generated.timetable, generated.id, generated.tt_no);
          }
        }
    
        console.log('All local data migrated to DB successfully!');
        
    } catch (error) {
        console.error('Error migrating local data to DB:', error);
    }
}

export default migrateLocalDataToDB;