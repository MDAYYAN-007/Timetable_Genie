'use server';

import getUserData from "./getUserData";
import storeFormData from "./storeFromData";
import storeGeneratedTimetables from "./storeGeneratedTimetables";
import storeTimeTable from "./storeTimetables";

const migrateLocalDataToDB = async (timetables, formData, generatedTimetables, email) => {
  try {

    const userData = await getUserData(email);
    if (!userData) {
      console.error('User not found in the database');
      return false;
    }
    const userId = userData.id;

    for (const timetable of timetables) {
      if (timetable.id && timetable.name) {
        await storeTimeTable(timetable.id, timetable.name, userId);
        console.log(`Migrated timetable: ${timetable.name}`);
      }
    }

    for (const form of formData) {
      if (form.id && form.data) {
        await storeFormData(form.id, form.data, userId);
        console.log(`Migrated form data for ID: ${form.id}`);
      }
    }

    for (const generated of generatedTimetables) {
      if (generated.id && generated.timetable && generated.tt_no) {
        await storeGeneratedTimetables(generated.timetable, generated.id, generated.tt_no, userId);
      }
    }

    console.log('All local data migrated to DB successfully!');
    return true;
  } catch (error) {
    console.error('Error migrating local data to DB:', error);
  }
}

export default migrateLocalDataToDB;