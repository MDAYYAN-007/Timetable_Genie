'use server';

const consoleFunc = async (data) => {
    console.log('Console Function Called:', data);
    return data;
}

export default consoleFunc;