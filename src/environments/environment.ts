// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backendPath: "http://127.0.0.1:5001/boggelnc/europe-west1",
  firebase: {
    apiKey: "AIzaSyBp-oeRndoMC9M2R5P7KNuA_shwj_yuVbY",
    authDomain: "boggelnc.firebaseapp.com",
    projectId: "boggelnc",
    storageBucket: "boggelnc.appspot.com",
    messagingSenderId: "262521420317",
    appId: "1:262521420317:web:5d08fd60cc9be32b9ca4f4",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
