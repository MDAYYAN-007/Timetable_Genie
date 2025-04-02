'use server';
import storeTimeTable from "./storeTimetables";
import storeGeneratedTimetables from "./storeGeneratedTimetables";
import storeFormData from "./storeFromData";

export const migrateLocalDataToDB = async (userId) => {
  try {
    // 1. Get all localStorage data (simulating client-side data)
    const localStorageData = {
      formData: JSON.parse(localStorage.getItem('formData') || '[]'),
      timetables: JSON.parse(localStorage.getItem('timetables') || '[]'),
      generatedTimetables: JSON.parse(localStorage.getItem('generatedtimetables') || '[]')
    };

    // 2. Migrate Form Data
    for (const form of localStorageData.formData) {
      if (form.id && form.data) {
        await storeFormData(form.id, form.data);
        console.log(`Migrated form data for ID: ${form.id}`);
      }
    }

    // 3. Migrate Timetables
    for (const timetable of localStorageData.timetables) {
      if (timetable.id && timetable.name) {
        await storeTimeTable(timetable.id, timetable.name, userId);
        console.log(`Migrated timetable: ${timetable.name}`);
      }
    }

    // 4. Migrate Generated Timetables
    for (const generated of localStorageData.generatedTimetables) {
      if (generated.id && generated.timetable && generated.tt_no) {
        await storeGeneratedTimetables(generated.timetable, generated.id, generated.tt_no);
        console.log(`Migrated generated timetable ${generated.tt_no} for ID: ${generated.id}`);
      }
    }

    // 5. Clear localStorage after successful migration
    localStorage.removeItem('formData');
    localStorage.removeItem('timetables');
    localStorage.removeItem('generatedtimetables');

    return { success: true, message: 'Data migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, message: 'Data migration failed', error };
  }
};