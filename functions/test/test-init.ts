process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

import * as firebaseFunctionsTest from 'firebase-functions-test';

export const firebaseTest = firebaseFunctionsTest();
